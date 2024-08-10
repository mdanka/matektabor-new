import { FirebaseApp } from 'firebase/app';
import { initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

export class FirestoreService {
    public constructor(firebaseApp: FirebaseApp) {
        const settings = {};
        const initializedFirestore = initializeFirestore(firebaseApp, settings);
        enableIndexedDbPersistence(initializedFirestore);
    }
}
