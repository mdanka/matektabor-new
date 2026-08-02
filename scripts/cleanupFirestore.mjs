#!/usr/bin/env node
/**
 * Cleans up Firestore: renames camp/person groups and merges duplicate people.
 *
 * Dry run by default — nothing is written unless you pass --commit.
 *
 *   node scripts/cleanupFirestore.mjs --rename-group "MaMuTos=MaMuT"
 *   node scripts/cleanupFirestore.mjs --propose merge-plan.json
 *   node scripts/cleanupFirestore.mjs --plan merge-plan.json
 *   node scripts/cleanupFirestore.mjs --plan merge-plan.json --target emulator --commit
 *   node scripts/cleanupFirestore.mjs --plan merge-plan.json --commit --confirm-prod
 *
 * People are referenced from two places, both of which are rewritten on a merge:
 *   - camps/{id}.rooms[roomName]  — an array of person ids
 *   - stories/{id}.personsWhoKnow — an array of person ids
 * The survivor inherits the union of the merged people's camp rooms and known stories,
 * and the duplicate person documents are deleted.
 *
 * firebase-admin is not a dependency of the web app, so it is resolved from functions/node_modules.
 * Prod access uses gcloud Application Default Credentials; the emulator needs no credentials.
 */

import { readFileSync, writeFileSync } from "node:fs";
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

const USAGE = `
Usage: node scripts/cleanupFirestore.mjs [options]

  --rename-group <old=new>  Rename a group on every camp and person that carries it.
                            Repeatable.
  --plan <file>             JSON merge plan to apply, see --propose.
  --propose <file>          Write a candidate merge plan (people sharing a name) to <file>
                            and exit. Review and edit it before passing it to --plan.
  --prune-dangling          Drop person ids from camp rooms and stories.personsWhoKnow
                            that point at no person document.
  --target <t>              "prod" (default) or "emulator".
  --commit                  Actually write. Without this the script is a dry run.
  --confirm-prod            Required in addition to --commit when --target prod.

Merge plan format:
  {
      "merges": [
          {
              "keep": "<personId>",           // the document that survives
              "merge": ["<personId>", ...],   // documents folded into it and then deleted
              "name": "Optional new name",    // defaults to the kept person's name
              "group": "Optional new group"   // defaults to the kept person's group
          }
      ]
  }
Entries may also carry "_note" / "_why" style keys; anything starting with "_" is ignored.
`;

function parseArgs(argv) {
    const args = { target: "prod", commit: false, confirmProd: false, renames: [], pruneDangling: false };
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
            case "--rename-group": args.renames.push(next()); break;
            case "--plan": args.plan = next(); break;
            case "--propose": args.propose = next(); break;
            case "--prune-dangling": args.pruneDangling = true; break;
            case "--target": args.target = next(); break;
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
    return admin.firestore();
}

async function confirm(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise((resolveAnswer) => rl.question(question, resolveAnswer));
    rl.close();
    return answer.trim().toLowerCase();
}

async function readAll(db) {
    const read = async (name) => {
        const docs = [];
        (await db.collection(name).get()).forEach((doc) => docs.push({ id: doc.id, ...doc.data() }));
        return docs;
    };
    const [persons, camps, stories] = await Promise.all([read("persons"), read("camps"), read("stories")]);
    return { persons, camps, stories };
}

// ---------------------------------------------------------------------------
// Names and usage
// ---------------------------------------------------------------------------

const normalizeName = (name) => (name ?? "").normalize("NFC").replace(/\s+/g, " ").trim();
const matchKey = (name) => normalizeName(name).toLocaleLowerCase("hu");

/** Where each person id is referenced, so a merge can be reported and checked. */
function indexUsage({ camps, stories }) {
    const usage = new Map();
    const entry = (id) => {
        if (!usage.has(id)) {
            usage.set(id, { rooms: [], stories: [] });
        }
        return usage.get(id);
    };
    for (const camp of camps) {
        for (const [roomName, ids] of Object.entries(camp.rooms ?? {})) {
            for (const id of ids) {
                entry(id).rooms.push({ campId: camp.id, label: `${camp.group}/${camp.number}`, roomName });
            }
        }
    }
    for (const story of stories) {
        for (const id of story.personsWhoKnow ?? []) {
            entry(id).stories.push(story.number);
        }
    }
    return usage;
}

const usageOf = (usage, id) => usage.get(id) ?? { rooms: [], stories: [] };
const describePerson = (person, usage) => {
    const { rooms, stories } = usageOf(usage, person.id);
    return `${person.id} "${person.name}" [${person.group || "—"}] (${rooms.length} rooms, ${stories.length} stories)`;
};

// ---------------------------------------------------------------------------
// Proposing a merge plan
// ---------------------------------------------------------------------------

