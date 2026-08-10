#!/usr/bin/env node
/**
 * Adds an email address to the viewers or admins list in Firestore (admin/roles).
 *
 * Dry run by default — nothing is written unless you pass --commit.
 *
 *   node scripts/addViewer.mjs --email someone@example.com
 *   node scripts/addViewer.mjs --email someone@example.com --role admin
 *   node scripts/addViewer.mjs --email someone@example.com --target emulator --commit
 *   node scripts/addViewer.mjs --email someone@example.com --commit --confirm-prod
 *
 * These lists are what firestore.rules checks (isViewer/isAdmin) to grant access, matched
 * against the signed-in user's verified email address. Admins can manage both lists from
 * the app's manage screen, but since only admins may write the lists from the client, the
 * very first admin has to be added with this script. Emails are stored lowercased and the
 * list is kept sorted; adding an email that is already there is a no-op.
 *
 * firebase-admin is a devDependency at the repo root, used only by these scripts.
 * Prod access uses gcloud Application Default Credentials; the emulator needs no credentials.
 */

import { createRequire } from "node:module";
import readline from "node:readline";

const PROJECT_ID = "barkochba-app";
const EMULATOR_HOST = "127.0.0.1:8080";
const ROLES_COLLECTION = "admin";
const ROLES_DOC = "roles";
const ROLE_FIELDS = { viewer: "viewers", admin: "admins" };

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------

function parseArgs(argv) {
    const args = { target: "prod", role: "viewer", commit: false, confirmProd: false };
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
            case "--email": args.email = next(); break;
            case "--role": args.role = next(); break;
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

const USAGE = `
Usage: yarn add-viewer --email <address> [options]
       node scripts/addViewer.mjs --email <address> [options]

  --email <address>  Email address to grant the role to.
  --role <r>         "viewer" (default) or "admin".
  --target <t>       "prod" (default) or "emulator".
  --commit           Actually write. Without this the script is a dry run.
  --confirm-prod     Required in addition to --commit when --target prod.
`;

// A deliberately loose check: catch typos like a missing @ or stray whitespace,
// without trying to out-guess what an email server will accept.
function isPlausibleEmail(email) {
    return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email);
}

// ---------------------------------------------------------------------------
// Firestore
// ---------------------------------------------------------------------------

async function connect(target) {
    const require = createRequire(import.meta.url);
    let adminPath;
    try {
        adminPath = require.resolve("firebase-admin");
    } catch {
        fail("Could not find firebase-admin. Run `yarn install` at the repo root.");
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
    if (!args.email) {
        fail(`--email is required.\n${USAGE}`);
    }
    if (args.target !== "prod" && args.target !== "emulator") {
        fail(`--target must be "prod" or "emulator", got "${args.target}".`);
    }
    if (!(args.role in ROLE_FIELDS)) {
        fail(`--role must be "viewer" or "admin", got "${args.role}".`);
    }
    if (args.commit && args.target === "prod" && !args.confirmProd) {
        fail("Writing to prod needs --confirm-prod in addition to --commit.");
    }

    const email = args.email.trim().toLowerCase();
    if (!isPlausibleEmail(email)) {
        fail(`"${args.email}" does not look like an email address.`);
    }

    const roleField = ROLE_FIELDS[args.role];
    const { db } = await connect(args.target);
    const rolesRef = db.collection(ROLES_COLLECTION).doc(ROLES_DOC);
    const snapshot = await rolesRef.get();
    if (!snapshot.exists) {
        fail(`${ROLES_COLLECTION}/${ROLES_DOC} does not exist in ${args.target}. Refusing to create it — check the target.`);
    }

    // The admins field may not exist yet on documents created before the admin role did.
    const members = snapshot.get(roleField) ?? [];
    if (!Array.isArray(members)) {
        fail(`${ROLES_COLLECTION}/${ROLES_DOC}.${roleField} is not a list (got ${typeof members}). Refusing to overwrite it.`);
    }

    console.log(`\nTarget:  ${args.target} (${PROJECT_ID})`);
    console.log(`Email:   ${email}`);
    console.log(`Role:    ${args.role}`);
    console.log(`Current: ${members.length} ${roleField}`);

    // Compare case-insensitively — the rules match the token email exactly, but an
    // existing entry differing only in case would still be a duplicate in practice.
    const existing = members.find((member) => String(member).toLowerCase() === email);
    if (existing !== undefined) {
        console.log(`\n"${existing}" is already in ${roleField}. Nothing to do.\n`);
        return;
    }

    const updated = [...members, email].sort();
    console.log(`\nWill add "${email}" -> ${updated.length} ${roleField}.`);

    if (!args.commit) {
        console.log("\nDry run finished. Re-run with --commit to write.\n");
        return;
    }

    if (args.target === "prod") {
        const answer = await confirm(`\nAbout to grant ${args.role} access to ${email} in PRODUCTION (${PROJECT_ID}). Type "${email}" to continue: `);
        if (answer !== email) {
            fail("Aborted.");
        }
    }

    console.log("\nWriting…");
    await rolesRef.update({ [roleField]: updated });
    console.log(`  added ${email} to ${ROLES_COLLECTION}/${ROLES_DOC}.${roleField}`);
    console.log("\nDone.\n");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
