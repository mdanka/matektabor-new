import { configureStore } from "@reduxjs/toolkit";
import { appReducer } from "./slice";
import { saveListeningSelection } from "./persistence";

export function createAppStore() {
    const store = configureStore({
        reducer: appReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    // Firebase User objects are not serializable
                    ignoredActions: ["matektabor/setCurrentUser"],
                    ignoredPaths: ["currentUser"],
                },
            }),
    });

    let previousCampRoom = store.getState().currentListeningCampRoom;
    let previousPersonIds = store.getState().currentListeningPersonIds;
    store.subscribe(() => {
        const { currentListeningCampRoom, currentListeningPersonIds } = store.getState();
        if (currentListeningCampRoom === previousCampRoom && currentListeningPersonIds === previousPersonIds) {
            return;
        }
        previousCampRoom = currentListeningCampRoom;
        previousPersonIds = currentListeningPersonIds;
        saveListeningSelection({
            campRoom: currentListeningCampRoom,
            personIds: currentListeningPersonIds,
        });
    });

    return store;
}

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore["dispatch"];
