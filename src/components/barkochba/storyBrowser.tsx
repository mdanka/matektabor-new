import * as React from "react";
import { connect } from "react-redux";
import { IAppState, selectSongsOrderedByNumber } from "../../store";
import { Dispatch } from "redux";
import { List, ListItemText, ListItem } from "@material-ui/core";
import { Page } from "../../utils";
import { Link } from "react-router-dom";
import { NavUtils } from "../../utils";
import { IStory } from "../../commons";

export interface IStoryBrowserOwnProps {}

export interface IStoryBrowserStateProps {
    stories: IStory[];
}

export interface IStoryBrowserDispatchProps {}

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
            <Link key={id} to={NavUtils.getNavUrl[Page.Barkochba]()}>
                <ListItem button divider={true}>
                    <ListItemText primary={`${number} - ${title}`} />
                </ListItem>
            </Link>
        );
    };
}

function mapStateToProps(state: IAppState, _ownProps: IStoryBrowserOwnProps): IStoryBrowserStateProps {
    return {
        stories: selectSongsOrderedByNumber(state),
    };
}

function mapDispatchToProps(_dispatch: Dispatch, _ownProps: IStoryBrowserOwnProps): IStoryBrowserDispatchProps {
    return {};
}

export const StoryBrowser = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedStoryBrowser);
