import * as firebase from "firebase/app";
import "firebase/functions";
import {
    ISetStoryStarredForUserRequest,
    IGetUserRolesResponse,
    IAddNewPeopleWhoHeardStory,
} from "../../functions/src/shared";

export class FunctionsService {
    public constructor(private functions: firebase.functions.Functions) {}

    public getUserRoles = async (): Promise<IGetUserRolesResponse> => {
        const getUserRolesFunction = this.functions.httpsCallable("getUserRoles");
        const response = await getUserRolesFunction();
        return response.data as IGetUserRolesResponse;
    };

    public setStoryStarredForUser = async (request: ISetStoryStarredForUserRequest): Promise<void> => {
        const setStoryStarredForUserFunction = this.functions.httpsCallable("setStoryStarredForUser");
        await setStoryStarredForUserFunction(request);
        return;
    };

    public addNewPeopleWhoHeardStory = async (request: IAddNewPeopleWhoHeardStory): Promise<void> => {
        const addNewPeopleWhoHeardStoryFunction = this.functions.httpsCallable("addNewPeopleWhoHeardStory");
        await addNewPeopleWhoHeardStoryFunction(request);
        return;
    };

    public backupData = async (): Promise<object> => {
        const backupDataFunction = this.functions.httpsCallable("backupData");
        const result = await backupDataFunction();
        return result.data;
    };
}
