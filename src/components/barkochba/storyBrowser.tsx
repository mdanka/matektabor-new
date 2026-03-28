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
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PersonIcon from "@mui/icons-material/Person";
import StarRateIcon from "@mui/icons-material/StarRate";
import { BarkochbaSortingSelector } from "./barkochbaSortingSelector";
import css from "./storyBrowser.module.scss";
import { useDataService } from "../../hooks/useDataService";
import { FC, MouseEvent } from "react";
import { SxProps, Theme } from "@mui/material/styles";

const KNOWN_BY_COLORS: Record<string, { borderColor: string; backgroundColor: string }> = {
    "0": { borderColor: "#60A5FA", backgroundColor: "#EFF6FF" },
    "1": { borderColor: "#FBBF24", backgroundColor: "#FFFBEB" },
    "2": { borderColor: "#F97316", backgroundColor: "#FFF7ED" },
    "3": { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
};

function getKnownBySx(numberWhoListening: number, numberWhoKnow: number): SxProps<Theme> {
    if (!numberWhoListening) return {};
    const key = numberWhoKnow === 0 ? "0" : numberWhoKnow === 1 ? "1" : numberWhoKnow === 2 ? "2" : "3";
    const colors = KNOWN_BY_COLORS[key];
    return {
        borderLeft: "4px solid",
        borderColor: colors.borderColor,
        backgroundColor: colors.backgroundColor,
        transition: "background-color 0.2s ease, border-color 0.2s ease",
    };
}

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

        return (
            <ListItemButton
                key={storyId}
                selected={storyId === currentStoryId}
                divider={false}
                onClick={() => selectStory(storyId)}
                sx={getKnownBySx(numberWhoListening, numberWhoKnow)}
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
        <div>
            <List subheader={<ListSubheader disableSticky>Rendezés</ListSubheader>}>
                <ListItem>
                    <BarkochbaSortingSelector />
                </ListItem>
            </List>
            {starredStories.length > 0 && (
                <div>
                    <List subheader={<ListSubheader disableSticky>Kedvencek</ListSubheader>}>
                        {starredStories.map(renderStory)}
                    </List>
                    <Divider />
                </div>
            )}
            <List subheader={<ListSubheader disableSticky>Összes barkochbatörténet</ListSubheader>}>
                {stories.map(renderStory)}
            </List>
        </div>
    );
};
