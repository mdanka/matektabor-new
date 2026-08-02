#!/usr/bin/env node
/**
 * Imports a camp, its rooms and its children into Firestore from a room-assignment CSV.
 *
 * Dry run by default — nothing is written unless you pass --commit.
 *
 *   node scripts/importCamp.mjs --csv "path/to/Szobabeosztás.csv" --group MaMuT --number 2026
 *   node scripts/importCamp.mjs ... --target emulator --commit
 *   node scripts/importCamp.mjs ... --target prod --commit --confirm-prod
 *
 * Existing children are reused: a person is matched by name (see resolution rules below),
 * so their barkochba history stays intact. Only genuinely new names get a new person doc.
 *
 * Resolution rules, per name in the CSV:
 *   1. An entry in the aliases file wins (person id, or the literal "NEW" to force creation).
 *      An entry can also rename the person it points at — see readAlias below.
 *   2. Exactly one existing person with that name  -> reuse it.
 *   3. Several people share the name, exactly one of them is in the target group -> reuse that one.
 *   4. Several people share the name, none or many in the target group -> AMBIGUOUS, blocks --commit.
 *      Resolve it by adding the name to the aliases file.
 *   5. No match -> a new person is created (with fuzzy near-matches printed as a warning).
 *
 * firebase-admin is not a dependency of the web app, so it is resolved from functions/node_modules.
 * Prod access uses gcloud Application Default Credentials; the emulator needs no credentials.
 */

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

const REPO_ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_ID = "barkochba-app";
const EMULATOR_HOST = "127.0.0.1:8080";

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------

function parseArgs(argv) {
    const args = { target: "prod", commit: false, confirmProd: false };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        const next = () => {
            const value = argv[++i];
            if (value === undefined) {
                fail(`Missing value for ${arg}`);
            }
            return value;
        };
        switch (arg) {
            case "--csv": args.csv = next(); break;
            case "--group": args.group = next(); break;
            case "--number": args.number = next(); break;
            case "--target": args.target = next(); break;
            case "--aliases": args.aliases = next(); break;
            case "--commit": args.commit = true; break;
            case "--confirm-prod": args.confirmProd = true; break;
            case "--help": case "-h": args.help = true; break;
            default: fail(`Unknown argument: ${arg}`);
        }
    }
    return args;
}

function fail(message) {
    console.error(`\nHiba: ${message}\n`);
    process.exit(1);
}

const USAGE = `
Usage: node scripts/importCamp.mjs --csv <file> --group <name> --number <n> [options]

  --csv <file>       Room-assignment CSV to import.
  --group <name>     Camp group, e.g. "MaMuT".
  --number <n>       Camp number, e.g. 2026.
  --target <t>       "prod" (default) or "emulator".
  --aliases <file>   JSON map of { "CSV name": "<personId>" | "NEW" | { "id", "rename" } }
                     to resolve ambiguities and fix up spellings.
  --commit           Actually write. Without this the script is a dry run.
  --confirm-prod     Required in addition to --commit when --target prod.
`;

// ---------------------------------------------------------------------------
// CSV parsing
// ---------------------------------------------------------------------------

