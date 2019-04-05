import { IAppState, IStoriesState, IPersonsState, ICampsState, ICampRoomState } from "./state";
import createCachedSelector from "re-reselect";
import { createSelector } from "reselect";
import { IStory, IPerson, ISelectOption, IWithId, ICamp } from "../commons";

export const selectCurrentUser = (state: IAppState) => state.currentUser;

export const selectStories = (state: IAppState) => state.stories;

export const selectStoriesList = createSelector(
    selectStories,
    (stories: IStoriesState): IStory[] => {
        return idMapToList(stories);
    },
);

export const selectStoriesOrderedByNumber = createSelector(
    selectStoriesList,
    (songs: IStory[]) => {
        return songs.sort((a: IStory, b: IStory) => {
            if (a.number === undefined && b.number === undefined) {
                return 0;
            } else if (a.number === undefined) {
                return 1; // no number goes to the end of the list
            } else if (b.number === undefined) {
                return -1;
            } else if (a.number > b.number) {
                return 1;
            } else if (a.number < b.number) {
                return -11;
            } else {
                return 0;
            }
        });
    },
);

export const selectStory = createCachedSelector(
    selectStories,
    (_state: IAppState, id: string) => id,
    (stories: IStoriesState, id: string) => {
        return stories[id];
    },
)((_state: IAppState, id: string) => id);

export const selectPersons = (state: IAppState) => state.persons;

export const selectPersonsList = createSelector(
    selectPersons,
    (persons: IPersonsState): IPerson[] => {
        return idMapToList(persons);
    },
);

export const selectPersonsAsSelectOptions = createSelector(
    selectPersonsList,
    (persons: IPerson[]): ISelectOption[] => {
        return persons.map(personToSelectOption);
    },
);

export const selectCamps = (state: IAppState) => state.camps;

export const selectCampsList = createSelector(
    selectCamps,
    (camps: ICampsState): ICamp[] => {
        return idMapToList(camps);
    },
);

export const selectCampsAsSelectOptions = createSelector(
    selectCampsList,
    (camps: ICamp[]): ISelectOption[] => {
        return camps.map(campToSelectOption);
    },
);

export const selectCamp = createCachedSelector(
    selectCamps,
    (_state: IAppState, id: string) => id,
    (camps: ICampsState, id: string): ICamp | undefined => {
        const camp = camps[id];
        return camp === undefined ? undefined : { id, ...camp };
    },
)((_state: IAppState, id: string) => id);

export const selectCurrentStoryId = (state: IAppState) => state.currentStoryId;

export const selectCurrentStory = createSelector(
    selectStories,
    selectCurrentStoryId,
    (stories: IStoriesState, id: string | undefined): IStory | undefined => {
        if (id === undefined) {
            return undefined;
        }
        const storyApi = stories[id];
        return storyApi === undefined ? undefined : { id, ...storyApi };
    },
);

export const selectCurrentStoryPersonsAsSelectOptions = createSelector(
    selectCurrentStory,
    selectPersons,
    (story: IStory | undefined, personsMap: IPersonsState): ISelectOption[] => {
        if (story === undefined) {
            return [];
        }
        const { personsWhoKnow } = story;
        return mapPersonIdsToSelectOptions(personsWhoKnow, personsMap);
    },
);

export const selectCurrentListeningPersonIds = (state: IAppState) => state.currentListeningPersonIds;

export const selectCurrentListeningPersonsAsSelectOptions = createSelector(
    selectCurrentListeningPersonIds,
    selectPersons,
    (currentListeningPersonIds: string[], personsMap: IPersonsState): ISelectOption[] => {
        return mapPersonIdsToSelectOptions(currentListeningPersonIds, personsMap);
    },
);

export const selectCurrentListeningCampRoom = (state: IAppState) => state.currentListeningCampRoom;

export const selectCurrentListeningCampRoomCamp = createSelector(
    selectCurrentListeningCampRoom,
    selectCamps,
    (currentListeningRoom: ICampRoomState, campsMap: ICampsState): ICamp | undefined => {
        const { campId } = currentListeningRoom;
        if (campId === undefined) {
            return undefined;
        }
        const camp = campsMap[campId];
        if (camp === undefined) {
            return undefined;
        }
        return { id: campId, ...camp };
    },
);

export const selectCurrentListeningCampRoomCampAsSelectOption = createSelector(
    selectCurrentListeningCampRoomCamp,
    (camp: ICamp | undefined): ISelectOption | undefined => {
        return camp === undefined ? undefined : campToSelectOption(camp);
    },
);

export const selectCurrentListeningCampRoomNamesAsSelectOptions = createSelector(
    selectCurrentListeningCampRoomCamp,
    (camp: ICamp | undefined): ISelectOption[] => {
        if (camp === undefined) {
            return [];
        }
        const { rooms } = camp;
        const roomNames = Object.keys(rooms);
        return roomNames.map(stringToSelectOption);
    },
);

export const selectCurrentListeningCampRoomNameAsSelectOption = createSelector(
    selectCurrentListeningCampRoom,
    (currentListeningRoom: ICampRoomState): ISelectOption | undefined => {
        const { roomName } = currentListeningRoom;
        return roomName === undefined ? undefined : stringToSelectOption(roomName);
    },
);

export const selectHasPendingWrites = (state: IAppState) => state.hasPendingWrites;

const mapPersonIdsToSelectOptions = (personIds: string[], personsMap: IPersonsState): ISelectOption[] => {
    return ((personIds
        .map(personId => {
            const person = personsMap[personId];
            return person === undefined ? undefined : { id: personId, ...person };
        })
        .filter(person => person !== undefined) as unknown) as IPerson[]).map(personToSelectOption);
};

const personToSelectOption = (person: IPerson): ISelectOption => {
    const { id, name, group } = person;
    const label = group === undefined ? name : `${name} (${group})`;
    return { value: id, label };
};

const campToSelectOption = (camp: ICamp): ISelectOption => {
    const { id, group, number } = camp;
    return { value: id, label: `${group}/${number}` };
};

const idMapToList = <T>(idMap: { [id: string]: T }): Array<T & IWithId> => {
    return Object.keys(idMap)
        .map(id => {
            const value = idMap[id];
            return value === undefined ? undefined : { id, ...value };
        })
        .filter(value => value !== undefined) as Array<T & IWithId>;
};

const stringToSelectOption = (value: string) => {
    return {
        value,
        label: value,
    };
};
