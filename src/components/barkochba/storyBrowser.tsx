import * as React from "react";
import { connect } from "react-redux";
import {
    IAppState,
    selectStoriesOrdered,
    SetCurrentStoryId,
    selectCurrentStoryId,
    selectCurrentListeningPersonIds,
    SetBarkochbaDrawerIsOpen,
    selectCurrentUserId,
    selectStarredStoriesOrdered,
} from "../../store";
import { Dispatch } from "redux";
import {
    List,
    ListItemText,
    ListItem,
    Chip,
    Tooltip,
    Avatar,
    IconButton,
    Divider,
    ListSubheader,
} from "@material-ui/core";
import { IStory } from "../../commons";
import * as classNames from "classnames";
import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import PersonIcon from "@material-ui/icons/Person";
import StarRateIcon from "@material-ui/icons/StarRate";
import { getGlobalServices } from "../../services";
import { BarkochbaSortingSelector } from "./barkochbaSortingSelector";

export interface IStoryBrowserOwnProps {}

export interface IStoryBrowserStateProps {
    stories: IStory[];
    starredStories: IStory[];
    currentStoryId: string | undefined;
    currentListeningPersonIds: string[];
    currentUserId: string | undefined;
}

export interface IStoryBrowserDispatchProps {
    selectStory: (id: string | undefined) => void;
    closeDrawer: () => void;
}

export type IStoryBrowserProps = IStoryBrowserOwnProps & IStoryBrowserStateProps & IStoryBrowserDispatchProps;

export class UnconnectedStoryBrowser extends React.Component<IStoryBrowserProps, {}> {
    public render() {
        const { stories, starredStories } = this.props;
        const areThereStarredStories = starredStories.length !== 0;
        return (
            <div className="story-browser">
                <List>
                    <ListItem>
                        <BarkochbaSortingSelector />
                    </ListItem>
                </List>
                {areThereStarredStories && (
                    <div>
                        <List subheader={<ListSubheader disableSticky={true}>Kedvencek</ListSubheader>}>
                            {starredStories.map(this.renderStory)}
                        </List>
                        <Divider />
                    </div>
                )}
                <List subheader={<ListSubheader disableSticky={true}>Összes barkochbatörténet</ListSubheader>}>
                    {stories.map(this.renderStory)}
                </List>
            </div>
        );
    }

    private renderStory = (story: IStory) => {
        const { currentStoryId, currentListeningPersonIds, currentUserId } = this.props;
        const { id: storyId, title, number, personsWhoKnow, usersWhoStarred } = story;
        const usersWhoStarredList = usersWhoStarred === undefined ? [] : usersWhoStarred;
        const personsWhoKnowSet = new Set(personsWhoKnow);
        const listeningPersonsWhoKnow = currentListeningPersonIds.filter(listeningPersonId =>
            personsWhoKnowSet.has(listeningPersonId),
        );
        const numberWhoKnow = listeningPersonsWhoKnow.length;
        const numberWhoStarred = usersWhoStarredList.length;
        const isStarredForCurrentUser =
            currentUserId !== undefined && usersWhoStarredList.indexOf(currentUserId) !== -1;
        const secondaryLabel = numberWhoKnow === 0 ? undefined : `${numberWhoKnow} gyerek ismeri`;
        const classes = classNames({
            "story-list-item-known-by-1": numberWhoKnow === 1,
            "story-list-item-known-by-2": numberWhoKnow === 2,
            "story-list-item-known-by-3": numberWhoKnow >= 3,
        });
        // <Chip label="Basic Chip" className={classes.chip} />
        const primaryLabel = (
            <div className="story-list-item-primary-label">
                <span className="story-list-item-label-title">
                    {number} - {title}
                </span>
            </div>
        );
        return (
            <ListItem
                className={classes}
                key={storyId}
                selected={storyId === currentStoryId}
                button
                divider={false}
                onClick={this.getStorySelectionHandler(storyId)}
            >
                <ListItemText primary={primaryLabel} secondary={secondaryLabel} />
                <Tooltip title="Ennyien hallották már" placement="bottom">
                    <Chip
                        className="story-list-item-label-heard-number"
                        avatar={
                            <Avatar>
                                <PersonIcon />
                            </Avatar>
                        }
                        label={personsWhoKnow.length.toString()}
                    />
                </Tooltip>
                <Tooltip title="Ennyien kedvelik" placement="bottom">
                    <Chip
                        avatar={
                            <Avatar>
                                <StarRateIcon />
                            </Avatar>
                        }
                        label={numberWhoStarred.toString()}
                    />
                </Tooltip>
                <IconButton onClick={this.getStarClickHandler(storyId, !isStarredForCurrentUser)}>
                    {isStarredForCurrentUser ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
            </ListItem>
        );
    };

    private getStorySelectionHandler = (id: string) => {
        const { selectStory, closeDrawer } = this.props;
        return () => {
            selectStory(id);
            closeDrawer();
        };
    };

    private getStarClickHandler = (storyId: string, shouldBeStarred: boolean) => (
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
        event.stopPropagation();
        const globalServices = getGlobalServices();
        if (globalServices === undefined) {
            return;
        }
        globalServices.dataService.updateStoryStarred(storyId, shouldBeStarred);
    };
}

function mapStateToProps(state: IAppState, _ownProps: IStoryBrowserOwnProps): IStoryBrowserStateProps {
    return {
        stories: selectStoriesOrdered(state),
        starredStories: selectStarredStoriesOrdered(state),
        currentStoryId: selectCurrentStoryId(state),
        currentListeningPersonIds: selectCurrentListeningPersonIds(state),
        currentUserId: selectCurrentUserId(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch, _ownProps: IStoryBrowserOwnProps): IStoryBrowserDispatchProps {
    return {
        selectStory: (currentStoryId: string | undefined) => dispatch(SetCurrentStoryId.create({ currentStoryId })),
        closeDrawer: () => dispatch(SetBarkochbaDrawerIsOpen.create({ barkochbaDrawerIsOpen: false })),
    };
}

export const StoryBrowser = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedStoryBrowser);
