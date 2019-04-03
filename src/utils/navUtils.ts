import { matchPath } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import * as queryString from "query-string";

export enum Page {
    Home = "home",
    SignIn = "signin",
    Song = "song",
    TermsOfService = "terms-of-service",
    PrivacyPolicy = "privacy-policy",
}

export namespace NavUtils {
    export const getNavUrl = {
        [Page.Home]: () => "/",
        [Page.SignIn]: (redirectUrl?: string) =>
            `/signin${redirectUrl === undefined ? "" : `?redirectUrl=${redirectUrl}`}`,
        [Page.Song]: (id: string) => `/songs/${id}`,
        [Page.TermsOfService]: () => `/terms-of-service`,
        [Page.PrivacyPolicy]: () => `/privacy-policy`,
    };

    export const getNavUrlTemplate = {
        [Page.Home]: getNavUrl[Page.Home](),
        [Page.SignIn]: getNavUrl[Page.SignIn](),
        [Page.Song]: `/songs/:id`,
        [Page.TermsOfService]: getNavUrl[Page.TermsOfService](),
        [Page.PrivacyPolicy]: getNavUrl[Page.PrivacyPolicy](),
    };

    interface ISongRouteComponentParams {
        id: string;
    }

    interface ISignInRouteQueryParams {
        redirectUrl: string | undefined;
    }

    export const getNavUrlMatch = {
        [Page.Song]: (pathName: string) => {
            return matchPath<ISongRouteComponentParams>(pathName, {
                path: getNavUrlTemplate[Page.Song],
            });
        },
    };

    export const getNavUrlQueryParams = {
        [Page.SignIn]: (value: string) => (queryString.parse(value) as unknown) as ISignInRouteQueryParams,
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
        const pages = [Page.Home, Page.SignIn, Page.Song, Page.TermsOfService, Page.PrivacyPolicy];
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
        [Page.Home]: getPageTitle("Home"),
        [Page.SignIn]: getPageTitle("Sign in"),
        [Page.Song]: getPageTitle("Song"),
        [Page.TermsOfService]: getPageTitle("Terms of Service"),
        [Page.PrivacyPolicy]: getPageTitle("Privacy Policy"),
    };
}
