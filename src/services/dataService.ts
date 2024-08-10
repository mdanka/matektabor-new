import { SetStories, IAppState, SetPersons, SetCamps, SetHasPendingWrites } from "../store";
import { IStoryApi, IPersonApi, ICampApi, ICamp } from "../commons";
import { CollectionId } from "../types/shared";
import { Store } from "redoodle";
import { FirebaseAuthService } from "./firebaseAuthService";
import { addDoc, arrayRemove, arrayUnion, collection, doc, Firestore, getDocs, getFirestore, onSnapshot, QuerySnapshot, updateDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { FirebaseApp } from "firebase/app";

export class DataService {
    private firestore: Firestore;
    private snapshotUnsubscribers: Array<() => void> = [];
    private hasPendingWritesMap: { [key: string]: boolean } = {
        [CollectionId.Persons]: false,
        [CollectionId.Camps]: false,
        [CollectionId.Stories]: false,
    };

    public constructor(
        firebaseApp: FirebaseApp,
        private firebaseAuthService: FirebaseAuthService,
        private store: Store<IAppState> | undefined,
    ) {
        this.firestore = getFirestore(firebaseApp);
        const currentUser = this.firebaseAuthService.authGetCurrentUser();
        this.subscribeToDataStoreIfLoggedIn(currentUser);
        firebaseAuthService.subscribeToAuthState(this.subscribeToDataStoreIfLoggedIn);
    }

    private subscribeToDataStoreIfLoggedIn = (currentUser: User | undefined | null) => {
        if (currentUser != null) {
            this.subscribeToDataStore();
        }
    };

    public subscribeToDataStore = () => {
        if (this.store === undefined) {
            return;
        }
        const store = this.store;
        // Unsubscribe previous listeners
        this.snapshotUnsubscribers.forEach(unsubscriber => unsubscriber());
        this.snapshotUnsubscribers.splice(0, this.snapshotUnsubscribers.length);
        // Subscribe new listeners
        this.snapshotUnsubscribers.push(
            this.subscribeToCollection<IPersonApi>(CollectionId.Persons, (documents, hasPendingWrites) => {
                store.dispatch(SetPersons.create({ persons: documents }));
                this.setPendingWrite(CollectionId.Persons, hasPendingWrites);
            }),
        );
        this.snapshotUnsubscribers.push(
            this.subscribeToCollection<ICampApi>(CollectionId.Camps, (documents, hasPendingWrites) => {
                store.dispatch(SetCamps.create({ camps: documents }));
                this.setPendingWrite(CollectionId.Camps, hasPendingWrites);
            }),
        );
        this.snapshotUnsubscribers.push(
            this.subscribeToCollection<IStoryApi>(CollectionId.Stories, (documents, hasPendingWrites) => {
                store.dispatch(SetStories.create({ stories: documents }));
                this.setPendingWrite(CollectionId.Stories, hasPendingWrites);
            }),
        );
    };

    public subscribeToCollection = <API>(
        collectionName: string,
        onUpdate: (documents: { [id: string]: API }, hasPendingWrites: boolean) => void,
    ) => {
        const currentUser = this.firebaseAuthService.authGetCurrentUser();
        if (currentUser == null) {
            throw new Error(`Cannot subscribe to collection ${collection} if user is not logged in.`);
        }
        const collectionRef = collection(this.firestore, collectionName);
        return onSnapshot(
            collectionRef,
            { includeMetadataChanges: true },
            (querySnapshot: QuerySnapshot) => {
                const documents = this.querySnapshotToObjects<API>(querySnapshot);
                const hasPendingWrites = querySnapshot.docs.some(doc => doc.metadata.hasPendingWrites);
                onUpdate(documents, hasPendingWrites);
            },
        );
    };

    public getAllDocuments = async <API>(collectionName: string) => {
        try {
            const collectionRef = collection(this.firestore, collectionName);
            const querySnapshot = await getDocs(collectionRef);
            return this.querySnapshotToObjects<API>(querySnapshot);
        } catch (error) {
            console.error(`[DataService] Failed to get all ${collection} IDs. ${error}`);
            return {} as { [id: string]: API };
        }
    };

    public getAllDocumentIds = (collectionName: string) => {
        const collectionRef = collection(this.firestore, collectionName);
        return getDocs(collectionRef)
            .then(querySnapshot => {
                return querySnapshot.docs.map(doc => doc.id);
            })
            .catch((reason: any) => {
                console.error(`[DataService] Failed to get all ${collectionName} IDs. ${reason}`);
            });
    };

    public addPersonsWhoKnowStory = (storyId: string, peopleIds: string[]) => {
        const storyDocRef = doc(collection(this.firestore, CollectionId.Stories), storyId);
        return updateDoc(storyDocRef, { personsWhoKnow: arrayUnion(...peopleIds) })
            .catch((reason: any) =>
                console.error(`[DataService] Failed to update story with persons who know it. ${reason}`),
            );
    };

    public updateStoryStarred = (storyId: string, isStarred: boolean) => {
        const currentUser = this.firebaseAuthService.authGetCurrentUser();
        if (currentUser == null) {
            return;
        }
        const userId = currentUser.uid;
        const storyDocRef = doc(collection(this.firestore, CollectionId.Stories), storyId);

        return updateDoc(
            storyDocRef,
            isStarred
                ? { usersWhoStarred: arrayUnion(userId) }
                : { usersWhoStarred: arrayRemove(userId) }
        )
        .catch((reason: any) =>
            console.error(`[DataService] Failed to update story with user starring selection. ${reason}`),
        );
    };

    public createPerson = (newPerson: IPersonApi) => {
        const personsCollectionRef = collection(this.firestore, CollectionId.Persons);
        return addDoc(personsCollectionRef, newPerson);
    };

    public createCamp = (newCamp: ICampApi) => {
        const campsCollectionRef = collection(this.firestore, CollectionId.Camps);
        return addDoc(campsCollectionRef, newCamp);
    };

    public createRoom = (camp: ICamp, roomName: string) => {
        return this.updateCampRoom(camp, roomName, []);
    };

    public updateCampRoom = (camp: ICamp, roomName: string, personIds: string[]) => {
        const { id, rooms } = camp;
        const newRooms = { ...rooms, [roomName]: personIds };
        const campDocRef = doc(collection(this.firestore, CollectionId.Camps), id);

        return updateDoc(campDocRef, { rooms: newRooms });
    };

    private querySnapshotToObjects = <API>(querySnapshot: QuerySnapshot) => {
        const songs: { [id: string]: API } = {};
        querySnapshot.forEach(doc => {
            songs[doc.id] = doc.data() as API;
        });
        return songs;
    };

    private setPendingWrite = (key: string, value: boolean) => {
        this.hasPendingWritesMap[key] = value;
        const hasPendingWrites = Object.values(this.hasPendingWritesMap).indexOf(true) !== -1;
        const store = this.store;
        if (store === undefined) {
            return;
        }
        store.dispatch(SetHasPendingWrites.create({ hasPendingWrites }));
    };
}
