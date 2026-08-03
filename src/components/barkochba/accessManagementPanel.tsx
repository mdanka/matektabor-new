import * as React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
    Typography,
    TextField,
    Button,
    Paper,
    FormControl,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Switch,
    IconButton,
    Tooltip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useSnackbar } from "notistack";
import { selectCurrentUser, selectRoles } from "../../store";
import { useDataService } from "../../hooks/useDataService";
import css from "./barkochbaManageScreen.module.scss";

// A deliberately loose check: catch typos like a missing @ or stray whitespace,
// without trying to out-guess what an email server will accept.
const isPlausibleEmail = (email: string) => /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email);

export const AccessManagementPanel: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const roles = useSelector(selectRoles);
    const currentUser = useSelector(selectCurrentUser);
    const { addRoleEmail, removeRoleEmail } = useDataService();

    const [newEmail, setNewEmail] = useState("");
    const [validationError, setValidationError] = useState<string | undefined>(undefined);

    if (roles === undefined) {
        return null;
    }

    const currentUserEmail = currentUser?.email?.toLowerCase();
    const viewers = roles.viewers;
    const admins = roles.admins ?? [];
    const allEmails = [...new Set([...viewers, ...admins])].sort();

    const showError = () =>
        enqueueSnackbar("Nem sikerült a hozzáférés módosítása - kérjük próbáld újra!", { variant: "error" });

    const handleNewEmailChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewEmail(event.target.value);
        setValidationError(undefined);
    };

    const handleAdd = () => {
        const email = newEmail.trim().toLowerCase();
        if (!isPlausibleEmail(email)) {
            setValidationError("Ez nem tűnik érvényes e-mail-címnek.");
            return;
        }
        if (allEmails.includes(email)) {
            setValidationError("Ez a cím már szerepel a listán.");
            return;
        }
        addRoleEmail("viewers", email)
            .then(() => setNewEmail(""))
            .catch(showError);
    };

    const handleAdminToggle = (email: string, makeAdmin: boolean) => {
        const updates = makeAdmin
            ? [addRoleEmail("admins", email)]
            : [
                // Keep them as a viewer so revoking admin doesn't silently revoke all access.
                ...(viewers.includes(email) ? [] : [addRoleEmail("viewers", email)]),
                removeRoleEmail("admins", email),
            ];
        Promise.all(updates).catch(showError);
    };

    const handleRemove = (email: string) => {
        const removals = [
            ...(viewers.includes(email) ? [removeRoleEmail("viewers", email)] : []),
            ...(admins.includes(email) ? [removeRoleEmail("admins", email)] : []),
        ];
        Promise.all(removals).catch(showError);
    };

    return (
        <Paper className={css.barkochbaManagePanel} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Hozzáférések</Typography>
            <Typography variant="subtitle2" color="text.secondary">
                A listán szereplők használhatják az appot: láthatják a történeteket és szerkeszthetik a táborokat.
                Az adminok ezen felül a hozzáféréseket is kezelhetik.
            </Typography>
            <div className={css.barkochbaManageFormStack}>
                <FormControl variant="standard" fullWidth error={!!validationError}>
                    <TextField
                        variant="filled"
                        value={newEmail}
                        onChange={handleNewEmailChange}
                        label="E-mail-cím"
                        placeholder="valaki@gmail.com"
                        type="email"
                        fullWidth
                        error={!!validationError}
                        helperText={validationError}
                    />
                </FormControl>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleAdd}
                    sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
                >
                    Hozzáadás
                </Button>
            </div>
            <Table size="small" sx={{ mt: 1.5, mb: 1.5 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>E-mail-cím</TableCell>
                        <TableCell align="center" sx={{ width: 80 }}>Admin</TableCell>
                        <TableCell align="center" sx={{ width: 80 }}>Törlés</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {allEmails.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3}>
                                <Typography variant="body2" color="text.secondary">
                                    Még nincs senki a listán.
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                    {allEmails.map(email => {
                        // The rules refuse an admin removing themselves from admins anyway;
                        // disabling the controls makes the lockout protection visible.
                        const isSelfAsAdmin = admins.includes(email) && email === currentUserEmail;
                        return (
                            <TableRow key={email}>
                                <TableCell sx={{ wordBreak: "break-all" }}>{email}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title={isSelfAsAdmin ? "Saját magadat nem tudod eltávolítani az adminok közül." : ""}>
                                        <span>
                                            <Switch
                                                checked={admins.includes(email)}
                                                disabled={isSelfAsAdmin}
                                                onChange={event => handleAdminToggle(email, event.target.checked)}
                                                inputProps={{ "aria-label": `${email} admin` }}
                                            />
                                        </span>
                                    </Tooltip>
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title={isSelfAsAdmin ? "Saját magadat nem tudod törölni." : ""}>
                                        <span>
                                            <IconButton
                                                disabled={isSelfAsAdmin}
                                                onClick={() => handleRemove(email)}
                                                aria-label={`${email} törlése`}
                                            >
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Paper>
    );
};
