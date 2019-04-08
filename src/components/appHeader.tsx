import * as React from "react";
import { connect } from "react-redux";
import { IAppState, selectCurrentUser, selectHasPendingWrites } from "../store";
import { Dispatch } from "redux";
import { RouteComponentProps } from "react-router";
import { Link, withRouter } from "react-router-dom";
import { getGlobalServices } from "../services";
import { Page, NavUtils } from "../utils";
import {
    Button,
    Icon,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    ListItemText,
    Snackbar,
    MuiThemeProvider,
    SnackbarContent,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { IUser } from "../commons";
import { DARK_THEME, CONTACT_HREF } from "../utils";
import amber from "@material-ui/core/colors/amber";
import { green } from "@material-ui/core/colors";

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

export class UnconnectedAppHeader extends React.Component<IAppHeaderProps, IAppHeaderLocalState> {
    private userMenuButtonRef: React.RefObject<HTMLElement>;

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
            <div className="app-header">
                <MuiThemeProvider theme={DARK_THEME}>
                    <span className="app-title">
                        <Link className="inherit-color" to={NavUtils.getNavUrl[Page.Home]()}>
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
                </MuiThemeProvider>
            </div>
        );
    }

    private renderContactButton = () => {
        return (
            <IconButton className="app-header-contact-button" href={CONTACT_HREF} disableRipple={true}>
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
                className="app-header-avatar-button"
                onClick={this.toggleUserMenu}
                disableRipple={true}
                buttonRef={this.userMenuButtonRef}
            >
                {avatar}
            </IconButton>
        );
    };

    private renderAvatar = (photoUrl: string | undefined, displayName?: string) => {
        const classes = "app-header-avatar-image";
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
            <Button size="small" className="app-header-sign-in-button" onClick={this.handleSignInClick}>
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
                    <IconButton key="close" aria-label="Close" color="inherit" onClick={this.closeSignedOutMessage}>
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
        NavUtils.singInAndReturn(this.props);
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
