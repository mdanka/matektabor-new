import { Functions, getFunctions, httpsCallable } from "firebase/functions";
import {
    ISetStoryStarredForUserRequest,
    IGetUserRolesResponse,
    IAddNewPeopleWhoHeardStory,
} from "../../functions/src/shared";
import { FirebaseApp } from "firebase/app";

export class FunctionsService {
    private functions: Functions;

    public constructor(firebaseApp: FirebaseApp) {
        this.functions = getFunctions(firebaseApp, "europe-west1");
    }

    public getUserRoles = async (): Promise<IGetUserRolesResponse> => {
        const getUserRolesFunction = httpsCallable(this.functions, "getUserRoles");
        const response = await getUserRolesFunction();
        return response.data as IGetUserRolesResponse;
    };

    public setStoryStarredForUser = async (request: ISetStoryStarredForUserRequest): Promise<void> => {
        const setStoryStarredForUserFunction = httpsCallable(this.functions, "setStoryStarredForUser");
        await setStoryStarredForUserFunction(request);
        return;
    };

    public addNewPeopleWhoHeardStory = async (request: IAddNewPeopleWhoHeardStory): Promise<void> => {
        const addNewPeopleWhoHeardStoryFunction = httpsCallable(this.functions, "addNewPeopleWhoHeardStory");
        await addNewPeopleWhoHeardStoryFunction(request);
        return;
    };

    public backupData = async (): Promise<string> => {
        const backupDataFunction = httpsCallable<unknown, string>(this.functions, "backupData");
        const result = await backupDataFunction();
        return result.data;
    };
}
