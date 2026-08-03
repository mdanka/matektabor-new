import * as React from "react";
import { useSelector } from "react-redux";
import {
    selectCurrentStory,
    selectPersonsAsSelectOptions,
    selectCurrentListeningPersonIds,
    selectCurrentListeningPersonsAsSelectOptions,
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
    Chip,
    Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";
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
    const currentListeningPersonsAsSelectOptions = useSelector(selectCurrentListeningPersonsAsSelectOptions);
    const currentListeningPersonsWhoKnowStoryAsSelectOptions = useSelector(
        selectCurrentListeningPersonsWhoKnowStoryAsSelectOptions
    );
    const { addPersonsWhoKnowStory, removePersonsWhoKnowStory } = useDataService();

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

    const handleListenerChipClicked = (personId: string, knowsStory: boolean) => {
        if (!story) {
            return;
        }
        if (knowsStory) {
            removePersonsWhoKnowStory(story.id, [personId]);
        } else {
            addPersonsWhoKnowStory(story.id, [personId]);
        }
    };

    const renderStory = () => {
        if (!story) return null;

        const listeningPersonIdsWhoKnow = new Set(
            currentListeningPersonsWhoKnowStoryAsSelectOptions.map(option => option.value)
        );
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
                {currentListeningPersonsAsSelectOptions.length > 0 && (
                    <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.5 }}>
                            Kattints a gyerek nevére, ha már ismeri a történetet!
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {currentListeningPersonsAsSelectOptions.map(option => {
                                const knowsStory = listeningPersonIdsWhoKnow.has(option.value);
                                return (
                                    <Chip
                                        key={option.value}
                                        label={option.label}
                                        clickable
                                        color={knowsStory ? "secondary" : "default"}
                                        variant={knowsStory ? "filled" : "outlined"}
                                        icon={knowsStory ? <CheckIcon /> : undefined}
                                        onClick={() => handleListenerChipClicked(option.value, knowsStory)}
                                    />
                                );
                            })}
                        </Box>
                    </Box>
                )}
                <Divider sx={{ mb: 2 }} />
                <Box className={css.storyDescription} sx={{ backgroundColor: "background.default" }}>
                    <Typography variant="body2">
                        {description}
                    </Typography>
                </Box>
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
        <Paper className={css.storyPanel} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: "12px" }}>
            {story ? renderStory() : renderPlaceholder()}
        </Paper>
    );
};
