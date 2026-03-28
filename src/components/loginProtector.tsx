import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { AppHeader } from "./appHeader";
import { AppFooter } from "./appFooter";
import { Typography, Button, Paper, Box } from "@mui/material";
import { selectCurrentUser, selectHasViewerRole } from "../store";
import { Link as RouterLink } from "react-router-dom";
import { getNavUrl, Page } from "../utils/navUtils";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

interface ILoginProtectorProps {
    children: ReactNode;
}

export function LoginProtector({ children }: ILoginProtectorProps) {
    const currentUser = useSelector(selectCurrentUser);
    const hasViewerRole = useSelector(selectHasViewerRole);
    const isLoggedIn = currentUser !== undefined && hasViewerRole !== false;

    const renderNotLoggedInScreen = () => (
        <div>
            <AppHeader />
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "calc(100vh - 120px)",
                padding: { xs: "24px 16px", sm: "40px" },
            }}>
                <Paper
                    elevation={0}
                    sx={{
                        maxWidth: 400,
                        width: "100%",
                        padding: { xs: "32px 24px", sm: "40px" },
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
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
                </Paper>
            </Box>
            <AppFooter />
        </div>
    );

    return isLoggedIn ? <>{children}</> : renderNotLoggedInScreen();
}
