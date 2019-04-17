export interface ISetStoryStarredForUserRequest {
    storyId: string;
    isStarred: boolean;
}

export interface IAddNewPeopleWhoHeardStory {
    storyId: string;
    personIds: string[];
}

export interface IUserRoles {
    isViewer: boolean;
}

export type IGetUserRolesResponse = IUserRoles;

export enum CollectionId {
    Persons = "persons",
    Camps = "camps",
    Stories = "stories",
    Admin = "admin",
}

export enum DocId {
    Roles = "roles",
}
