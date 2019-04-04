import * as React from "react";
import { connect } from "react-redux";
import {
    IAppState,
    selectCurrentStory,
    selectCurrentStoryPersonsAsSelectOptions,
    selectPersonsAsSelectOptions,
} from "../../store";
import { Dispatch } from "redux";
import { ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Paper, Typography } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { IStory, ISelectOption } from "../../commons";
import { PersonsSelector } from "./personsSelector";
import { getGlobalServices } from "../../services";

export interface IStoryPanelOwnProps {}

export interface IStoryPanelStateProps {
    story: IStory | undefined;
    personsWhoKnowAsSelectOptions: ISelectOption[];
    personsAsSelectOptions: ISelectOption[];
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
        const { story, personsWhoKnowAsSelectOptions, personsAsSelectOptions } = this.props;
        if (story === undefined) {
            return null;
        }
        const { title, description, solution, number } = story;
        return (
            <div>
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
            <Typography variant="display1" paragraph={true} align="center">
                ← Válassz egy barkochbatörténetet!
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
}

function mapStateToProps(state: IAppState, _ownProps: IStoryPanelOwnProps): IStoryPanelStateProps {
    return {
        story: selectCurrentStory(state),
        personsWhoKnowAsSelectOptions: selectCurrentStoryPersonsAsSelectOptions(state),
        personsAsSelectOptions: selectPersonsAsSelectOptions(state),
    };
}

function mapDispatchToProps(_dispatch: Dispatch, _ownProps: IStoryPanelOwnProps): IStoryPanelDispatchProps {
    return {};
}

export const StoryPanel = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedStoryPanel);
