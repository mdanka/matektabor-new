import { FirebaseService } from "./firebaseService";
import { FirebaseAuthService } from "./firebaseAuthService";
import { DataService } from "./dataService";
import { FirestoreService } from "./firestoreService";
import { Store } from "redoodle";
import { IAppState } from "../store";
import { FirebaseAuthUiService } from "./firebaseAuthUiService";
import { FunctionsService } from "./functionsService";

export interface IGlobalServices {
    firebaseService: FirebaseService;
    firebaseAuthService: FirebaseAuthService;
    firebaseAuthUiService: FirebaseAuthUiService;
    firestoreService: FirestoreService;
    dataService: DataService;
    functionsService: FunctionsService;
}

function getServices(store: Store<IAppState> | undefined): IGlobalServices {
    const firebaseService = new FirebaseService();
    const firebaseAuthService = new FirebaseAuthService(firebaseService.getApp().auth(), store);
    const firebaseAuthUiService = new FirebaseAuthUiService(store);
    const firestoreService = new FirestoreService(firebaseService.getApp().firestore());
    const dataService = new DataService(firebaseService.getApp().firestore(), firebaseAuthService, store);
    const functionsService = new FunctionsService(firebaseService.getApp().functions());
    return {
        firebaseService,
        firebaseAuthService,
        firebaseAuthUiService,
        firestoreService,
        dataService,
        functionsService,
    };
}

let GLOBAL_SERVICES: IGlobalServices | undefined;

export function getGlobalServices() {
    return GLOBAL_SERVICES;
}

export function initializeAndGetClientSideServices(store: Store<IAppState>) {
    GLOBAL_SERVICES = getServices(store);
    createSecretBackupDataCode();
    return GLOBAL_SERVICES;
}

function createSecretBackupDataCode() {
    (document as any).backupData = async () => {
        if (GLOBAL_SERVICES === undefined) {
            return;
        }
        const data = await GLOBAL_SERVICES.functionsService.backupData();
        const dateString = new Date().toISOString();
        downloadAsFile(`matektabor-backup-${dateString}.json`, JSON.stringify(data));
    };
}

function downloadAsFile(filename: string, text: string) {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
