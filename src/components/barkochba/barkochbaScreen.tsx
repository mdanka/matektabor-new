import * as React from "react";
import { StoryBrowser } from "./storyBrowser";
import { Typography, Link } from "@material-ui/core";
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
import { NavUtils, Page } from "../../utils";
import { Link as RouterLink } from "react-router-dom";

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

const BarkochbaExportLink = (props: any) => (
    <RouterLink to={NavUtils.getNavUrl[Page.BarkochbaExport](undefined)} {...props} />
);

class UnconnectedBarkochbaScreen extends React.Component<IBarkochbaScreenProps, {}> {
    public render() {
        const { currentListeningPersonsAsSelectOptions, personsAsSelectOptions } = this.props;
        return (
            <div className="barkochba-screen">
                <div className="barkochba-screen-row-header">
                    <div className="barkochba-screen-info">
                        <Typography variant="h6" paragraph={true}>
                            Nekik mesélek:
                        </Typography>
                        <Typography variant="body1" paragraph={true}>
                            Válaszd ki a tábort és a szobát, vagy írd be azon gyerekek neveit, akiknek mesélni
                            szeretnél. Ezután a listában színesek lesznek azok a barkochbatörténetek, amiket valamelyik
                            gyerek már hallotta.
                        </Typography>
                        <Typography variant="body1" paragraph={true}>
                            <Link variant="body1" component={BarkochbaExportLink}>
                                Áttekintő táblázatok az egyes táborokhoz
                            </Link>
                        </Typography>
                    </div>
                    <div className="barkochba-screen-person-selector">
                        <ListeningCampRoomSelector />
                        <PersonsSelector
                            allPersons={personsAsSelectOptions}
                            selectedPersons={currentListeningPersonsAsSelectOptions}
                            onChange={this.handleCurrentListeningPersonsChange}
                        />
                    </div>
                </div>
                <div className="barkochba-screen-row-main">
                    <div className="barkochba-screen-browser">
                        <StoryBrowser />
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
