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
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    Paper,
    Typography,
    Button,
    Icon,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { IStory, ISelectOption } from "../../commons";
import { PersonsSelector } from "./personsSelector";
import { getGlobalServices } from "../../services";

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
            <Paper className="story-panel" elevation={0}>
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
        const isPlusralListeningAndKnowing = currentListeningPersonsWhoKnowStoryAsSelectOptions.length > 1;
        const { title, description, solution, number } = story;
        return (
            <div>
                <p>
                    <Button
                        className="story-panel-done-button"
                        variant="contained"
                        color="primary"
                        onClick={this.handleDoneClicked}
                        disabled={currentListeningPersonIds.length === 0}
                    >
                        <Icon className="story-panel-button-icon">done</Icon>
                        Elmeséltem
                    </Button>
                </p>
                <Typography variant="h5" paragraph={true}>
                    {number} - {title}
                </Typography>
                <Typography variant="body2" paragraph={true}>
                    {description}
                </Typography>
                <ExpansionPanel elevation={2}>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1">Megoldás</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Typography variant="body2">{solution}</Typography>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
                <ExpansionPanel elevation={2}>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1">Kik ismerik?</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className="story-panel-people-who-know">
                        {someoneListeningKnowsIt && (
                            <Typography variant="body2" paragraph={true}>
                                <b>
                                    Ő{isPlusralListeningAndKnowing ? "k" : ""} ismeri
                                    {isPlusralListeningAndKnowing ? "k" : ""} a mostani hallgatóságból:
                                </b>{" "}
                                {currentListeningPersonsWhoKnowStoryAsSelectOptions
                                    .map(option => option.label)
                                    .join(", ")}
                            </Typography>
                        )}
                        <div className="story-panel-people-who-know-add">
                            <PersonsSelector
                                className="story-panel-people-who-know-add-selector"
                                allPersons={personsAsSelectOptions}
                                selectedPersons={personsToAdd}
                                onChange={this.handlePersonsWhoKnowChange}
                            />
                            <Button
                                className="story-panel-people-who-know-add-button"
                                variant="contained"
                                onClick={this.handleAddClicked}
                                disabled={personsToAdd.length === 0}
                            >
                                <Icon className="story-panel-button-icon">add</Icon>
                                Hozzáadom
                            </Button>
                        </div>
                        <Typography variant="body2" paragraph={true}>
                            <b>Mindenki, aki ismeri:</b>{" "}
                            {personsWhoKnowAsSelectOptions.map(option => option.label).join(", ")}
                        </Typography>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </div>
        );
    };

    private renderPlaceholder = () => {
        return (
            <Typography
                className="story-panel-empty-state"
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
