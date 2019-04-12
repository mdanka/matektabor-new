import { TypedAction } from "redoodle";
import { IUser } from "../commons";
import {
    IPersonsState,
    ICampsState,
    IStoriesState,
    ICampRoomState,
    IBarkochbaManageState,
    IBarkochbaOrdering,
} from "./state";

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

export const SetCurrentStoryId = TypedAction.define("MATEKTABOR//SET_CURRENT_STORY_ID")<{
    currentStoryId: string | undefined;
}>();

export const SetCurrentListeningPersonIds = TypedAction.define("MATEKTABOR//SET_CURRENT_LISTENING_PERSON_IDS")<{
    currentListeningPersonIds: string[];
}>();

export const SetCurrentListeningCampRoom = TypedAction.define("MATEKTABOR//SET_CURRENT_LISTENING_CAMP_ROOM")<{
    currentListeningCampRoom: ICampRoomState;
}>();

export const SetHasPendingWrites = TypedAction.define("MATEKTABOR//SET_HAS_PENDING_WRITES")<{
    hasPendingWrites: boolean;
}>();

export const SetBarkochbaManageState = TypedAction.define("MATEKTABOR//SET_BARKOCHBA_MANAGE_STATE")<
    Partial<IBarkochbaManageState>
>();

export const SetBarkochbaDrawerIsOpen = TypedAction.define("MATEKTABOR//SET_BARKOCHBA_DRAWER_IS_OPEN")<{
    barkochbaDrawerIsOpen: boolean;
}>();

export const SetBarkochbaOrdering = TypedAction.define("MATEKTABOR//SET_BARKOCHBA_ORDERING")<{
    barkochbaOrdering: IBarkochbaOrdering;
}>();
