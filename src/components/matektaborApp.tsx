import React from "react";
import { Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
import { Login } from "./login";
import { AppHeader } from "./appHeader";
import { AppFooter } from "./appFooter";
import { BarkochbaScreen, BarkochbaManageScreen, BarkochbaExportScreen } from "./barkochba";
import { StaticContent } from "./staticContent";
import { ScrollToTop } from "./common";
import { LoginProtector } from "./loginProtector";
import DocumentTitle from "react-document-title";
import {
    getNavUrlSimpleTitle,
    getNavUrlTemplate,
    getNavUrl,
    getNavUrlQueryParams,
    getNavUrlMatch,
    Page,
} from "../utils/navUtils";
import css from "./matektaborApp.module.scss";  

export const MatektaborApp: React.FC = () => {    
    const renderHome = () => {
        // The home screen for now just redirects directly to the barkochba page
        return <Redirect to={getNavUrl[Page.Barkochba]()} />;
        // Uncomment if you want to render the BarkochbaScreen directly
        // return (
        //     <DocumentTitle title={getNavUrlSimpleTitle[Page.Home]}>
        //         <BarkochbaScreen />
        //     </DocumentTitle>
        // );
    };

    const renderTermsOfService = () => (
        <DocumentTitle title={getNavUrlSimpleTitle[Page.TermsOfService]}>
            <div>
                <AppHeader />
                <StaticContent type="terms of service" />
                <AppFooter />
            </div>
        </DocumentTitle>
    );

    const renderPrivacyPolicy = () => (
        <DocumentTitle title={getNavUrlSimpleTitle[Page.PrivacyPolicy]}>
            <div>
                <AppHeader />
                <StaticContent type="privacy policy" />
                <AppFooter />
            </div>
        </DocumentTitle>
    );

    const renderRouteAuth = (locationInfo: RouteComponentProps) => {
        const signInQueryParams = getNavUrlQueryParams[Page.SignIn](locationInfo.location.search);
        const { redirectUrl } = signInQueryParams;
        return (
            <DocumentTitle title={getNavUrlSimpleTitle[Page.SignIn]}>
                <div>
                    <AppHeader />
                    <Login redirectUrl={redirectUrl} />
                    <AppFooter />
                </div>
            </DocumentTitle>
        );
    };

    const renderBarkochba = () => (
        <DocumentTitle title={getNavUrlSimpleTitle[Page.Barkochba]}>
            <LoginProtector>
                <div className={css.barkochbaRouteContainer}>
                    <AppHeader />
                    <BarkochbaScreen />
                    <AppFooter />
                </div>
            </LoginProtector>
        </DocumentTitle>
    );

    const renderBarkochbaExport = (locationInfo: RouteComponentProps) => {
        const match = getNavUrlMatch[Page.BarkochbaExport](locationInfo.location.pathname);
        if (!match) {
            return null;
        }
        const { campId } = match.params;
        return (
            <DocumentTitle title={getNavUrlSimpleTitle[Page.BarkochbaExport]}>
                <LoginProtector>
                    <BarkochbaExportScreen campId={campId} />
                </LoginProtector>
            </DocumentTitle>
        );
    };

    const renderBarkochbaManage = () => (
        <DocumentTitle title={getNavUrlSimpleTitle[Page.BarkochbaManage]}>
            <LoginProtector>
                <div>
                    <AppHeader />
                    <BarkochbaManageScreen />
                    <AppFooter />
                </div>
            </LoginProtector>
        </DocumentTitle>
    );

    const renderRedirectToHome = () => <Redirect to={getNavUrl[Page.Home]()} />;

    return (
        <DocumentTitle title={getNavUrlSimpleTitle[Page.Home]}>
            <ScrollToTop>
                <div className={css.matektaborApp}>
                    <div className={css.appContent}>
                        <Switch>
                            <Route exact path={getNavUrlTemplate[Page.Home]} render={renderHome} />
                            <Route path={getNavUrlTemplate[Page.SignIn]} render={renderRouteAuth} />
                            <Route exact path={getNavUrlTemplate[Page.Barkochba]} render={renderBarkochba} />
                            <Route path={getNavUrlTemplate[Page.BarkochbaExport]} render={renderBarkochbaExport} />
                            <Route path={getNavUrlTemplate[Page.BarkochbaManage]} render={renderBarkochbaManage} />
                            <Route exact path={getNavUrlTemplate[Page.TermsOfService]} render={renderTermsOfService} />
                            <Route exact path={getNavUrlTemplate[Page.PrivacyPolicy]} render={renderPrivacyPolicy} />
                            <Route render={renderRedirectToHome} />
                        </Switch>
                    </div>
                </div>
            </ScrollToTop>
        </DocumentTitle>
    );
};
