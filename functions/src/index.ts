import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as firestore from "@google-cloud/firestore"; 
import { ISetStoryStarredForUserRequest, CollectionId, DocId, IUserRoles, IGetUserRolesResponse, IAddNewPeopleWhoHeardStory, PROJECT_ID } from "./shared";

admin.initializeApp(functions.config().firebase);

const getUserIdFromContext = (context: functions.https.CallableContext) => {
    const { auth } = context;
    return auth === undefined ? undefined : auth.uid;
}

const getUserForUserId = (userId: string) => {
    return admin.auth().getUser(userId);
}

const getVerifiedEmailForUser = (user: admin.auth.UserRecord) => {
    const { email, emailVerified} = user;
    return emailVerified ? email : undefined;
}

const getRolesForEmail = async (email: string): Promise<IUserRoles> => {
    const rolesDoc = await admin.firestore().collection(CollectionId.Admin).doc(DocId.Roles).get()
    const rolesData = rolesDoc.data();
    if (rolesData === undefined) {
        return { isViewer: false };
    }
    const viewers = rolesData.viewers as string[];
    return {
        isViewer: viewers.indexOf(email) !== -1,
    };
}

const getUserDataAndCheckIsLoggedIn = async (context: functions.https.CallableContext) => {
    const userId = getUserIdFromContext(context);
    if (userId === undefined) {
        throw new functions.https.HttpsError("unauthenticated", "You have to be logged in to call this function.");
    }
    const user = await getUserForUserId(userId);
    const email = getVerifiedEmailForUser(user);
    if (email === undefined) {
        throw new functions.https.HttpsError("permission-denied", "You don't have persmissions to call this function.");
    }
    const roles = await getRolesForEmail(email);
    return { userId, email, roles };
}

const getUserDataAndCheckIsViewer = async (context: functions.https.CallableContext) => {
    const userData = await getUserDataAndCheckIsLoggedIn(context);
    const { roles } = userData;
    if (!roles.isViewer) {
        throw new functions.https.HttpsError("permission-denied", "You don't have persmissions to call this function.");
    }
    return userData;
}

const getCollection = async (collectionId: string) => {
    const querySnapshot = await admin.firestore().collection(collectionId).get();
    const docs: {[id: string]: unknown} = {};
    querySnapshot.forEach(doc => {
        docs[doc.id] = doc.data();
    });
    return docs;
}

export const getUserRoles = functions.region("europe-west1").https.onCall(async (data, context): Promise<IGetUserRolesResponse> => {
    const { roles } = await getUserDataAndCheckIsLoggedIn(context);
    return roles;
});


export const setStoryStarredForUser = functions.region("europe-west1").https.onCall(async (data: ISetStoryStarredForUserRequest, context) => {
    const { userId } = await getUserDataAndCheckIsViewer(context);
    const { storyId, isStarred } = data;
    await admin.firestore().collection(CollectionId.Stories).doc(storyId).update({
        usersWhoStarred: isStarred ? admin.firestore.FieldValue.arrayUnion(userId) : admin.firestore.FieldValue.arrayRemove(userId),
    });
    return {};
});

export const addNewPeopleWhoHeardStory = functions.region("europe-west1").https.onCall(async (data: IAddNewPeopleWhoHeardStory, context) => {
    await getUserDataAndCheckIsViewer(context);
    const { storyId, personIds } = data;
    await admin.firestore().collection(CollectionId.Stories).doc(storyId).update({
        personsWhoKnow: admin.firestore.FieldValue.arrayUnion(...personIds),
    });
    return {};
});

export const backupData = functions.region("europe-west1").https.onCall(async (data, context) => {
    await getUserDataAndCheckIsViewer(context);
    const collectionIds = [CollectionId.Stories, CollectionId.Camps, CollectionId.Persons];
    const collections = await Promise.all(collectionIds.map(getCollection));
    const allDocs: {[id: string]: unknown} = {};
    collectionIds.forEach((collectionId, index) => {
        allDocs[collectionId] = collections[index];
    });
    return JSON.stringify(allDocs);
});

export const scheduledFirestoreExport = functions
    .region("europe-west1")
    .pubsub
    .schedule("1 of month 04:00")
    .timeZone("Europe/Budapest")
    .onRun(async (_context) => {
        const client = new firestore.v1.FirestoreAdminClient();
        const bucket = "gs://barkochba-app.appspot.com";
        const projectId = process.env.GCP_PROJECT ?? process.env.GCLOUD_PROJECT ?? PROJECT_ID;
        const databaseName = client.databasePath(projectId, '(default)');
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
            console.log(`Operation Name: ${response['name']}`);
        } catch (err) {
            console.error(err);
            throw new Error('Export operation failed');
        }
    });
