import "firebase/firestore";

export class FirestoreService {
    public constructor(firestore: firebase.firestore.Firestore) {
        const settings = { timestampsInSnapshots: true };
        firestore.settings(settings);
    }
}
