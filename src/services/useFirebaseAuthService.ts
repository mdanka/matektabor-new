import { SetCurrentUser } from "../store";
import { User } from "firebase/auth";
import { useStore } from "react-redux";
import { useAuth } from "reactfire";
import { useEffect } from "react";

export type IAuthStateListener = (user: User | undefined) => void;

const authStateListeners: Array<IAuthStateListener> = [];

export function useFirebaseAuthService() {
    const store = useStore();
    const firebaseAuth = useAuth();
    
    useEffect(() => {
        subscribeToAuthState(setUserInStore);
        firebaseAuth.onAuthStateChanged(handleAuthStateChange);
    }, []);

    const authGetCurrentUser = () => {
        return firebaseAuth.currentUser;
    };

    const authIsLoggedIn = () => {
        return authGetCurrentUser() != null;
    };

    const authSignOut = () => {
        return firebaseAuth.signOut();
    };

    const subscribeToAuthState = (authStateListener: IAuthStateListener) => {
        authStateListeners.push(authStateListener);
    };

    const handleAuthStateChange = (user: User | null) => {
        const userOrUndefined = user === null ? undefined : user;
        setUserInStore(userOrUndefined);
        notifyAuthStateListeners(userOrUndefined);
    };

    const notifyAuthStateListeners = (user: User | undefined) => {
        authStateListeners.forEach(authStateListener => authStateListener(user));
    };

    const setUserInStore = (user: User | undefined) => {
        if (store !== undefined) {
            store.dispatch(SetCurrentUser.create({ currentUser: user }));
        }
    };

    return {
        authGetCurrentUser,
        authIsLoggedIn,
        authSignOut,
        subscribeToAuthState,
    };
}
