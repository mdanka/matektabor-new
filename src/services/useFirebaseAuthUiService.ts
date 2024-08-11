import { SetCurrentUser } from "../store";
import { Page, getNavUrl } from "../utils/navUtils";
import { GoogleAuthProvider, User } from "firebase/auth";
import * as firebaseui from "firebaseui";
import { useStore } from "react-redux";
import { useAuth } from "reactfire";
import { useEffect } from "react";

let firebaseAuthUi: any;

export function useFirebaseAuthUiService() {
    const store = useStore();
    const auth = useAuth();

    const defaultFirebaseAuthUiConfig = {
        signInSuccessUrl: getNavUrl[Page.Home](),
        signInOptions: [GoogleAuthProvider.PROVIDER_ID],
        tosUrl: "/terms-of-service",
        privacyPolicyUrl: "/privacy-policy",
        callbacks: {
            signInSuccessWithAuthResult: (authResult: any) => {
                setUser(authResult.user);
                // Do not redirect.
                return true;
            },
        },
    };

    useEffect(() => {
        firebaseAuthUi = firebaseui === undefined ? undefined : new firebaseui.auth.AuthUI(auth);
    }, [auth])


    const authStart = (element: string | Element, signInSuccessUrl: string | undefined) => {
        firebaseAuthUi.start(element, getFirebaseAuthUiConfig(signInSuccessUrl));
    };

    const setUser = (user: User | null) => {
        const userOrUndefined = user === null ? undefined : user;
        if (store !== undefined) {
            store.dispatch(SetCurrentUser.create({ currentUser: userOrUndefined }));
        }
    };

    const getFirebaseAuthUiConfig = (signInSuccessUrl?: string) => {
        return signInSuccessUrl === undefined
            ? defaultFirebaseAuthUiConfig
            : {
                  ...defaultFirebaseAuthUiConfig,
                  signInSuccessUrl,
              };
    };

    return {
        authStart,
    };
}
