import * as React from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectHasPendingWrites } from "../store";
import { RouteComponentProps } from "react-router";
import { Link as RouterLink, withRouter } from "react-router-dom";
import {
    Button,
    Link,
    Icon,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    ListItemText,
    Snackbar,
    ThemeProvider,
    Theme,
    StyledEngineProvider,
    SnackbarContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DARK_THEME, CONTACT_HREF } from "../utils";
import { singInAndReturn, getNavUrl, Page } from "../utils/navUtils";
import amber from "@mui/material/colors/amber";
import { green } from "@mui/material/colors";
import css from "./appHeader.module.scss";
import { useState, useRef, useEffect} from "react";
import { useFirebaseAuthService } from "../services/useFirebaseAuthService";
import { usePrevious } from "../services/usePrevious";


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


const HomeLink = (props: any) => <RouterLink to={getNavUrl[Page.Home]()} {...props} />;

const UnconnectedAppHeader: React.FC<RouteComponentProps> = (props) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSignedOutMessageOpen, setIsSignedOutMessageOpen] = useState(false);
    const [isSaveSuccessfulMessageOpen, setIsSaveSuccessfulMessageOpen] = useState(false);

    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

    const currentUser = useSelector(selectCurrentUser);
    const hasPendingWrites = useSelector(selectHasPendingWrites);
    const previousHasPendingWrites = usePrevious(hasPendingWrites);
    const { authSignOut } = useFirebaseAuthService();

    useEffect(() => {
        if (previousHasPendingWrites === true && hasPendingWrites === false) {
            setIsSaveSuccessfulMessageOpen(true);
        }
    }, [previousHasPendingWrites, hasPendingWrites]);

    const handleSignOutClick = async () => {
        await authSignOut();
        setIsSignedOutMessageOpen(true);
    };

    const handleSignInClick = () => {
        singInAndReturn(props);
    };

    const renderContactButton = () => (
        <IconButton
            className={css.appHeaderContactButton}
            href={CONTACT_HREF}
            disableRipple
            size="large"
        >
            <Icon>email</Icon>
        </IconButton>
    );

    const renderAvatar = (photoUrl: string | undefined, displayName?: string) => {
        const classes = css.appHeaderAvatarImage;
        if (photoUrl) {
            return <Avatar className={classes} src={photoUrl} />;
        }
        if (displayName) {
            const initials = displayName
                .split(" ")
                .filter((nameComponent) => nameComponent.length > 0)
                .map((nameComponent) => nameComponent[0])
                .join("");
            return <Avatar className={classes}>{initials}</Avatar>;
        }
        return <Avatar className={classes} />;
    };

    const renderUserMenu = () => (
        <Menu
            open={isUserMenuOpen}
            onClose={() => setIsUserMenuOpen(false)}
            anchorEl={userMenuButtonRef.current}
        >
            <MenuItem onClick={handleSignOutClick}>
                <ListItemText primary="Kijelentkezés" />
            </MenuItem>
        </Menu>
    );

    const renderUser = () => {
        if (!currentUser) return null;
        const { displayName, photoURL } = currentUser;
        const avatar = renderAvatar(photoURL ?? undefined, displayName ?? undefined);
        return (
            <IconButton
                className={css.appHeaderAvatarButton}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                ref={userMenuButtonRef}
                disableRipple
                size="large"
            >
                {avatar}
            </IconButton>
        );
    };

    return (
        <div className={css.appHeader}>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={DARK_THEME}>
                    <span className={css.appTitle}>
                        <Link component={HomeLink} underline="hover">
                            Matektábor
                        </Link>
                    </span>
                    {renderContactButton()}
                    {currentUser && renderUser()}
                    {currentUser && renderUserMenu()}
                    {!currentUser && (
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            className={css.appHeaderSignInButton}
                            onClick={handleSignInClick}
                        >
                            Bejelentkezés
                        </Button>
                    )}
                    <Snackbar
                        autoHideDuration={3000}
                        anchorOrigin={{ horizontal: "center", vertical: "top" }}
                        message={<span>Sikeresen kiléptél. Ügyes vagy!</span>}
                        onClose={() => setIsSignedOutMessageOpen(false)}
                        open={isSignedOutMessageOpen}
                        action={
                            <IconButton
                                aria-label="Close"
                                color="inherit"
                                onClick={() => setIsSignedOutMessageOpen(false)}
                                size="large"
                            >
                                <CloseIcon />
                            </IconButton>
                        }
                    />
                    <Snackbar anchorOrigin={{ horizontal: "right", vertical: "top" }} open={hasPendingWrites}>
                        <SnackbarContent
                            message={<span>Mentés... (ha nem vagy online, csatlakozz)</span>}
                            style={{ backgroundColor: amber[200] }}
                        />
                    </Snackbar>
                    <Snackbar
                        autoHideDuration={3000}
                        anchorOrigin={{ horizontal: "right", vertical: "top" }}
                        open={isSaveSuccessfulMessageOpen}
                        onClose={() => setIsSaveSuccessfulMessageOpen(false)}
                    >
                        <SnackbarContent
                            message={<span>A mentés sikeres volt</span>}
                            style={{ backgroundColor: green[200] }}
                        />
                    </Snackbar>
                </ThemeProvider>
            </StyledEngineProvider>
        </div>
    );
};

export const AppHeader = withRouter(UnconnectedAppHeader);
