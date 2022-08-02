import * as React from "react";
import {
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Hidden,
    SwipeableDrawer,
    Button,
} from "@mui/material";
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import css from "./barkochbaScreen.module.scss";

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
            <div className={css.barkochbaScreen}>
                <Hidden xsDown implementation="css">
                    <div className={css.barkochbaScreenDrawerContainer}>
                        <BarkochbaDrawer />
                    </div>
                </Hidden>
                <Hidden smUp implementation="css">
                    <div className={css.barkochbaScreenMobileDrawerContainer}>
                        <SwipeableDrawer
                            className={css.barkochbaScreenMobileDrawer}
                            variant="temporary"
                            open={barkochbaDrawerIsOpen}
                            onOpen={this.handleDrawerOpen}
                            onClose={this.handleDrawerClose}
                            PaperProps={{
                                className: css.barkochbaScreenMobileDrawerPaper,
                            }}
                        >
                            <BarkochbaDrawer />
                        </SwipeableDrawer>
                    </div>
                </Hidden>
                <div className={css.barkochbaScreenContentArea}>
                    <Hidden smUp implementation="css">
                        <div className={css.barkochbaScreenDrawerToggle}>
                            <Button
                                className={css.barkochbaScreenDrawerToggleButton}
                                variant="outlined"
                                onClick={this.handleDrawerToggle}
                            >
                                <MenuIcon className={css.barkochbaScreenDrawerToggleButtonIcon} />
                                Navigáció és barkochbatörténetek
                            </Button>
                        </div>
                    </Hidden>
                    <div className={css.barkochbaScreenPersonSelector}>
                        <Accordion elevation={2} defaultExpanded={true}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle1">{personSelectorTitle}</Typography>
                            </AccordionSummary>
                            <AccordionDetails className={css.personSelectorContent}>
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
                            </AccordionDetails>
                        </Accordion>{" "}
                    </div>
                    <div className={css.barkochbaScreenPanel}>
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
