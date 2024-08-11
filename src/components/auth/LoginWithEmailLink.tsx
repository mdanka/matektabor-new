import { TextField, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Auth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { useLocalStorage } from "react-use";
import { useSnackbar } from "notistack";
import { isValidEmail } from "../../lib/isValidEmail";
import { LoadingButton } from "@mui/lab";

const LOCAL_STORAGE_KEY_LOGIN_WITH_EMAIL_EMAIL = "MATEKTABOR_LOGIN_WITH_EMAIL_EMAIL";

export interface ILoginWithEmailLinkProps {
    authInfo:
        | {
              auth: Auth;
              tenantLanguageCode: string;
          }
        | undefined;
    onFlowActivated: () => void;
    onAuthSuccess: () => void;
}

const KEYS_ALREADY_USED_FOR_SIGN_IN_WITH_EMAIL_LINK = new Set<string>();

// It's very important that we call this functions at most once, otherwise we'll create multiple users with the same email address.
// To be more precise, Firebase will not create multiple users, but the handleCreateAccountBlocking function will be called with
// different user IDs and _we_ will create multiple users in our DB.
function signInWithEmailLinkOnce(key: string, auth: Auth, email: string, url: string) {
    if (KEYS_ALREADY_USED_FOR_SIGN_IN_WITH_EMAIL_LINK.has(key)) {
        console.warn("signInWithEmailLinkOnce: key already used, not calling signInWithEmailLink again");
        return Promise.resolve();
    }
    KEYS_ALREADY_USED_FOR_SIGN_IN_WITH_EMAIL_LINK.add(key);
    return signInWithEmailLink(auth, email, url);
}

export function LoginWithEmailLink(props: ILoginWithEmailLinkProps) {
    const { onFlowActivated, onAuthSuccess, authInfo } = props;
    const [email, setEmail] = useState<string>("");
    const [mode, setMode] = useState<"SEND" | "ACCEPT">("SEND");
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isWorking, setIsWorking] = useState(false);
    // One key is generated per mount, so the component can be correctly used again if it's unmounted and mounted again.
    const [oneTimeKeyForSignInWithEmailLink] = useState(() => Math.random().toString());
    const [emailInLocalStorage, setEmailInLocalStorage, removeEmailInLocalStorage] = useLocalStorage(
        LOCAL_STORAGE_KEY_LOGIN_WITH_EMAIL_EMAIL,
        "",
        { raw: true },
    );
    const { enqueueSnackbar } = useSnackbar();
    const emailFieldError = useMemo(() => {
        if (email !== "" && email.includes("@") && email.includes(".") && !isValidEmail(email)) {
            return "Kérjük adj meg egy érvényes e-mail-címet!";
        }
        return undefined;
    }, [email]);
    const isEmailFieldValid = useMemo(
        () => email !== "" && emailFieldError === undefined && isValidEmail(email),
        [email, emailFieldError],
    );

    const getAndConfigureAuth = useCallback(() => {
        if (authInfo === undefined) {
            return undefined;
        }
        const { auth, tenantLanguageCode } = authInfo;
        auth.languageCode = tenantLanguageCode;
        return auth;
    }, [authInfo]);

    const handleEmailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    }, []);

    const handleSendEmail = useCallback(() => {
        const execute = async () => {
            const auth = getAndConfigureAuth();
            if (auth === undefined) {
                console.error("Auth is undefined");
                enqueueSnackbar("Nem sikerült bejelentkezni - kérjük próbáld újra!", { variant: "error" });
                return;
            }
            try {
                setIsWorking(true);
                await sendSignInLinkToEmail(auth, email, {
                    url: window.location.href,
                    handleCodeInApp: true,
                });
                setEmailInLocalStorage(email);
                setIsEmailSent(true);
                onFlowActivated();
            } catch (error) {
                console.error(error);
                enqueueSnackbar("Nem sikerült bejelentkezni - kérjük próbáld újra!", { variant: "error" });
            } finally {
                setIsWorking(false);
            }
        };
        void execute();
    }, [email, setEmailInLocalStorage, getAndConfigureAuth, enqueueSnackbar, onFlowActivated]);

    const acceptSignInLink = useCallback(
        (providedEmail: string) => {
            const execute = async () => {
                const auth = getAndConfigureAuth();
                if (auth === undefined) {
                    return;
                }
                try {
                    setIsWorking(true);
                    await signInWithEmailLinkOnce(
                        oneTimeKeyForSignInWithEmailLink,
                        auth,
                        providedEmail,
                        window.location.href,
                    );
                    removeEmailInLocalStorage();
                    onAuthSuccess();
                } catch (error) {
                    console.error(error);
                    enqueueSnackbar("Nem sikerült bejelentkezni - kérjük próbáld újra!", { variant: "error" });
                } finally {
                    setIsWorking(false);
                }
            };
            void execute();
        },
        [
            oneTimeKeyForSignInWithEmailLink,
            enqueueSnackbar,
            getAndConfigureAuth,
            onAuthSuccess,
            removeEmailInLocalStorage,
        ],
    );

    const handleAcceptSignInLink = useCallback(() => {
        acceptSignInLink(email);
    }, [email, acceptSignInLink]);

    useEffect(() => {
        const auth = getAndConfigureAuth();
        if (auth === undefined) {
            return;
        }
        if (!isSignInWithEmailLink(auth, window.location.href)) {
            return;
        }
        setMode("ACCEPT");
        onFlowActivated();
        if (emailInLocalStorage !== "" && emailInLocalStorage !== undefined) {
            acceptSignInLink(emailInLocalStorage);
        }
    }, [authInfo, emailInLocalStorage, acceptSignInLink, getAndConfigureAuth, onFlowActivated]);

    return (
        <Grid2 container direction="column" spacing={2} alignItems="stretch" sx={{ padding: "2vh 0" }}>
            {isEmailSent ? (
                <Grid2>
                    <Typography variant="body1" align="center" paragraph>
                        Küldtünk neked egy linket a következő e-mail-címre: {email}. Kérjük nyisd meg ezt az e-mailt és kattints a linkre a bejelentkezéshez.
                    </Typography>
                </Grid2>
            ) : (
                <>
                    <Grid2>
                        <TextField
                            value={email}
                            onChange={handleEmailChange}
                            label="E-mail-cím"
                            variant="filled"
                            fullWidth
                            sx={{ minWidth: "300px" }}
                            helperText={emailFieldError}
                            error={emailFieldError !== undefined}
                        />
                    </Grid2>
                    <Grid2>
                        {mode === "SEND" && (
                            <LoadingButton
                                onClick={handleSendEmail}
                                variant="contained"
                                fullWidth
                                disabled={!isEmailFieldValid}
                                loading={isWorking}
                            >
                                Bejelentkezés e-maillel
                            </LoadingButton>
                        )}
                        {mode === "ACCEPT" && (
                            <LoadingButton
                                onClick={handleAcceptSignInLink}
                                variant="contained"
                                fullWidth
                                disabled={!isEmailFieldValid}
                                loading={isWorking}
                            >
                                E-mail-cím megerősítése és bejelentkezés
                            </LoadingButton>
                        )}
                    </Grid2>
                </>
            )}
        </Grid2>
    );
}
