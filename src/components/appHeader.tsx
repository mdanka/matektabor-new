import * as React from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { CONTACT_HREF } from "../utils";
import { singInAndReturn, getNavUrl, Page } from "../utils/navUtils";
import { useEffect, useRef, useState } from "react";
import { useFirebaseAuthService } from "../hooks/useFirebaseAuthService";
import { usePrevious } from "../hooks/usePrevious";

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
    const saveNotifiedRef = useRef(false);

    // Detect save completion: pending writes just resolved
    useEffect(() => {
        if (hasPendingWrites) {
            saveNotifiedRef.current = false;
        } else if (previousHasPendingWrites === true && !saveNotifiedRef.current) {
            saveNotifiedRef.current = true;
            setIsSaveSuccessfulMessageOpen(true);
        }
    }, [hasPendingWrites, previousHasPendingWrites]);

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
                color: "text.secondary",
                "&:hover": {
                    color: "text.primary",
                    backgroundColor: "rgba(0,0,0,0.04)",
                },
            }}
            href={CONTACT_HREF}
            disableRipple
            size="large"
        >
            <EmailOutlinedIcon fontSize="small" />
        </IconButton>
    );

    const renderAvatar = (photoUrl: string | undefined, displayName?: string) => {
        const style = {
            width: 32,
            height: 32,
            fontSize: 14,
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
                    marginLeft: "8px",
                    "&:hover": {
                        outline: "2px solid",
                        outlineColor: "secondary.light",
                        outlineOffset: 1,
                    },
                }}
                onClick={(e) => setUserMenuAnchorEl(userMenuAnchorEl ? null : e.currentTarget)}
                disableRipple
                size="large"
            >
                {avatar}
            </IconButton>
        );
    };

    return (
        <Box sx={(theme) => ({
            height: { xs: "56px", sm: "64px" },
            color: "text.primary",
            background: "linear-gradient(135deg, rgba(255,248,231,0.95) 0%, rgba(255,243,214,0.95) 100%)",
            backdropFilter: "blur(8px)",
            padding: { xs: "8px 12px", sm: "10px 20px" },
            display: "flex",
            alignItems: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            position: "sticky",
            top: 0,
            zIndex: theme.zIndex.appBar,
        })}>
            <Box sx={{ fontSize: { xs: "18px", sm: "20px" }, flexGrow: 1 }}>
                <Link
                    component={RouterLink}
                    to={getNavUrl[Page.Home]()}
                    underline="hover"
                    sx={{
                        color: "text.primary",
                        fontWeight: 700,
                        fontFamily: "Inter, system-ui, sans-serif",
                    }}
                >
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
                        aria-label="Close"
                        color="inherit"
                        onClick={() => setIsSignedOutMessageOpen(false)}
                        size="large"
                    >
                        <CloseIcon />
                    </IconButton>
                }
            />
            <Snackbar anchorOrigin={{ horizontal: "center", vertical: "bottom" }} open={hasPendingWrites}>
                <SnackbarContent
                    message={<span>Mentés... (ha nem vagy online, csatlakozz)</span>}
                    sx={{ backgroundColor: "primary.main", color: "text.primary" }}
                />
            </Snackbar>
            <Snackbar
                autoHideDuration={3000}
                anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
                open={isSaveSuccessfulMessageOpen}
                onClose={() => setIsSaveSuccessfulMessageOpen(false)}
                message="A mentés sikeres volt"
                ContentProps={{ sx: { backgroundColor: "success.main", color: "white" } }}
                action={
                    <IconButton
                        aria-label="Close"
                        color="inherit"
                        onClick={() => setIsSaveSuccessfulMessageOpen(false)}
                        size="small"
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
        </Box>
    );
};
