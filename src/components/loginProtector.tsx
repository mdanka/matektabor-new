import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { AppHeader } from "./appHeader";
import { AppFooter } from "./appFooter";
import { Typography, Button } from "@mui/material";
import { selectCurrentUser } from "../store";
import { Link as RouterLink } from "react-router-dom";
import { getNavUrl, Page } from "../utils/navUtils";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { CenteredCard } from "./common";

interface ILoginProtectorProps {
    children: ReactNode;
}

export function LoginProtector({ children }: ILoginProtectorProps) {
    const currentUser = useSelector(selectCurrentUser);
    const isLoggedIn = currentUser !== undefined;

    const renderNotLoggedInScreen = () => (
        <div>
            <AppHeader />
            <CenteredCard>
                <LockOutlinedIcon sx={{ fontSize: 48, color: "text.secondary" }} />
                <Typography variant="h5" align="center">
                    A lap használatához be kell jelentkezned.
                </Typography>
                <Button
                    component={RouterLink}
                    to={getNavUrl[Page.SignIn]()}
                    variant="contained"
                    color="secondary"
                    fullWidth
                    sx={{ height: 48, mt: 1 }}
                >
                    Bejelentkezés
                </Button>
            </CenteredCard>
            <AppFooter />
        </div>
    );

    return isLoggedIn ? <>{children}</> : renderNotLoggedInScreen();
}
