import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { ISetStoryStarredForUserRequest, CollectionId, DocId, IUserRoles, IGetUserRolesResponse, IAddNewPeopleWhoHeardStory } from "./shared";

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
    const querySnapshot = await admin.firestore().collection(CollectionId.Stories).get();
    const docs: {[id: string]: any} = {};
    querySnapshot.forEach(doc => {
        docs[doc.id] = doc.data();
    });
    return docs;
}

export const getUserRoles = functions.https.onCall(async (data, context): Promise<IGetUserRolesResponse> => {
    const { roles } = await getUserDataAndCheckIsLoggedIn(context);
    return roles;
});


export const setStoryStarredForUser = functions.https.onCall(async (data: ISetStoryStarredForUserRequest, context) => {
    const { userId } = await getUserDataAndCheckIsViewer(context);
    const { storyId, isStarred } = data;
    await admin.firestore().collection(CollectionId.Stories).doc(storyId).update({
        usersWhoStarred: isStarred ? admin.firestore.FieldValue.arrayUnion(userId) : admin.firestore.FieldValue.arrayRemove(userId),
    });
    return {};
});

export const addNewPeopleWhoHeardStory = functions.https.onCall(async (data: IAddNewPeopleWhoHeardStory, context) => {
    await getUserDataAndCheckIsViewer(context);
    const { storyId, personIds } = data;
    await admin.firestore().collection(CollectionId.Stories).doc(storyId).update({
        personsWhoKnow: admin.firestore.FieldValue.arrayUnion(...personIds),
    });
    return {};
});

export const backupData = functions.https.onCall(async (data, context) => {
    await getUserDataAndCheckIsViewer(context);
    const collectionIds = [CollectionId.Stories, CollectionId.Camps, CollectionId.Persons];
    const collections = await Promise.all(collectionIds.map(getCollection));
    const allDocs: {[id: string]: any} = {};
    collectionIds.forEach((collectionId, index) => {
        allDocs[collectionId] = collections[index];
    });
    return allDocs;
});
