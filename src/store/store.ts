import { StoreEnhancer, createStore, loggingMiddleware } from "redoodle";
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
    barkochbaOrdering: "storyNumber",
};

export function createAppStore() {
    const middlewareEnhancer = applyMiddleware(loggingMiddleware()) as unknown as StoreEnhancer;
    return createStore<IAppState>(appReducer, initialState, middlewareEnhancer);
}
