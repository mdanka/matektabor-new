import { matchPath } from "react-router-dom";
import { NavigateFunction } from "react-router";

export enum Page {
    Home = "home",
    SignIn = "signin",
    Barkochba = "barkochba",
    BarkochbaExport = "barkochba/export",
    BarkochbaManage = "barkochba/manage",
    TermsOfService = "terms-of-service",
    PrivacyPolicy = "privacy-policy",
}

export const getNavUrl = {
    [Page.Home]: () => "/",
    [Page.SignIn]: (redirectUrl?: string) =>
        `/signin${redirectUrl === undefined ? "" : `?redirectUrl=${redirectUrl}`}`,
    [Page.Barkochba]: () => `/barkochba`,
    [Page.BarkochbaExport]: (campId?: string) => `/barkochba/export/${campId === undefined ? "" : `${campId}`}`,
    [Page.BarkochbaManage]: () => `/barkochba/manage`,
    [Page.TermsOfService]: () => `/terms-of-service`,
    [Page.PrivacyPolicy]: () => `/privacy-policy`,
};

export const getNavUrlTemplate = {
    [Page.Home]: getNavUrl[Page.Home](),
    [Page.SignIn]: getNavUrl[Page.SignIn](),
    [Page.Barkochba]: getNavUrl[Page.Barkochba](),
    [Page.BarkochbaExport]: `/barkochba/export/:campId?`,
    [Page.BarkochbaManage]: getNavUrl[Page.BarkochbaManage](),
    [Page.TermsOfService]: getNavUrl[Page.TermsOfService](),
    [Page.PrivacyPolicy]: getNavUrl[Page.PrivacyPolicy](),
};

export const singInAndReturn = (navigate: NavigateFunction, pathName: string) => {
    navigate(getNavUrl[Page.SignIn](pathName));
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
    return matchPath({
        path: getNavUrlTemplate[page],
        end: true,
        caseSensitive: false,
    }, path);
}

export const getNavUrlSimpleTitle = {
    [Page.Home]: getPageTitle(),
    [Page.SignIn]: getPageTitle("Bejelentkezés"),
    [Page.Barkochba]: getPageTitle("Barkochba"),
    [Page.BarkochbaExport]: getPageTitle("Barkochba - Áttekintő táblázatok"),
    [Page.BarkochbaManage]: getPageTitle("Barkochba - Szerkesztés"),
    [Page.TermsOfService]: getPageTitle("Terms of Service"),
    [Page.PrivacyPolicy]: getPageTitle("Privacy Policy"),
};
