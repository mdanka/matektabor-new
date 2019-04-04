import * as React from "react";
import { connect } from "react-redux";
import {
    IAppState,
    selectStoriesOrderedByNumber,
    SetCurrentStoryId,
    selectCurrentStoryId,
    selectCurrentListeningPersonIds,
} from "../../store";
import { Dispatch } from "redux";
import { List, ListItemText, ListItem } from "@material-ui/core";
import { IStory } from "../../commons";
import * as classNames from "classnames";

export interface IStoryBrowserOwnProps {}

export interface IStoryBrowserStateProps {
    stories: IStory[];
    currentStoryId: string | undefined;
    currentListeningPersonIds: string[];
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
        const { currentStoryId, currentListeningPersonIds } = this.props;
        const { id, title, number, personsWhoKnow } = story;
        const personsWhoKnowSet = new Set(personsWhoKnow);
        const listeningPersonsWhoKnow = currentListeningPersonIds.filter(listeningPersonId =>
            personsWhoKnowSet.has(listeningPersonId),
        );
        const numberWhoKnow = listeningPersonsWhoKnow.length;
        const secondaryLabel = numberWhoKnow === 0 ? undefined : `${numberWhoKnow} gyerek ismeri`;
        const classes = classNames({
            "story-list-item-known-by-1": numberWhoKnow === 1,
            "story-list-item-known-by-2": numberWhoKnow === 2,
            "story-list-item-known-by-3": numberWhoKnow >= 3,
        });
        return (
            <ListItem
                className={classes}
                key={id}
                selected={id === currentStoryId}
                button
                divider={true}
                onClick={this.getStorySelectionHandler(id)}
            >
                <ListItemText primary={`${number} - ${title}`} secondary={secondaryLabel} />
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
        stories: selectStoriesOrderedByNumber(state),
        currentStoryId: selectCurrentStoryId(state),
        currentListeningPersonIds: selectCurrentListeningPersonIds(state),
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
