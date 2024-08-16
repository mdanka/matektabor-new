import { setWith, TypedReducer } from "redoodle";
import {
    SetCurrentUser,
    SetPersons,
    SetCamps,
    SetStories,
    SetCurrentStoryId,
    SetCurrentListeningPersonIds,
    SetCurrentListeningCampRoom,
    SetHasPendingWrites,
    SetBarkochbaManageState,
    SetBarkochbaDrawerIsOpen,
    SetHasViewerRole,
    SetDataLoaded,
} from "./actions";
import { IAppState, IBarkochbaManageState } from "./state";
import { SetBarkochbaOrdering } from "./actions";

export const appReducer = TypedReducer.builder<IAppState>()
    .withHandler(SetCurrentUser.TYPE, (state, payload) => {
        return setWith(state, {
            currentUser: payload.currentUser,
        });
    })
    .withHandler(SetHasViewerRole.TYPE, (state, payload) => {
        return setWith(state, {
            hasViewerRole: payload.hasViewerRole,
        });
    })
    .withHandler(SetPersons.TYPE, (state, payload) => {
        return setWith(state, {
            persons: payload.persons,
        });
    })
    .withHandler(SetCamps.TYPE, (state, payload) => {
        return setWith(state, {
            camps: payload.camps,
        });
    })
    .withHandler(SetDataLoaded.TYPE, (state, payload) => {
        return setWith(state, {
            dataLoading: { ...state.dataLoading, ...payload }
        });
    })
    .withHandler(SetStories.TYPE, (state, payload) => {
        return setWith(state, {
            stories: payload.stories,
        });
    })
    .withHandler(SetCurrentStoryId.TYPE, (state, payload) => {
        return setWith(state, {
            currentStoryId: payload.currentStoryId,
        });
    })
    .withHandler(SetCurrentListeningPersonIds.TYPE, (state, payload) => {
        return setWith(state, {
            currentListeningPersonIds: payload.currentListeningPersonIds,
        });
    })
    .withHandler(SetCurrentListeningCampRoom.TYPE, (state, payload) => {
        return setWith(state, {
            currentListeningCampRoom: payload.currentListeningCampRoom,
        });
    })
    .withHandler(SetHasPendingWrites.TYPE, (state, payload) => {
        return setWith(state, {
            hasPendingWrites: payload.hasPendingWrites,
        });
    })
    .withHandler(SetBarkochbaManageState.TYPE, (state, payload) => {
        return setWith(state, {
            barkochbaManageState: setWith(state.barkochbaManageState, payload) as IBarkochbaManageState,
        });
    })
    .withHandler(SetBarkochbaDrawerIsOpen.TYPE, (state, payload) => {
        return setWith(state, {
            barkochbaDrawerIsOpen: payload.barkochbaDrawerIsOpen,
        });
    })
    .withHandler(SetBarkochbaOrdering.TYPE, (state, payload) => {
        return setWith(state, {
            barkochbaOrdering: payload.barkochbaOrdering,
        });
    })
    .build();
