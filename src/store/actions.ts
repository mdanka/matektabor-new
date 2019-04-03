import { TypedAction } from "redoodle";
import { IUser } from "../commons";
import { IPersonsState, ICampsState, IStoriesState } from "./state";

export const SetCurrentUser = TypedAction.define("MATEKTABOR//SET_CURRENT_USER")<{
    currentUser: IUser | undefined;
}>();

export const SetPersons = TypedAction.define("MATEKTABOR//SET_PERSONS")<{
    persons: IPersonsState;
}>();

export const SetCamps = TypedAction.define("MATEKTABOR//SET_CAMPS")<{
    camps: ICampsState;
}>();

export const SetStories = TypedAction.define("MATEKTABOR//SET_STORIES")<{
    stories: IStoriesState;
}>();
