import * as firebase from "firebase/app";
import "firebase/functions";
import { ISetStarredForUserRequest, IGetIsUserViewerResponse } from "../../functions/src/shared";

export class FunctionsService {
    public constructor(private functions: firebase.functions.Functions) {}

    public getIsUserViewer = async (): Promise<IGetIsUserViewerResponse> => {
        const getIsUserViewerFunction = this.functions.httpsCallable("getIsUserViewer");
        const response = await getIsUserViewerFunction();
        return response.data as IGetIsUserViewerResponse;
    };

    public setStarredForUser = async (request: ISetStarredForUserRequest): Promise<void> => {
        const setStarredForUserFunction = this.functions.httpsCallable("setStarredForUser");
        await setStarredForUserFunction(request);
        return;
    };
}
