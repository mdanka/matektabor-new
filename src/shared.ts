/**
 * Types shared with Functions
 */

export enum CollectionId {
    Persons = "persons",
    Camps = "camps",
    Stories = "stories",
    Admin = "admin",
}

export enum DocId {
    AdminRoles = "roles",
}

export interface ISetStarredForUserRequest {
    storyId: string;
    isStarred: boolean;
}

export type IGetIsUserViewerResponse = boolean;
