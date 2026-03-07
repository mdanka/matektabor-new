import { configureStore } from "@reduxjs/toolkit";
import { appReducer } from "./slice";

export function createAppStore() {
    return configureStore({
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
}

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore["dispatch"];
