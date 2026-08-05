import { IUser, IPersonApi, ICampApi, IStoryApi, IRolesApi } from "../commons";

export interface IAppState {
    currentUser: IUser | undefined;
    hasViewerRole: boolean | undefined;
    hasAdminRole: boolean | undefined;
    roles: IRolesApi | undefined;
    persons: IPersonsState;
    camps: ICampsState;
    stories: IStoriesState;
    dataLoading: IDataLoadingState;
    currentStoryId: string | undefined;
    currentListeningPersonIds: string[];
    currentListeningCampRoom: ICampRoomState;
    hasPendingWrites: boolean;
    barkochbaManageState: IBarkochbaManageState;
    barkochbaDrawerIsOpen: boolean;
    barkochbaOrdering: IBarkochbaOrdering;
    /** User ids that opted out of the flying animal easter egg. */
    flyingAnimalDisabledUserIds: string[];
}

export type IBarkochbaOrdering = "storyNumber" | "knowNumber" | "starNumber";

export type IPersonsState = IMapState<IPersonApi>;

export type ICampsState = IMapState<ICampApi>;

export type IStoriesState = IMapState<IStoryApi>;

export interface IDataLoadingState {
    arePersonsLoaded: boolean;
    areCampsLoaded: boolean;
    areStoriesLoaded: boolean;
}

export interface ICampRoomState {
    campId: string | undefined;
    roomName: string | undefined;
}

export interface IBarkochbaManageState {
    roomsSelectionCampId: string | undefined;
}

interface IMapState<T> {
    [id: string]: T | undefined;
}
