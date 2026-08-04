import * as React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
    Typography,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Tooltip,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import { useSnackbar } from "notistack";
import { selectAllStoriesOrderedByNumber } from "../../store";
import { IStory, IStoryEditableFields } from "../../commons";
import { useDataService } from "../../hooks/useDataService";
import { StoryEditDialog } from "./storyEditDialog";
import css from "./barkochbaManageScreen.module.scss";

export const StoryManagementPanel: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const stories = useSelector(selectAllStoriesOrderedByNumber);
    const { createStory, updateStory, setStoryArchived } = useDataService();

    // `undefined` means the editor is closed; `{ story: undefined }` means it is open
    // for a brand new story.
    const [editorState, setEditorState] = useState<{ story: IStory | undefined } | undefined>(undefined);
    const [storyBeingArchived, setStoryBeingArchived] = useState<IStory | undefined>(undefined);

    const activeStories = stories.filter(story => !story.isArchived);
    const archivedStories = stories.filter(story => story.isArchived);
    const suggestedNumber = stories.reduce((highest, story) => Math.max(highest, story.number), 0) + 1;
    const takenNumbers = stories
        .filter(story => story.id !== editorState?.story?.id)
        .map(story => story.number);

    const showError = (reason: unknown) => {
        console.error(`[StoryManagementPanel] Failed to save the story. ${reason}`);
        enqueueSnackbar("Nem sikerült a mentés - kérjük próbáld újra!", { variant: "error" });
    };

    const handleSave = (storyBeingEdited: IStory | undefined) => (fields: IStoryEditableFields) => {
        const promise =
            storyBeingEdited === undefined
                ? createStory({ ...fields, personsWhoKnow: [], usersWhoStarred: [], isArchived: false })
                : updateStory(storyBeingEdited.id, fields);
        return promise.then(
            () =>
                enqueueSnackbar(
                    storyBeingEdited === undefined ? "Történet létrehozva." : "Történet mentve.",
                    { variant: "success" },
                ),
            reason => {
                showError(reason);
                // Rethrow so the dialog stays open with the typed-in values.
                throw reason;
            },
        );
    };

    const handleArchiveConfirmed = () => {
        if (storyBeingArchived === undefined) {
            return;
        }
        setStoryArchived(storyBeingArchived.id, true).catch(showError);
        setStoryBeingArchived(undefined);
    };

    const handleRestore = (story: IStory) => {
        setStoryArchived(story.id, false).catch(showError);
    };

    const renderStory = (story: IStory, isArchived: boolean) => {
        const { id, number, title, personsWhoKnow } = story;
        return (
            <ListItem
                key={id}
                divider
                secondaryAction={
                    <>
                        <Tooltip title="Szerkesztés">
                            <IconButton onClick={() => setEditorState({ story })} aria-label={`${title} szerkesztése`}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        {isArchived ? (
                            <Tooltip title="Visszaállítás">
                                <IconButton
                                    onClick={() => handleRestore(story)}
                                    aria-label={`${title} visszaállítása`}
                                >
                                    <UnarchiveOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Archiválás">
                                <IconButton
                                    onClick={() => setStoryBeingArchived(story)}
                                    aria-label={`${title} archiválása`}
                                >
                                    <ArchiveOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </>
                }
            >
                <ListItemText
                    primary={`${number} - ${title}`}
                    secondary={`${personsWhoKnow.length} gyerek ismeri`}
                    sx={{ pr: 8 }}
                />
            </ListItem>
        );
    };

    return (
        <>
            <Paper
                className={css.barkochbaManagePanel}
                elevation={0}
                sx={{ border: "1px solid", borderColor: "divider", borderRadius: { xs: 3, sm: 4 } }}
            >
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Barkochbatörténetek
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                    Itt hozhatsz létre új barkochbatörténetet, illetve szerkesztheted a meglévőket. Történetet nem
                    lehet törölni, csak archiválni: az archivált történetek eltűnnek a listákból és a táblázatokból,
                    de bármikor visszaállíthatók.
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setEditorState({ story: undefined })}
                    startIcon={<AddIcon />}
                    sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, mt: 2 }}
                >
                    Új történet
                </Button>
                <List sx={{ mt: 1 }}>
                    {activeStories.length === 0 && (
                        <ListItem>
                            <Typography variant="body2" color="text.secondary">
                                Még nincs egyetlen barkochbatörténet sem.
                            </Typography>
                        </ListItem>
                    )}
                    {activeStories.map(story => renderStory(story, false))}
                </List>
                {archivedStories.length > 0 && (
                    <>
                        <Divider sx={{ mt: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, mt: 2 }}>
                            Archivált történetek
                            <Chip size="small" label={archivedStories.length} sx={{ ml: 1 }} />
                        </Typography>
                        <List>{archivedStories.map(story => renderStory(story, true))}</List>
                    </>
                )}
            </Paper>
            {editorState !== undefined && (
                <StoryEditDialog
                    story={editorState.story}
                    takenNumbers={takenNumbers}
                    suggestedNumber={suggestedNumber}
                    onClose={() => setEditorState(undefined)}
                    onSave={handleSave(editorState.story)}
                />
            )}
            <Dialog open={storyBeingArchived !== undefined} onClose={() => setStoryBeingArchived(undefined)}>
                <DialogTitle>Archiválod a történetet?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        A(z) "{storyBeingArchived?.number} - {storyBeingArchived?.title}" történet eltűnik a
                        listákból és a táblázatokból, de nem törlődik, és bármikor visszaállíthatod.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ padding: 2 }}>
                    <Button onClick={() => setStoryBeingArchived(undefined)} color="inherit">
                        Mégse
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleArchiveConfirmed}>
                        Archiválás
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
