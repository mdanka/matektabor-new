import * as React from "react";
import { connect } from "react-redux";
import { IAppState, selectCurrentUser, selectHasPendingWrites } from "../store";
import { Dispatch } from "redux";
import { RouteComponentProps } from "react-router";
import { Link as RouterLink, withRouter } from "react-router-dom";
import { getGlobalServices } from "../services";
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
import { IUser } from "../commons";
import { DARK_THEME, CONTACT_HREF } from "../utils";
import { singInAndReturn, getNavUrl, Page } from "../utils/navUtils";
import amber from "@mui/material/colors/amber";
import { green } from "@mui/material/colors";
import css from "./appHeader.module.scss";


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


export interface IAppHeaderOwnProps extends RouteComponentProps<any> {}

export interface IAppHeaderStateProps {
    currentUser: IUser | undefined;
    hasPendingWrites: boolean;
}

export interface IAppHeaderDispatchProps {}

export interface IAppHeaderLocalState {
    isUserMenuOpen: boolean;
    isSignedOutMessageOpen: boolean;
    isSaveSuccessfulMessageOpen: boolean;
}

export type IAppHeaderProps = IAppHeaderOwnProps & IAppHeaderStateProps & IAppHeaderDispatchProps;

const HomeLink = (props: any) => (
    <RouterLink to={getNavUrl[Page.Home]()} {...props} />
);

export class UnconnectedAppHeader extends React.Component<IAppHeaderProps, IAppHeaderLocalState> {
    private userMenuButtonRef: React.RefObject<HTMLButtonElement>;

    public constructor(props: IAppHeaderProps) {
        super(props);
        this.state = {
            isUserMenuOpen: false,
            isSignedOutMessageOpen: false,
            isSaveSuccessfulMessageOpen: false,
        };
        this.userMenuButtonRef = React.createRef();
    }

    public componentDidUpdate(prevProps: IAppHeaderProps) {
        const { hasPendingWrites: hasPendingWritesPrev } = prevProps;
        const { hasPendingWrites: hasPendingWritesCurrent } = this.props;
        if (hasPendingWritesPrev && !hasPendingWritesCurrent) {
            this.openSaveSuccessfulMessage();
        }
    }

    public render() {
        const { currentUser } = this.props;
        const isLoggedIn = currentUser !== undefined;
        return (
            <div className={css.appHeader}>
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={DARK_THEME}>
                        <span className={css.appTitle}>
                        <Link component={HomeLink} underline="hover">
                            Matektábor
                        </Link>
                        </span>
                        {this.renderContactButton()}
                        {isLoggedIn && this.renderUser()}
                        {isLoggedIn && this.renderUserMenu()}
                        {!isLoggedIn && this.renderSignIn()}
                        {this.renderSignedOutMessage()}
                        {this.renderPendingWritesMessage()}
                        {this.renderSaveSuccessfulMessage()}
                    </ThemeProvider>
                </StyledEngineProvider>
            </div>
        );
    }

    private renderContactButton = () => {
        return (
            <IconButton
                className={css.appHeaderContactButton}
                href={CONTACT_HREF}
                disableRipple={true}
                size="large">
                <Icon>email</Icon>
            </IconButton>
        );
    };

    private renderUser = () => {
        const { currentUser } = this.props;
        if (currentUser === undefined) {
            return;
        }
        const { displayName, photoURL } = currentUser;
        const avatar = this.renderAvatar(
            photoURL == null ? undefined : photoURL,
            displayName == null ? undefined : displayName,
        );
        return (
            <IconButton
                className={css.appHeaderAvatarButton}
                onClick={this.toggleUserMenu}
                ref={this.userMenuButtonRef}
                disableRipple={true}
                size="large">
                {avatar}
            </IconButton>
        );
    };

