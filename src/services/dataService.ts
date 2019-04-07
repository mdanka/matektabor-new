import * as firebase from "firebase/app";
import {
    SetStories,
    IAppState,
    SetPersons,
    SetCamps,
    SetHasPendingWrites,
    IPersonsState,
    ICampsState,
    IStoriesState,
} from "../store";
import { IStoryApi, IPersonApi, ICampApi } from "../commons";
import { Store } from "redoodle";
import { FirebaseAuthService } from "./firebaseAuthService";
import { runImport } from "../components/import/dataTransform";

export class DataService {
    private static COLLECTION_PERSONS = "persons";
    private static COLLECTION_CAMPS = "camps";
    private static COLLECTION_STORIES = "stories";

    private snapshotUnsubscribers: Array<() => void> = [];

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
            // TODO(mdanka): remove
            runImport();
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
            this.subscribeToCollection<IPersonApi>(DataService.COLLECTION_PERSONS, documents => {
                store.dispatch(SetPersons.create({ persons: documents }));
            }),
        );
        this.snapshotUnsubscribers.push(
            this.subscribeToCollection<ICampApi>(DataService.COLLECTION_CAMPS, documents => {
                store.dispatch(SetCamps.create({ camps: documents }));
            }),
        );
        this.snapshotUnsubscribers.push(
            this.subscribeToCollection<IStoryApi>(DataService.COLLECTION_STORIES, (documents, hasPendingWrites) => {
                store.dispatch(SetStories.create({ stories: documents }));
                store.dispatch(SetHasPendingWrites.create({ hasPendingWrites }));
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

    public updatePersonsWhoKnowStory = (storyId: string, peopleIds: string[]) => {
        return this.firestore
            .collection(DataService.COLLECTION_STORIES)
            .doc(storyId)
            .update({ personsWhoKnow: peopleIds })
            .catch((reason: any) =>
                console.error(`[DataService] Failed to update story with persons who know it. ${reason}`),
            );
    };

    /*
     * TEMP IMPORT
     */
    public deleteAllCollections = () => {
        return Promise.all([
            this.deleteCollection(DataService.COLLECTION_PERSONS),
            this.deleteCollection(DataService.COLLECTION_STORIES),
            this.deleteCollection(DataService.COLLECTION_CAMPS),
        ]);
    };

    public createData = (personMap: IPersonsState, campMap: ICampsState, storyMap: IStoriesState) => {
        return Promise.all([
            this.createFromMap(personMap, DataService.COLLECTION_PERSONS),
            this.createFromMap(campMap, DataService.COLLECTION_CAMPS),
            this.createFromMap(storyMap, DataService.COLLECTION_STORIES),
        ]);
    };

    private createFromMap = <T>(map: { [id: string]: T }, collection: string) => {
        return Promise.all(
            Object.keys(map).map(id => {
                const value = map[id];
                return this.firestore
                    .collection(collection)
                    .doc(id)
                    .set(value);
            }),
        );
    };

    private deleteCollection = (collection: string) => {
        return this.firestore
            .collection(collection)
            .get()
            .then(querySnapshot => {
                return Promise.all(querySnapshot.docs.map(doc => doc.id).map(this.getDocDeleter(collection)));
            })
            .catch((reason: any) => console.error(`[DataService] Failed to get all ${collection} IDs. ${reason}`));
    };

    private getDocDeleter = (collection: string) => (id: string) => {
        return this.firestore
            .collection(collection)
            .doc(id)
            .delete();
    };

    private querySnapshotToObjects = <API>(querySnapshot: firebase.firestore.QuerySnapshot) => {
        const songs: { [id: string]: API } = {};
        querySnapshot.forEach(doc => {
            songs[doc.id] = doc.data() as API;
        });
        return songs;
    };
}
