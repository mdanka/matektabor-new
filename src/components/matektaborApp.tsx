import { FC, ReactNode } from "react";
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

interface PageLayoutProps {
    children: ReactNode;
    title: string;
    withContainer?: boolean;
}

function PageLayout({ children, title, withContainer }: PageLayoutProps) {
    return (
        <>
            <Helmet>
                <title>{title}</title>
            </Helmet>
            <AppHeader />
            <Box component="main" id="main-content" sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {withContainer ? <Container sx={{ padding: 5 }}>{children}</Container> : children}
            </Box>
            <AppFooter />
        </>
    );
}

export const MatektaborApp: FC = () => {
    useDataService(); // this is included to trigger fetching all the data

    return (
        <ScrollToTop>
            <HelmetProvider>
                <Helmet>
                    <title>{getNavUrlSimpleTitle[Page.Home]}</title>
                </Helmet>
                <a href="#main-content" className={css.skipToContent}>
                    Ugrás a tartalomhoz
                </a>
                <div className={css.matektaborApp}>
                    <div className={css.appContent}>
                        <Routes>
                            <Route
                                path={getNavUrlTemplate[Page.Home]}
                                element={<Navigate to={getNavUrl[Page.Barkochba]()} replace />}
                            />
                            <Route
                                path={getNavUrlTemplate[Page.SignIn]}
                                element={
                                    <PageLayout title={getNavUrlSimpleTitle[Page.SignIn]} withContainer>
                                        <LoginPanel />
                                    </PageLayout>
                                }
                            />
                            <Route
                                path={getNavUrlTemplate[Page.Barkochba]}
                                element={
                                    <>
                                        <Helmet>
                                            <title>{getNavUrlSimpleTitle[Page.Barkochba]}</title>
                                        </Helmet>
                                        <LoginProtector>
                                            <div className={css.barkochbaRouteContainer}>
                                                <AppHeader />
                                                <Box component="main" id="main-content" sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                                    <BarkochbaScreen />
                                                </Box>
                                                <AppFooter />
                                            </div>
                                        </LoginProtector>
                                    </>
                                }
                            />
                            <Route
                                path={getNavUrlTemplate[Page.BarkochbaExport]}
                                element={
                                    <>
                                        <Helmet>
                                            <title>{getNavUrlSimpleTitle[Page.BarkochbaExport]}</title>
                                        </Helmet>
                                        <LoginProtector>
                                            <BarkochbaExportScreen />
                                        </LoginProtector>
                                    </>
                                }
                            />
                            <Route
                                path={getNavUrlTemplate[Page.BarkochbaManage]}
                                element={
                                    <>
                                        <Helmet>
                                            <title>{getNavUrlSimpleTitle[Page.BarkochbaManage]}</title>
                                        </Helmet>
                                        <LoginProtector>
                                            <PageLayout title={getNavUrlSimpleTitle[Page.BarkochbaManage]}>
                                                <BarkochbaManageScreen />
                                            </PageLayout>
                                        </LoginProtector>
                                    </>
                                }
                            />
                            <Route
                                path={getNavUrlTemplate[Page.TermsOfService]}
                                element={
                                    <PageLayout title={getNavUrlSimpleTitle[Page.TermsOfService]}>
                                        <StaticContent type="terms of service" />
                                    </PageLayout>
                                }
                            />
                            <Route
                                path={getNavUrlTemplate[Page.PrivacyPolicy]}
                                element={
                                    <PageLayout title={getNavUrlSimpleTitle[Page.PrivacyPolicy]}>
                                        <StaticContent type="privacy policy" />
                                    </PageLayout>
                                }
                            />
                            <Route path="*" element={<Navigate to={getNavUrl[Page.Home]()} replace />} />
                        </Routes>
                    </div>
                </div>
            </HelmetProvider>
        </ScrollToTop>
    );
};
