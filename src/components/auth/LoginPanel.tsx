import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import { useAuth, useSigninCheck } from "reactfire";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useSnackbar } from "notistack";
import Grid2 from "@mui/material/Unstable_Grid2";
import { LoginWithEmailLink } from "./LoginWithEmailLink";
import { useNavigate } from "react-router";
import { getNavUrl, Page } from "../../utils/navUtils";
import { useSearchParams } from "react-router-dom";

const IS_EMAIL_LINK_SIGN_IN_ENABLED = false;

export function LoginPanel() {
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get("redirectUrl") ?? undefined;
    const navigate = useNavigate();
    const auth = useAuth();
    const { status: signInCheckStatus, data: signInCheckResult } = useSigninCheck();
    const { enqueueSnackbar } = useSnackbar();
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const [activatedFlow, setActivatedFlow] = useState<"EMAIL_WITH_LINK" | undefined>(undefined);

    const handleAuthSuccess = useCallback(() => {
        void navigate(redirectUrl ?? getNavUrl[Page.Home]());
    }, [navigate, redirectUrl]);

    const handleInitGoogleLogin = useCallback(() => {
        const execute = async () => {
            setIsLoggingIn(true);
            const provider = new GoogleAuthProvider();
            try {
                auth.languageCode = "hu";
                await signInWithPopup(auth, provider);
                handleAuthSuccess();
            } catch (error) {
                enqueueSnackbar("Nem sikerült a bejelentkezés - kérjük próbáld újra!", { variant: "error" });
                console.error(error);
                setIsLoggingIn(false);
            }
        };
        void execute();
    }, [auth, handleAuthSuccess, enqueueSnackbar]);

    const handleGoToHome = useCallback(() => {
        void navigate(getNavUrl[Page.Home]());
    }, [navigate]);

    const handleEmailWithLinkFlowActivated = useCallback(() => {
        setActivatedFlow("EMAIL_WITH_LINK");
    }, []);

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
            {isLoggingIn && (
                <CircularProgress size={60} />
            )}
            {!isLoggingIn && (
                <>
                    {signInCheckStatus === "loading" && <CircularProgress size={60} />}
                    {signInCheckStatus === "success" && signInCheckResult.signedIn && (
                        <>
                            <Typography variant="body1" paragraph>
                                Már be vagy jelentkezve.
                            </Typography>
                            <Button onClick={handleGoToHome} variant="contained">
                                Tovább a kezdőlapra
                            </Button>
                        </>
                    )}
                    {signInCheckStatus === "success" && !signInCheckResult.signedIn && (
                        <>
                            {activatedFlow === undefined && (
                                <>
                                    <Typography variant="h4" paragraph>
                                        Üdvözlünk!
                                    </Typography>
                                    <Typography variant="body1" paragraph>

                                        Kattints alább a bejelentkezéshez!
                                    </Typography>
                                </>
                            )}
                            <Grid2
                                container
                                direction="column"
                                spacing={2}
                                alignItems="stretch"
                                sx={{ padding: "2vh 0" }}
                            >
                                {activatedFlow === undefined && (
                                    <Grid2>
                                        <Button onClick={handleInitGoogleLogin} variant="contained" fullWidth>
                                            Bejelentkezés Google fiókkal
                                        </Button>
                                    </Grid2>
                                )}
                                {IS_EMAIL_LINK_SIGN_IN_ENABLED && (
                                    <Grid2>
                                        <LoginWithEmailLink
                                            authInfo={{
                                                auth,
                                                tenantLanguageCode: "hu",
                                            }}
                                            onFlowActivated={handleEmailWithLinkFlowActivated}
                                            onAuthSuccess={handleAuthSuccess}
                                        />
                                    </Grid2>
                                )}
                            </Grid2>
                        </>
                    )}
                </>
            )}
        </Box>
    );
}
