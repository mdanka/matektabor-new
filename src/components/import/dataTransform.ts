import {
    DATA_BARKOCHBA_STORY,
    DATA_SZOBABEOSZTAS_CAMP,
    DATA_SZOBABEOSZTAS_ROOM,
    DATA_TABOR_CAMPGROUP,
    DATA_TABOR_PERSON,
    IImportedWithId,
} from "./data";
import { IStoriesState, IPersonsState, ICampsState } from "../../store";
import { IPersonApi, ICampApi, IRoomsApi, IStoryApi } from "../../commons";
import { getGlobalServices } from "../../services";

function importedListToMap<T>(list: IImportedWithId<T>[]) {
    const map: { [key: number]: T } = {};
    list.forEach(item => {
        const { pk, fields } = item;
        map[pk] = fields;
    });
    return map;
}

const importedBarkochbaStoryMap = importedListToMap(DATA_BARKOCHBA_STORY);
const importedSzobabeosztasCamp = importedListToMap(DATA_SZOBABEOSZTAS_CAMP);
const importedSzobabeosztasRoom = importedListToMap(DATA_SZOBABEOSZTAS_ROOM);
const importedTaborCampGroup = importedListToMap(DATA_TABOR_CAMPGROUP);
const importedTaborPerson = importedListToMap(DATA_TABOR_PERSON);

const storyMap: IStoriesState = {};
const personMap: IPersonsState = {};
const campMap: ICampsState = {};

function transformPeople() {
    Object.keys(importedTaborPerson).forEach(personId => {
        const importedPerson = importedTaborPerson[parseInt(personId)];
        const { camp_group, name } = importedPerson;
        const newPerson: IPersonApi = {
            name,
            group: camp_group,
        };
        personMap[personId] = newPerson;
    });
}

function transformCamps() {
    Object.keys(importedSzobabeosztasCamp).forEach(szobabeosztasCampId => {
        const importedCamp = importedSzobabeosztasCamp[parseInt(szobabeosztasCampId)];
        const { group: groupId, number: campNumber } = importedCamp;
        const importedGroup = importedTaborCampGroup[groupId];
        const { name: groupName } = importedGroup;

        const rooms: IRoomsApi = {};
        Object.values(importedSzobabeosztasRoom)
            .filter(item => item.camp === parseInt(szobabeosztasCampId))
            .map(item => {
                const { name, people } = item;
                rooms[name] = people.map(id => id.toString());
            });

        const newCamp: ICampApi = {
            group: groupName,
            number: parseInt(campNumber),
            rooms,
        };
        campMap[szobabeosztasCampId] = newCamp;
    });
}

function transformStories() {
    Object.keys(importedBarkochbaStoryMap).forEach(storyId => {
        const importedStory = importedBarkochbaStoryMap[parseInt(storyId)];
        const { story, people, order_number, solution, title } = importedStory;
        const newStory: IStoryApi = {
            title,
            description: story,
            number: order_number,
            solution,
            personsWhoKnow: people.map(id => id.toString()),
        };
        storyMap[storyId] = newStory;
    });
}

function transformData() {
    transformPeople();
    transformCamps();
    transformStories();
}

export async function runImport() {
    const globalServices = getGlobalServices();
    if (globalServices === undefined) {
        return;
    }
    const { dataService } = globalServices;
    try {
        transformData();
        await dataService.deleteAllCollections();
        await dataService.createData(personMap, campMap, storyMap);
    } catch (e) {
        console.error("Failed to run import");
        console.error(e);
        return;
    }
    console.error("IMPORT SUCCEEDED!");
}
