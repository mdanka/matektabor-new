export type IUser = firebase.User;

export interface IPersonApi {
    group: string;
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
     * List of user IDs of people who know this story.
     */
    personsWhoKnow: string[];
}

export type IPerson = IPersonApi & IWithId;

export type ICamp = ICampApi & IWithId;

export type IStory = IStoryApi & IWithId;

interface IWithId {
    id: string;
}