/**
 * Every set of people sharing a name, most-referenced first as the suggested survivor.
 * This is a starting point for a human, not a decision: two children really can share a name.
 */
function proposePlan({ persons }, usage) {
    const byKey = new Map();
    for (const person of persons) {
        const key = matchKey(person.name);
        if (!byKey.has(key)) {
            byKey.set(key, []);
        }
        byKey.get(key).push(person);
    }

    const merges = [];
    for (const group of byKey.values()) {
        if (group.length < 2) {
            continue;
        }
        const weight = (person) => {
            const { rooms, stories } = usageOf(usage, person.id);
            return rooms.length * 10 + stories.length;
        };
        const sorted = [...group].sort((a, b) => weight(b) - weight(a));
        const [keep, ...rest] = sorted;
        merges.push({
            _person: sorted.map((person) => describePerson(person, usage)),
            _sharedRoom: sharedCampConflicts(sorted, usage).sameRoom,
            _groups: [...new Set(sorted.map((person) => person.group || ""))],
            keep: keep.id,
            merge: rest.map((person) => person.id),
        });
    }
    merges.sort((a, b) => a._person[0].localeCompare(b._person[0], "hu"));
    return { _note: "Review every entry. Delete the ones that are genuinely different people.", merges };
}

/**
 * Two signals about a candidate merge:
 *   sameRoom — the people already sit in the same room of the same camp, which only makes
 *              sense if they are the same child. Strong evidence for merging.
 *   sameCampDifferentRooms — merging would put one person in two rooms of one camp, which
 *              the app's data model does not really allow. Worth a human look.
 */
function sharedCampConflicts(people, usage) {
    const byCamp = new Map();
    for (const person of people) {
        for (const room of usageOf(usage, person.id).rooms) {
            if (!byCamp.has(room.campId)) {
                byCamp.set(room.campId, { label: room.label, rooms: new Map() });
            }
            const camp = byCamp.get(room.campId);
            if (!camp.rooms.has(room.roomName)) {
                camp.rooms.set(room.roomName, new Set());
            }
            camp.rooms.get(room.roomName).add(person.id);
        }
    }
    const sameRoom = [];
    const sameCampDifferentRooms = [];
    for (const camp of byCamp.values()) {
        for (const [roomName, ids] of camp.rooms) {
            if (ids.size > 1) {
                sameRoom.push(`${camp.label}:${roomName}`);
            }
        }
        if (camp.rooms.size > 1) {
            sameCampDifferentRooms.push(`${camp.label}:${[...camp.rooms.keys()].join("+")}`);
        }
    }
    return { sameRoom, sameCampDifferentRooms };
}

// ---------------------------------------------------------------------------
// Planning the writes
// ---------------------------------------------------------------------------

function planGroupRenames(renames, { persons, camps }) {
    const mapping = new Map();
    for (const rename of renames) {
        const index = rename.indexOf("=");
        if (index <= 0 || index === rename.length - 1) {
            fail(`--rename-group expects "old=new", got "${rename}".`);
        }
        mapping.set(rename.slice(0, index), rename.slice(index + 1));
    }
    const campUpdates = [];
    const personUpdates = [];
    for (const [from, to] of mapping) {
        for (const camp of camps.filter((candidate) => candidate.group === from)) {
            campUpdates.push({ camp, from, to });
        }
        for (const person of persons.filter((candidate) => candidate.group === from)) {
            personUpdates.push({ person, from, to });
        }
        if (campUpdates.length === 0 && personUpdates.length === 0) {
            console.log(`  warning: nothing carries the group "${from}"`);
        }
    }
    return { mapping, campUpdates, personUpdates };
}

function planMerges(plan, data, usage, problems) {
    const personsById = new Map(data.persons.map((person) => [person.id, person]));
    const claimed = new Map();
    const merges = [];

    for (const raw of plan.merges ?? []) {
        const keep = personsById.get(raw.keep);
        if (keep === undefined) {
            problems.push(`merge plan: unknown "keep" id "${raw.keep}"`);
            continue;
        }
        const losers = [];
        for (const id of raw.merge ?? []) {
            const loser = personsById.get(id);
            if (loser === undefined) {
                problems.push(`merge plan (keep ${raw.keep}): unknown id "${id}"`);
                continue;
            }
            if (id === raw.keep) {
                problems.push(`merge plan (keep ${raw.keep}): "${id}" is both kept and merged`);
                continue;
            }
            losers.push(loser);
        }
        if (losers.length === 0) {
            continue;
        }
        for (const person of [keep, ...losers]) {
            const previous = claimed.get(person.id);
            if (previous !== undefined) {
                problems.push(`merge plan: person ${person.id} appears in two merge entries (${previous} and ${raw.keep})`);
            }
            claimed.set(person.id, raw.keep);
        }

        const name = raw.name === undefined ? normalizeName(keep.name) : normalizeName(raw.name);
        const group = raw.group === undefined ? keep.group : raw.group;
        const conflicts = sharedCampConflicts([keep, ...losers], usage);
        merges.push({ keep, losers, name, group, conflicts });
    }
    return merges;
}

