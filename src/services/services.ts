import { FirebaseService } from "./firebaseService";
import { Store } from "redoodle";
import { IAppState } from "../store";
import { FirebaseAuthUiService } from "./firebaseAuthUiService";

export interface IGlobalServices {
    firebaseService: FirebaseService;
    firebaseAuthUiService: FirebaseAuthUiService;
}

function getServices(store: Store<IAppState> | undefined): IGlobalServices {
    const firebaseService = new FirebaseService();
    const firebaseApp = firebaseService.getApp();
    const firebaseAuthUiService = new FirebaseAuthUiService(firebaseApp, store);
    return {
        firebaseService,
        firebaseAuthUiService,
    };
}

let GLOBAL_SERVICES: IGlobalServices | undefined;

export function getGlobalServices() {
    return GLOBAL_SERVICES;
}

export function initializeAndGetClientSideServices(store: Store<IAppState>) {
    GLOBAL_SERVICES = getServices(store);
    return GLOBAL_SERVICES;
}
