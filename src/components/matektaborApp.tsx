import { FC, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppHeader } from "./appHeader";
import { AppFooter } from "./appFooter";
import { BarkochbaScreen, BarkochbaManageScreen, BarkochbaExportScreen } from "./barkochba";
import { StaticContent } from "./staticContent";
import { ScrollToTop } from "./common";
import { LoginProtector } from "./loginProtector";
import {
    getNavUrlSimpleTitle,
    getNavUrlTemplate,
    getNavUrl,
    Page,
} from "../utils/navUtils";
import css from "./matektaborApp.module.scss";  
import { LoginPanel } from "./auth/LoginPanel";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useDataService } from "../hooks/useDataService";
import { Box, Container } from "@mui/material";

export const MatektaborApp: FC = () => {
    useDataService(); // this is included to trigger fetching all the data

    const renderHome = useCallback(() => {
        // The home screen for now just redirects directly to the barkochba page
        return <Navigate to={getNavUrl[Page.Barkochba]()} replace />;
        // Uncomment if you want to render the BarkochbaScreen directly
        // return (
        //     <DocumentTitle title={getNavUrlSimpleTitle[Page.Home]}>
        //         <BarkochbaScreen />
        //     </DocumentTitle>
        // );
    }, []);

    const renderTermsOfService = useCallback(() => (
        <div>
            <Helmet>
                <title>{getNavUrlSimpleTitle[Page.TermsOfService]}</title>
            </Helmet>
            <AppHeader />
            <StaticContent type="terms of service" />
            <AppFooter />
        </div>
    ), []);

    const renderPrivacyPolicy = useCallback(() => (
        <div>
            <Helmet>
                <title>{getNavUrlSimpleTitle[Page.PrivacyPolicy]}</title>
            </Helmet>
            <AppHeader />
            <StaticContent type="privacy policy" />
            <AppFooter />
        </div>
    ), []);

    const renderRouteAuth = useCallback(() => {
        return (
            <div>
                <Helmet>
                    <title>{getNavUrlSimpleTitle[Page.SignIn]}</title>
                </Helmet>
                <AppHeader />
                <Container sx={{ padding: 5 }}>
                    <LoginPanel />
                </Container>
                <AppFooter />
            </div>
        );
    }, []);

    const renderBarkochba = useCallback(() => (
        <>
            <Helmet>
                <title>{getNavUrlSimpleTitle[Page.Barkochba]}</title>
            </Helmet>
            <LoginProtector>
                <div className={css.barkochbaRouteContainer}>
                    <AppHeader />
                    <BarkochbaScreen />
                    <AppFooter />
                </div>
            </LoginProtector>
        </>
    ), []);

    const renderBarkochbaExport = useCallback(() => {
        return (
            <>
                <Helmet>
                    <title>{getNavUrlSimpleTitle[Page.BarkochbaExport]}</title>
                </Helmet>
                <LoginProtector>
                    <BarkochbaExportScreen />
                </LoginProtector>
            </>
        );
    }, []);

    const renderBarkochbaManage = useCallback(() => (
        <>
            <Helmet>
                <title>{getNavUrlSimpleTitle[Page.BarkochbaManage]}</title>
            </Helmet>
            <LoginProtector>
                <div>
                    <AppHeader />
                    <BarkochbaManageScreen />
                    <AppFooter />
                </div>
            </LoginProtector>
        </>
    ), []);

    const renderRedirectToHome = useCallback(() => <Navigate to={getNavUrl[Page.Home]()} replace />, []);

    return (
        <ScrollToTop>
            <HelmetProvider>
                <Helmet>
                    <title>{getNavUrlSimpleTitle[Page.Home]}</title>
                </Helmet>
                <div className={css.matektaborApp}>
                    <Box
                        component="a"
                        href="#main-content"
                        sx={{
                            position: "absolute",
                            left: "-9999px",
                            top: "auto",
                            width: "1px",
                            height: "1px",
                            overflow: "hidden",
                            "&:focus": {
                                position: "static",
                                width: "auto",
                                height: "auto",
                                padding: "8px 16px",
                                backgroundColor: "secondary.main",
                                color: "common.white",
                                zIndex: 9999,
                                textAlign: "center",
                            },
                        }}
                    >
                        Ugrás a tartalomhoz
                    </Box>
                    <Box component="main" id="main-content" className={css.appContent}>
                        <Routes>
                            <Route path={getNavUrlTemplate[Page.Home]} element={renderHome()} />
                            <Route path={getNavUrlTemplate[Page.SignIn]} element={renderRouteAuth()} />
                            <Route path={getNavUrlTemplate[Page.Barkochba]} element={renderBarkochba()} />
                            <Route path={getNavUrlTemplate[Page.BarkochbaExport]} element={renderBarkochbaExport()} />
                            <Route path={getNavUrlTemplate[Page.BarkochbaManage]} element={renderBarkochbaManage()} />
                            <Route path={getNavUrlTemplate[Page.TermsOfService]} element={renderTermsOfService()} />
                            <Route path={getNavUrlTemplate[Page.PrivacyPolicy]} element={renderPrivacyPolicy()} />
                            <Route path="*" element={renderRedirectToHome()} />
                        </Routes>
                    </Box>
                </div>
            </HelmetProvider>
        </ScrollToTop>
    );
};