import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as firestore from "@google-cloud/firestore"; 
import { PROJECT_ID } from "./shared";

admin.initializeApp(functions.config().firebase);

export const scheduledFirestoreExport = functions
    .region("europe-west1")
    .pubsub
    .schedule("1 of month 04:00")
    .timeZone("Europe/Budapest")
    .onRun(async (_context) => {
        const client = new firestore.v1.FirestoreAdminClient();
        const bucket = "gs://barkochba-app.appspot.com";
        const projectId = process.env.GCP_PROJECT ?? process.env.GCLOUD_PROJECT ?? PROJECT_ID;
        const databaseName = client.databasePath(projectId, "(default)");
        try {
            const responses = await client.exportDocuments({
                name: databaseName,
                outputUriPrefix: bucket,
                // Leave collectionIds empty to export all collections
                // or set to a list of collection IDs to export,
                // collectionIds: ['users', 'posts']
                collectionIds: [],
            })
            const response = responses[0];
            console.log(`Operation Name: ${response["name"]}`);
        } catch (err) {
            console.error(err);
            throw new Error("Export operation failed");
        }
    });
