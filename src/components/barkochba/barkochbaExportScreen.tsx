import React from "react";
import { useSelector } from "react-redux";
import { ICamp, IStory } from "../../commons";
import { IAppState, selectStoriesOrderedByNumber, selectPersons } from "../../store";
import { selectCamp, selectCampsListOrderedByNameAndNumber } from "../../store/selectors";
import { Link, List, ListItem, ListItemText } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Page, getNavUrl } from "../../utils/navUtils";
import css from "./barkochbaExportScreen.module.scss";

interface BarkochbaExportScreenProps {
    campId: string | undefined;
}

const getExportLinkComponent = (id: string) => (props: any) => (
    <RouterLink to={getNavUrl[Page.BarkochbaExport](id)} {...props} />
);

export function BarkochbaExportScreen({ campId }: BarkochbaExportScreenProps) {
    const camp = useSelector((state: IAppState) => campId ? selectCamp(state, campId) : undefined);
    const camps = useSelector(selectCampsListOrderedByNameAndNumber);
    const stories = useSelector(selectStoriesOrderedByNumber);
    const personMap = useSelector(selectPersons);

    const renderCampSelector = () => (
        <List>
            {camps.map(renderCampItem)}
        </List>
    );

    const renderCampItem = (camp: ICamp) => {
        const { id, group, number } = camp;
        return (
            <Link
                key={id}
                color="textPrimary"
                component={getExportLinkComponent(id)}
                underline="hover"
            >
                <ListItem button divider={true}>
                    <ListItemText primary={`${group}/${number}`} />
                </ListItem>
            </Link>
        );
    };

    const renderTable = () => {
        if (!camp) return null;
        const { group, number } = camp;
        return (
            <div className={css.barkochbaExport}>
                <div className={css.barkochbaExportTitle}>
                    {group}/{number} barkochbatörténet ismeretek
                </div>
                <table>
                    <tbody>{stories.map(renderTableRow)}</tbody>
                </table>
            </div>
        );
    };

    const renderTableRow = (story: IStory) => {
        if (!camp) return null;
        const { rooms } = camp;
        const { id: storyId, title, number, personsWhoKnow } = story;
        const personsWhoKnowSet = new Set(personsWhoKnow);
        const roomToPeople: { [id: string]: string[] } = {};

        Object.keys(rooms).forEach(roomName => {
            const personsInRoom = rooms[roomName];
            const personsInRoomWhoKnow = personsInRoom.filter(personId => personsWhoKnowSet.has(personId));
            if (personsInRoomWhoKnow.length === 0) return;

            const personNames = personsInRoomWhoKnow.map(personId => {
                const person = personMap[personId];
                return person ? person.name : "<nincs név>";
            });
            roomToPeople[roomName] = personNames;
        });

        return (
            <tr key={storyId}>
                <td className={css.barkochbaExportColLeft}>
                    {number} - {title}
                </td>
                <td className={css.barkochbaExportColRight}>
                    {Object.keys(roomToPeople).map(roomName =>
                        renderPeopleRow(roomName, roomToPeople[roomName])
                    )}
                </td>
            </tr>
        );
    };

    const renderPeopleRow = (roomName: string, people: string[]) => (
        <div key={roomName}>
            {roomName}: {people.join(", ")}
        </div>
    );

    return (
        <div>
            {campId === undefined ? renderCampSelector() : renderTable()}
        </div>
    );
}