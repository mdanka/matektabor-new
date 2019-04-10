import * as React from "react";
import { connect } from "react-redux";
import {
    IAppState,
    selectCurrentStory,
    selectCurrentStoryPersonsAsSelectOptions,
    selectPersonsAsSelectOptions,
    selectCurrentListeningPersonIds,
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
    personsWhoKnowAsSelectOptions: ISelectOption[];
    personsAsSelectOptions: ISelectOption[];
    currentListeningPersonIds: string[];
}

export interface IStoryPanelDispatchProps {}

export type IStoryPanelProps = IStoryPanelOwnProps & IStoryPanelStateProps & IStoryPanelDispatchProps;

export class UnconnectedStoryPanel extends React.Component<IStoryPanelProps, {}> {
    public render() {
        const { story } = this.props;
        return (
            <Paper className="story-panel" elevation={0}>
                {story === undefined ? this.renderPlaceholder() : this.renderStory()}
            </Paper>
        );
    }

    private renderStory = () => {
        const { story, personsWhoKnowAsSelectOptions, personsAsSelectOptions, currentListeningPersonIds } = this.props;
        if (story === undefined) {
            return null;
        }
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
                        <Icon className="story-panel-done-button-icon">done</Icon>
                        Elmeséltem
                    </Button>
                </p>
                <Typography variant="h5" paragraph={true}>
                    {number} - {title}
                </Typography>
                <Typography variant="body1" paragraph={true}>
                    {description}
                </Typography>
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1">Megoldás</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Typography variant="body1">{solution}</Typography>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1">Kik ismerik?</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className="story-panel-people-who-know">
                        <PersonsSelector
                            allPersons={personsAsSelectOptions}
                            selectedPersons={personsWhoKnowAsSelectOptions}
                            onChange={this.handlePersonsWhoKnowChange}
                        />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </div>
        );
    };

    private renderPlaceholder = () => {
        return (
            <Typography className="story-panel-empty-state" variant="display1" paragraph={true} align="center">
                Válassz egy barkochbatörténetet!
            </Typography>
        );
    };

    private handlePersonsWhoKnowChange = (values: ISelectOption[]) => {
        const globalServices = getGlobalServices();
        const { story } = this.props;
        if (globalServices === undefined || story === undefined) {
            return;
        }
        const { id: storyId } = story;
        const peopleIds = values.map(value => value.value);
        globalServices.dataService.updatePersonsWhoKnowStory(storyId, peopleIds);
    };

    private handleDoneClicked = () => {
        const globalServices = getGlobalServices();
        const { currentListeningPersonIds, story } = this.props;
        if (globalServices === undefined || story === undefined) {
            return;
        }
        const { id: storyId, personsWhoKnow } = story;
        const allPersonsWhoKnowIt = Array.from(new Set([...personsWhoKnow, ...currentListeningPersonIds]));
        globalServices.dataService.updatePersonsWhoKnowStory(storyId, allPersonsWhoKnowIt);
    };
}

function mapStateToProps(state: IAppState, _ownProps: IStoryPanelOwnProps): IStoryPanelStateProps {
    return {
        story: selectCurrentStory(state),
        personsWhoKnowAsSelectOptions: selectCurrentStoryPersonsAsSelectOptions(state),
        personsAsSelectOptions: selectPersonsAsSelectOptions(state),
        currentListeningPersonIds: selectCurrentListeningPersonIds(state),
    };
}

function mapDispatchToProps(_dispatch: Dispatch, _ownProps: IStoryPanelOwnProps): IStoryPanelDispatchProps {
    return {};
}

export const StoryPanel = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedStoryPanel);
