import * as React from "react";
import { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { GroupSelector } from "./groupSelector";

interface ICampEditDialogProps {
    title: string;
    submitLabel: string;
    initialGroup: string | undefined;
    initialNumber: string;
    onClose: () => void;
    onSubmit: (group: string, campNumber: number) => void;
}

/**
 * Dialog for the "Group/Number" fields of a camp, used both to create and to
 * edit one. Mount it only while it is open: the initial values are captured
 * into state when the component mounts.
 */
export const CampEditDialog: React.FC<ICampEditDialogProps> = ({
    title,
    submitLabel,
    initialGroup,
    initialNumber,
    onClose,
    onSubmit,
}) => {
    const [group, setGroup] = useState<string | undefined>(initialGroup);
    const [numberValue, setNumberValue] = useState(initialNumber);
    const [groupError, setGroupError] = useState<string | undefined>(undefined);
    const [numberError, setNumberError] = useState<string | undefined>(undefined);

    const handleSubmit = () => {
        if (group === undefined || group === "") {
            setGroupError("A csoport megadása kötelező.");
            return;
        }
        const trimmedNumber = numberValue.trim();
        const parsedNumber = parseInt(trimmedNumber, 10);
        if (trimmedNumber === "" || isNaN(parsedNumber) || parsedNumber < 0 || parsedNumber.toString() !== trimmedNumber) {
            setNumberError("A tábor számának nem-negatív egész számnak kell lennie.");
            return;
        }
        onSubmit(group, parsedNumber);
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    <GroupSelector
                        value={group}
                        error={groupError}
                        onChange={newGroup => {
                            setGroup(newGroup);
                            setGroupError(undefined);
                        }}
                    />
                    <TextField
                        variant="filled"
                        label="Sorszám"
                        placeholder="3"
                        type="number"
                        fullWidth
                        value={numberValue}
                        error={numberError !== undefined}
                        helperText={numberError ?? "Pl. \"3\", mint a \"Beluga/3\"-ban"}
                        onChange={event => {
                            setNumberValue(event.target.value);
                            setNumberError(undefined);
                        }}
                        onKeyDown={event => {
                            if (event.key === "Enter") {
                                handleSubmit();
                            }
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Mégse</Button>
                <Button variant="contained" onClick={handleSubmit}>
                    {submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
