import * as React from "react";
import { Typography, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from "@material-ui/core";
import { PersonsSelector } from "./personsSelector";
import { ISelectOption } from "../../commons";
import {
    IAppState,
    selectCurrentListeningPersonsAsSelectOptions,
    selectPersonsAsSelectOptions,
    SetCurrentListeningPersonIds,
} from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { StoryPanel } from "./storyPanel";
import { ListeningCampRoomSelector } from "./listeningCampRoomSelector";
import { BarkochbaDrawer } from "./barkochbaDrawer";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

export interface IBarkochbaScreenOwnProps {}

export interface IBarkochbaScreenStateProps {
    currentListeningPersonsAsSelectOptions: ISelectOption[];
    personsAsSelectOptions: ISelectOption[];
}

export interface IBarkochbaScreenDispatchProps {
    setCurrentListeningPersonIds: (ids: string[]) => void;
}

export type IBarkochbaScreenProps = IBarkochbaScreenOwnProps &
    IBarkochbaScreenStateProps &
    IBarkochbaScreenDispatchProps;

class UnconnectedBarkochbaScreen extends React.Component<IBarkochbaScreenProps, {}> {
    public render() {
        const { currentListeningPersonsAsSelectOptions, personsAsSelectOptions } = this.props;
        return (
            <div className="barkochba-screen">
                <div className="barkochba-screen-drawer">
                    <BarkochbaDrawer />
                </div>
                <div className="barkochba-screen-content-area">
                    <div className="barkochba-screen-person-selector">
                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle1">Nekik mesélek</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails className="story-panel-people-who-know">
                                <Typography variant="body1" paragraph={true}>
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
}

function mapStateToProps(state: IAppState, _ownProps: IBarkochbaScreenOwnProps): IBarkochbaScreenStateProps {
    return {
        currentListeningPersonsAsSelectOptions: selectCurrentListeningPersonsAsSelectOptions(state),
        personsAsSelectOptions: selectPersonsAsSelectOptions(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch, _ownProps: IBarkochbaScreenOwnProps): IBarkochbaScreenDispatchProps {
    return {
        setCurrentListeningPersonIds: (ids: string[]) =>
            dispatch(SetCurrentListeningPersonIds.create({ currentListeningPersonIds: ids })),
    };
}

export const BarkochbaScreen = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedBarkochbaScreen);
