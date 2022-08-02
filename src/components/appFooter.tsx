import * as React from "react";
import { connect } from "react-redux";
import { IAppState } from "../store";
import { Dispatch } from "redux";
import { ThemeProvider, Theme, StyledEngineProvider } from "@mui/material";
import { DARK_THEME, CONTACT_HREF } from "../utils";
import css from "./appFooter.module.scss";


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


export interface IAppFooterOwnProps {}

export interface IAppFooterStateProps {}

export interface IAppFooterDispatchProps {}

export interface IAppFooterLocalState {}

export type IAppFooterProps = IAppFooterOwnProps & IAppFooterStateProps & IAppFooterDispatchProps;

export class UnconnectedAppFooter extends React.Component<IAppFooterProps, IAppFooterLocalState> {
    public render() {
        return (
            <div className={css.appFooter}>
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={DARK_THEME}>
                        <span className={css.appFooterItem}>
                            <a className="underline inherit-color" href={CONTACT_HREF}>
                                Kérdésed van? Írj emailt!
                            </a>
                        </span>
                    </ThemeProvider>
                </StyledEngineProvider>
            </div>
        );
    }
}

function mapStateToProps(_state: IAppState, _ownProps: IAppFooterOwnProps): IAppFooterStateProps {
    return {};
}

function mapDispatchToProps(_dispatch: Dispatch, _ownProps: IAppFooterOwnProps): IAppFooterDispatchProps {
    return {};
}

export const AppFooter = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedAppFooter);
