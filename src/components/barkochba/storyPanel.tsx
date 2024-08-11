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
    Icon,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ISelectOption } from "../../commons";
import { PersonsSelector } from "./personsSelector";
import css from "./storyPanel.module.scss";
import { useState } from "react";
import { useDataService } from "../../services/useDataService";

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
                <p>
                    <Button
                        className={css.doneButton}
                        variant="contained"
                        color="primary"
                        onClick={handleDoneClicked}
                        disabled={currentListeningPersonIds.length === 0}
                    >
                        <Icon className={css.buttonIcon}>done</Icon>
                        Elmeséltem
                    </Button>
                </p>
                <Typography variant="h5" paragraph>
                    {number} - {title}
                </Typography>
                <Typography variant="body2" paragraph>
                    {description}
                </Typography>
                <Accordion elevation={2}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1">Megoldás</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body2">{solution}</Typography>
                    </AccordionDetails>
                </Accordion>
                <Accordion elevation={2}>
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
                                variant="contained"
                                onClick={handleAddClicked}
                                disabled={personsToAdd.length === 0}
                            >
                                <Icon className={css.buttonIcon}>add</Icon>
                                Hozzáadom
                            </Button>
                        </div>
                        <Typography variant="body2" paragraph>
                            <b>Mindenki, aki ismeri:</b>{" "}
                            {personsWhoKnowAsSelectOptions.map(option => option.label).join(", ")}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </div>
        );
    };

    const renderPlaceholder = () => {
        return (
            <Typography
                className={css.emptyState}
                variant="h4"
                paragraph
                align="center"
                color="textSecondary"
            >
                Válassz egy barkochbatörténetet!
            </Typography>
        );
    };

    return (
        <Paper className={css.storyPanel} elevation={0}>
            {story ? renderStory() : renderPlaceholder()}
        </Paper>
    );
};
