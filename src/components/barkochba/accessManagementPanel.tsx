import * as React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Typography, TextField, Button, Paper, Chip, Box, FormControl } from "@mui/material";
import { useSnackbar } from "notistack";
import { selectCurrentUser, selectRoles } from "../../store";
import { useDataService } from "../../hooks/useDataService";
import css from "./barkochbaManageScreen.module.scss";

type IRoleField = "viewers" | "admins";

// A deliberately loose check: catch typos like a missing @ or stray whitespace,
// without trying to out-guess what an email server will accept.
const isPlausibleEmail = (email: string) => /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email);

export const AccessManagementPanel: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const roles = useSelector(selectRoles);
    const currentUser = useSelector(selectCurrentUser);
    const { addRoleEmail, removeRoleEmail } = useDataService();

    const [newEmails, setNewEmails] = useState<Record<IRoleField, string>>({ viewers: "", admins: "" });
    const [validationErrors, setValidationErrors] = useState<Record<IRoleField, string | undefined>>({
        viewers: undefined,
        admins: undefined,
    });

    if (roles === undefined) {
        return null;
    }

    const currentUserEmail = currentUser?.email?.toLowerCase();
    const emailLists: Record<IRoleField, string[]> = {
        viewers: [...roles.viewers].sort(),
        admins: [...(roles.admins ?? [])].sort(),
    };

    const handleNewEmailChange = (role: IRoleField) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setNewEmails(prev => ({ ...prev, [role]: event.target.value }));
        setValidationErrors(prev => ({ ...prev, [role]: undefined }));
    };

    const handleAdd = (role: IRoleField) => {
        const email = newEmails[role].trim().toLowerCase();
        if (!isPlausibleEmail(email)) {
            setValidationErrors(prev => ({ ...prev, [role]: "Ez nem tűnik érvényes e-mail-címnek." }));
            return;
        }
        if (emailLists[role].includes(email)) {
            setValidationErrors(prev => ({ ...prev, [role]: "Ez a cím már szerepel a listán." }));
            return;
        }
        addRoleEmail(role, email)
            .then(() => setNewEmails(prev => ({ ...prev, [role]: "" })))
            .catch(() => enqueueSnackbar("Nem sikerült a hozzáférés módosítása - kérjük próbáld újra!", { variant: "error" }));
    };

    const handleRemove = (role: IRoleField, email: string) => {
        removeRoleEmail(role, email)
            .catch(() => enqueueSnackbar("Nem sikerült a hozzáférés módosítása - kérjük próbáld újra!", { variant: "error" }));
    };

    const renderRoleSection = (role: IRoleField, title: string, description: string) => (
        <div>
            <Typography className={css.barkochbaManageSubtitle} variant="subtitle1">
                {title}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
                {description}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5, mb: 1.5 }}>
                {emailLists[role].length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        Még nincs senki a listán.
                    </Typography>
                )}
                {emailLists[role].map(email => {
                    // The rules refuse an admin removing themselves anyway; not offering
                    // the delete button makes the lockout protection visible.
                    const isSelfAsAdmin = role === "admins" && email === currentUserEmail;
                    return (
                        <Chip
                            key={email}
                            label={email}
                            onDelete={isSelfAsAdmin ? undefined : () => handleRemove(role, email)}
                        />
                    );
                })}
            </Box>
            <div className={css.barkochbaManageFormStack}>
                <FormControl variant="standard" fullWidth error={!!validationErrors[role]}>
                    <TextField
                        variant="filled"
                        value={newEmails[role]}
                        onChange={handleNewEmailChange(role)}
                        label="E-mail-cím"
                        placeholder="valaki@gmail.com"
                        type="email"
                        fullWidth
                        error={!!validationErrors[role]}
                        helperText={validationErrors[role]}
                    />
                </FormControl>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleAdd(role)}
                    sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
                >
                    Hozzáadás
                </Button>
            </div>
        </div>
    );

    return (
        <Paper className={css.barkochbaManagePanel} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Hozzáférések</Typography>
            {renderRoleSection(
                "viewers",
                "Megtekintők",
                "Ők használhatják az appot: láthatják a történeteket és szerkeszthetik a táborokat."
            )}
            {renderRoleSection(
                "admins",
                "Adminok",
                "Ők ezen felül a hozzáféréseket is kezelhetik. Minden admin egyben megtekintő is."
            )}
        </Paper>
    );
};
