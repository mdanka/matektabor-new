import { setCurrentUser } from "../store";
import { User } from "firebase/auth";
import { useStore } from "react-redux";
import { useAuth } from "reactfire";
import { useCallback, useEffect, useRef } from "react";

export type IAuthStateListener = (user: User | undefined) => void;

export function useFirebaseAuthService() {
    const store = useStore();
    const firebaseAuth = useAuth();
    const authStateListenersRef = useRef<Array<IAuthStateListener>>([]);

    const setUserInStore = useCallback((user: User | undefined) => {
        store.dispatch(setCurrentUser({ currentUser: user }));
    }, [store]);

    const subscribeToAuthState = useCallback((authStateListener: IAuthStateListener) => {
        authStateListenersRef.current.push(authStateListener);
    }, []);

    const notifyAuthStateListeners = useCallback((user: User | undefined) => {
        authStateListenersRef.current.forEach(authStateListener => authStateListener(user));
    }, []);

    const handleAuthStateChange = useCallback((user: User | null) => {
        console.log("[FirebaseAuthService] Auth state changed:", user ? user.uid : "signed out");
        const userOrUndefined = user === null ? undefined : user;
        setUserInStore(userOrUndefined);
        notifyAuthStateListeners(userOrUndefined);
    }, [setUserInStore, notifyAuthStateListeners]);

    useEffect(() => {
        subscribeToAuthState(setUserInStore);
        firebaseAuth.onAuthStateChanged(handleAuthStateChange);
    }, [firebaseAuth, handleAuthStateChange, setUserInStore, subscribeToAuthState]);

    const authSignOut = useCallback(() => {
        return firebaseAuth.signOut();
    }, [firebaseAuth]);

    return {
        authSignOut,
        subscribeToAuthState,
    };
}
