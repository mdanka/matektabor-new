import { IUser, IPersonApi, ICampApi, IStoryApi } from "../commons";

export interface IAppState {
    currentUser: IUser | undefined;
    persons: IPersonsState;
    camps: ICampsState;
    stories: IStoriesState;
    currentStoryId: string | undefined;
}

export type IPersonsState = IMapState<IPersonApi>;

export type ICampsState = IMapState<ICampApi>;

export type IStoriesState = IMapState<IStoryApi>;

interface IMapState<T> {
    [id: string]: T | undefined;
}
