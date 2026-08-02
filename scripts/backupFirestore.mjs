#!/usr/bin/env node
/**
 * Dumps every Firestore collection to CSV files under backups/<timestamp>/.
 *
 *   node scripts/backupFirestore.mjs
 *   node scripts/backupFirestore.mjs --target emulator --out /tmp/somewhere
 *
 * Alongside the CSVs it writes snapshot.json, which is the exact document contents.
 * The CSVs are for reading; snapshot.json is what you would restore from, because
 * CSV cannot round-trip the nested `rooms` map or distinguish a missing field from
 * an empty one.
 *
 * Backups hold children's names, so backups/ is git-ignored. Keep it that way.
 *
 * firebase-admin is not a dependency of the web app, so it is resolved from functions/node_modules.
 * Prod access uses gcloud Application Default Credentials; the emulator needs no credentials.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_ID = "barkochba-app";
const EMULATOR_HOST = "127.0.0.1:8080";
const COLLECTIONS = ["persons", "camps", "stories", "admin"];

function fail(message) {
    console.error(`\nHiba: ${message}\n`);
    process.exit(1);
}

function parseArgs(argv) {
    const args = { target: "prod" };
    for (let i = 0; i < argv.length; i++) {
        switch (argv[i]) {
            case "--target": args.target = argv[++i]; break;
            case "--out": args.out = argv[++i]; break;
            case "--help": case "-h": args.help = true; break;
            default: fail(`Unknown argument: ${argv[i]}`);
        }
    }
    return args;
}

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
        fail("Could not find firebase-admin. Run `npm install` in functions/.");
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

const escapeCell = (value) => {
    const text =
        value === undefined || value === null
            ? ""
            : Array.isArray(value) || typeof value === "object"
              ? JSON.stringify(value)
              : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const toCsv = (columns, rows) =>
    `${[columns.join(","), ...rows.map((row) => columns.map((column) => escapeCell(row[column])).join(","))].join("\n")}\n`;

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        console.log("\nUsage: node scripts/backupFirestore.mjs [--target prod|emulator] [--out <dir>]\n");
        return;
    }
    if (args.target !== "prod" && args.target !== "emulator") {
        fail(`--target must be "prod" or "emulator", got "${args.target}".`);
    }

    const db = await connect(args.target);
    const data = {};
    for (const name of COLLECTIONS) {
        const docs = [];
        (await db.collection(name).get()).forEach((doc) => docs.push({ id: doc.id, ...doc.data() }));
        data[name] = docs;
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outDir = args.out ?? join(REPO_ROOT, "backups", `${args.target}-${stamp}`);
    mkdirSync(outDir, { recursive: true });

    const write = (file, contents) => {
        writeFileSync(join(outDir, file), contents);
        console.log(`  ${file}`);
    };
    const nameOf = new Map(data.persons.map((person) => [person.id, person.name]));

    console.log(`\nBacking up ${args.target} to ${outDir}`);
    write("snapshot.json", `${JSON.stringify(data, null, 2)}\n`);
    write("persons.csv", toCsv(["id", "name", "group"], data.persons));
    write(
        "camps.csv",
        toCsv(
            ["id", "group", "number", "roomCount", "personCount"],
            data.camps.map((camp) => ({
                ...camp,
                roomCount: Object.keys(camp.rooms ?? {}).length,
                personCount: Object.values(camp.rooms ?? {}).flat().length,
            })),
        ),
    );
    write(
        "camp-rooms.csv",
        toCsv(
            ["campId", "group", "number", "room", "personId", "personName"],
            data.camps.flatMap((camp) =>
                Object.entries(camp.rooms ?? {}).flatMap(([room, ids]) =>
                    ids.map((personId) => ({
                        campId: camp.id,
                        group: camp.group,
                        number: camp.number,
                        room,
                        personId,
                        personName: nameOf.get(personId) ?? "(unknown)",
                    })),
                ),
            ),
        ),
    );
    write(
        "stories.csv",
        toCsv(
            ["id", "number", "title", "description", "solution", "personsWhoKnowCount", "personsWhoKnow", "usersWhoStarred"],
            data.stories.map((story) => ({
                ...story,
                personsWhoKnowCount: (story.personsWhoKnow ?? []).length,
                personsWhoKnow: (story.personsWhoKnow ?? []).join(";"),
                usersWhoStarred: (story.usersWhoStarred ?? []).join(";"),
            })),
        ),
    );
    write(
        "story-persons.csv",
        toCsv(
            ["storyId", "storyNumber", "personId", "personName"],
            data.stories.flatMap((story) =>
                (story.personsWhoKnow ?? []).map((personId) => ({
                    storyId: story.id,
                    storyNumber: story.number,
                    personId,
                    personName: nameOf.get(personId) ?? "(unknown)",
                })),
            ),
        ),
    );
    write("admin.csv", toCsv(["id", "viewers"], data.admin.map((doc) => ({ ...doc, viewers: doc.viewers }))));

    console.log(`\nDone: ${COLLECTIONS.map((name) => `${data[name].length} ${name}`).join(", ")}\n`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
