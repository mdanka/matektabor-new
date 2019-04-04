import { IAppState, IStoriesState } from "./state";
import createCachedSelector from "re-reselect";
import { createSelector } from "reselect";
import { IStory } from "../commons";

export const selectCurrentUser = (state: IAppState) => state.currentUser;

export const selectStories = (state: IAppState) => state.stories;

export const selectStoriesList = createSelector(
    selectStories,
    (stories: IStoriesState): IStory[] => {
        return Object.keys(stories)
            .map(storyId => {
                const story = stories[storyId];
                return story === undefined ? undefined : { id: storyId, ...story };
            })
            .filter(story => story !== undefined) as IStory[];
    },
);

export const selectSongsOrderedByNumber = createSelector(
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

export const selectCamps = (state: IAppState) => state.camps;

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
