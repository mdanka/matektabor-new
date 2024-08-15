import { SetStories, SetPersons, SetCamps, SetHasPendingWrites } from "../store";
import { IStoryApi, IPersonApi, ICampApi, ICamp } from "../commons";
import { CollectionId } from "../types/shared";
import { addDoc, arrayRemove, arrayUnion, collection, doc, onSnapshot, QuerySnapshot, updateDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { useAuth, useFirestore } from "reactfire";
import { useEffect, useCallback } from "react";
import { useStore } from "react-redux";
import { useFirebaseAuthService } from "./useFirebaseAuthService";

const snapshotUnsubscribers: Array<() => void> = [];
const hasPendingWritesMap: { [key: string]: boolean } = {
    [CollectionId.Persons]: false,
    [CollectionId.Camps]: false,
    [CollectionId.Stories]: false,
};

export function useDataService() {
    const store = useStore();
    const firestore = useFirestore();
    const auth = useAuth();
    const currentUserFromAuth = auth.currentUser;
    const firebaseAuthService = useFirebaseAuthService();

    const setPendingWrite = useCallback((key: string, value: boolean) => {
        hasPendingWritesMap[key] = value;
        const hasPendingWrites = Object.values(hasPendingWritesMap).indexOf(true) !== -1;
        store.dispatch(SetHasPendingWrites.create({ hasPendingWrites }));
    }, [store]);

    const subscribeToCollection = useCallback(<API>(
        currentUser: User,
        collectionName: string,
        onUpdate: (documents: { [id: string]: API }, hasPendingWrites: boolean) => void,
    ) => {
        if (currentUser == null) {
            throw new Error(`Cannot subscribe to collection ${collectionName} if user is not logged in.`);
        }
        const collectionRef = collection(firestore, collectionName);
        return onSnapshot(
            collectionRef,
            { includeMetadataChanges: true },
            (querySnapshot: QuerySnapshot) => {
                const documents = querySnapshotToObjects<API>(querySnapshot);
                const hasPendingWrites = querySnapshot.docs.some(doc => doc.metadata.hasPendingWrites);
                onUpdate(documents, hasPendingWrites);
            },
        );
    }, [firestore]);

    const subscribeToDataStore = useCallback((currentUser: User) => {
        // Unsubscribe previous listeners
        snapshotUnsubscribers.forEach(unsubscriber => unsubscriber());
        snapshotUnsubscribers.splice(0, snapshotUnsubscribers.length);
        // Subscribe new listeners
        snapshotUnsubscribers.push(
            subscribeToCollection<IPersonApi>(currentUser, CollectionId.Persons, (documents, hasPendingWrites) => {
                store.dispatch(SetPersons.create({ persons: documents }));
                setPendingWrite(CollectionId.Persons, hasPendingWrites);
            }),
        );
        snapshotUnsubscribers.push(
            subscribeToCollection<ICampApi>(currentUser, CollectionId.Camps, (documents, hasPendingWrites) => {
                store.dispatch(SetCamps.create({ camps: documents }));
                setPendingWrite(CollectionId.Camps, hasPendingWrites);
            }),
        );
        snapshotUnsubscribers.push(
            subscribeToCollection<IStoryApi>(currentUser, CollectionId.Stories, (documents, hasPendingWrites) => {
                store.dispatch(SetStories.create({ stories: documents }));
                setPendingWrite(CollectionId.Stories, hasPendingWrites);
            }),
        );
    }, [setPendingWrite, store, subscribeToCollection]);

    const subscribeToDataStoreIfLoggedIn = useCallback((currentUser: User | undefined | null) => {
        if (currentUser != null) {
            subscribeToDataStore(currentUser);
        }
    }, [subscribeToDataStore]);

    useEffect(() => {
        // TODO(mdanka): without disabling this line, the system seems to get into an infinite loop
        // subscribeToDataStoreIfLoggedIn(currentUser);
        firebaseAuthService.subscribeToAuthState(subscribeToDataStoreIfLoggedIn);
    }, [currentUserFromAuth, firebaseAuthService, subscribeToDataStoreIfLoggedIn]);

    const addPersonsWhoKnowStory = (storyId: string, peopleIds: string[]) => {
        const storyDocRef = doc(collection(firestore, CollectionId.Stories), storyId);
        return updateDoc(storyDocRef, { personsWhoKnow: arrayUnion(...peopleIds) })
            .catch((reason: unknown) =>
                console.error(`[DataService] Failed to update story with persons who know it. ${reason}`),
            );
    };

    const updateStoryStarred = useCallback((storyId: string, isStarred: boolean) => {
        if (currentUserFromAuth == null) {
            return;
        }
        const userId = currentUserFromAuth.uid;
        const storyDocRef = doc(collection(firestore, CollectionId.Stories), storyId);

        return updateDoc(
            storyDocRef,
            isStarred
                ? { usersWhoStarred: arrayUnion(userId) }
                : { usersWhoStarred: arrayRemove(userId) }
        )
        .catch((reason: unknown) =>
            console.error(`[DataService] Failed to update story with user starring selection. ${reason}`),
        );
    }, [currentUserFromAuth, firestore]);

    const createPerson = (newPerson: IPersonApi) => {
        const personsCollectionRef = collection(firestore, CollectionId.Persons);
        return addDoc(personsCollectionRef, newPerson);
    };

    const createCamp = (newCamp: ICampApi) => {
        const campsCollectionRef = collection(firestore, CollectionId.Camps);
        return addDoc(campsCollectionRef, newCamp);
    };

    const createRoom = (camp: ICamp, roomName: string) => {
        return updateCampRoom(camp, roomName, []);
    };

    const updateCampRoom = (camp: ICamp, roomName: string, personIds: string[]) => {
        const { id, rooms } = camp;
        const newRooms = { ...rooms, [roomName]: personIds };
        const campDocRef = doc(collection(firestore, CollectionId.Camps), id);

        return updateDoc(campDocRef, { rooms: newRooms });
    };

    const querySnapshotToObjects = <API>(querySnapshot: QuerySnapshot) => {
        const songs: { [id: string]: API } = {};
        querySnapshot.forEach(doc => {
            songs[doc.id] = doc.data() as API;
        });
        return songs;
    };

    return {
        addPersonsWhoKnowStory,
        updateStoryStarred,
        createPerson,
        createCamp,
        createRoom,
        updateCampRoom,
    }
}
