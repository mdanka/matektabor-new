import * as React from "react";
import { useSelector } from "react-redux";
import {
    selectCurrentStory,
    selectPersonsAsSelectOptions,
    selectCurrentListeningPersonIds,
    selectCurrentListeningPersonsWhoKnowStoryAsSelectOptions,
    selectCurrentStoryPersonsAsSelectOptions,
} from "../../store";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Paper,
    Typography,
    Button,
    Box,
    Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { ISelectOption } from "../../commons";
import { PersonsSelector } from "./personsSelector";
import css from "./storyPanel.module.scss";
import { useState } from "react";
import { useDataService } from "../../hooks/useDataService";

export const StoryPanel: React.FC = () => {
    const story = useSelector(selectCurrentStory);
    const personsAsSelectOptions = useSelector(selectPersonsAsSelectOptions);
    const personsWhoKnowAsSelectOptions = useSelector(selectCurrentStoryPersonsAsSelectOptions);
    const currentListeningPersonIds = useSelector(selectCurrentListeningPersonIds);
    const currentListeningPersonsWhoKnowStoryAsSelectOptions = useSelector(
        selectCurrentListeningPersonsWhoKnowStoryAsSelectOptions
    );
    const { addPersonsWhoKnowStory } = useDataService();

    const [personsToAdd, setPersonsToAdd] = useState<ISelectOption[]>([]);

    const handlePersonsWhoKnowChange = (values: ISelectOption[]) => {
        setPersonsToAdd(values);
    };

    const handleAddClicked = async () => {
        if (story) {
            await addPersonsWhoKnowStory(
                story.id,
                personsToAdd.map(person => person.value)
            );
            setPersonsToAdd([]);
        }
    };

    const handleDoneClicked = () => {
        if (story) {
            addPersonsWhoKnowStory(story.id, currentListeningPersonIds);
        }
    };

    const renderStory = () => {
        if (!story) return null;

        const someoneListeningKnowsIt = currentListeningPersonsWhoKnowStoryAsSelectOptions.length > 0;
        const isPluralListeningAndKnowing = currentListeningPersonsWhoKnowStoryAsSelectOptions.length > 1;
        const { title, description, solution, number } = story;

        return (
            <div>
                <div className={css.storyTitleRow}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {number} - {title}
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleDoneClicked}
                        disabled={currentListeningPersonIds.length === 0}
                        startIcon={<CheckCircleOutlineIcon />}
                        sx={{ flexShrink: 0 }}
                    >
                        Elmeséltem
                    </Button>
                </div>
                <Divider sx={{ mb: 2 }} />
                <div className={css.storyDescription}>
                    <Typography variant="body2">
                        {description}
                    </Typography>
                </div>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Accordion elevation={0}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1">Megoldás</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body2">{solution}</Typography>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion elevation={0}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1">Kik ismerik?</Typography>
                        </AccordionSummary>
                        <AccordionDetails className={css.peopleWhoKnow}>
                            {someoneListeningKnowsIt && (
                                <Typography variant="body2" paragraph>
                                    <b>
                                        Ő{isPluralListeningAndKnowing ? "k" : ""} ismeri
                                        {isPluralListeningAndKnowing ? "k" : ""} a mostani hallgatóságból:
                                    </b>{" "}
                                    {currentListeningPersonsWhoKnowStoryAsSelectOptions
                                        .map(option => option.label)
                                        .join(", ")}
                                </Typography>
                            )}
                            <div className={css.peopleWhoKnowAdd}>
                                <PersonsSelector
                                    className={css.peopleWhoKnowAddSelector}
                                    allPersons={personsAsSelectOptions}
                                    selectedPersons={personsToAdd}
                                    onChange={handlePersonsWhoKnowChange}
                                />
                                <Button
                                    className={css.peopleWhoKnowAddButton}
                                    variant="outlined"
                                    onClick={handleAddClicked}
                                    disabled={personsToAdd.length === 0}
                                    startIcon={<AddIcon />}
                                >
                                    Hozzáadom
                                </Button>
                            </div>
                            <Typography variant="body2" paragraph>
                                <b>Mindenki, aki ismeri:</b>{" "}
                                {personsWhoKnowAsSelectOptions.map(option => option.label).join(", ")}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </div>
        );
    };

    const renderPlaceholder = () => {
        return (
            <div className={css.emptyState}>
                <MenuBookOutlinedIcon className={css.emptyStateIcon} />
                <Typography
                    variant="h5"
                    align="center"
                    color="textSecondary"
                >
                    Válassz egy barkochbatörténetet!
                </Typography>
            </div>
        );
    };

    return (
        <Paper className={css.storyPanel} elevation={0}>
            {story ? renderStory() : renderPlaceholder()}
        </Paper>
    );
};
