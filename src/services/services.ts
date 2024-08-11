import { FirebaseService } from "./firebaseService";
import { Store } from "redoodle";
import { IAppState } from "../store";

export interface IGlobalServices {
    firebaseService: FirebaseService;
}

function getServices(store: Store<IAppState> | undefined): IGlobalServices {
    const firebaseService = new FirebaseService();
    return {
        firebaseService,
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
