import React from "react";
import { useSelector } from "react-redux";
import { AppHeader } from "./appHeader";
import { AppFooter } from "./appFooter";
import { Typography } from "@mui/material";
import { selectCurrentUser } from "../store";
import css from "./loginProtector.module.scss";

interface ILoginProtectorProps {
    children: React.ReactNode;
}

export function LoginProtector({ children }: ILoginProtectorProps) {
    const isLoggedIn = useSelector(selectCurrentUser) !== undefined;

    const renderNotLoggedInScreen = () => (
        <div>
            <AppHeader />
            <div className={css.loginProtectorNotLoggedIn}>
                <Typography variant="h4" align="center" color="textSecondary">
                    A lap használatához be kell jelentkezned.
                </Typography>
            </div>
            <AppFooter />
        </div>
    );

    return isLoggedIn ? <>{children}</> : renderNotLoggedInScreen();
}