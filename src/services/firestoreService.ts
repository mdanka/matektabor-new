import "firebase/firestore";

export class FirestoreService {
    public constructor(firestore: firebase.firestore.Firestore) {
        const settings = {};
        firestore.settings(settings);
        firestore.enablePersistence();
    }
}
