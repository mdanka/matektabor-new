import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import {
    AuthProvider,
    FunctionsProvider,
    useFirebaseApp,
    StorageProvider,
    FirestoreProvider,
    AppCheckProvider,
    useInitFirestore,
} from "reactfire";
// import { AppCheck } from "firebase/app-check";

// const APP_CHECK_TOKEN = "6LdzrQoqAAAAABwDfR1mb8Q8JArK5R1TvJ-xIOHz";

export function FirebaseComponents(props: { children: React.ReactNode }) {
    const { children } = props;
    const app = useFirebaseApp(); // a parent component contains a `FirebaseAppProvider`
    const appCheck = undefined;
    // let appCheck: AppCheck | undefined = undefined;
    // if (typeof window !== "undefined") {
    //     // We can't initialize App Check while in SSR
    //     // TODO(mdanka): this is a bit hacky about the SSR...
    //     // In the local emulators Functions won't check the token itself, but they check for the presence of one,
    //     // so we create a fake token. See: https://stackoverflow.com/a/77870521/8759022
    //     const attestationProvider = import.meta.env.DEV
    //         ? new CustomProvider({
    //               getToken: () => {
    //                   return Promise.resolve({
    //                       token: "fake-token",
    //                       expireTimeMillis: Date.now() + 1000 * 60 * 60 * 24, // 1 day
    //                   });
    //               },
    //           })
    //         : new ReCaptchaEnterpriseProvider(APP_CHECK_TOKEN);
    //     appCheck = initializeAppCheck(app, {
    //         provider: attestationProvider,
    //         isTokenAutoRefreshEnabled: true, // Set to true to allow auto-refresh.
    //     });
    // }
    const auth = getAuth(app);
    auth.languageCode = "hu";
    const functions = getFunctions(app, "europe-west1");
    const { status: firestoreInitStatus, data: firestore } = useInitFirestore(async (firebaseApp) => {
        try {
            const tabManager = persistentMultipleTabManager();
            const localCache = persistentLocalCache({ tabManager });
            const db = initializeFirestore(firebaseApp, { localCache });
            return db;
        } catch (e) {
            // initializeFirestore may have already been called (e.g. during HMR)
            console.warn("initializeFirestore failed, falling back to getFirestore:", e);
            return getFirestore(firebaseApp);
        }
    });
    if (firestoreInitStatus === "loading") {
        // TODO(mdanka): add a proper spinner or such here
        return<div>Töltés...</div>;
    }
    // const storage = getStorage(app, `gs://${CLOUD_STORAGE_BUCKETS.Main}`);
    const storage = getStorage(app);
    if (import.meta.env.DEV) {
        // Set up emulators
        // TODO(mdanka): remove this once we figure out why this is triggered with hot reloading
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (auth as unknown as any)._canInitEmulator = true;
        try {
            connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
            connectFunctionsEmulator(functions, "127.0.0.1", 5001);
            connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
            connectStorageEmulator(storage, "127.0.0.1", 9199);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    const childrenWithProviders = (
        <AuthProvider sdk={auth}>
            <FunctionsProvider sdk={functions}>
                <FirestoreProvider sdk={firestore}>
                    <StorageProvider sdk={storage}>
                        {children}
                    </StorageProvider>
                </FirestoreProvider>
            </FunctionsProvider>
        </AuthProvider>
    );
    return appCheck !== undefined ? (
        <AppCheckProvider sdk={appCheck}>{childrenWithProviders}</AppCheckProvider>
    ) : (
        childrenWithProviders
    );
}
