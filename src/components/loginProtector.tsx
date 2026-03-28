import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { AppHeader } from "./appHeader";
import { AppFooter } from "./appFooter";
import { Typography, Button } from "@mui/material";
import { selectCurrentUser } from "../store";
import { singInAndReturn } from "../utils/navUtils";
import css from "./loginProtector.module.scss";

interface ILoginProtectorProps {
    children: ReactNode;
}

export function LoginProtector({ children }: ILoginProtectorProps) {
    const currentUser = useSelector(selectCurrentUser);
    const isLoggedIn = currentUser !== undefined;
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignInClick = () => {
        singInAndReturn(navigate, location.pathname);
    };

    const renderNotLoggedInScreen = () => (
        <div>
            <AppHeader />
            <div className={css.loginProtectorNotLoggedIn}>
                <Typography variant="h4" align="center" color="textSecondary">
                    A lap használatához be kell jelentkezned.
                </Typography>
                <Typography align="center" sx={{ marginTop: 3 }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={handleSignInClick}
                    >
                        Bejelentkezés
                    </Button>
                </Typography>
            </div>
            <AppFooter />
        </div>
    );

    return isLoggedIn ? <>{children}</> : renderNotLoggedInScreen();
}
