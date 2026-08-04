import { User } from "firebase/auth";

export type IUser = User;

export interface IPersonApi {
    group: string | undefined;
    name: string;
}

export interface ICampApi {
    group: string;
    number: number;
    rooms: IRoomsApi;
}

export interface IRoomsApi {
    [roomName: string]: string[]; // list of user IDs
}

export interface IStoryApi {
    title: string;

    description: string;

    solution: string;

    /**
     * The number matching Lajos' list. New stories have to have a new number.
     */
    number: number;

    /**
     * List of person IDs of people who know this story.
     */
    personsWhoKnow: string[];

    /**
     * List of user IDs of users who starred this story.
     */
    usersWhoStarred: string[] | undefined;

    /**
     * Archived stories are kept forever (stories are never deleted), but they are
     * hidden everywhere outside the admin story editor. Missing on stories created
     * before archiving existed, which means the same as `false`.
     */
    isArchived: boolean | undefined;
}

/**
 * The admin/roles document. Access is granted by email address (matched against
 * the signed-in user's verified email). Admins implicitly have viewer access too.
 */
export interface IRolesApi {
    viewers: string[];

    /**
     * May be missing on documents created before the admin role existed.
     */
    admins: string[] | undefined;
}

/**
 * The parts of a story an admin edits by hand. `personsWhoKnow` and `usersWhoStarred`
 * are maintained by the app itself, so they are deliberately not editable here.
 */
export type IStoryEditableFields = Pick<IStoryApi, "title" | "description" | "solution" | "number">;

export type IPerson = IPersonApi & IWithId;

export type ICamp = ICampApi & IWithId;

export type IStory = IStoryApi & IWithId;

export interface IWithId {
    id: string;
}

export interface ISelectOption {
    value: string;
    label: string;
}
