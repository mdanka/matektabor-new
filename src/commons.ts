export type IUser = firebase.User;

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
}

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
