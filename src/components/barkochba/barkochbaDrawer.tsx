import * as React from "react";
import { connect } from "react-redux";
import { IAppState, selectBarkochbaDrawerIsOpen, SetBarkochbaDrawerIsOpen } from "../../store";
import { Dispatch } from "redux";
import { List, ListItemText, ListItem, Divider, ListItemIcon, Link } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import TableChartIcon from "@material-ui/icons/TableChart";
import { Link as RouterLink } from "react-router-dom";
import { NavUtils, Page } from "../../utils";
import { StoryBrowser } from "./storyBrowser";

const BarkochbaExportLink = (props: any) => (
    <RouterLink to={NavUtils.getNavUrl[Page.BarkochbaExport](undefined)} {...props} />
);

const BarkochbaManageLink = (props: any) => <RouterLink to={NavUtils.getNavUrl[Page.BarkochbaManage]()} {...props} />;

export interface IBarkochbaDrawerOwnProps {}

export interface IBarkochbaDrawerStateProps {
    isOpen: boolean;
}

export interface IBarkochbaDrawerDispatchProps {
    setIsOpen: (isOpen: boolean) => void;
}

export type IBarkochbaDrawerProps = IBarkochbaDrawerOwnProps &
    IBarkochbaDrawerStateProps &
    IBarkochbaDrawerDispatchProps;

export class UnconnectedBarkochbaDrawer extends React.Component<IBarkochbaDrawerProps, {}> {
    public render() {
        return (
            <div className="barkochba-drawer">
                <div className="barkochba-drawer-navigation">
                    <List>
                        <Link variant="body1" component={BarkochbaExportLink}>
                            <ListItem button className="barkochba-drawer-list-item">
                                <ListItemIcon>
                                    <TableChartIcon />
                                </ListItemIcon>
                                <ListItemText primary="Áttekintő táblázatok" />
                            </ListItem>
                        </Link>
                        <Link variant="body1" component={BarkochbaManageLink}>
                            <ListItem button className="barkochba-drawer-list-item">
                                <ListItemIcon>
                                    <EditIcon />
                                </ListItemIcon>
                                <ListItemText primary="Táborok szerkesztése" />
                            </ListItem>
                        </Link>
                    </List>
                    <Divider />
                </div>
                <div className="barkochba-drawer-story-browser">
                    <StoryBrowser />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: IAppState, _ownProps: IBarkochbaDrawerOwnProps): IBarkochbaDrawerStateProps {
    return {
        isOpen: selectBarkochbaDrawerIsOpen(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch, _ownProps: IBarkochbaDrawerOwnProps): IBarkochbaDrawerDispatchProps {
    return {
        setIsOpen: (barkochbaDrawerIsOpen: boolean) =>
            dispatch(SetBarkochbaDrawerIsOpen.create({ barkochbaDrawerIsOpen })),
    };
}

export const BarkochbaDrawer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedBarkochbaDrawer);
