import * as React from "react";
import { connect } from "react-redux";
import { IAppState } from "../../store";
import { Dispatch } from "redux";
import { List, ListItemText, ListItem, Divider, ListItemIcon, Link } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import TableChartIcon from "@mui/icons-material/TableChart";
import { Link as RouterLink } from "react-router-dom";
import { StoryBrowser } from "./storyBrowser";
import { getNavUrl, Page } from "../../utils/navUtils";
import css from "./barkochbaDrawer.module.scss";

const BarkochbaExportLink = (props: any) => (
    <RouterLink to={getNavUrl[Page.BarkochbaExport](undefined)} {...props} />
);

const BarkochbaManageLink = (props: any) => <RouterLink to={getNavUrl[Page.BarkochbaManage]()} {...props} />;

export interface IBarkochbaDrawerOwnProps {}

export interface IBarkochbaDrawerStateProps {}

export interface IBarkochbaDrawerDispatchProps {}

export type IBarkochbaDrawerProps = IBarkochbaDrawerOwnProps &
    IBarkochbaDrawerStateProps &
    IBarkochbaDrawerDispatchProps;

export class UnconnectedBarkochbaDrawer extends React.Component<IBarkochbaDrawerProps, {}> {
    public render() {
        return (
            <div className={css.barkochbaDrawer}>
                <div className={css.barkochbaDrawerNavigation}>
                    <List>
                        <Link variant="body1" color="inherit" component={BarkochbaExportLink}>
                            <ListItem button className={css.barkochbaDrawerListItem}>
                                <ListItemIcon>
                                    <TableChartIcon />
                                </ListItemIcon>
                                <ListItemText primary="Áttekintő táblázatok" />
                            </ListItem>
                        </Link>
                        <Link variant="body1" color="inherit" component={BarkochbaManageLink}>
                            <ListItem button className={css.barkochbaDrawerListItem}>
                                <ListItemIcon>
                                    <EditIcon />
                                </ListItemIcon>
                                <ListItemText primary="Táborok szerkesztése" />
                            </ListItem>
                        </Link>
                    </List>
                    <Divider />
                </div>
                <div className={css.barkochbaDrawerStoryBrowser}>
                    <StoryBrowser />
                </div>
            </div>
        );
    }
}

function mapStateToProps(_state: IAppState, _ownProps: IBarkochbaDrawerOwnProps): IBarkochbaDrawerStateProps {
    return {};
}

function mapDispatchToProps(_dispatch: Dispatch, _ownProps: IBarkochbaDrawerOwnProps): IBarkochbaDrawerDispatchProps {
    return {};
}

export const BarkochbaDrawer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedBarkochbaDrawer);