/**
 * Rewrites every reference in one pass so a person merged in one entry and a group renamed in
 * another both land in the same document update. Returns the documents that actually change.
 */
function applyToDocuments(data, { mapping, merges, pruneDangling }) {
    const replacement = new Map();
    const deleted = new Set();
    for (const merge of merges) {
        for (const loser of merge.losers) {
            replacement.set(loser.id, merge.keep.id);
            deleted.add(loser.id);
        }
    }
    const known = new Set(data.persons.map((person) => person.id));
    const resolveId = (id) => replacement.get(id) ?? id;
    const isDangling = (id) => !known.has(id) || id === "";

    const campWrites = [];
    for (const camp of data.camps) {
        const update = {};
        const notes = [];
        const nextGroup = mapping.get(camp.group);
        if (nextGroup !== undefined) {
            update.group = nextGroup;
            notes.push(`group "${camp.group}" -> "${nextGroup}"`);
        }
        const rooms = {};
        let roomsChanged = false;
        for (const [roomName, ids] of Object.entries(camp.rooms ?? {})) {
            const next = [];
            for (const id of ids) {
                if (pruneDangling && isDangling(id)) {
                    notes.push(`room ${roomName}: dropped dangling "${id}"`);
                    roomsChanged = true;
                    continue;
                }
                const resolved = resolveId(id);
                if (next.includes(resolved)) {
                    notes.push(`room ${roomName}: ${resolved} would appear twice, kept once`);
                    roomsChanged = true;
                    continue;
                }
                if (resolved !== id) {
                    notes.push(`room ${roomName}: ${id} -> ${resolved}`);
                    roomsChanged = true;
                }
                next.push(resolved);
            }
            rooms[roomName] = next;
        }
        if (roomsChanged) {
            update.rooms = rooms;
        }
        if (Object.keys(update).length > 0) {
            campWrites.push({ camp, update, notes });
        }
    }

    const storyWrites = [];
    for (const story of data.stories) {
        const next = [];
        const notes = [];
        let changed = false;
        for (const id of story.personsWhoKnow ?? []) {
            if (pruneDangling && isDangling(id)) {
                notes.push(`dropped dangling "${id}"`);
                changed = true;
                continue;
            }
            const resolved = resolveId(id);
            if (next.includes(resolved)) {
                notes.push(`${resolved} would appear twice, kept once`);
                changed = true;
                continue;
            }
            if (resolved !== id) {
                notes.push(`${id} -> ${resolved}`);
                changed = true;
            }
            next.push(resolved);
        }
        if (changed) {
            storyWrites.push({ story, personsWhoKnow: next, notes });
        }
    }

    const personWrites = [];
    for (const person of data.persons) {
        if (deleted.has(person.id)) {
            continue;
        }
        const update = {};
        const merge = merges.find((candidate) => candidate.keep.id === person.id);
        const nextGroup = merge ? (mapping.get(merge.group) ?? merge.group) : mapping.get(person.group);
        const nextName = merge ? merge.name : normalizeName(person.name);
        if (nextName !== normalizeName(person.name)) {
            update.name = nextName;
        }
        if (nextGroup !== undefined && nextGroup !== person.group) {
            update.group = nextGroup;
        }
        if (Object.keys(update).length > 0) {
            personWrites.push({ person, update });
        }
    }

    return { campWrites, storyWrites, personWrites, deleted };
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
    if (args.target !== "prod" && args.target !== "emulator") {
        fail(`--target must be "prod" or "emulator", got "${args.target}".`);
    }
    if (args.commit && args.target === "prod" && !args.confirmProd) {
        fail("Writing to prod needs --confirm-prod in addition to --commit.");
    }
    if (!args.propose && args.renames.length === 0 && !args.plan && !args.pruneDangling) {
        fail(`Nothing to do. Pass --rename-group, --plan, --prune-dangling or --propose.\n${USAGE}`);
    }

    const db = await connect(args.target);
    const data = await readAll(db);
    const usage = indexUsage(data);
    console.log(`\nRead ${data.persons.length} persons, ${data.camps.length} camps, ${data.stories.length} stories from ${args.target}.`);

    if (args.propose) {
        const proposal = proposePlan(data, usage);
        writeFileSync(args.propose, `${JSON.stringify(proposal, null, 4)}\n`);
        console.log(`Wrote ${proposal.merges.length} candidate merges to ${args.propose}. Review it, then pass it to --plan.\n`);
        return;
    }

    const problems = [];
    console.log(`\n=== Cleanup — ${args.target}${args.commit ? "" : " (DRY RUN, nothing is written)"} ===`);

    console.log("\n--- Group renames ---");
    const { mapping, campUpdates, personUpdates } = planGroupRenames(args.renames, data);
    if (mapping.size === 0) {
        console.log("  none requested");
    }
    for (const { camp, from, to } of campUpdates) {
        console.log(`  camp ${camp.id} (number ${camp.number}, ${Object.keys(camp.rooms ?? {}).length} rooms): "${from}" -> "${to}"`);
        const clash = data.camps.find((other) => other.id !== camp.id && other.group === to && other.number === camp.number);
        if (clash !== undefined) {
            problems.push(`renaming camp ${camp.id} to "${to}" collides with ${clash.id}, which is already ${to}/${camp.number}`);
        }
    }
    for (const { person, from, to } of personUpdates) {
        console.log(`  person ${person.id} "${person.name}": "${from}" -> "${to}"`);
    }

    console.log("\n--- Person merges ---");
    const plan = args.plan ? JSON.parse(readFileSync(args.plan, "utf8")) : { merges: [] };
    const merges = planMerges(plan, data, usage, problems);
    if (merges.length === 0) {
        console.log("  none requested");
    }
    for (const merge of merges) {
        console.log(`  keep ${describePerson(merge.keep, usage)}`);
        for (const loser of merge.losers) {
            console.log(`    <- ${describePerson(loser, usage)}`);
        }
        if (merge.name !== normalizeName(merge.keep.name)) {
            console.log(`     name -> "${merge.name}"`);
        }
        if (merge.group !== merge.keep.group) {
            console.log(`     group -> "${merge.group || "—"}"`);
        }
        const groups = [...new Set([merge.keep, ...merge.losers].map((person) => person.group || "—"))];
        if (groups.length > 1) {
            console.log(`     note: the merged people carried different groups (${groups.join(", ")}); keeping "${merge.group || "—"}"`);
        }
        if (merge.conflicts.sameRoom.length > 0) {
            console.log(`     note: already together in ${merge.conflicts.sameRoom.join(", ")} — that room loses a duplicate entry`);
        }
        if (merge.conflicts.sameCampDifferentRooms.length > 0) {
            console.log(`     WARNING: ends up in several rooms of one camp: ${merge.conflicts.sameCampDifferentRooms.join(", ")}`);
        }
    }

    const { campWrites, storyWrites, personWrites, deleted } = applyToDocuments(data, {
        mapping,
        merges,
        pruneDangling: args.pruneDangling,
    });

    console.log("\n--- Document writes ---");
    for (const { camp, notes } of campWrites) {
        console.log(`  camp ${camp.id} (${camp.group}/${camp.number})`);
        for (const note of notes) {
            console.log(`      ${note}`);
        }
    }
    for (const { story, notes } of storyWrites) {
        console.log(`  story ${story.id} (#${story.number} ${story.title})`);
        for (const note of notes) {
            console.log(`      ${note}`);
        }
    }
    for (const { person, update } of personWrites) {
        console.log(`  person ${person.id} "${person.name}": ${JSON.stringify(update)}`);
    }
    if (deleted.size > 0) {
        console.log(`  delete ${deleted.size} person documents: ${[...deleted].join(", ")}`);
    }

    console.log("\n--- Summary ---");
    console.log(`  camps updated:    ${campWrites.length}`);
    console.log(`  stories updated:  ${storyWrites.length}`);
    console.log(`  persons updated:  ${personWrites.length}`);
    console.log(`  persons deleted:  ${deleted.size}`);

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
        fail("Refusing to write while there are unresolved problems.");
    }

    if (args.target === "prod") {
        const answer = await confirm(`\nAbout to write to PRODUCTION (${PROJECT_ID}). Type "cleanup" to continue: `);
        if (answer !== "cleanup") {
            fail("Aborted.");
        }
    }

    console.log("\nWriting…");
    let batch = db.batch();
    let pending = 0;
    const queue = async (operation) => {
        operation(batch);
        if (++pending >= 400) {
            await batch.commit();
            batch = db.batch();
            pending = 0;
        }
    };
    for (const { camp, update } of campWrites) {
        await queue((current) => current.update(db.collection("camps").doc(camp.id), update));
    }
    for (const { story, personsWhoKnow } of storyWrites) {
        await queue((current) => current.update(db.collection("stories").doc(story.id), { personsWhoKnow }));
    }
    for (const { person, update } of personWrites) {
        await queue((current) => current.update(db.collection("persons").doc(person.id), update));
    }
    for (const id of deleted) {
        await queue((current) => current.delete(db.collection("persons").doc(id)));
    }
    if (pending > 0) {
        await batch.commit();
    }
    console.log(`  wrote ${campWrites.length} camps, ${storyWrites.length} stories, ${personWrites.length} persons, deleted ${deleted.size} persons`);
    console.log("\nDone.\n");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
