import * as React from "react";
import { ICamp, IStory } from "../../commons";
import { IAppState, IPersonsState, selectStoriesOrderedByNumber, selectPersons } from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { selectCamp, selectCampsListOrderedByNameAndNumber } from "../../store/selectors";
import { Link, List, ListItem, ListItemText } from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import { Page, getNavUrl } from "../../utils/navUtils";
import css from "./barkochbaExportScreen.module.scss";

export interface IBarkochbaExportScreenOwnProps {
    campId: string | undefined;
}

export interface IBarkochbaExportScreenStateProps {
    camp: ICamp | undefined;
    camps: ICamp[];
    stories: IStory[];
    personMap: IPersonsState;
}

export interface IBarkochbaExportScreenDispatchProps {}

export type IBarkochbaExportScreenProps = IBarkochbaExportScreenOwnProps &
    IBarkochbaExportScreenStateProps &
    IBarkochbaExportScreenDispatchProps;

const getExportLinkComponent = (id: string) => (props: any) => (
    <RouterLink to={getNavUrl[Page.BarkochbaExport](id)} {...props} />
);

class UnconnectedBarkochbaExportScreen extends React.Component<IBarkochbaExportScreenProps, {}> {
    public render() {
        const { campId } = this.props;
        return <div>{campId === undefined ? this.renderCampSelector() : this.renderTable()}</div>;
    }

    private renderCampSelector = () => {
        const { camps } = this.props;
        return <List>{camps.map(this.renderCampItem)}</List>;
    };

    private renderCampItem = (camp: ICamp) => {
        const { id, group, number } = camp;
        return (
            <Link key={id} color="textPrimary" component={getExportLinkComponent(id)}>
                <ListItem button divider={true}>
                    <ListItemText primary={`${group}/${number}`} />
                </ListItem>
            </Link>
        );
    };

    private renderTable = () => {
        const { camp, stories } = this.props;
        if (camp === undefined) {
            return null;
        }
        const { group, number } = camp;
        return (
            <div className={css.barkochbaExport}>
                <div className={css.barkochbaExportTitle}>
                    {group}/{number} barkochbatörténet ismeretek
                </div>
                <table>
                    <tbody>{stories.map(this.renderTableRow)}</tbody>
                </table>
            </div>
        );
    };

    private renderTableRow = (story: IStory) => {
        const { camp, personMap } = this.props;
        if (camp === undefined) {
            return null;
        }
        const { rooms } = camp;
        const { id: storyId, title, number, personsWhoKnow } = story;
        const personsWhoKnowSet = new Set(personsWhoKnow);
        const roomToPeople: { [id: string]: string[] } = {};
        Object.keys(rooms).forEach(roomName => {
            const personsInRoom = rooms[roomName];
            const personsInRoomWhoKnow = personsInRoom.filter(personId => personsWhoKnowSet.has(personId));
            if (personsInRoomWhoKnow.length === 0) {
                return;
            }
            const personNames = personsInRoomWhoKnow.map(personId => {
                const person = personMap[personId];
                return person === undefined ? "<nincs név>" : person.name;
            });
            roomToPeople[roomName] = personNames;
        });
        return (
            <tr key={storyId}>
                <td className={css.barkochbaExportColLeft}>
                    {number} - {title}
                </td>
                <td className={css.barkochbaExportColRight}>
                    {Object.keys(roomToPeople).map(roomName => this.renderPeopleRow(roomName, roomToPeople[roomName]))}
                </td>
            </tr>
        );
    };

    private renderPeopleRow = (roomName: string, people: string[]) => {
        return (
            <div key={roomName}>
                {roomName}: {people.join(", ")}
            </div>
        );
    };
}

function mapStateToProps(state: IAppState, ownProps: IBarkochbaExportScreenOwnProps): IBarkochbaExportScreenStateProps {
    const { campId } = ownProps;
    return {
        camp: campId === undefined ? undefined : selectCamp(state, campId),
        camps: selectCampsListOrderedByNameAndNumber(state),
        stories: selectStoriesOrderedByNumber(state),
        personMap: selectPersons(state),
    };
}

function mapDispatchToProps(
    _dispatch: Dispatch,
    _ownProps: IBarkochbaExportScreenOwnProps,
): IBarkochbaExportScreenDispatchProps {
    return {};
}

export const BarkochbaExportScreen = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedBarkochbaExportScreen);
