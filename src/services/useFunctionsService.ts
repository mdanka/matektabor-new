import { httpsCallable } from "firebase/functions";
import {
    ISetStoryStarredForUserRequest,
    IGetUserRolesResponse,
    IAddNewPeopleWhoHeardStory,
} from "../../functions/src/shared";
import { useFunctions } from "reactfire";

export function useFunctionsService() {
    const functions = useFunctions();

    const getUserRoles = async (): Promise<IGetUserRolesResponse> => {
        const getUserRolesFunction = httpsCallable(functions, "getUserRoles");
        const response = await getUserRolesFunction();
        return response.data as IGetUserRolesResponse;
    };

    const setStoryStarredForUser = async (request: ISetStoryStarredForUserRequest): Promise<void> => {
        const setStoryStarredForUserFunction = httpsCallable(functions, "setStoryStarredForUser");
        await setStoryStarredForUserFunction(request);
        return;
    };

    const addNewPeopleWhoHeardStory = async (request: IAddNewPeopleWhoHeardStory): Promise<void> => {
        const addNewPeopleWhoHeardStoryFunction = httpsCallable(functions, "addNewPeopleWhoHeardStory");
        await addNewPeopleWhoHeardStoryFunction(request);
        return;
    };

    const backupData = async (): Promise<string> => {
        const backupDataFunction = httpsCallable<unknown, string>(functions, "backupData");
        const result = await backupDataFunction();
        return result.data;
    };

    return {
        getUserRoles,
        setStoryStarredForUser,
        addNewPeopleWhoHeardStory,
        backupData,
    }
}
