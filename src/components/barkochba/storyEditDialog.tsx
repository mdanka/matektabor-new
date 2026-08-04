import * as React from "react";
import { useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@mui/material";
import { IStory, IStoryEditableFields } from "../../commons";

/**
 * The dialog holds the half-typed story in local state, so the caller mounts it only
 * while it is open — that way every opening starts from the story it was opened for.
 */
export interface IStoryEditDialogProps {
    /** The story being edited, or `undefined` when creating a new one. */
    story: IStory | undefined;

    /**
     * Numbers already taken by other stories. Story numbers match Lajos' list, so
     * two stories sharing one would be ambiguous.
     */
    takenNumbers: number[];

    /** A number suggested for a new story: one past the highest existing one. */
    suggestedNumber: number;

    onClose: () => void;
    onSave: (fields: IStoryEditableFields) => Promise<unknown>;
}

interface IFormState {
    number: string;
    title: string;
    description: string;
    solution: string;
}

const emptyForm: IFormState = { number: "", title: "", description: "", solution: "" };

export const StoryEditDialog: React.FC<IStoryEditDialogProps> = ({
    story,
    takenNumbers,
    suggestedNumber,
    onClose,
    onSave,
}) => {
    const [form, setForm] = useState<IFormState>(() =>
        story === undefined
            ? { ...emptyForm, number: suggestedNumber.toString() }
            : {
                number: story.number.toString(),
                title: story.title,
                description: story.description,
                solution: story.solution,
            },
    );
    const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof IFormState, string>>>({});
    const [isSaving, setIsSaving] = useState(false);

    const getFieldUpdater = (field: keyof IFormState) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { value } = event.target;
        setForm(previous => ({ ...previous, [field]: value }));
        setValidationErrors(previous => {
            const next = { ...previous };
            delete next[field];
            return next;
        });
    };

    const validate = (): IStoryEditableFields | undefined => {
        const errors: Partial<Record<keyof IFormState, string>> = {};
        const trimmedNumber = form.number.trim();
        const number = parseInt(trimmedNumber);
        if (trimmedNumber === "") {
            errors.number = "A sorszám megadása kötelező.";
        } else if (isNaN(number) || number < 0 || number.toString() !== trimmedNumber) {
            errors.number = "A sorszámnak nem-negatív egész számnak kell lennie.";
        } else if (takenNumbers.includes(number)) {
            errors.number = "Ezzel a sorszámmal már van történet.";
        }
        if (form.title.trim() === "") {
            errors.title = "A cím megadása kötelező.";
        }
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return undefined;
        }
        return {
            number,
            title: form.title.trim(),
            description: form.description.trim(),
            solution: form.solution.trim(),
        };
    };

    const handleSave = () => {
        const fields = validate();
        if (fields === undefined) {
            return;
        }
        setIsSaving(true);
        onSave(fields)
            .then(onClose)
            // The caller reports the failure; the dialog just stays open with the typed-in values.
            .catch(() => undefined)
            .finally(() => setIsSaving(false));
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{story === undefined ? "Új barkochbatörténet" : "Barkochbatörténet szerkesztése"}</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                <TextField
                    variant="filled"
                    value={form.number}
                    onChange={getFieldUpdater("number")}
                    label="Sorszám"
                    type="number"
                    fullWidth
                    error={!!validationErrors.number}
                    helperText={validationErrors.number ?? "Lajos listája szerinti sorszám"}
                    sx={{ mt: 1 }}
                />
                <TextField
                    variant="filled"
                    value={form.title}
                    onChange={getFieldUpdater("title")}
                    label="Cím"
                    placeholder="A csendes hangverseny"
                    fullWidth
                    error={!!validationErrors.title}
                    helperText={validationErrors.title}
                />
                <TextField
                    variant="filled"
                    value={form.description}
                    onChange={getFieldUpdater("description")}
                    label="Történet"
                    multiline
                    minRows={4}
                    fullWidth
                />
                <TextField
                    variant="filled"
                    value={form.solution}
                    onChange={getFieldUpdater("solution")}
                    label="Megoldás"
                    multiline
                    minRows={3}
                    fullWidth
                />
            </DialogContent>
            <DialogActions sx={{ padding: 2 }}>
                <Button onClick={onClose} color="inherit">
                    Mégse
                </Button>
                <Button variant="contained" color="secondary" onClick={handleSave} disabled={isSaving}>
                    Mentés
                </Button>
            </DialogActions>
        </Dialog>
    );
};