function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    const source = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    for (let i = 0; i < source.length; i++) {
        const char = source[i];
        if (inQuotes) {
            if (char === '"') {
                if (source[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += char;
            }
        } else if (char === '"') {
            inQuotes = true;
        } else if (char === ",") {
            row.push(field);
            field = "";
        } else if (char === "\n") {
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
        } else {
            field += char;
        }
    }
    row.push(field);
    rows.push(row);
    return rows;
}

const cell = (rows, r, c) => (rows[r]?.[c] ?? "").trim();
const isRoomNumber = (value) => /^\d+$/.test(value);

/**
 * The sheet lays rooms out in blocks of two columns: the name column and, next to it, the
 * child's school grade. A block starts at a cell holding the room number, with the room's
 * leader on the next row (no grade beside them) and the children below (grade beside them).
 *
 * The list of leaders on the right-hand side of the sheet is also numbered, but its numbers
 * have a name in the very next column, which is how it gets skipped here.
 */
function extractRooms(rows) {
    const rooms = [];
    for (let r = 0; r < rows.length; r++) {
        const width = rows[r].length;
        for (let c = 0; c < width; c++) {
            const value = cell(rows, r, c);
            if (!isRoomNumber(value) || cell(rows, r, c + 1) !== "") {
                continue;
            }
            const leader = cell(rows, r + 1, c);
            if (leader === "" || cell(rows, r + 1, c + 1) !== "") {
                continue;
            }
            const children = [];
            for (let cr = r + 2; cr < rows.length; cr++) {
                const name = cell(rows, cr, c);
                const grade = cell(rows, cr, c + 1);
                if (name === "" || !/^\d+$/.test(grade)) {
                    break;
                }
                children.push({ name, grade, row: cr + 1 });
            }
            if (children.length === 0) {
                continue;
            }
            rooms.push({ name: value, leader, children, row: r + 1 });
        }
    }
    return rooms;
}

// ---------------------------------------------------------------------------
// Name matching
// ---------------------------------------------------------------------------

const normalizeName = (name) => name.normalize("NFC").replace(/\s+/g, " ").trim();
const matchKey = (name) => normalizeName(name).toLocaleLowerCase("hu");
const fuzzyKey = (name) =>
    normalizeName(name)
        .toLocaleLowerCase("hu")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

/**
 * An aliases-file entry is either a bare person id (or "NEW"), or an object:
 *   { "id": "<personId>", "rename": true }          reuse, and rename the person to the CSV spelling
 *   { "id": "<personId>", "rename": "Other Name" }  reuse, and rename the person to exactly this
 */
function readAlias(alias, csvName) {
    if (typeof alias === "string") {
        return { id: alias };
    }
    if (alias === null || typeof alias !== "object" || typeof alias.id !== "string") {
        return { error: `aliases file entry must be a person id or an object with an "id" field` };
    }
    if (alias.rename === undefined || alias.rename === false) {
        return { id: alias.id };
    }
    if (alias.rename === true) {
        return { id: alias.id, rename: csvName };
    }
    if (typeof alias.rename === "string") {
        return { id: alias.id, rename: alias.rename };
    }
    return { error: `aliases file "rename" must be true, false, or a name` };
}

function editDistance(a, b) {
    if (a === b) {
        return 0;
    }
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const current = [i];
        for (let j = 1; j <= b.length; j++) {
            current[j] = Math.min(
                previous[j] + 1,
                current[j - 1] + 1,
                previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
            );
        }
        previous = current;
    }
    return previous[b.length];
}

/** Near-matches worth a human look: a small edit distance, or one name being a prefix of the other. */
function findNearMatches(name, persons) {
    const target = fuzzyKey(name);
    const threshold = target.length <= 12 ? 2 : 3;
    return persons
        .map((person) => {
            const candidate = fuzzyKey(person.name);
            const distance = editDistance(target, candidate);
            const isPrefix = candidate.startsWith(target) || target.startsWith(candidate);
            return { person, distance, isPrefix };
        })
        .filter(({ distance, isPrefix }) => distance <= threshold || (isPrefix && distance <= 8))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 4);
}

// ---------------------------------------------------------------------------
// Firestore
// ---------------------------------------------------------------------------

async function connect(target) {
    const require = createRequire(import.meta.url);
    let adminPath;
    for (const candidate of ["firebase-admin", resolvePath(REPO_ROOT, "functions/node_modules/firebase-admin")]) {
        try {
            adminPath = require.resolve(candidate);
            break;
        } catch {
            // try the next location
        }
    }
    if (adminPath === undefined) {
        fail("Could not find firebase-admin. Run `npm install` in functions/, or `yarn add -D firebase-admin` at the repo root.");
    }
    const admin = require(adminPath);

    if (target === "emulator") {
        process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? EMULATOR_HOST;
        admin.initializeApp({ projectId: PROJECT_ID });
    } else {
        delete process.env.FIRESTORE_EMULATOR_HOST;
        admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: PROJECT_ID });
    }
    return { db: admin.firestore(), admin };
}