    private renderAvatar = (photoUrl: string | undefined, displayName?: string) => {
        const classes = css.appHeaderAvatarImage;
        if (photoUrl !== undefined) {
            return <Avatar className={classes} src={photoUrl} />;
        }
        if (displayName !== undefined) {
            const initials = displayName
                .split(" ")
                .filter(nameComponent => nameComponent.length > 0)
                .map(nameComponent => nameComponent[0])
                .join("");
            return <Avatar className={classes}>{initials}</Avatar>;
        }
        return <Avatar className={classes} />;
    };

    private renderUserMenu = () => {
        const { isUserMenuOpen } = this.state;
        return (
            <Menu open={isUserMenuOpen} onClose={this.closeUserMenu} anchorEl={this.userMenuButtonRef.current}>
                <MenuItem onClick={this.handleSignOutClick}>
                    <ListItemText primary="Kijelentkezés" />
                </MenuItem>
            </Menu>
        );
    };

    private renderSignIn = () => {
        return (
            <Button variant="contained" color="primary" size="small" className={css.appHeaderSignInButton} onClick={this.handleSignInClick}>
                Bejelentkezés
            </Button>
        );
    };

    private renderSignedOutMessage = () => {
        const { isSignedOutMessageOpen } = this.state;
        return (
            <Snackbar
                autoHideDuration={3000}
                anchorOrigin={{ horizontal: "center", vertical: "top" }}
                message={<span>Sikeresen kiléptél. Ügyes vagy!</span>}
                onClose={this.closeSignedOutMessage}
                open={isSignedOutMessageOpen}
                action={[
                    <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        onClick={this.closeSignedOutMessage}
                        size="large">
                        <CloseIcon />
                    </IconButton>,
                ]}
            />
        );
    };

    private renderPendingWritesMessage = () => {
        const { hasPendingWrites } = this.props;
        return (
            <Snackbar anchorOrigin={{ horizontal: "right", vertical: "top" }} open={hasPendingWrites}>
                <SnackbarContent
                    message={<span>Mentés... (ha nem vagy online, csatlakozz)</span>}
                    style={{ backgroundColor: amber[200] }}
                />
            </Snackbar>
        );
    };

    private renderSaveSuccessfulMessage = () => {
        const { isSaveSuccessfulMessageOpen } = this.state;
        return (
            <Snackbar
                autoHideDuration={3000}
                anchorOrigin={{ horizontal: "right", vertical: "top" }}
                open={isSaveSuccessfulMessageOpen}
                onClose={this.closeSaveSuccessfulMessage}
            >
                <SnackbarContent message={<span>A mentés sikeres volt</span>} style={{ backgroundColor: green[200] }} />
            </Snackbar>
        );
    };

    private handleSignOutClick = async () => {
        const globalServices = getGlobalServices();
        if (globalServices === undefined) {
            return;
        }
        await globalServices.firebaseAuthService.authSignOut();
        this.openSignedOutMessage();
    };

    private closeUserMenu = () => {
        this.setState({ isUserMenuOpen: false });
    };

    private toggleUserMenu = () => {
        const { isUserMenuOpen } = this.state;
        this.setState({ isUserMenuOpen: !isUserMenuOpen });
    };

    private openSignedOutMessage = () => {
        this.setState({ isSignedOutMessageOpen: true });
    };

    private closeSignedOutMessage = () => {
        this.setState({ isSignedOutMessageOpen: false });
    };

    private openSaveSuccessfulMessage = () => {
        this.setState({ isSaveSuccessfulMessageOpen: true });
    };

    private closeSaveSuccessfulMessage = () => {
        this.setState({ isSaveSuccessfulMessageOpen: false });
    };

    private handleSignInClick = () => {
        singInAndReturn(this.props);
    };
}

function mapStateToProps(state: IAppState, _ownProps: IAppHeaderOwnProps): IAppHeaderStateProps {
    return {
        currentUser: selectCurrentUser(state),
        hasPendingWrites: selectHasPendingWrites(state),
    };
}

function mapDispatchToProps(_dispatch: Dispatch, _ownProps: IAppHeaderOwnProps): IAppHeaderDispatchProps {
    return {};
}

export const AppHeader = withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(UnconnectedAppHeader),
);
