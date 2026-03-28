import { useSelector } from "react-redux";
import { selectCurrentUser, selectHasPendingWrites } from "../store";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
    Button,
    Link,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    ListItemText,
    Snackbar,
    SnackbarContent,
    Box,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import CloseIcon from "@mui/icons-material/Close";
import { CONTACT_HREF } from "../utils";
import { singInAndReturn, getNavUrl, Page } from "../utils/navUtils";
import { amber } from "@mui/material/colors";
import { green } from "@mui/material/colors";
import { useState } from "react";
import { useFirebaseAuthService } from "../hooks/useFirebaseAuthService";
import { usePrevious } from "../hooks/usePrevious";
import { lighten } from "@mui/material/styles";

export const AppHeader: React.FC = () => {
    const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<HTMLElement | null>(null);
    const [isSignedOutMessageOpen, setIsSignedOutMessageOpen] = useState(false);
    const [isSaveSuccessfulMessageOpen, setIsSaveSuccessfulMessageOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const currentUser = useSelector(selectCurrentUser);
    const hasPendingWrites = useSelector(selectHasPendingWrites);
    const previousHasPendingWrites = usePrevious(hasPendingWrites);
    const { authSignOut } = useFirebaseAuthService();

    // Detect save completion: pending writes just resolved
    if (previousHasPendingWrites === true && hasPendingWrites === false && !isSaveSuccessfulMessageOpen) {
        setIsSaveSuccessfulMessageOpen(true);
    }

    const handleSignOutClick = async () => {
        await authSignOut();
        setIsSignedOutMessageOpen(true);
    };

    const handleSignInClick = () => {
        singInAndReturn(navigate, location.pathname);
    };

    const renderContactButton = () => (
        <IconButton
            sx={{
                fontSize: "16px",
                color: "text.primary",
            }}
            href={CONTACT_HREF}
            disableRipple
            size="large"
            aria-label="Kapcsolat e-mailben"
        >
            <EmailIcon />
        </IconButton>
    );

    const renderAvatar = (photoUrl: string | undefined, displayName?: string) => {
        const style = {
            width: "30px",
            height: "30px",
            color: "text.primary",
        };
        if (photoUrl) {
            return <Avatar sx={style} src={photoUrl} />;
        }
        if (displayName) {
            const initials = displayName
                .split(" ")
                .filter((nameComponent) => nameComponent.length > 0)
                .map((nameComponent) => nameComponent[0])
                .join("");
            return <Avatar sx={style}>{initials}</Avatar>;
        }
        return <Avatar sx={style} />;
    };

    const renderUser = () => {
        if (!currentUser) return null;
        const { displayName, photoURL } = currentUser;
        const avatar = renderAvatar(photoURL ?? undefined, displayName ?? undefined);
        return (
            <IconButton
                sx={{
                    marginLeft: "10px",
                }}
                onClick={(e) => setUserMenuAnchorEl(userMenuAnchorEl ? null : e.currentTarget)}
                disableRipple
                size="large"
                aria-label="Felhasználói menü"
            >
                {avatar}
            </IconButton>
        );
    };

    return (
        <Box component="header" sx={(theme) => ({
            height: "60px",
            color: "text.primary",
            backgroundColor: lighten(theme.palette.primary.main, 0.5),
            padding: "10px 20px 10px 20px",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: theme.palette.divider,
        })}>
            <Box sx={{ fontSize: "18px", flexGrow: 1 }}>
                <Link component={RouterLink} to={getNavUrl[Page.Home]()} underline="hover" sx={{ color: "text.primary", fontWeight: "bold" }}>
                    Matektábor
                </Link>
            </Box>
            {renderContactButton()}
            {currentUser && renderUser()}
            {currentUser && (
                <Menu
                    open={Boolean(userMenuAnchorEl)}
                    onClose={() => setUserMenuAnchorEl(null)}
                    anchorEl={userMenuAnchorEl}
                >
                    <MenuItem onClick={handleSignOutClick}>
                        <ListItemText primary="Kijelentkezés" />
                    </MenuItem>
                </Menu>
            )}
            {!currentUser && (
                <Button
                    variant="contained"
                    color="secondary"
                    size="small"
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
                        aria-label="Bezárás"
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
                    style={{ backgroundColor: amber[200], color: "rgba(0,0,0,0.87)" }}
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
                    style={{ backgroundColor: green[200], color: "rgba(0,0,0,0.87)" }}
                />
            </Snackbar>
        </Box>
    );
};
