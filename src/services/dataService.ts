import firebase from "firebase/app";
import { SetStories, IAppState, SetPersons, SetCamps, SetHasPendingWrites } from "../store";
import { IStoryApi, IPersonApi, ICampApi, ICamp } from "../commons";
import { CollectionId } from "../types/shared";
import { Store } from "redoodle";
import { FirebaseAuthService } from "./firebaseAuthService";

export class DataService {
    private snapshotUnsubscribers: Array<() => void> = [];
    private hasPendingWritesMap: { [key: string]: boolean } = {
        [CollectionId.Persons]: false,
        [CollectionId.Camps]: false,
        [CollectionId.Stories]: false,
    };

    public constructor(
        private firestore: firebase.firestore.Firestore,
        private firebaseAuthService: FirebaseAuthService,
        private store: Store<IAppState> | undefined,
    ) {
        const currentUser = this.firebaseAuthService.authGetCurrentUser();
        this.subscribeToDataStoreIfLoggedIn(currentUser);
        firebaseAuthService.subscribeToAuthState(this.subscribeToDataStoreIfLoggedIn);
    }

    private subscribeToDataStoreIfLoggedIn = (currentUser: firebase.User | undefined | null) => {
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
        collection: string,
        onUpdate: (documents: { [id: string]: API }, hasPendingWrites: boolean) => void,
    ) => {
        const currentUser = this.firebaseAuthService.authGetCurrentUser();
        if (currentUser == null) {
            throw new Error(`Cannot subscribe to collection ${collection} if user is not logged in.`);
        }
        return this.firestore.collection(collection).onSnapshot(
            {
                includeMetadataChanges: true,
            },
            (querySnapshot: firebase.firestore.QuerySnapshot) => {
                const documents = this.querySnapshotToObjects<API>(querySnapshot);
                const hasPendingWrites = querySnapshot.docs.some(doc => doc.metadata.hasPendingWrites);
                onUpdate(documents, hasPendingWrites);
            },
        );
    };

    public getAllDocuments = async <API>(collection: string) => {
        try {
            const querySnapshot = await this.firestore.collection(collection).get();
            return this.querySnapshotToObjects<API>(querySnapshot);
        } catch (error) {
            console.error(`[DataService] Failed to get all ${collection} IDs. ${error}`);
            return {} as { [id: string]: API };
        }
    };

    public getAllDocumentIds = (collection: string) => {
        return this.firestore
            .collection(collection)
            .get()
            .then(querySnapshot => {
                return querySnapshot.docs.map(doc => doc.id);
            })
            .catch((reason: any) => console.error(`[DataService] Failed to get all ${collection} IDs. ${reason}`));
    };

    public addPersonsWhoKnowStory = (storyId: string, peopleIds: string[]) => {
        return this.firestore
            .collection(CollectionId.Stories)
            .doc(storyId)
            .update({ personsWhoKnow: firebase.firestore.FieldValue.arrayUnion(...peopleIds) })
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
        return this.firestore
            .collection(CollectionId.Stories)
            .doc(storyId)
            .update(
                isStarred
                    ? { usersWhoStarred: firebase.firestore.FieldValue.arrayUnion(userId) }
                    : { usersWhoStarred: firebase.firestore.FieldValue.arrayRemove(userId) },
            )
            .catch((reason: any) =>
                console.error(`[DataService] Failed to update story with user starring selection. ${reason}`),
            );
    };

    public createPerson = (newPerson: IPersonApi) => {
        return this.firestore.collection(CollectionId.Persons).add(newPerson);
    };

    public createCamp = (newCamp: ICampApi) => {
        return this.firestore.collection(CollectionId.Camps).add(newCamp);
    };

    public createRoom = (camp: ICamp, roomName: string) => {
        return this.updateCampRoom(camp, roomName, []);
    };

    public updateCampRoom = (camp: ICamp, roomName: string, personIds: string[]) => {
        const { id, rooms } = camp;
        const newRooms = Object.assign(rooms, { [roomName]: personIds });
        return this.firestore
            .collection(CollectionId.Camps)
            .doc(id)
            .update({ rooms: newRooms });
    };

    private querySnapshotToObjects = <API>(querySnapshot: firebase.firestore.QuerySnapshot) => {
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
