import { SetCurrentUser } from "../store";
import { User } from "firebase/auth";
import { useStore } from "react-redux";
import { useAuth } from "reactfire";
import { useCallback, useEffect } from "react";

export type IAuthStateListener = (user: User | undefined) => void;

const authStateListeners: Array<IAuthStateListener> = [];

export function useFirebaseAuthService() {
    const store = useStore();
    const firebaseAuth = useAuth();

    const setUserInStore = useCallback((user: User | undefined) => {
        store.dispatch(SetCurrentUser.create({ currentUser: user }));
    }, [store]);

    const handleAuthStateChange = useCallback((user: User | null) => {
        const userOrUndefined = user === null ? undefined : user;
        setUserInStore(userOrUndefined);
        notifyAuthStateListeners(userOrUndefined);
    }, [setUserInStore]);
    
    useEffect(() => {
        subscribeToAuthState(setUserInStore);
        firebaseAuth.onAuthStateChanged(handleAuthStateChange);
    }, [firebaseAuth, handleAuthStateChange, setUserInStore]);

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

    const notifyAuthStateListeners = (user: User | undefined) => {
        authStateListeners.forEach(authStateListener => authStateListener(user));
    };

    return {
        authGetCurrentUser,
        authIsLoggedIn,
        authSignOut,
        subscribeToAuthState,
    };
}
