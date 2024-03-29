import * as React from "react";
import { connect } from "react-redux";
import {
    IAppState,
    selectCurrentStory,
    selectPersonsAsSelectOptions,
    selectCurrentListeningPersonIds,
    selectCurrentListeningPersonsWhoKnowStoryAsSelectOptions,
    selectCurrentStoryPersonsAsSelectOptions,
} from "../../store";
import { Dispatch } from "redux";
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
import { IStory, ISelectOption } from "../../commons";
import { PersonsSelector } from "./personsSelector";
import { getGlobalServices } from "../../services";
import css from "./storyPanel.module.scss";

export interface IStoryPanelOwnProps {}

export interface IStoryPanelStateProps {
    story: IStory | undefined;
    personsAsSelectOptions: ISelectOption[];
    personsWhoKnowAsSelectOptions: ISelectOption[];
    currentListeningPersonIds: string[];
    currentListeningPersonsWhoKnowStoryAsSelectOptions: ISelectOption[];
}

export interface IStoryPanelDispatchProps {}

export type IStoryPanelProps = IStoryPanelOwnProps & IStoryPanelStateProps & IStoryPanelDispatchProps;

export interface IStoryPanelLocalState {
    personsToAdd: ISelectOption[];
}

export class UnconnectedStoryPanel extends React.Component<IStoryPanelProps, IStoryPanelLocalState> {
    public constructor(props: IStoryPanelProps) {
        super(props);
        this.state = {
            personsToAdd: [],
        } as IStoryPanelLocalState;
    }

    public render() {
        const { story } = this.props;
        return (
            <Paper className={css.storyPanel} elevation={0}>
                {story === undefined ? this.renderPlaceholder() : this.renderStory()}
            </Paper>
        );
    }

    private renderStory = () => {
        const {
            story,
            personsAsSelectOptions,
            personsWhoKnowAsSelectOptions,
            currentListeningPersonIds,
            currentListeningPersonsWhoKnowStoryAsSelectOptions,
        } = this.props;
        if (story === undefined) {
            return null;
        }
        const { personsToAdd } = this.state;
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
                        onClick={this.handleDoneClicked}
                        disabled={currentListeningPersonIds.length === 0}
                    >
                        <Icon className={css.buttonIcon}>done</Icon>
                        Elmeséltem
                    </Button>
                </p>
                <Typography variant="h5" paragraph={true}>
                    {number} - {title}
                </Typography>
                <Typography variant="body2" paragraph={true}>
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
                            <Typography variant="body2" paragraph={true}>
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
                                onChange={this.handlePersonsWhoKnowChange}
                            />
                            <Button
                                className={css.peopleWhoKnowAddButton}
                                variant="contained"
                                onClick={this.handleAddClicked}
                                disabled={personsToAdd.length === 0}
                            >
                                <Icon className={css.buttonIcon}>add</Icon>
                                Hozzáadom
                            </Button>
                        </div>
                        <Typography variant="body2" paragraph={true}>
                            <b>Mindenki, aki ismeri:</b>{" "}
                            {personsWhoKnowAsSelectOptions.map(option => option.label).join(", ")}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </div>
        );
    };

    private renderPlaceholder = () => {
        return (
            <Typography
                className={css.emptyState}
                variant="h4"
                paragraph={true}
                align="center"
                color="textSecondary"
            >
                Válassz egy barkochbatörténetet!
            </Typography>
        );
    };

    private handlePersonsWhoKnowChange = (values: ISelectOption[]) => {
        this.setState({ personsToAdd: values });
    };

    private handleAddClicked = async () => {
        const globalServices = getGlobalServices();
        const { story } = this.props;
        if (globalServices === undefined || story === undefined) {
            return;
        }
        const { id: storyId } = story;
        const { personsToAdd } = this.state;
        await globalServices.dataService.addPersonsWhoKnowStory(storyId, personsToAdd.map(person => person.value));
        this.setState({ personsToAdd: [] });
    };

    private handleDoneClicked = () => {
        const globalServices = getGlobalServices();
        const { currentListeningPersonIds, story } = this.props;
        if (globalServices === undefined || story === undefined) {
            return;
        }
        const { id: storyId } = story;
        globalServices.dataService.addPersonsWhoKnowStory(storyId, currentListeningPersonIds);
    };
}

function mapStateToProps(state: IAppState, _ownProps: IStoryPanelOwnProps): IStoryPanelStateProps {
    return {
        story: selectCurrentStory(state),
        personsAsSelectOptions: selectPersonsAsSelectOptions(state),
        personsWhoKnowAsSelectOptions: selectCurrentStoryPersonsAsSelectOptions(state),
        currentListeningPersonIds: selectCurrentListeningPersonIds(state),
        currentListeningPersonsWhoKnowStoryAsSelectOptions: selectCurrentListeningPersonsWhoKnowStoryAsSelectOptions(
            state,
        ),
    };
}

function mapDispatchToProps(_dispatch: Dispatch, _ownProps: IStoryPanelOwnProps): IStoryPanelDispatchProps {
    return {};
}

export const StoryPanel = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedStoryPanel);
