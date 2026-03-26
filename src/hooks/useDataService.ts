import { setStories, setPersons, setCamps, setHasPendingWrites, setHasViewerRole, setDataLoaded } from "../store";
import { IStoryApi, IPersonApi, ICampApi, ICamp } from "../commons";
import { CollectionId } from "../types/shared";
import { addDoc, arrayRemove, arrayUnion, collection, doc, FirestoreError, onSnapshot, QuerySnapshot, updateDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { useAuth, useFirestore } from "reactfire";
import { useEffect, useCallback, useRef } from "react";
import { useStore } from "react-redux";
import { useFirebaseAuthService } from "./useFirebaseAuthService";

function querySnapshotToObjects<API>(querySnapshot: QuerySnapshot) {
    const result: { [id: string]: API } = {};
    querySnapshot.forEach(doc => {
        result[doc.id] = doc.data() as API;
    });
    return result;
}

export function useDataService() {
    const store = useStore();
    const firestore = useFirestore();
    const auth = useAuth();
    const currentUserFromAuth = auth.currentUser;
    const firebaseAuthService = useFirebaseAuthService();

    const snapshotUnsubscribersRef = useRef<Array<() => void>>([]);
    const hasPendingWritesMapRef = useRef<{ [key: string]: boolean }>({
        [CollectionId.Persons]: false,
        [CollectionId.Camps]: false,
        [CollectionId.Stories]: false,
    });

    const setPendingWrite = useCallback((key: string, value: boolean) => {
        hasPendingWritesMapRef.current[key] = value;
        const hasPendingWrites = Object.values(hasPendingWritesMapRef.current).includes(true);
        store.dispatch(setHasPendingWrites({ hasPendingWrites }));
    }, [store]);

    const subscribeToCollection = useCallback(<API,>(
        currentUser: User,
        collectionName: string,
        onUpdate: (documents: { [id: string]: API }, hasPendingWrites: boolean) => void,
        onPermissionDenied: () => void,
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
            (error: FirestoreError) => {
                if (error.code === "permission-denied") {
                    onPermissionDenied();
                } else {
                    console.error(`[DataService] Failed to subscribe to collection ${collectionName}. ${error}`);
                }
            },
        );
    }, [firestore]);

    const subscribeToDataStore = useCallback((currentUser: User) => {
        // Unsubscribe previous listeners
        snapshotUnsubscribersRef.current.forEach(unsubscriber => unsubscriber());
        snapshotUnsubscribersRef.current = [];
        // Subscribe new listeners
        snapshotUnsubscribersRef.current.push(
            subscribeToCollection<IPersonApi>(currentUser, CollectionId.Persons, (documents, hasPendingWrites) => {
                store.dispatch(setHasViewerRole({ hasViewerRole: true }))
                store.dispatch(setPersons({ persons: documents }));
                store.dispatch(setDataLoaded({ arePersonsLoaded: true }));
                setPendingWrite(CollectionId.Persons, hasPendingWrites);
            },
            () => {
                store.dispatch(setHasViewerRole({ hasViewerRole: false }))
            }),
        );
        snapshotUnsubscribersRef.current.push(
            subscribeToCollection<ICampApi>(currentUser, CollectionId.Camps, (documents, hasPendingWrites) => {
                store.dispatch(setHasViewerRole({ hasViewerRole: true }))
                store.dispatch(setCamps({ camps: documents }));
                store.dispatch(setDataLoaded({ areCampsLoaded: true }));
                setPendingWrite(CollectionId.Camps, hasPendingWrites);
            },
            () => {
                store.dispatch(setHasViewerRole({ hasViewerRole: false }))
            }),
        );
        snapshotUnsubscribersRef.current.push(
            subscribeToCollection<IStoryApi>(currentUser, CollectionId.Stories, (documents, hasPendingWrites) => {
                store.dispatch(setHasViewerRole({ hasViewerRole: true }))
                store.dispatch(setStories({ stories: documents }));
                store.dispatch(setDataLoaded({ areStoriesLoaded: true }));
                setPendingWrite(CollectionId.Stories, hasPendingWrites);
            },
            () => {
                store.dispatch(setHasViewerRole({ hasViewerRole: false }))
            }),
        );
    }, [setPendingWrite, store, subscribeToCollection]);

    const subscribeToDataStoreIfLoggedIn = useCallback((currentUser: User | undefined | null) => {
        if (currentUser != null) {
            subscribeToDataStore(currentUser);
        }
    }, [subscribeToDataStore]);

    useEffect(() => {
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

    return {
        addPersonsWhoKnowStory,
        updateStoryStarred,
        createPerson,
        createCamp,
        createRoom,
        updateCampRoom,
    }
}
