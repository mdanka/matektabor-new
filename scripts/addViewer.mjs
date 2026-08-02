#!/usr/bin/env node
/**
 * Adds an email address to the viewers list in Firestore (admin/roles).
 *
 * Dry run by default — nothing is written unless you pass --commit.
 *
 *   node scripts/addViewer.mjs --email someone@example.com
 *   node scripts/addViewer.mjs --email someone@example.com --target emulator --commit
 *   node scripts/addViewer.mjs --email someone@example.com --commit --confirm-prod
 *
 * The viewers list is what firestore.rules checks (isViewer) to grant access to the app,
 * matched against the signed-in user's verified email address. Emails are stored lowercased
 * and the list is kept sorted; adding an email that is already there is a no-op.
 *
 * firebase-admin is not a dependency of the web app, so it is resolved from functions/node_modules.
 * Prod access uses gcloud Application Default Credentials; the emulator needs no credentials.
 */

import { createRequire } from "node:module";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

const REPO_ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_ID = "barkochba-app";
const EMULATOR_HOST = "127.0.0.1:8080";
const ROLES_COLLECTION = "admin";
const ROLES_DOC = "roles";
const VIEWERS_FIELD = "viewers";

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
            case "--email": args.email = next(); break;
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

  --email <address>  Email address to grant the viewer role to.
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
    if (!args.email) {
        fail(`--email is required.\n${USAGE}`);
    }
    if (args.target !== "prod" && args.target !== "emulator") {
        fail(`--target must be "prod" or "emulator", got "${args.target}".`);
    }
    if (args.commit && args.target === "prod" && !args.confirmProd) {
        fail("Writing to prod needs --confirm-prod in addition to --commit.");
    }

    const email = args.email.trim().toLowerCase();
    if (!isPlausibleEmail(email)) {
        fail(`"${args.email}" does not look like an email address.`);
    }

    const { db } = await connect(args.target);
    const rolesRef = db.collection(ROLES_COLLECTION).doc(ROLES_DOC);
    const snapshot = await rolesRef.get();
    if (!snapshot.exists) {
        fail(`${ROLES_COLLECTION}/${ROLES_DOC} does not exist in ${args.target}. Refusing to create it — check the target.`);
    }

    const viewers = snapshot.get(VIEWERS_FIELD);
    if (!Array.isArray(viewers)) {
        fail(`${ROLES_COLLECTION}/${ROLES_DOC}.${VIEWERS_FIELD} is not a list (got ${typeof viewers}). Refusing to overwrite it.`);
    }

    console.log(`\nTarget:  ${args.target} (${PROJECT_ID})`);
    console.log(`Email:   ${email}`);
    console.log(`Viewers: ${viewers.length} currently`);

    // Compare case-insensitively — the rules match the token email exactly, but an
    // existing entry differing only in case would still be a duplicate in practice.
    const existing = viewers.find((viewer) => String(viewer).toLowerCase() === email);
    if (existing !== undefined) {
        console.log(`\n"${existing}" is already a viewer. Nothing to do.\n`);
        return;
    }

    const updated = [...viewers, email].sort();
    console.log(`\nWill add "${email}" -> ${updated.length} viewers.`);

    if (!args.commit) {
        console.log("\nDry run finished. Re-run with --commit to write.\n");
        return;
    }

    if (args.target === "prod") {
        const answer = await confirm(`\nAbout to grant viewer access to ${email} in PRODUCTION (${PROJECT_ID}). Type "${email}" to continue: `);
        if (answer !== email) {
            fail("Aborted.");
        }
    }

    console.log("\nWriting…");
    await rolesRef.update({ [VIEWERS_FIELD]: updated });
    console.log(`  added ${email} to ${ROLES_COLLECTION}/${ROLES_DOC}.${VIEWERS_FIELD}`);
    console.log("\nDone.\n");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
