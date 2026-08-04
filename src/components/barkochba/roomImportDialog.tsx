import * as React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
    Alert,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "notistack";
import { ICamp, IRoomsApi, ISelectOption } from "../../commons";
import { selectPersonsAsSelectOptions, selectPersonsList } from "../../store";
import { useDataService } from "../../hooks/useDataService";
import { matchNameToPerson, parsePastedRooms } from "../../utils/roomImport";
import css from "./roomImportDialog.module.scss";

interface IRoomImportDialogProps {
    camp: ICamp;
    open: boolean;
    onClose: () => void;
}

type IEntryStatus = "match" | "suggestion" | "none" | "confirmed";

interface IReviewEntry {
    rawName: string;
    selectedPersonId: string | undefined;
    status: IEntryStatus;
}

interface IReviewRoom {
    roomName: string;
    entries: IReviewEntry[];
}

const STATUS_CHIPS: { [status in IEntryStatus]: { label: string; color: "success" | "warning" | "info" } } = {
    match: { label: "Megtalálva", color: "success" },
    confirmed: { label: "Kiválasztva", color: "success" },
    suggestion: { label: "Ellenőrizd!", color: "warning" },
    none: { label: "Új gyerek lesz", color: "info" },
};

export const RoomImportDialog: React.FC<IRoomImportDialogProps> = ({ camp, open, onClose }) => {
    const allPersons = useSelector(selectPersonsList);
    const allPersonsAsOptions = useSelector(selectPersonsAsSelectOptions);
    const { createPersons, setCampRooms } = useDataService();
    const { enqueueSnackbar } = useSnackbar();

    const [step, setStep] = useState<"paste" | "review">("paste");
    const [pasteText, setPasteText] = useState("");
    const [pasteError, setPasteError] = useState<string | undefined>(undefined);
    const [reviewRooms, setReviewRooms] = useState<IReviewRoom[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const personOptionsById = new Map(allPersonsAsOptions.map(option => [option.value, option]));

    const handleParse = () => {
        const parsedRooms = parsePastedRooms(pasteText);
        if (parsedRooms.length === 0) {
            setPasteError("Nem sikerült szobákat találni a beillesztett szövegben. Az első sorban a szobák nevének kell szerepelnie.");
            return;
        }
        const newReviewRooms = parsedRooms.map(parsedRoom => ({
            roomName: parsedRoom.roomName,
            entries: parsedRoom.names.map((rawName): IReviewEntry => {
                const match = matchNameToPerson(rawName, allPersons, camp.group);
                if (match.status === "match") {
                    return { rawName, selectedPersonId: match.person.id, status: "match" };
                }
                if (match.status === "suggestion") {
                    return { rawName, selectedPersonId: match.candidates[0].person.id, status: "suggestion" };
                }
                return { rawName, selectedPersonId: undefined, status: "none" };
            }),
        }));
        setReviewRooms(newReviewRooms);
        setPasteError(undefined);
        setStep("review");
    };

    const updateEntry = (roomIndex: number, entryIndex: number, newEntry: IReviewEntry | undefined) => {
        setReviewRooms(currentRooms =>
            currentRooms.map((room, i) =>
                i === roomIndex
                    ? {
                        ...room,
                        entries:
                            newEntry === undefined
                                ? room.entries.filter((_entry, j) => j !== entryIndex)
                                : room.entries.map((entry, j) => (j === entryIndex ? newEntry : entry)),
                    }
                    : room,
            ),
        );
    };

    const selectedIdCounts = new Map<string, number>();
    reviewRooms.forEach(room =>
        room.entries.forEach(entry => {
            if (entry.selectedPersonId !== undefined) {
                selectedIdCounts.set(entry.selectedPersonId, (selectedIdCounts.get(entry.selectedPersonId) ?? 0) + 1);
            }
        }),
    );
    const duplicatedPersonLabels = Array.from(selectedIdCounts.entries())
        .filter(([, count]) => count > 1)
        .map(([personId]) => personOptionsById.get(personId)?.label ?? personId);
    const newPersonCount = reviewRooms.reduce(
        (count, room) => count + room.entries.filter(entry => entry.selectedPersonId === undefined).length,
        0,
    );

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const entriesToCreate = reviewRooms.flatMap(room =>
                room.entries.filter(entry => entry.selectedPersonId === undefined),
            );
            const createdIds = await createPersons(
                entriesToCreate.map(entry => ({ name: entry.rawName, group: camp.group })),
            );
            const createdIdByEntry = new Map(entriesToCreate.map((entry, index) => [entry, createdIds[index]]));

            const importedPersonIds = new Set<string>();
            const roomsToImport = reviewRooms.map(room => ({
                roomName: room.roomName,
                personIds: room.entries.map(entry => {
                    const personId = entry.selectedPersonId ?? createdIdByEntry.get(entry) as string;
                    importedPersonIds.add(personId);
                    return personId;
                }),
            }));

            // Anyone placed by the import is removed from their previous room,
            // so a child never ends up in two rooms at once.
            const newRooms: IRoomsApi = {};
            Object.keys(camp.rooms).forEach(roomName => {
                newRooms[roomName] = camp.rooms[roomName].filter(personId => !importedPersonIds.has(personId));
            });
            roomsToImport.forEach(room => {
                newRooms[room.roomName] = room.personIds;
            });
            await setCampRooms(camp, newRooms);

            enqueueSnackbar("Szobabeosztás elmentve.", { variant: "success" });
            setStep("paste");
            setPasteText("");
            setReviewRooms([]);
            onClose();
        } catch (error) {
            console.error(`[RoomImportDialog] Failed to save the imported rooms. ${error}`);
            enqueueSnackbar("Nem sikerült elmenteni a beosztást - kérjük próbáld újra!", { variant: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const renderPasteStep = () => (
        <>
            <DialogContentText>
                Jelöld ki a szobabeosztás táblázatát Excelben a szobanevek sorával együtt (a sorszámok és a
                felnőttek oszlopai nélkül), másold ki, majd illeszd be ide. Egy ilyen táblázatrészt várunk:
            </DialogContentText>
            <Typography component="table" variant="body2" color="text.secondary" className={css.exampleTable} sx={{ borderColor: "divider" }}>
                <thead>
                    <tr>
                        <th>B (5)</th>
                        <th>C (8)</th>
                        <th>L</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Tóth János</td>
                        <td>Kis Réka</td>
                        <td>Nagy Ádám</td>
                    </tr>
                    <tr>
                        <td>Szabó Petra</td>
                        <td>--</td>
                        <td>Kovács Léna</td>
                    </tr>
                </tbody>
            </Typography>
            <TextField
                autoFocus
                multiline
                fullWidth
                minRows={8}
                maxRows={16}
                sx={{ mt: 2 }}
                value={pasteText}
                error={pasteError !== undefined}
                helperText={pasteError}
                onChange={event => {
                    setPasteText(event.target.value);
                    setPasteError(undefined);
                }}
                placeholder={"B (5)\tC (8)\nTóth János\tKis Réka\n..."}
            />
        </>
    );

    const renderReviewEntry = (roomIndex: number, entryIndex: number, entry: IReviewEntry) => {
        const chip = STATUS_CHIPS[entry.status];
        const selectedOption =
            entry.selectedPersonId === undefined ? null : personOptionsById.get(entry.selectedPersonId) ?? null;
        return (
            <div key={`${entry.rawName}-${entryIndex}`} className={css.reviewRow}>
                <Typography variant="body2" className={css.reviewRawName} title={entry.rawName}>
                    {entry.rawName}
                </Typography>
                <Autocomplete
                    className={css.reviewPicker}
                    size="small"
                    options={allPersonsAsOptions}
                    value={selectedOption}
                    onChange={(_event, value) =>
                        updateEntry(roomIndex, entryIndex, {
                            ...entry,
                            selectedPersonId: value === null ? undefined : value.value,
                            status: value === null ? "none" : "confirmed",
                        })
                    }
                    renderInput={params => (
                        <TextField {...params} placeholder="Új gyerekként jön létre" variant="standard" />
                    )}
                    getOptionLabel={(option: ISelectOption) => option.label}
                />
                <Chip className={css.reviewStatus} size="small" color={chip.color} label={chip.label} />
                <IconButton
                    size="small"
                    aria-label="Név kihagyása"
                    onClick={() => updateEntry(roomIndex, entryIndex, undefined)}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </div>
        );
    };

    const renderReviewStep = () => (
        <>
            <DialogContentText>
                Ellenőrizd a találatokat. Ahol nincs kiválasztott gyerek, ott új gyereket hozunk létre a(z)
                &quot;{camp.group}&quot; csoportban. A sor végi X-szel kihagyhatsz egy nevet.
            </DialogContentText>
            {duplicatedPersonLabels.length > 0 && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    Ugyanaz a gyerek több helyen is szerepel: {duplicatedPersonLabels.join(", ")}
                </Alert>
            )}
            {reviewRooms.map((room, roomIndex) => {
                const existingMemberCount = (camp.rooms[room.roomName] ?? []).length;
                const isExistingRoom = camp.rooms[room.roomName] !== undefined;
                return (
                    <div key={room.roomName} className={css.reviewRoom}>
                        <div className={css.reviewRoomHeader}>
                            <Typography variant="h6">{room.roomName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {room.entries.length} név
                            </Typography>
                            {isExistingRoom ? (
                                <Chip
                                    size="small"
                                    color="warning"
                                    label={`Felülírja a meglévő szobát (${existingMemberCount} lakó)`}
                                />
                            ) : (
                                <Chip size="small" label="Új szoba" />
                            )}
                        </div>
                        {room.entries.map((entry, entryIndex) => renderReviewEntry(roomIndex, entryIndex, entry))}
                        {room.entries.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                Üres szoba jön létre.
                            </Typography>
                        )}
                    </div>
                );
            })}
        </>
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Szobabeosztás beillesztése Excelből</DialogTitle>
            <DialogContent>{step === "paste" ? renderPasteStep() : renderReviewStep()}</DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Mégse</Button>
                {step === "paste" ? (
                    <Button variant="contained" onClick={handleParse} disabled={pasteText.trim() === ""}>
                        Tovább
                    </Button>
                ) : (
                    <>
                        <Button onClick={() => setStep("paste")}>Vissza</Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={isSaving || duplicatedPersonLabels.length > 0}
                        >
                            {newPersonCount > 0 ? `Mentés (${newPersonCount} új gyerek)` : "Mentés"}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};
