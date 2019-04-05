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
} from "./actions";
import { IAppState } from "./state";

export const appReducer = TypedReducer.builder<IAppState>()
    .withHandler(SetCurrentUser.TYPE, (state, payload) => {
        return setWith(state, {
            currentUser: payload.currentUser,
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
    .build();
