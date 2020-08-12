import * as React from "react";
import {
    Typography,
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails,
    Hidden,
    SwipeableDrawer,
    Button,
} from "@material-ui/core";
import { PersonsSelector } from "./personsSelector";
import { ISelectOption } from "../../commons";
import {
    IAppState,
    selectCurrentListeningPersonsAsSelectOptions,
    selectPersonsAsSelectOptions,
    SetCurrentListeningPersonIds,
    selectBarkochbaDrawerIsOpen,
    SetBarkochbaDrawerIsOpen,
} from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { StoryPanel } from "./storyPanel";
import { ListeningCampRoomSelector } from "./listeningCampRoomSelector";
import { BarkochbaDrawer } from "./barkochbaDrawer";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import MenuIcon from "@material-ui/icons/Menu";

export interface IBarkochbaScreenOwnProps {}

export interface IBarkochbaScreenStateProps {
    currentListeningPersonsAsSelectOptions: ISelectOption[];
    personsAsSelectOptions: ISelectOption[];
    barkochbaDrawerIsOpen: boolean;
}

export interface IBarkochbaScreenDispatchProps {
    setCurrentListeningPersonIds: (ids: string[]) => void;
    setDrawerIsOpen: (isOpen: boolean) => void;
}

export type IBarkochbaScreenProps = IBarkochbaScreenOwnProps &
    IBarkochbaScreenStateProps &
    IBarkochbaScreenDispatchProps;

class UnconnectedBarkochbaScreen extends React.Component<IBarkochbaScreenProps, {}> {
    public render() {
        const { barkochbaDrawerIsOpen, currentListeningPersonsAsSelectOptions, personsAsSelectOptions } = this.props;
        const selectedPeopleNumber = currentListeningPersonsAsSelectOptions.length;
        const personSelectorTitle = `Nekik mesélek${
            selectedPeopleNumber === 0 ? "" : ` (${selectedPeopleNumber} gyerek)`
        }`;
        return (
            <div className="barkochba-screen">
                <Hidden xsDown implementation="css">
                    <div className="barkochba-screen-drawer-container">
                        <BarkochbaDrawer />
                    </div>
                </Hidden>
                <Hidden smUp implementation="css">
                    <div className="barkochba-screen-mobile-drawer-container">
                        <SwipeableDrawer
                            className="barkochba-screen-mobile-drawer"
                            //   container={this.props.container}
                            variant="temporary"
                            open={barkochbaDrawerIsOpen}
                            onOpen={this.handleDrawerOpen}
                            onClose={this.handleDrawerClose}
                            PaperProps={{
                                className: "barkochba-screen-mobile-drawer-paper",
                            }}
                        >
                            <BarkochbaDrawer />
                        </SwipeableDrawer>
                    </div>
                </Hidden>
                <div className="barkochba-screen-content-area">
                    <Hidden smUp implementation="css">
                        <div className="barkochba-screen-drawer-toggle">
                            {/* <IconButton color="inherit" aria-label="Open drawer" onClick={this.handleDrawerToggle}>
                                <MenuIcon />
                            </IconButton> */}

                            <Button
                                className="barkochba-screen-drawer-toggle-button"
                                variant="outlined"
                                onClick={this.handleDrawerToggle}
                            >
                                <MenuIcon className="barkochba-screen-drawer-toggle-button-icon" />
                                Navigáció és barkochbatörténetek
                            </Button>
                        </div>
                    </Hidden>
                    <div className="barkochba-screen-person-selector">
                        <ExpansionPanel elevation={2} defaultExpanded={true}>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle1">{personSelectorTitle}</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails className="story-panel-people-who-know">
                                <Typography variant="body2" paragraph={true}>
                                    Válaszd ki a tábort és a szobát, vagy írd be azon gyerekek neveit, akiknek mesélni
                                    szeretnél. Ezután a listában színesek lesznek azok a barkochbatörténetek, amelyeket
                                    valamelyik bejelölt gyerek már hallotta.
                                </Typography>
                                <ListeningCampRoomSelector />
                                <PersonsSelector
                                    allPersons={personsAsSelectOptions}
                                    selectedPersons={currentListeningPersonsAsSelectOptions}
                                    onChange={this.handleCurrentListeningPersonsChange}
                                />
                            </ExpansionPanelDetails>
                        </ExpansionPanel>{" "}
                    </div>
                    <div className="barkochba-screen-panel">
                        <StoryPanel />
                    </div>
                </div>
            </div>
        );
    }

    private handleCurrentListeningPersonsChange = (values: ISelectOption[]) => {
        const { setCurrentListeningPersonIds } = this.props;
        const personIds = values.map(value => value.value);
        setCurrentListeningPersonIds(personIds);
    };

    private handleDrawerOpen = () => {
        const { setDrawerIsOpen } = this.props;
        setDrawerIsOpen(true);
    };

    private handleDrawerClose = () => {
        const { setDrawerIsOpen } = this.props;
        setDrawerIsOpen(false);
    };

    private handleDrawerToggle = () => {
        const { barkochbaDrawerIsOpen, setDrawerIsOpen } = this.props;
        setDrawerIsOpen(!barkochbaDrawerIsOpen);
    };
}

function mapStateToProps(state: IAppState, _ownProps: IBarkochbaScreenOwnProps): IBarkochbaScreenStateProps {
    return {
        currentListeningPersonsAsSelectOptions: selectCurrentListeningPersonsAsSelectOptions(state),
        personsAsSelectOptions: selectPersonsAsSelectOptions(state),
        barkochbaDrawerIsOpen: selectBarkochbaDrawerIsOpen(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch, _ownProps: IBarkochbaScreenOwnProps): IBarkochbaScreenDispatchProps {
    return {
        setCurrentListeningPersonIds: (ids: string[]) =>
            dispatch(SetCurrentListeningPersonIds.create({ currentListeningPersonIds: ids })),
        setDrawerIsOpen: (barkochbaDrawerIsOpen: boolean) =>
            dispatch(SetBarkochbaDrawerIsOpen.create({ barkochbaDrawerIsOpen })),
    };
}

export const BarkochbaScreen = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedBarkochbaScreen);
