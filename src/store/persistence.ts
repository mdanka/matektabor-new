import { ICampRoomState } from "./state";

const STORAGE_KEY = "matektabor.listeningSelection.v1";
const FLYING_ANIMAL_DISABLED_KEY = "matektabor.flyingAnimalDisabledUserIds.v1";

export interface IPersistedListeningSelection {
    campRoom: ICampRoomState;
    personIds: string[];
}

function isOptionalString(value: unknown): value is string | undefined {
    return value === undefined || typeof value === "string";
}

function isPersistedListeningSelection(value: unknown): value is IPersistedListeningSelection {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const { campRoom, personIds } = value as Partial<IPersistedListeningSelection>;
    if (typeof campRoom !== "object" || campRoom === null) {
        return false;
    }
    if (!isOptionalString(campRoom.campId) || !isOptionalString(campRoom.roomName)) {
        return false;
    }
    return Array.isArray(personIds) && personIds.every(personId => typeof personId === "string");
}

export function loadListeningSelection(): IPersistedListeningSelection | undefined {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw === null) {
            return undefined;
        }
        const parsed: unknown = JSON.parse(raw);
        return isPersistedListeningSelection(parsed) ? parsed : undefined;
    } catch {
        // localStorage can be unavailable (e.g. private browsing) or hold invalid JSON
        return undefined;
    }
}

export function saveListeningSelection(selection: IPersistedListeningSelection) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    } catch {
        // Persisting the selection is best-effort only
    }
}

export function loadFlyingAnimalDisabledUserIds(): string[] {
    try {
        const raw = window.localStorage.getItem(FLYING_ANIMAL_DISABLED_KEY);
        if (raw === null) {
            return [];
        }
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every(userId => typeof userId === "string")) {
            return parsed;
        }
        return [];
    } catch {
        // localStorage can be unavailable (e.g. private browsing) or hold invalid JSON
        return [];
    }
}

export function saveFlyingAnimalDisabledUserIds(userIds: string[]) {
    try {
        window.localStorage.setItem(FLYING_ANIMAL_DISABLED_KEY, JSON.stringify(userIds));
    } catch {
        // Persisting the preference is best-effort only
    }
}
