import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "reactfire";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { getNavUrl, Page } from "../../utils/navUtils";

export function LogoutPanel() {
    const auth = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [status, setStatus] = useState<"working" | "success" | "error" | undefined>();
    const navigate = useNavigate();

    const handleGoToHome = useCallback(() => {
        navigate(getNavUrl[Page.Home]());
    }, [navigate]);

    const handleTryAgain = useCallback(() => {
        window.location.reload();
    }, []);

    const handleLogout = useCallback(() => {
        const execute = async () => {
            setStatus("working");
            try {
                auth.languageCode = "hu";
                await auth.signOut();
                setStatus("success");
            } catch (e) {
                setStatus("error");
                console.error(e);
                enqueueSnackbar("Nem sikerült kijelentkezni - kérjük próbáld újra!", { variant: "error" });
            }
        };
        void execute();
    }, [auth, enqueueSnackbar]);

    useEffect(() => {
        handleLogout();
    }, [handleLogout]);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: 1,
            }}
        >
            {(status === "working") && (
                <CircularProgress size={60} />
            )}
            {status === "success" && (
                <>
                    <Typography variant="body1" paragraph>
                        Sikeresen kijelentkeztél.
                    </Typography>
                    <Button onClick={handleGoToHome} variant="contained">
                        Tovább a kezdőlapra
                    </Button>
                </>
            )}
            {status === "error" && (
                <>
                    <Typography variant="body1" paragraph>
                        Nem sikerült kijelentkezni.
                    </Typography>
                    <Button onClick={handleTryAgain} variant="contained">
                        Újrapróbálás
                    </Button>
                </>
            )}
        </Box>
    );
}
