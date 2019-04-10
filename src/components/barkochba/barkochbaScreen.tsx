import * as React from "react";
import { Typography, Tooltip } from "@material-ui/core";
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
import InfoIcon from "@material-ui/icons/Info";

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
                        <Typography variant="h6" paragraph={true}>
                            Nekik mesélek:{" "}
                            <Tooltip
                                title="Válaszd ki a tábort és a szobát, vagy írd be azon gyerekek neveit, akiknek mesélni
                                szeretnél. Ezután a listában színesek lesznek azok a barkochbatörténetek, amelyeket
                                valamelyik bejelölt gyerek már hallotta."
                                placement="right"
                            >
                                <InfoIcon fontSize="small" className="barkochba-screen-person-selector-info-button" />
                            </Tooltip>
                        </Typography>
                        <ListeningCampRoomSelector />
                        <PersonsSelector
                            allPersons={personsAsSelectOptions}
                            selectedPersons={currentListeningPersonsAsSelectOptions}
                            onChange={this.handleCurrentListeningPersonsChange}
                        />
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
