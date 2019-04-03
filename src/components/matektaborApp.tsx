import * as React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { Login } from "./login";
import { AppHeader } from "./appHeader";
import { AppFooter } from "./appFooter";
import { NavUtils, Page } from "../utils";
import { BarkochbaScreen } from "./barkochba/barkochbaScreen";
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
                        <AppHeader />
                        <div className="app-content">
                            <Switch>
                                <Route exact path={NavUtils.getNavUrlTemplate[Page.Home]} render={this.renderHome} />
                                <Route path={NavUtils.getNavUrlTemplate[Page.SignIn]} render={this.renderRouteAuth} />
                                <Route
                                    path={NavUtils.getNavUrlTemplate[Page.Barkochba]}
                                    render={this.renderBarkochba}
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
                        <AppFooter />
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
                <StaticContent type="terms of service" />
            </DocumentTitle>
        );
    };

    private renderPrivacyPolicy = (_locationInfo: RouteComponentProps<any>) => {
        return (
            <DocumentTitle title={NavUtils.getNavUrlSimpleTitle[Page.PrivacyPolicy]}>
                <StaticContent type="privacy policy" />
            </DocumentTitle>
        );
    };

    private renderRouteAuth = (locationInfo: RouteComponentProps<any>) => {
        const signInQueryParams = NavUtils.getNavUrlQueryParams[Page.SignIn](locationInfo.location.search);
        const { redirectUrl } = signInQueryParams;
        return (
            <DocumentTitle title={NavUtils.getNavUrlSimpleTitle[Page.SignIn]}>
                <Login redirectUrl={redirectUrl} />
            </DocumentTitle>
        );
    };

    private renderBarkochba = (_locationInfo: RouteComponentProps<any>) => {
        return (
            <DocumentTitle title={NavUtils.getNavUrlSimpleTitle[Page.Barkochba]}>
                <BarkochbaScreen />
            </DocumentTitle>
        );
    };

    private renderRedirectToHome = (_locationInfo: RouteComponentProps<any>) => {
        return <Redirect to={NavUtils.getNavUrl[Page.Home]()} />;
    };
}
