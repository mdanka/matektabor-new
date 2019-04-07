import * as React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { Login } from "./login";
import { AppHeader } from "./appHeader";
import { AppFooter } from "./appFooter";
import { NavUtils, Page } from "../utils";
import { BarkochbaScreen, BarkochbaManageScreen, BarkochbaExportScreen } from "./barkochba";
import { StaticContent } from "./staticContent";
import { ScrollToTop } from "./common";
import DocumentTitle = require("react-document-title");

export interface IMatektaborAppState {}

export class MatektaborApp extends React.Component<{}, IMatektaborAppState> {
    public render() {
        return (
            <DocumentTitle title={NavUtils.getNavUrlSimpleTitle[Page.Home]}>
                <ScrollToTop>
                    <div className="matektabor-app">
                        <div className="app-content">
                            <Switch>
                                <Route exact path={NavUtils.getNavUrlTemplate[Page.Home]} render={this.renderHome} />
                                <Route path={NavUtils.getNavUrlTemplate[Page.SignIn]} render={this.renderRouteAuth} />
                                <Route
                                    exact
                                    path={NavUtils.getNavUrlTemplate[Page.Barkochba]}
                                    render={this.renderBarkochba}
                                />
                                <Route
                                    path={NavUtils.getNavUrlTemplate[Page.BarkochbaExport]}
                                    render={this.renderBarkochbaExport}
                                />
                                <Route
                                    path={NavUtils.getNavUrlTemplate[Page.BarkochbaManage]}
                                    render={this.renderBarkochbaManage}
                                />
                                <Route
                                    exact
                                    path={NavUtils.getNavUrlTemplate[Page.TermsOfService]}
                                    render={this.renderTermsOfService}
                                />
                                <Route
                                    exact
                                    path={NavUtils.getNavUrlTemplate[Page.PrivacyPolicy]}
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
        return <Redirect to={NavUtils.getNavUrl[Page.Barkochba]()} />;
        // return (
        //     <DocumentTitle title={NavUtils.getNavUrlSimpleTitle[Page.Home]}>
        //         <BarkochbaScreen />
        //     </DocumentTitle>
        // );
    };

    private renderTermsOfService = (_locationInfo: RouteComponentProps<any>) => {
        return (
            <DocumentTitle title={NavUtils.getNavUrlSimpleTitle[Page.TermsOfService]}>
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
            <DocumentTitle title={NavUtils.getNavUrlSimpleTitle[Page.PrivacyPolicy]}>
                <div>
                    <AppHeader />
                    <StaticContent type="privacy policy" />
                    <AppFooter />
                </div>
            </DocumentTitle>
        );
    };

    private renderRouteAuth = (locationInfo: RouteComponentProps<any>) => {
        const signInQueryParams = NavUtils.getNavUrlQueryParams[Page.SignIn](locationInfo.location.search);
        const { redirectUrl } = signInQueryParams;
        return (
            <DocumentTitle title={NavUtils.getNavUrlSimpleTitle[Page.SignIn]}>
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
            <DocumentTitle title={NavUtils.getNavUrlSimpleTitle[Page.Barkochba]}>
                <div>
                    <AppHeader />
                    <BarkochbaScreen />
                    <AppFooter />
                </div>
            </DocumentTitle>
        );
    };

    private renderBarkochbaExport = (locationInfo: RouteComponentProps<any>) => {
        const match = NavUtils.getNavUrlMatch[Page.BarkochbaExport](locationInfo.location.pathname);
        if (match == null) {
            return null;
        }
        const { campId } = match.params;
        return (
            <DocumentTitle title={NavUtils.getNavUrlSimpleTitle[Page.BarkochbaExport]}>
                <BarkochbaExportScreen campId={campId} />
            </DocumentTitle>
        );
    };

    private renderBarkochbaManage = (_locationInfo: RouteComponentProps<any>) => {
        return (
            <DocumentTitle title={NavUtils.getNavUrlSimpleTitle[Page.BarkochbaManage]}>
                <div>
                    <AppHeader />
                    <BarkochbaManageScreen />
                    <AppFooter />
                </div>
            </DocumentTitle>
        );
    };

    private renderRedirectToHome = (_locationInfo: RouteComponentProps<any>) => {
        return <Redirect to={NavUtils.getNavUrl[Page.Home]()} />;
    };
}
