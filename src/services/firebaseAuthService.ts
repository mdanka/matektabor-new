import { SetCurrentUser, IAppState } from "../store";
import { Store } from "redoodle";
import { Auth, getAuth, User } from "firebase/auth";
import { FirebaseApp } from "firebase/app";

export type IAuthStateListener = (user: User | undefined) => void;

export class FirebaseAuthService {
    private firebaseAuth: Auth;
    private authStateListeners: Array<IAuthStateListener> = [];

    public constructor(private firebaseApp: FirebaseApp, private store: Store<IAppState> | undefined) {
        this.subscribeToAuthState(this.setUserInStore);
        this.firebaseAuth = getAuth(firebaseApp);
        this.firebaseAuth.onAuthStateChanged(this.handleAuthStateChange);
    }

    public authGetCurrentUser = () => {
        return this.firebaseAuth.currentUser;
    };

    public authIsLoggedIn = () => {
        return this.authGetCurrentUser() != null;
    };

    public authSignOut = () => {
        return this.firebaseAuth.signOut();
    };

    public subscribeToAuthState = (authStateListener: IAuthStateListener) => {
        this.authStateListeners.push(authStateListener);
    };

    private handleAuthStateChange = (user: User | null) => {
        const userOrUndefined = user === null ? undefined : user;
        this.setUserInStore(userOrUndefined);
        this.notifyAuthStateListeners(userOrUndefined);
    };

    private notifyAuthStateListeners = (user: User | undefined) => {
        this.authStateListeners.forEach(authStateListener => authStateListener(user));
    };

    private setUserInStore = (user: User | undefined) => {
        if (this.store !== undefined) {
            this.store.dispatch(SetCurrentUser.create({ currentUser: user }));
        }
    };
}
