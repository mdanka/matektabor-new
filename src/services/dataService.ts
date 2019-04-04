import * as firebase from "firebase/app";
import { SetStories, IAppState, SetPersons, SetCamps } from "../store";
import { IStoryApi, IPersonApi, ICampApi } from "../commons";
import { Store } from "redoodle";
import { FirebaseAuthService } from "./firebaseAuthService";

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
            this.subscribeToCollection<IStoryApi>(DataService.COLLECTION_STORIES, documents => {
                store.dispatch(SetStories.create({ stories: documents }));
            }),
        );
    };

    public subscribeToCollection = <API>(collection: string, onUpdate: (documents: { [id: string]: API }) => void) => {
        const currentUser = this.firebaseAuthService.authGetCurrentUser();
        if (currentUser == null) {
            throw new Error(`Cannot subscribe to collection ${collection} if user is not logged in.`);
        }
        return this.firestore.collection(collection).onSnapshot((querySnapshot: firebase.firestore.QuerySnapshot) => {
            const documents = this.querySnapshotToObjects<API>(querySnapshot);
            onUpdate(documents);
        });
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

    private querySnapshotToObjects = <API>(querySnapshot: firebase.firestore.QuerySnapshot) => {
        const songs: { [id: string]: API } = {};
        querySnapshot.forEach(doc => {
            songs[doc.id] = doc.data() as API;
        });
        return songs;
    };
}
