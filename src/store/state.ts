import { IUser, IPersonApi, ICampApi, IStoryApi } from "../commons";

export interface IAppState {
    currentUser: IUser | undefined;
    persons: IPersonsState;
    camps: ICampsState;
    stories: IStoriesState;
    currentStoryId: string | undefined;
    currentListeningPersonIds: string[];
    currentListeningCampRoom: ICampRoomState;
    hasPendingWrites: boolean;
    barkochbaManageState: IBarkochbaManageState;
}

export type IPersonsState = IMapState<IPersonApi>;

export type ICampsState = IMapState<ICampApi>;

export type IStoriesState = IMapState<IStoryApi>;

export interface ICampRoomState {
    campId: string | undefined;
    roomName: string | undefined;
}

export interface IBarkochbaManageState {
    newPersonName: string;
    newPersonGroup: string;
    newCampGroup: string;
    newCampNumber: number | undefined;
    roomsSelectionCampId: string | undefined;
    roomsNewRoomName: string;
    roomsSelectionRoomName: string | undefined;
}

interface IMapState<T> {
    [id: string]: T | undefined;
}
