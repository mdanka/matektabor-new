import "firebase/firestore";
import firebase from "firebase/app";

export class FirestoreService {
    public constructor(firestore: firebase.firestore.Firestore) {
        const settings = {};
        firestore.settings(settings);
        firestore.enablePersistence();
    }
}
