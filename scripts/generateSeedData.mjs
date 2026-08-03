/**
 * Regenerates seed-data/ from scratch with entirely synthetic content.
 *
 * This repository is public, so seed-data must never be an export of the real
 * Firestore database: real stories carry the names of the people who told them,
 * and usersWhoStarred carries real Firebase Auth UIDs. Everything below is made
 * up. If you need more or different fixtures, edit this file and re-run it —
 * never copy a production export in.
 *
 * Usage:
 *   yarn seed:generate
 *
 * It boots the emulators with an empty datastore, writes the documents below,
 * and exports the result to seed-data/ (which `yarn start` then imports).
 */

import { createRequire } from "node:module";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_ID = "barkochba-app";

// firebase-admin is not a dependency of the web app, so it is resolved from functions/node_modules.
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
    console.error("\nHiba: Could not find firebase-admin. Run `npm install` in functions/.\n");
    process.exit(1);
}
const admin = require(adminPath);

admin.initializeApp({ projectId: PROJECT_ID });
const db = admin.firestore();
const auth = admin.auth();

/** Synthetic sign-in accounts. example.com/example.org are RFC 2606 reserved and cannot be registered. */
const USERS = [
    {
        uid: "tZ9LlYdP4tvP3sbE4Hj3lsDNglrc",
        email: "test.user@example.com",
        displayName: "Test User",
        rawId: "100000000000000000001",
    },
    {
        uid: "0Zo5giDXGAW8q4w2nKHGcjOM3hYG",
        email: "no.access@example.com",
        displayName: "No Access",
        rawId: "100000000000000000002",
    },
    {
        uid: "vW2QmXhT7ubQ5rcD8Kj4mtEOhmsd",
        email: "viewer.only@example.com",
        displayName: "Viewer Only",
        rawId: "100000000000000000003",
    },
];

const GROUPS = ["Mókus", "Vidra", "Sündisznó"];

/** Placeholder children. Invented name combinations, not a real camp roster. */
const FIRST_NAMES = ["Anna", "Bence", "Csenge", "Dávid", "Eszter", "Gergő", "Hanna", "István"];
const LAST_NAMES = ["Példa", "Minta", "Teszt", "Próba"];

const persons = [];
let personCounter = 0;
for (const lastName of LAST_NAMES) {
    for (const firstName of FIRST_NAMES) {
        personCounter += 1;
        persons.push({
            id: `person-${String(personCounter).padStart(3, "0")}`,
            name: `${lastName} ${firstName}`,
            group: GROUPS[personCounter % GROUPS.length],
        });
    }
}

const personIdsInGroup = (group) => persons.filter((p) => p.group === group).map((p) => p.id);

const camps = GROUPS.map((group, index) => {
    const ids = personIdsInGroup(group);
    return {
        id: `camp-${String(index + 1).padStart(3, "0")}`,
        group,
        number: index + 1,
        rooms: {
            "1. szoba": ids.slice(0, 3),
            "2. szoba": ids.slice(3, 6),
            "3. szoba": ids.slice(6),
        },
    };
});

/** Invented barkochba stories. Deliberately generic placeholders, not real riddles. */
const STORY_SEEDS = [
    {
        title: "A lámpás kertész",
        description: "Egy kertész minden este lámpással sétál végig a kerten, de sosem gyújtja meg. Miért?",
        solution: "Placeholder megoldás: a lámpás egy dísz, a kertész a holdfényben tájékozódik.",
    },
    {
        title: "A néma óra",
        description: "Egy óra pontosan jár, mégsem hallja senki ketyegni. Hogyan lehetséges?",
        solution: "Placeholder megoldás: az óra egy festményen látható.",
    },
    {
        title: "A visszafelé folyó patak",
        description: "Egy faluban a patak reggelente az egyik, délutánonként a másik irányba folyik.",
        solution: "Placeholder megoldás: a falu egy árapállyal érintett torkolat mellett fekszik.",
    },
    {
        title: "A kétszer feladott levél",
        description: "Egy levelet ugyanaz az ember kétszer adott fel, ugyanarra a címre, ugyanazon a napon.",
        solution: "Placeholder megoldás: az első boríték címzése elmosódott az esőben.",
    },
    {
        title: "A hiányzó lépcsőfok",
        description: "Egy lépcsőn mindenki tizennégy fokot számol felfelé, és tizenhármat lefelé.",
        solution: "Placeholder megoldás: a legalsó fok a járdaszinttel egy magasságban van.",
    },
    {
        title: "A csendes hangverseny",
        description: "Egy teltházas hangversenyen a közönség egyetlen hangot sem hallott, mégis tapsolt.",
        solution: "Placeholder megoldás: a darab egy szándékosan néma kompozíció volt.",
    },
    {
        title: "A megfordított térkép",
        description: "Egy túrázó fejjel lefelé tartotta a térképet, és így talált oda a menedékházhoz.",
        solution: "Placeholder megoldás: dél felől érkezett, a térkép észak felé volt tájolva.",
    },
    {
        title: "A két egyforma kulcs",
        description: "Két teljesen egyforma kulcs közül csak az egyik nyitja a zárat.",
        solution: "Placeholder megoldás: a másik kulcs egy másolat, amelyet még nem reszeltek készre.",
    },
];

const stories = STORY_SEEDS.map((seed, index) => ({
    id: `story-${String(index + 1).padStart(3, "0")}`,
    title: seed.title,
    description: seed.description,
    solution: seed.solution,
    number: index + 1,
    // A rotating slice of the placeholder children, so the UI has something to render.
    personsWhoKnow: persons.filter((_p, i) => i % (index + 2) === 0).map((p) => p.id),
    // Only the synthetic seed accounts ever appear here.
    usersWhoStarred: index % 3 === 0 ? [USERS[0].uid] : [],
}));

async function main() {
    console.log(`Seeding ${persons.length} persons, ${camps.length} camps, ${stories.length} stories...`);

    await auth.importUsers(
        USERS.map((user) => ({
            uid: user.uid,
            email: user.email,
            emailVerified: true,
            displayName: user.displayName,
            providerData: [
                {
                    uid: user.rawId,
                    providerId: "google.com",
                    email: user.email,
                    displayName: user.displayName,
                },
            ],
        })),
    );

    const batch = db.batch();
    batch.set(db.collection("admin").doc("roles"), {
        viewers: [USERS[0].email, USERS[2].email],
        admins: [USERS[0].email],
    });
    for (const { id, ...data } of persons) {
        batch.set(db.collection("persons").doc(id), data);
    }
    for (const { id, ...data } of camps) {
        batch.set(db.collection("camps").doc(id), data);
    }
    for (const { id, ...data } of stories) {
        batch.set(db.collection("stories").doc(id), data);
    }
    await batch.commit();

    console.log("Seed data written to the emulators; it will be exported on exit.");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
