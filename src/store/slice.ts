import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser, IRolesApi } from "../commons";
import {
    IAppState,
    IPersonsState,
    ICampsState,
    IStoriesState,
    ICampRoomState,
    IBarkochbaManageState,
    IBarkochbaOrdering,
    IDataLoadingState,
} from "./state";
import { loadListeningSelection, loadFlyingAnimalDisabledUserIds } from "./persistence";

const persistedListeningSelection = loadListeningSelection();
const persistedFlyingAnimalDisabledUserIds = loadFlyingAnimalDisabledUserIds();

const initialState: IAppState = {
    currentUser: undefined,
    hasViewerRole: undefined,
    hasAdminRole: undefined,
    roles: undefined,
    persons: {},
    camps: {},
    stories: {},
    dataLoading: {
        arePersonsLoaded: false,
        areCampsLoaded: false,
        areStoriesLoaded: false,
    },
    currentStoryId: undefined,
    currentListeningPersonIds: persistedListeningSelection?.personIds ?? [],
    currentListeningCampRoom: persistedListeningSelection?.campRoom ?? {
        campId: undefined,
        roomName: undefined,
    },
    hasPendingWrites: false,
    barkochbaManageState: {
        roomsSelectionCampId: undefined,
    },
    barkochbaDrawerIsOpen: false,
    barkochbaOrdering: "storyNumber",
    flyingAnimalDisabledUserIds: persistedFlyingAnimalDisabledUserIds,
};

export const appSlice = createSlice({
    name: "matektabor",
    initialState,
    reducers: {
        setCurrentUser(state, action: PayloadAction<{ currentUser: IUser | undefined }>) {
            state.currentUser = action.payload.currentUser;
        },
        setHasViewerRole(state, action: PayloadAction<{ hasViewerRole: boolean }>) {
            state.hasViewerRole = action.payload.hasViewerRole;
        },
        setHasAdminRole(state, action: PayloadAction<{ hasAdminRole: boolean }>) {
            state.hasAdminRole = action.payload.hasAdminRole;
        },
        setRoles(state, action: PayloadAction<{ roles: IRolesApi | undefined }>) {
            state.roles = action.payload.roles;
        },
        setPersons(state, action: PayloadAction<{ persons: IPersonsState }>) {
            state.persons = action.payload.persons;
        },
        setCamps(state, action: PayloadAction<{ camps: ICampsState }>) {
            state.camps = action.payload.camps;
        },
        setStories(state, action: PayloadAction<{ stories: IStoriesState }>) {
            state.stories = action.payload.stories;
        },
        setDataLoaded(state, action: PayloadAction<Pick<IDataLoadingState, "areCampsLoaded"> | Pick<IDataLoadingState, "arePersonsLoaded"> | Pick<IDataLoadingState, "areStoriesLoaded">>) {
            Object.assign(state.dataLoading, action.payload);
        },
        setCurrentStoryId(state, action: PayloadAction<{ currentStoryId: string | undefined }>) {
            state.currentStoryId = action.payload.currentStoryId;
        },
        setCurrentListeningPersonIds(state, action: PayloadAction<{ currentListeningPersonIds: string[] }>) {
            state.currentListeningPersonIds = action.payload.currentListeningPersonIds;
        },
        setCurrentListeningCampRoom(state, action: PayloadAction<{ currentListeningCampRoom: ICampRoomState }>) {
            state.currentListeningCampRoom = action.payload.currentListeningCampRoom;
        },
        setHasPendingWrites(state, action: PayloadAction<{ hasPendingWrites: boolean }>) {
            state.hasPendingWrites = action.payload.hasPendingWrites;
        },
        setBarkochbaManageState(state, action: PayloadAction<Partial<IBarkochbaManageState>>) {
            Object.assign(state.barkochbaManageState, action.payload);
        },
        setBarkochbaDrawerIsOpen(state, action: PayloadAction<{ barkochbaDrawerIsOpen: boolean }>) {
            state.barkochbaDrawerIsOpen = action.payload.barkochbaDrawerIsOpen;
        },
        setBarkochbaOrdering(state, action: PayloadAction<{ barkochbaOrdering: IBarkochbaOrdering }>) {
            state.barkochbaOrdering = action.payload.barkochbaOrdering;
        },
        setFlyingAnimalEnabledForUser(state, action: PayloadAction<{ userId: string; isEnabled: boolean }>) {
            const { userId, isEnabled } = action.payload;
            const withoutUser = state.flyingAnimalDisabledUserIds.filter(disabledUserId => disabledUserId !== userId);
            state.flyingAnimalDisabledUserIds = isEnabled ? withoutUser : [...withoutUser, userId];
        },
    },
});

export const {
    setCurrentUser,
    setHasViewerRole,
    setHasAdminRole,
    setRoles,
    setPersons,
    setCamps,
    setStories,
    setDataLoaded,
    setCurrentStoryId,
    setCurrentListeningPersonIds,
    setCurrentListeningCampRoom,
    setHasPendingWrites,
    setBarkochbaManageState,
    setBarkochbaDrawerIsOpen,
    setBarkochbaOrdering,
    setFlyingAnimalEnabledForUser,
} = appSlice.actions;

export const appReducer = appSlice.reducer;