async function confirm(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise((resolveAnswer) => rl.question(question, resolveAnswer));
    rl.close();
    return answer.trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        console.log(USAGE);
        return;
    }
    if (!args.csv || !args.group || !args.number) {
        fail(`--csv, --group and --number are all required.\n${USAGE}`);
    }
    if (args.target !== "prod" && args.target !== "emulator") {
        fail(`--target must be "prod" or "emulator", got "${args.target}".`);
    }
    const campNumber = Number.parseInt(args.number, 10);
    if (!Number.isInteger(campNumber) || campNumber < 0 || String(campNumber) !== args.number) {
        fail(`--number must be a non-negative integer, got "${args.number}".`);
    }
    if (args.commit && args.target === "prod" && !args.confirmProd) {
        fail("Writing to prod needs --confirm-prod in addition to --commit.");
    }

    const aliases = args.aliases ? JSON.parse(readFileSync(args.aliases, "utf8")) : {};
    const aliasByKey = new Map(
        Object.entries(aliases)
            // Keys starting with "_" are notes for humans, not mappings.
            .filter(([name]) => !name.startsWith("_"))
            .map(([name, value]) => [matchKey(name), value]),
    );

    const rooms = extractRooms(parseCsv(readFileSync(args.csv, "utf8")));
    if (rooms.length === 0) {
        fail(`No rooms found in ${args.csv}. Is the layout what the script expects?`);
    }

    const { db } = await connect(args.target);

    const persons = [];
    (await db.collection("persons").get()).forEach((doc) => persons.push({ id: doc.id, ...doc.data() }));
    const personsByKey = new Map();
    for (const person of persons) {
        const key = matchKey(person.name ?? "");
        if (!personsByKey.has(key)) {
            personsByKey.set(key, []);
        }
        personsByKey.get(key).push(person);
    }
    const personsById = new Map(persons.map((person) => [person.id, person]));

    const camps = [];
    (await db.collection("camps").get()).forEach((doc) => camps.push({ id: doc.id, ...doc.data() }));
    const existingCamp = camps.find((camp) => camp.group === args.group && camp.number === campNumber);

    // --- Resolve every child ------------------------------------------------

    /** @type {Map<string, {name: string, action: string, personId?: string, note?: string, rooms: string[]}>} */
    const resolutions = new Map();
    const problems = [];

    for (const room of rooms) {
        for (const child of room.children) {
            const key = matchKey(child.name);
            const existingResolution = resolutions.get(key);
            if (existingResolution !== undefined) {
                existingResolution.rooms.push(room.name);
                problems.push(`"${child.name}" appears in more than one room: ${existingResolution.rooms.join(", ")}`);
                continue;
            }

            const name = normalizeName(child.name);
            const resolution = { name, rooms: [room.name], grade: child.grade };
            resolutions.set(key, resolution);

            const alias = aliasByKey.get(key);
            if (alias !== undefined) {
                const { id, rename, error } = readAlias(alias, name);
                if (error !== undefined) {
                    resolution.action = "error";
                    resolution.note = error;
                    problems.push(`"${name}": ${error}`);
                } else if (id === "NEW") {
                    resolution.action = "create";
                    resolution.note = "forced by aliases file";
                } else if (!personsById.has(id)) {
                    resolution.action = "error";
                    resolution.note = `aliases file points at unknown person id "${id}"`;
                    problems.push(`"${name}": ${resolution.note}`);
                } else {
                    const person = personsById.get(id);
                    resolution.action = "reuse";
                    resolution.personId = id;
                    resolution.note = `aliases file -> "${person.name}" [${person.group || "—"}]`;
                    if (rename !== undefined && normalizeName(rename) !== normalizeName(person.name ?? "")) {
                        resolution.rename = normalizeName(rename);
                        resolution.note += `, renaming to "${resolution.rename}"`;
                    }
                }
                continue;
            }

            const candidates = personsByKey.get(key) ?? [];
            if (candidates.length === 1) {
                resolution.action = "reuse";
                resolution.personId = candidates[0].id;
                resolution.note = `group ${candidates[0].group || "—"}`;
                continue;
            }
            if (candidates.length > 1) {
                const inGroup = candidates.filter((candidate) => candidate.group === args.group);
                if (inGroup.length === 1) {
                    resolution.action = "reuse";
                    resolution.personId = inGroup[0].id;
                    resolution.note = `${candidates.length} people share this name, picked the one in ${args.group}`;
                } else {
                    resolution.action = "error";
                    resolution.note = `ambiguous: ${candidates.map((c) => `${c.id} [${c.group || "—"}]`).join(", ")}`;
                    problems.push(`"${name}": ${resolution.note}. Add it to the aliases file.`);
                }
                continue;
            }

            resolution.action = "create";
            const near = findNearMatches(name, persons);
            if (near.length > 0) {
                resolution.note = `no exact match; similar: ${near.map(({ person }) => `"${person.name}" (${person.id} [${person.group || "—"}])`).join(", ")}`;
            }
        }
    }

    // --- Report -------------------------------------------------------------

    const label = `${args.group}/${campNumber}`;
    console.log(`\n=== ${label} — ${args.target}${args.commit ? "" : " (DRY RUN, nothing is written)"} ===\n`);
    console.log(`CSV: ${args.csv}`);
    console.log(`Rooms: ${rooms.length}   Children: ${rooms.reduce((sum, room) => sum + room.children.length, 0)}   Distinct names: ${resolutions.size}`);
    console.log(
        existingCamp
            ? `Camp: ${label} already exists (${existingCamp.id}) with rooms [${Object.keys(existingCamp.rooms ?? {}).join(", ")}] — its rooms will be overwritten.`
            : `Camp: ${label} does not exist yet — it will be created.`,
    );

    console.log("\n--- Rooms ---");
    for (const room of rooms) {
        console.log(`  ${room.name.padStart(4)} (leader: ${room.leader}, not stored)`);
        for (const child of room.children) {
            const resolution = resolutions.get(matchKey(child.name));
            const marker = resolution.action === "reuse" ? "reuse" : resolution.action === "create" ? "NEW  " : "ERROR";
            const id = resolution.personId ? ` ${resolution.personId}` : "";
            console.log(`         ${marker} ${child.name} (${child.grade}.)${id}${resolution.note ? `  — ${resolution.note}` : ""}`);
        }
    }

    const created = [...resolutions.values()].filter((r) => r.action === "create");
    const reused = [...resolutions.values()].filter((r) => r.action === "reuse");
    const errored = [...resolutions.values()].filter((r) => r.action === "error");
    const renamed = reused.filter((r) => r.rename !== undefined);

    if (renamed.length > 0) {
        console.log(`\n--- People to rename (${renamed.length}) ---`);
        for (const resolution of renamed) {
            const person = personsById.get(resolution.personId);
            console.log(`  ${resolution.personId}: "${person.name}" -> "${resolution.rename}"`);
            const clash = (personsByKey.get(matchKey(resolution.rename)) ?? []).filter((p) => p.id !== resolution.personId);
            if (clash.length > 0) {
                console.log(`      warning: ${clash.map((p) => `${p.id} [${p.group || "—"}]`).join(", ")} already goes by that name`);
            }
        }
    }
    if (created.length > 0) {
        console.log(`\n--- New people to create (${created.length}), all with group "${args.group}" ---`);
        for (const resolution of created) {
            console.log(`  ${resolution.name}${resolution.note ? `\n      ${resolution.note}` : ""}`);
        }
    }
    if (errored.length > 0) {
        console.log(`\n--- Unresolved (${errored.length}) ---`);
        for (const resolution of errored) {
            console.log(`  ${resolution.name} — ${resolution.note}`);
        }
    }

    console.log("\n--- Summary ---");
    console.log(`  reuse existing person: ${reused.length}`);
    console.log(`  rename existing person:${renamed.length}`);
    console.log(`  create new person:     ${created.length}`);
    console.log(`  unresolved:            ${errored.length}`);
    console.log(`  camp:                  ${existingCamp ? `update ${existingCamp.id}` : "create"}`);
    console.log(`  rooms written:         ${rooms.length}`);

    if (problems.length > 0) {
        console.log("\n--- Problems ---");
        for (const problem of [...new Set(problems)]) {
            console.log(`  ${problem}`);
        }
    }

    if (!args.commit) {
        console.log("\nDry run finished. Re-run with --commit to write.\n");
        return;
    }
    if (problems.length > 0) {
        fail("Refusing to write while there are unresolved problems. Fix them (aliases file) and re-run.");
    }

    // --- Write --------------------------------------------------------------

    if (args.target === "prod") {
        const answer = await confirm(`\nAbout to write ${label} to PRODUCTION (${PROJECT_ID}). Type "${label}" to continue: `);
        if (answer !== label.toLowerCase()) {
            fail("Aborted.");
        }
    }

    console.log("\nWriting…");
    for (const resolution of renamed) {
        await db.collection("persons").doc(resolution.personId).update({ name: resolution.rename });
        console.log(`  renamed person ${resolution.personId} — "${personsById.get(resolution.personId).name}" -> "${resolution.rename}"`);
    }
    for (const resolution of created) {
        const ref = await db.collection("persons").add({ name: resolution.name, group: args.group });
        resolution.personId = ref.id;
        console.log(`  created person ${ref.id} — ${resolution.name}`);
    }

    const roomsPayload = {};
    for (const room of rooms) {
        roomsPayload[room.name] = room.children.map((child) => resolutions.get(matchKey(child.name)).personId);
    }

    if (existingCamp) {
        await db.collection("camps").doc(existingCamp.id).update({ rooms: roomsPayload });
        console.log(`  updated camp ${existingCamp.id} — ${label}`);
    } else {
        const ref = await db.collection("camps").add({ group: args.group, number: campNumber, rooms: roomsPayload });
        console.log(`  created camp ${ref.id} — ${label}`);
    }
    console.log("\nDone.\n");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
