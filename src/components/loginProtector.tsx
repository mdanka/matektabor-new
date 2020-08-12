import * as React from "react";
import { AppHeader } from "./appHeader";
import { AppFooter } from "./appFooter";
import { Typography } from "@material-ui/core";
import { selectCurrentUser, IAppState } from "../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import css from "./loginProtector.module.scss";

export interface ILoginProtectorOwnProps {
    children: React.ReactChildren | React.ReactChild;
}

export interface ILoginProtectorStateProps {
    isLoggedIn: boolean;
}

export interface ILoginProtectorDispatchProps {}

export type ILoginProtectorProps = ILoginProtectorOwnProps & ILoginProtectorStateProps & ILoginProtectorDispatchProps;

export class UnconnectedLoginProtector extends React.Component<ILoginProtectorProps, {}> {
    public render() {
        const { children, isLoggedIn } = this.props;
        return isLoggedIn ? children : this.renderNotLoggedInScreen();
    }

    private renderNotLoggedInScreen = () => {
        return (
            <div>
                <AppHeader />
                <div className={css.loginProtectorNotLoggedIn}>
                    <Typography variant="h4" align="center" color="textSecondary">
                        A lap használatához be kell jelentkezned.
                    </Typography>
                </div>
                <AppFooter />
            </div>
        );
    };
}

function mapStateToProps(state: IAppState, _ownProps: ILoginProtectorOwnProps): ILoginProtectorStateProps {
    return {
        isLoggedIn: selectCurrentUser(state) !== undefined,
    };
}

function mapDispatchToProps(_dispatch: Dispatch, _ownProps: ILoginProtectorOwnProps): ILoginProtectorDispatchProps {
    return {};
}

export const LoginProtector = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedLoginProtector);
