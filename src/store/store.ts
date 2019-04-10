import { loggingMiddleware, createStore, StoreEnhancer } from "redoodle";
import { applyMiddleware } from "redux";
import { appReducer } from "./reducers";
import { IAppState } from "./state";

const initialState: IAppState = {
    currentUser: undefined,
    persons: {},
    camps: {},
    stories: {},
    currentStoryId: undefined,
    currentListeningPersonIds: [],
    currentListeningCampRoom: {
        campId: undefined,
        roomName: undefined,
    },
    hasPendingWrites: false,
    barkochbaManageState: {
        newPersonName: "",
        newPersonGroup: "",
        newCampGroup: "",
        newCampNumber: "",
        roomsSelectionCampId: undefined,
        roomsSelectionRoomName: undefined,
    },
    barkochbaDrawerIsOpen: false,
};

export function createAppStore() {
    const middlewareEnhancer = applyMiddleware(loggingMiddleware()) as StoreEnhancer;
    const store = createStore<IAppState>(appReducer, initialState, middlewareEnhancer);
    return store;
}
