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

    const subscribeToAuthState = useCallback((authStateListener: IAuthStateListener) => {
        authStateListeners.push(authStateListener);
    }, []);

    const notifyAuthStateListeners = useCallback((user: User | undefined) => {
        authStateListeners.forEach(authStateListener => authStateListener(user));
    }, []);

    const handleAuthStateChange = useCallback((user: User | null) => {
        console.log("[FirebaseAuthService] Auth state changed:", user);
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
