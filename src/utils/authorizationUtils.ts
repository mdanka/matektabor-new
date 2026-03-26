import { IUser } from "../commons";

export const AUTHORIZATION = {
    isAuthenticated: (user: IUser | undefined): boolean => user !== undefined,
    canAccessApp: (user: IUser | undefined, hasViewerRole: boolean | undefined): boolean =>
        user !== undefined && hasViewerRole === true,
};
