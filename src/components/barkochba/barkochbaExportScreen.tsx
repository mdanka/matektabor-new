import { useCallback } from "react";
import { useSelector } from "react-redux";
import { ICamp, IStory } from "../../commons";
import { IAppState, selectStoriesOrderedByNumber, selectPersons } from "../../store";
import { selectCamp, selectCampsListOrderedByNameAndNumber } from "../../store/selectors";
import { Box, Link, List, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Page, getNavUrl } from "../../utils/navUtils";
import css from "./barkochbaExportScreen.module.scss";

export function BarkochbaExportScreen() {
    const { campId } = useParams();
    const camp = useSelector((state: IAppState) => campId ? selectCamp(state, campId) : undefined);
    const camps = useSelector(selectCampsListOrderedByNameAndNumber);
    const stories = useSelector(selectStoriesOrderedByNumber);
    const personMap = useSelector(selectPersons);

    const renderPeopleRow = useCallback((roomName: string, people: string[]) => (
        <div key={roomName}>
            {roomName}: {people.join(", ")}
        </div>
    ), []);

    const renderTableRow = useCallback((story: IStory) => {
        if (!camp) return null;
        const { rooms } = camp;
        const { id: storyId, title, number, personsWhoKnow } = story;
        const personsWhoKnowSet = new Set(personsWhoKnow);
        const roomToPeople: { [id: string]: string[] } = {};

        Object.keys(rooms).forEach(roomName => {
            const personsInRoom = rooms[roomName];
            const personsInRoomWhoKnow = personsInRoom.filter((personId: string) => personsWhoKnowSet.has(personId));
            if (personsInRoomWhoKnow.length === 0) return;

            const personNames = personsInRoomWhoKnow.map((personId: string) => {
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
    }, [camp, personMap, renderPeopleRow]);

    const renderTable = useCallback(() => {
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
    }, [camp, renderTableRow, stories]);

    const renderCampItem = useCallback((camp: ICamp) => {
        const { id, group, number } = camp;
        return (
            <Link
                key={id}
                color="textPrimary"
                component={RouterLink}
                to={getNavUrl[Page.BarkochbaExport](id)}
                underline="none"
            >
                <Paper
                    elevation={0}
                    sx={{
                        mb: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 3,
                        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                        "&:hover": {
                            boxShadow: 2,
                            borderColor: "secondary.light",
                        },
                    }}
                >
                    <ListItemButton sx={{ borderRadius: 3 }}>
                        <ListItemText primary={`${group}/${number}`} />
                    </ListItemButton>
                </Paper>
            </Link>
        );
    }, []);

    const renderCampSelector = useCallback(() => {
        return (
            <Box sx={{ padding: { xs: "16px", sm: "32px 24px" }, maxWidth: 600, margin: "0 auto" }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Válassz tábort</Typography>
                <List disablePadding>
                    {camps.map(renderCampItem)}
                </List>
            </Box>
        );
    }, [camps, renderCampItem]);

    return (
        <div>
            {campId === undefined ? renderCampSelector() : renderTable()}
        </div>
    );
}