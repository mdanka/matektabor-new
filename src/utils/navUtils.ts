import { matchPath } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import * as queryString from "query-string";

export enum Page {
    Home = "home",
    SignIn = "signin",
    Barkochba = "barkochba",
    BarkochbaExport = "barkochba/export",
    TermsOfService = "terms-of-service",
    PrivacyPolicy = "privacy-policy",
}

export namespace NavUtils {
    export const getNavUrl = {
        [Page.Home]: () => "/",
        [Page.SignIn]: (redirectUrl?: string) =>
            `/signin${redirectUrl === undefined ? "" : `?redirectUrl=${redirectUrl}`}`,
        [Page.Barkochba]: () => `/barkochba`,
        [Page.BarkochbaExport]: (campId?: string) => `/barkochba/export/${campId === undefined ? "" : `${campId}`}`,
        [Page.TermsOfService]: () => `/terms-of-service`,
        [Page.PrivacyPolicy]: () => `/privacy-policy`,
    };

    export const getNavUrlTemplate = {
        [Page.Home]: getNavUrl[Page.Home](),
        [Page.SignIn]: getNavUrl[Page.SignIn](),
        [Page.Barkochba]: getNavUrl[Page.Barkochba](),
        [Page.BarkochbaExport]: `/barkochba/export/:campId?`,
        [Page.TermsOfService]: getNavUrl[Page.TermsOfService](),
        [Page.PrivacyPolicy]: getNavUrl[Page.PrivacyPolicy](),
    };

    interface ISignInRouteQueryParams {
        redirectUrl: string | undefined;
    }

    interface IBarkochbaExportRouteComponentParams {
        campId: string;
    }

    export const getNavUrlMatch = {
        [Page.BarkochbaExport]: (pathName: string) => {
            return matchPath<IBarkochbaExportRouteComponentParams>(pathName, {
                path: getNavUrlTemplate[Page.BarkochbaExport],
            });
        },
    };

    export const getNavUrlQueryParams = {
        [Page.SignIn]: (value: string) => (queryString.parse(value) as unknown) as ISignInRouteQueryParams,
        [Page.BarkochbaExport]: (value: string) =>
            (queryString.parse(value) as unknown) as IBarkochbaExportRouteComponentParams,
    };

    export const singInAndReturn = (reactRouterProps: RouteComponentProps<any>) => {
        const { history } = reactRouterProps;
        const currentPath = history.location.pathname;
        history.push(getNavUrl[Page.SignIn](currentPath));
    };

    const pageTitleBase = "Matektábor";
    const pageTitleEnding = "";

    function getPageTitle(title?: string) {
        const titlePrefix = title === undefined ? "" : `${title} - `;
        return `${titlePrefix}${pageTitleBase}${pageTitleEnding}`;
    }

    export function pathToPage(path: string) {
        const pages = [Page.Home, Page.SignIn, Page.Barkochba, Page.TermsOfService, Page.PrivacyPolicy];
        return pages.find(page => pageToMatch(path, page) !== null);
    }

    function pageToMatch(path: string, page: Page) {
        return matchPath(path, {
            path: getNavUrlTemplate[page],
            exact: true,
            strict: false,
        });
    }

    export const getNavUrlSimpleTitle = {
        [Page.Home]: getPageTitle(),
        [Page.SignIn]: getPageTitle("Bejelentkezés"),
        [Page.Barkochba]: getPageTitle("Barkochba"),
        [Page.BarkochbaExport]: getPageTitle("Barkochba - Export"),
        [Page.TermsOfService]: getPageTitle("Terms of Service"),
        [Page.PrivacyPolicy]: getPageTitle("Privacy Policy"),
    };
}
