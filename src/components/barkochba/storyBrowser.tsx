import * as React from "react";
import { connect } from "react-redux";
import { IAppState, selectSongsOrderedByNumber, SetCurrentStoryId } from "../../store";
import { Dispatch } from "redux";
import { List, ListItemText, ListItem } from "@material-ui/core";
import { IStory } from "../../commons";

export interface IStoryBrowserOwnProps {}

export interface IStoryBrowserStateProps {
    stories: IStory[];
}

export interface IStoryBrowserDispatchProps {
    selectStory: (id: string | undefined) => void;
}

export type IStoryBrowserProps = IStoryBrowserOwnProps & IStoryBrowserStateProps & IStoryBrowserDispatchProps;

export class UnconnectedStoryBrowser extends React.Component<IStoryBrowserProps, {}> {
    public render() {
        const { stories } = this.props;
        return (
            <div className="story-browser">
                <List>{stories.map(this.renderStory)}</List>
            </div>
        );
    }

    private renderStory = (story: IStory) => {
        const { id, title, number } = story;
        return (
            <ListItem key={id} button divider={true} onClick={this.getStorySelectionHandler(id)}>
                <ListItemText primary={`${number} - ${title}`} />
            </ListItem>
        );
    };

    private getStorySelectionHandler = (id: string) => {
        const { selectStory } = this.props;
        return () => selectStory(id);
    };
}

function mapStateToProps(state: IAppState, _ownProps: IStoryBrowserOwnProps): IStoryBrowserStateProps {
    return {
        stories: selectSongsOrderedByNumber(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch, _ownProps: IStoryBrowserOwnProps): IStoryBrowserDispatchProps {
    return {
        selectStory: (currentStoryId: string | undefined) => dispatch(SetCurrentStoryId.create({ currentStoryId })),
    };
}

export const StoryBrowser = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedStoryBrowser);
