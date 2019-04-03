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
                                <Route path={NavUtils.getNavUrlTemplate[Page.Song]} render={this.renderSong} />
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
        return (
            <DocumentTitle title={NavUtils.getNavUrlSimpleTitle[Page.Home]}>
                <BarkochbaScreen />
            </DocumentTitle>
        );
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

    private renderSong = (locationInfo: RouteComponentProps<any>) => {
        const match = NavUtils.getNavUrlMatch[Page.Song](locationInfo.location.pathname);
        if (match == null) {
            return null;
        }
        // const { id } = match.params;
        // return <Song id={id} />;
        return "Hello";
    };

    private renderRedirectToHome = (_locationInfo: RouteComponentProps<any>) => {
        return <Redirect to={NavUtils.getNavUrl[Page.Home]()} />;
    };
}
