import { useSelector, useDispatch } from "react-redux";
import {
    selectStoriesOrdered,
    setCurrentStoryId,
    selectCurrentStoryId,
    selectCurrentListeningPersonIds,
    setBarkochbaDrawerIsOpen,
    selectCurrentUserId,
    selectStarredStoriesOrdered,
} from "../../store";
import {
    List,
    ListItemText,
    ListItem,
    ListItemButton,
    Chip,
    Tooltip,
    IconButton,
    Divider,
    ListSubheader,
} from "@mui/material";
import { IStory } from "../../commons";
import classNames from "classnames";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PersonIcon from "@mui/icons-material/Person";
import StarRateIcon from "@mui/icons-material/StarRate";
import { BarkochbaSortingSelector } from "./barkochbaSortingSelector";
import css from "./storyBrowser.module.scss";
import { useDataService } from "../../hooks/useDataService";
import { FC, MouseEvent } from "react";

export const StoryBrowser: FC = () => {
    const dispatch = useDispatch();
    const stories = useSelector(selectStoriesOrdered);
    const starredStories = useSelector(selectStarredStoriesOrdered);
    const currentStoryId = useSelector(selectCurrentStoryId);
    const currentListeningPersonIds = useSelector(selectCurrentListeningPersonIds);
    const currentUserId = useSelector(selectCurrentUserId);
    const { updateStoryStarred } = useDataService();

    const selectStory = (id: string | undefined) => {
        dispatch(setCurrentStoryId({ currentStoryId: id }));
        dispatch(setBarkochbaDrawerIsOpen({ barkochbaDrawerIsOpen: false }));
    };

    const handleStarClick = (storyId: string, shouldBeStarred: boolean) => (
        event: MouseEvent<HTMLButtonElement>
    ) => {
        event.stopPropagation();
        updateStoryStarred(storyId, shouldBeStarred);
    };

    const renderStory = (story: IStory) => {
        const { id: storyId, title, number, personsWhoKnow, usersWhoStarred } = story;
        const usersWhoStarredList = usersWhoStarred || [];
        const personsWhoKnowSet = new Set(personsWhoKnow);
        const listeningPersonsWhoKnow = currentListeningPersonIds.filter(listeningPersonId =>
            personsWhoKnowSet.has(listeningPersonId)
        );
        const numberWhoListening = currentListeningPersonIds.length;
        const numberWhoKnow = listeningPersonsWhoKnow.length;
        const numberWhoStarred = usersWhoStarredList.length;
        const isStarredForCurrentUser = currentUserId && usersWhoStarredList.includes(currentUserId);
        const secondaryLabel = numberWhoKnow ? `${numberWhoKnow} gyerek ismeri` : undefined;
        const classes = classNames(css.item, {
            [css.itemKnownBy]: numberWhoListening,
            [css.itemKnownBy0]: numberWhoListening && !numberWhoKnow,
            [css.itemKnownBy1]: numberWhoKnow === 1,
            [css.itemKnownBy2]: numberWhoKnow === 2,
            [css.itemKnownBy3]: numberWhoKnow >= 3,
        });

        return (
            <ListItemButton
                className={classes}
                key={storyId}
                selected={storyId === currentStoryId}
                divider={false}
                onClick={() => selectStory(storyId)}
            >
                <ListItemText
                    primary={
                        <div className={css.itemPrimaryLabel}>
                            <span className={css.itemLabelTitle}>
                                {number} - {title}
                            </span>
                        </div>
                    }
                    secondary={secondaryLabel}
                />
                <Tooltip title="Ennyien hallották már" placement="bottom">
                    <Chip
                        size="small"
                        variant="outlined"
                        icon={<PersonIcon />}
                        label={personsWhoKnow.length.toString()}
                    />
                </Tooltip>
                <Tooltip title="Ennyien kedvelik" placement="bottom">
                    <Chip
                        size="small"
                        variant="outlined"
                        icon={<StarRateIcon />}
                        label={numberWhoStarred.toString()}
                        sx={{ ml: 0.5 }}
                    />
                </Tooltip>
                <IconButton
                    onClick={handleStarClick(storyId, !isStarredForCurrentUser)}
                    size="large"
                    sx={{
                        transition: "transform 0.15s ease",
                        "&:active": { transform: "scale(0.9)" },
                        color: isStarredForCurrentUser ? "primary.main" : "text.secondary",
                    }}
                >
                    {isStarredForCurrentUser ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
            </ListItemButton>
        );
    };

    return (
        <div className={css.storyBrowser}>
            <List subheader={<ListSubheader disableSticky sx={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary" }}>Rendezés</ListSubheader>}>
                <ListItem>
                    <BarkochbaSortingSelector />
                </ListItem>
            </List>
            {starredStories.length > 0 && (
                <div>
                    <List subheader={<ListSubheader disableSticky sx={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary" }}>Kedvencek</ListSubheader>}>
                        {starredStories.map(renderStory)}
                    </List>
                    <Divider />
                </div>
            )}
            <List subheader={<ListSubheader disableSticky sx={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary" }}>Összes barkochbatörténet</ListSubheader>}>
                {stories.map(renderStory)}
            </List>
        </div>
    );
};
