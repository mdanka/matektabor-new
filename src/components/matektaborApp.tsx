import * as React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { Login } from "./login";
import { AppHeader } from "./appHeader";
import { AppFooter } from "./appFooter";
import { BarkochbaScreen, BarkochbaManageScreen, BarkochbaExportScreen } from "./barkochba";
import { StaticContent } from "./staticContent";
import { ScrollToTop } from "./common";
import { LoginProtector } from "./loginProtector";
import DocumentTitle from "react-document-title";
import { getNavUrlSimpleTitle, getNavUrlTemplate, getNavUrl, getNavUrlQueryParams, getNavUrlMatch, Page } from "../utils/navUtils";
import css from "./matektaborApp.module.scss";

export class MatektaborApp extends React.Component<{}, {}> {
    public render() {
        return (
            <DocumentTitle title={getNavUrlSimpleTitle[Page.Home]}>
                <ScrollToTop>
                    <div className={css.matektaborApp}>
                        <div className={css.appContent}>
                            <Switch>
                                <Route exact path={getNavUrlTemplate[Page.Home]} render={this.renderHome} />
                                <Route path={getNavUrlTemplate[Page.SignIn]} render={this.renderRouteAuth} />
                                <Route
                                    exact
                                    path={getNavUrlTemplate[Page.Barkochba]}
                                    render={this.renderBarkochba}
                                />
                                <Route
                                    path={getNavUrlTemplate[Page.BarkochbaExport]}
                                    render={this.renderBarkochbaExport}
                                />
                                <Route
                                    path={getNavUrlTemplate[Page.BarkochbaManage]}
                                    render={this.renderBarkochbaManage}
                                />
                                <Route
                                    exact
                                    path={getNavUrlTemplate[Page.TermsOfService]}
                                    render={this.renderTermsOfService}
                                />
                                <Route
                                    exact
                                    path={getNavUrlTemplate[Page.PrivacyPolicy]}
                                    render={this.renderPrivacyPolicy}
                                />
                                <Route render={this.renderRedirectToHome} />
                            </Switch>
                        </div>
                    </div>
                </ScrollToTop>
            </DocumentTitle>
        );
    }

    private renderHome = (_locationInfo: RouteComponentProps<any>) => {
        // The home screen for now just redirects directly to the barkochba page
        return <Redirect to={getNavUrl[Page.Barkochba]()} />;
        // return (
        //     <DocumentTitle title={getNavUrlSimpleTitle[Page.Home]}>
        //         <BarkochbaScreen />
        //     </DocumentTitle>
        // );
    };

    private renderTermsOfService = (_locationInfo: RouteComponentProps<any>) => {
        return (
            <DocumentTitle title={getNavUrlSimpleTitle[Page.TermsOfService]}>
                <div>
                    <AppHeader />
                    <StaticContent type="terms of service" />
                    <AppFooter />
                </div>
            </DocumentTitle>
        );
    };

    private renderPrivacyPolicy = (_locationInfo: RouteComponentProps<any>) => {
        return (
            <DocumentTitle title={getNavUrlSimpleTitle[Page.PrivacyPolicy]}>
                <div>
                    <AppHeader />
                    <StaticContent type="privacy policy" />
                    <AppFooter />
                </div>
            </DocumentTitle>
        );
    };

    private renderRouteAuth = (locationInfo: RouteComponentProps<any>) => {
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

    private renderBarkochba = (_locationInfo: RouteComponentProps<any>) => {
        return (
            <DocumentTitle title={getNavUrlSimpleTitle[Page.Barkochba]}>
                <LoginProtector>
                    <div>
                        <AppHeader />
                        <BarkochbaScreen />
                        <AppFooter />
                    </div>
                </LoginProtector>
            </DocumentTitle>
        );
    };

    private renderBarkochbaExport = (locationInfo: RouteComponentProps<any>) => {
        const match = getNavUrlMatch[Page.BarkochbaExport](locationInfo.location.pathname);
        if (match == null) {
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

    private renderBarkochbaManage = (_locationInfo: RouteComponentProps<any>) => {
        return (
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
    };

    private renderRedirectToHome = (_locationInfo: RouteComponentProps<any>) => {
        return <Redirect to={getNavUrl[Page.Home]()} />;
    };
}
