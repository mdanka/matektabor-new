import firebase from "firebase/app";
import "firebase/auth";
import { SetCurrentUser, IAppState } from "../store";
import { Store } from "redoodle";

export type IAuthStateListener = (user: firebase.User | undefined) => void;

export class FirebaseAuthService {
    private authStateListeners: Array<IAuthStateListener> = [];

    public constructor(private firebaseAuth: firebase.auth.Auth, private store: Store<IAppState> | undefined) {
        this.subscribeToAuthState(this.setUserInStore);
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

    private handleAuthStateChange = (user: firebase.User | null) => {
        const userOrUndefined = user === null ? undefined : user;
        this.setUserInStore(userOrUndefined);
        this.notifyAuthStateListeners(userOrUndefined);
    };

    private notifyAuthStateListeners = (user: firebase.User | undefined) => {
        this.authStateListeners.forEach(authStateListener => authStateListener(user));
    };

    private setUserInStore = (user: firebase.User | undefined) => {
        if (this.store !== undefined) {
            this.store.dispatch(SetCurrentUser.create({ currentUser: user }));
        }
    };
}
