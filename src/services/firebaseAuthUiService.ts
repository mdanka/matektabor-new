import firebase from "firebase/app";
import "firebase/auth";
import { SetCurrentUser, IAppState } from "../store";
import { Store } from "redoodle";
import { Page, getNavUrl } from "../utils/navUtils";

const firebaseui = require("firebaseui");

export class FirebaseAuthUiService {
    private firebaseAuthUi: any;

    private defaultFirebaseAuthUiConfig = {
        signInSuccessUrl: getNavUrl[Page.Home](),
        signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
        tosUrl: "/terms-of-service",
        privacyPolicyUrl: "/privacy-policy",
        callbacks: {
            signInSuccessWithAuthResult: (authResult: any) => {
                this.setUser(authResult.user);
                // Do not redirect.
                return true;
            },
        },
    };

    public constructor(private store: Store<IAppState> | undefined) {
        this.firebaseAuthUi = firebaseui === undefined ? undefined : new firebaseui.auth.AuthUI(firebase.auth());
    }

    public authStart = (element: string | Element, signInSuccessUrl: string | undefined) => {
        this.firebaseAuthUi.start(element, this.getFirebaseAuthUiConfig(signInSuccessUrl));
    };

    private setUser = (user: firebase.User | null) => {
        const userOrUndefined = user === null ? undefined : user;
        if (this.store !== undefined) {
            this.store.dispatch(SetCurrentUser.create({ currentUser: userOrUndefined }));
        }
    };

    private getFirebaseAuthUiConfig = (signInSuccessUrl?: string) => {
        return signInSuccessUrl === undefined
            ? this.defaultFirebaseAuthUiConfig
            : {
                  ...this.defaultFirebaseAuthUiConfig,
                  signInSuccessUrl,
              };
    };
}
