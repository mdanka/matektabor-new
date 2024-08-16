import { IAppState, IStoriesState, IPersonsState, ICampsState, ICampRoomState, IBarkochbaOrdering } from "./state";
import createCachedSelector from "re-reselect";
import { createSelector } from "reselect";
import { IStory, IPerson, ISelectOption, IWithId, ICamp } from "../commons";

export const selectCurrentUser = (state: IAppState) => state.currentUser;

export const selectCurrentUserId = createSelector(
    selectCurrentUser,
    (user): string | undefined => {
        return user === undefined ? undefined : user.uid;
    },
);

export const selectHasViewerRole = (state: IAppState) => state.hasViewerRole;

export const selectBarkochbaOrdering = (state: IAppState) => state.barkochbaOrdering;

export const selectStories = (state: IAppState) => state.stories;

export const selectStoriesList = createSelector(
    selectStories,
    (stories: IStoriesState): IStory[] => {
        return idMapToList(stories);
    },
);

export const selectStoriesOrdered = createSelector(
    selectStoriesList,
    selectBarkochbaOrdering,
    (stories: IStory[], ordering: IBarkochbaOrdering) => {
        const sorter =
            ordering === "storyNumber"
                ? storyByNumberOrderer
                : ordering === "knowNumber"
                    ? storyByKnowOrderer
                    : storyByStarOrderer;
        return stories.sort(sorter).slice(0);
    },
);

export const selectStoriesOrderedByNumber = createSelector(
    selectStoriesList,
    (stories: IStory[]) => {
        return stories.sort(storyByNumberOrderer);
    },
);

export const selectStarredStoriesOrdered = createSelector(
    selectCurrentUserId,
    selectStoriesOrdered,
    (userId: string | undefined, stories: IStory[]): IStory[] => {
        if (userId === undefined) {
            return [];
        }
        return stories.filter(story => {
            const { usersWhoStarred } = story;
            return usersWhoStarred !== undefined && usersWhoStarred.indexOf(userId) !== -1;
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

export const selectCampsListOrderedByNameAndNumber = createSelector(
    selectCampsList,
    (camps: ICamp[]) => {
        return camps.sort((a: ICamp, b: ICamp) => {
            const { group: groupA, number: numberA } = a;
            const { group: groupB, number: numberB } = b;
            if (groupA > groupB) {
                return 1;
            } else if (groupA < groupB) {
                return -1;
            } else if (numberA > numberB) {
                return -1;
            } else if (numberA < numberB) {
                return 1;
            } else {
                return 0;
            }
        });
    },
);

export const selectCampsAsSelectOptions = createSelector(
    selectCampsListOrderedByNameAndNumber,
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

export const selectGroups = createSelector(
    selectCampsList,
    selectPersonsList,
    (camps: ICamp[], persons: IPerson[]): string[] => {
        const groupList = [...camps.map(camp => camp.group), ...persons.map(person => person.group)].filter(
            value => value !== undefined,
        ) as string[];
        const uniqueGroupList = Array.from(new Set(groupList));
        return uniqueGroupList.sort();
    },
);

export const selectGroupsAsSelectOptions = createSelector(
    selectGroups,
    (groups: string[]): ISelectOption[] => {
        return groups.map(stringToSelectOption);
    },
);

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

export const selectCurrentStoryPersonIds = createSelector(
    selectCurrentStory,
    (story: IStory | undefined): string[] => {
        if (story === undefined) {
            return [];
        }
        const { personsWhoKnow } = story;
        return personsWhoKnow;
    },
);

export const selectCurrentStoryPersonsAsSelectOptions = createSelector(
    selectCurrentStoryPersonIds,
    selectPersons,
    (personsWhoKnow: string[], personsMap: IPersonsState): ISelectOption[] => {
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

export const selectCurrentListeningPersonsWhoKnowStoryAsSelectOptions = createSelector(
    selectCurrentStoryPersonIds,
    selectCurrentListeningPersonIds,
    selectPersons,
    (personsWhoKnow: string[], currentListeningPersonIds: string[], personsMap: IPersonsState): ISelectOption[] => {
        const personsWhoKnowSet = new Set(personsWhoKnow);
        const currentListeningPersonIdsWhoKnow = currentListeningPersonIds.filter(personId =>
            personsWhoKnowSet.has(personId),
        );
        return mapPersonIdsToSelectOptions(currentListeningPersonIdsWhoKnow, personsMap);
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

export const selectBarkochbaManageState = (state: IAppState) => state.barkochbaManageState;

export const selectCampRoomsAsOptions = createCachedSelector(
    selectCamp,
    (_state: IAppState, id: string) => id,
    (camp: ICamp | undefined, _id: string): ISelectOption[] => {
        return camp === undefined
            ? []
            : Object.keys(camp.rooms).map(roomName => {
                return { value: roomName, label: roomName };
            });
    },
)((_state: IAppState, id: string) => id);

export const selectCampRoomPeopleAsOptions = createCachedSelector(
    selectCamp,
    (_state: IAppState, campId: string, _roomName: string) => campId,
    (_state: IAppState, _campId: string, roomName: string) => roomName,
    selectPersons,
    (camp: ICamp | undefined, _id: string, roomName: string, personMap: IPersonsState): ISelectOption[] => {
        if (camp === undefined) {
            return [];
        }
        const peopleIds = camp.rooms[roomName];
        return peopleIds === undefined
            ? []
            : peopleIds.map(personId => {
                const personApi = personMap[personId];
                return personApi === undefined
                    ? { value: personId, label: "<ismeretlen>" }
                    : personToSelectOption({ id: personId, ...personApi });
            });
    },
)((_state: IAppState, campId: string, roomName: string) => `${campId}:${roomName}`);

export const selectBarkochbaDrawerIsOpen = (state: IAppState) => state.barkochbaDrawerIsOpen;

export const selectIsAllDataLoaded = (state: IAppState) => {
    return Object.values(state.dataLoading).every((value) => value);
}

const storyByNumberOrderer = (a: IStory, b: IStory) => {
    return ascOrderer(a.number, b.number);
};

const storyByKnowOrderer = (a: IStory, b: IStory) => {
    return descOrderer(a.personsWhoKnow.length, b.personsWhoKnow.length);
};

const storyByStarOrderer = (a: IStory, b: IStory) => {
    const listLength = (list: string[] | undefined) => (list === undefined ? 0 : list.length);
    return descOrderer(listLength(a.usersWhoStarred), listLength(b.usersWhoStarred));
};

const ascOrderer = (a: number, b: number) => {
    if (a > b) {
        return 1;
    } else if (a < b) {
        return -1;
    } else {
        return 0;
    }
};

const descOrderer = (a: number, b: number) => {
    return ascOrderer(a, b) * -1;
};

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

export const campToSelectOption = (camp: ICamp): ISelectOption => {
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

export const stringToSelectOption = (value: string) => {
    return {
        value,
        label: value,
    };
};
