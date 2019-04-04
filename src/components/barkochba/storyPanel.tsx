import * as React from "react";
import { connect } from "react-redux";
import { IAppState, selectCurrentStory } from "../../store";
import { Dispatch } from "redux";
import { ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Paper, Typography } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { IStory } from "../../commons";

export interface IStoryPanelOwnProps {}

export interface IStoryPanelStateProps {
    story: IStory | undefined;
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
        const { story } = this.props;
        if (story === undefined) {
            return null;
        }
        const { title, description, solution, number } = story;
        return (
            <div>
                <Typography variant="headline" paragraph={true}>
                    {number} - {title}
                </Typography>
                <Typography variant="body1" paragraph={true}>
                    {description}
                </Typography>
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subheading">Megoldás</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Typography variant="body1">{solution}</Typography>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </div>
        );
    };

    private renderPlaceholder = () => {
        return (
            <Typography variant="display1" paragraph={true} align="center">
                Válassz egy barkochbatörténetet
            </Typography>
        );
    };
}

function mapStateToProps(state: IAppState, _ownProps: IStoryPanelOwnProps): IStoryPanelStateProps {
    return {
        story: selectCurrentStory(state),
    };
}

function mapDispatchToProps(_dispatch: Dispatch, _ownProps: IStoryPanelOwnProps): IStoryPanelDispatchProps {
    return {};
}

export const StoryPanel = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedStoryPanel);
