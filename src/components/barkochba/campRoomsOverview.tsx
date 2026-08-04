import * as React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { ICamp, IPerson, ISelectOption } from "../../commons";
import { selectPersonsList } from "../../store";
import { useDataService } from "../../hooks/useDataService";
import { RoomImportDialog } from "./roomImportDialog";
import { GroupSelector } from "./groupSelector";
import css from "./campRoomsOverview.module.scss";

interface ICampRoomsOverviewProps {
    camp: ICamp;
}

interface IMemberMenuState {
    anchorEl: HTMLElement;
    roomName: string;
    personId: string;
}

interface IRoomMenuState {
    anchorEl: HTMLElement;
    roomName: string;
}

const personAddFilter = createFilterOptions<ISelectOption>();

interface IPersonEditState {
    person: IPerson;
    name: string;
    group: string | undefined;
    nameError: string | undefined;
    groupError: string | undefined;
}

export const CampRoomsOverview: React.FC<ICampRoomsOverviewProps> = ({ camp }) => {
    const allPersons = useSelector(selectPersonsList);
    const { createPerson, updatePerson, createRoom, updateCampRoom, setCampRooms, deleteRoom, renameRoom } = useDataService();

    const [memberMenu, setMemberMenu] = useState<IMemberMenuState | undefined>(undefined);
    const [roomMenu, setRoomMenu] = useState<IRoomMenuState | undefined>(undefined);
    const [roomToDelete, setRoomToDelete] = useState<string | undefined>(undefined);
    const [roomToRename, setRoomToRename] = useState<string | undefined>(undefined);
    const [renameValue, setRenameValue] = useState("");
    const [newRoomName, setNewRoomName] = useState("");
    const [roomError, setRoomError] = useState<string | undefined>(undefined);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [personEdit, setPersonEdit] = useState<IPersonEditState | undefined>(undefined);

    const { rooms } = camp;
    const roomNames = Object.keys(rooms).sort((a, b) => a.localeCompare(b, "hu"));
    const personsById = new Map(allPersons.map(person => [person.id, person]));
    const assignedPersonIds = new Set(roomNames.flatMap(roomName => rooms[roomName]));

    const getPersonLabel = (personId: string) => {
        const person = personsById.get(personId);
        if (person === undefined) {
            return "<ismeretlen>";
        }
        return person.group === undefined || person.group === camp.group
            ? person.name
            : `${person.name} (${person.group})`;
    };

    const availablePersonOptions: ISelectOption[] = allPersons
        .filter(person => !assignedPersonIds.has(person.id))
        .sort((a, b) => a.name.localeCompare(b.name, "hu"))
        .map(person => ({
            value: person.id,
            label: person.group === undefined ? person.name : `${person.name} (${person.group})`,
        }));

    const handleAddMember = async (roomName: string, option: ISelectOption | null) => {
        if (option === null) {
            return;
        }
        const isExistingPerson = personsById.has(option.value);
        let personId = option.value;
        if (!isExistingPerson) {
            // The "Új: ..." option carries the typed name as its value
            const personDocRef = await createPerson({ name: option.value, group: camp.group });
            personId = personDocRef.id;
        }
        const currentMembers = rooms[roomName] ?? [];
        if (!currentMembers.includes(personId)) {
            updateCampRoom(camp, roomName, [...currentMembers, personId]);
        }
    };

    const handleRemoveMember = (roomName: string, personId: string) => {
        const currentMembers = rooms[roomName] ?? [];
        updateCampRoom(camp, roomName, currentMembers.filter(id => id !== personId));
        setMemberMenu(undefined);
    };

    const handleMoveMember = (fromRoomName: string, toRoomName: string, personId: string) => {
        const newRooms = {
            ...rooms,
            [fromRoomName]: (rooms[fromRoomName] ?? []).filter(id => id !== personId),
            [toRoomName]: [...(rooms[toRoomName] ?? []), personId],
        };
        setCampRooms(camp, newRooms);
        setMemberMenu(undefined);
    };

    const handleNewRoomAdd = () => {
        const roomName = newRoomName.trim();
        if (roomName === "") {
            setRoomError("Nem lehet szobát létrehozni üres névvel.");
            return;
        }
        if (rooms[roomName] !== undefined) {
            setRoomError("Már van ilyen nevű szoba.");
            return;
        }
        createRoom(camp, roomName);
        setNewRoomName("");
        setRoomError(undefined);
    };

    const handleDeleteRoomConfirm = () => {
        if (roomToDelete !== undefined) {
            deleteRoom(camp, roomToDelete);
        }
        setRoomToDelete(undefined);
    };

    const handlePersonEditOpen = (personId: string) => {
        const person = personsById.get(personId);
        setMemberMenu(undefined);
        if (person === undefined) {
            return;
        }
        setPersonEdit({
            person,
            name: person.name,
            group: person.group,
            nameError: undefined,
            groupError: undefined,
        });
    };

    const handlePersonEditSubmit = () => {
        if (personEdit === undefined) {
            return;
        }
        const name = personEdit.name.trim();
        if (name === "") {
            setPersonEdit({ ...personEdit, nameError: "A név megadása kötelező." });
            return;
        }
        if (personEdit.group === undefined || personEdit.group === "") {
            setPersonEdit({ ...personEdit, groupError: "A csoport megadása kötelező." });
            return;
        }
        updatePerson(personEdit.person.id, { name, group: personEdit.group });
        setPersonEdit(undefined);
    };

    const handleRenameSubmit = () => {
        const newName = renameValue.trim();
        if (roomToRename === undefined || newName === "" || newName === roomToRename) {
            setRoomToRename(undefined);
            return;
        }
        if (rooms[newName] !== undefined) {
            setRoomError("Már van ilyen nevű szoba.");
            setRoomToRename(undefined);
            return;
        }
        renameRoom(camp, roomToRename, newName);
        setRoomToRename(undefined);
    };

    const renderMemberRow = (roomName: string, personId: string) => (
        <div key={personId} className={css.memberRow}>
            <Typography variant="body2" className={css.memberName}>
                {getPersonLabel(personId)}
            </Typography>
            <IconButton
                size="small"
                aria-label="Műveletek"
                onClick={event => setMemberMenu({ anchorEl: event.currentTarget, roomName, personId })}
            >
                <MoreVertIcon fontSize="small" />
            </IconButton>
        </div>
    );

    const renderRoomCard = (roomName: string) => {
        const memberIds = rooms[roomName] ?? [];
        return (
            <Paper key={roomName} className={css.roomCard} variant="outlined">
                <div className={css.roomCardHeader}>
                    <Typography variant="h6" className={css.roomCardTitle}>
                        {roomName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {memberIds.length}
                    </Typography>
                    <IconButton
                        size="small"
                        aria-label="Szoba műveletek"
                        onClick={event => setRoomMenu({ anchorEl: event.currentTarget, roomName })}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </div>
                <Divider />
                {memberIds.map(personId => renderMemberRow(roomName, personId))}
                <Autocomplete
                    className={css.memberAdd}
                    size="small"
                    options={availablePersonOptions}
                    value={null}
                    blurOnSelect
                    onChange={(_event, value) => handleAddMember(roomName, value)}
                    filterOptions={(options, params) => {
                        const filtered = personAddFilter(options, params);
                        if (params.inputValue.trim() !== "") {
                            filtered.push({
                                value: params.inputValue.trim(),
                                label: `Új: "${params.inputValue.trim()}"`,
                            });
                        }
                        return filtered;
                    }}
                    renderInput={params => (
                        <TextField {...params} placeholder="Gyerek hozzáadása" variant="standard" />
                    )}
                    getOptionLabel={(option: ISelectOption) => option.label}
                />
            </Paper>
        );
    };

    return (
        <div>
            <div className={css.overviewToolbar}>
                <Typography variant="body2" color="text.secondary">
                    {roomNames.length} szoba, {assignedPersonIds.size} gyerek
                </Typography>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ContentPasteIcon />}
                    onClick={() => setIsImportOpen(true)}
                >
                    Beillesztés Excelből
                </Button>
            </div>
            <div className={css.roomsGrid}>
                {roomNames.map(renderRoomCard)}
                <Paper className={css.newRoomCard} variant="outlined">
                    <TextField
                        size="small"
                        variant="standard"
                        label="Új szoba neve"
                        value={newRoomName}
                        error={roomError !== undefined}
                        helperText={roomError}
                        onChange={event => {
                            setNewRoomName(event.target.value);
                            setRoomError(undefined);
                        }}
                        onKeyDown={event => {
                            if (event.key === "Enter") {
                                handleNewRoomAdd();
                            }
                        }}
                    />
                    <Button startIcon={<AddIcon />} size="small" onClick={handleNewRoomAdd}>
                        Új szoba
                    </Button>
                </Paper>
            </div>
            <Menu
                anchorEl={memberMenu?.anchorEl}
                open={memberMenu !== undefined}
                onClose={() => setMemberMenu(undefined)}
            >
                {memberMenu !== undefined && [
                    <MenuItem key="edit" onClick={() => handlePersonEditOpen(memberMenu.personId)}>
                        Adatok szerkesztése
                    </MenuItem>,
                    ...roomNames
                        .filter(roomName => roomName !== memberMenu.roomName)
                        .map(roomName => (
                            <MenuItem
                                key={roomName}
                                onClick={() => handleMoveMember(memberMenu.roomName, roomName, memberMenu.personId)}
                            >
                                Áthelyezés: {roomName}
                            </MenuItem>
                        )),
                    <MenuItem
                        key="remove"
                        onClick={() => handleRemoveMember(memberMenu.roomName, memberMenu.personId)}
                    >
                        Eltávolítás a szobából
                    </MenuItem>,
                ]}
            </Menu>
            <Menu
                anchorEl={roomMenu?.anchorEl}
                open={roomMenu !== undefined}
                onClose={() => setRoomMenu(undefined)}
            >
                <MenuItem
                    onClick={() => {
                        if (roomMenu !== undefined) {
                            setRoomToRename(roomMenu.roomName);
                            setRenameValue(roomMenu.roomName);
                        }
                        setRoomMenu(undefined);
                    }}
                >
                    Átnevezés
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (roomMenu !== undefined) {
                            setRoomToDelete(roomMenu.roomName);
                        }
                        setRoomMenu(undefined);
                    }}
                >
                    Törlés
                </MenuItem>
            </Menu>
            <Dialog open={roomToDelete !== undefined} onClose={() => setRoomToDelete(undefined)}>
                <DialogTitle>Szoba törlése</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {`Biztosan törlöd a(z) "${roomToDelete}" szobát`}
                        {roomToDelete !== undefined && (rooms[roomToDelete] ?? []).length > 0
                            ? ` és a ${(rooms[roomToDelete] ?? []).length} lakójának beosztását`
                            : ""}
                        ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRoomToDelete(undefined)}>Mégse</Button>
                    <Button color="error" onClick={handleDeleteRoomConfirm}>
                        Törlés
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={personEdit !== undefined} onClose={() => setPersonEdit(undefined)} fullWidth maxWidth="xs">
                <DialogTitle>Gyerek szerkesztése</DialogTitle>
                <DialogContent>
                    <div className={css.personEditStack}>
                        <TextField
                            autoFocus
                            variant="filled"
                            label="Név"
                            fullWidth
                            value={personEdit?.name ?? ""}
                            error={personEdit?.nameError !== undefined}
                            helperText={personEdit?.nameError}
                            onChange={event =>
                                setPersonEdit(current =>
                                    current === undefined
                                        ? undefined
                                        : { ...current, name: event.target.value, nameError: undefined },
                                )
                            }
                        />
                        <GroupSelector
                            value={personEdit?.group}
                            error={personEdit?.groupError}
                            onChange={newGroup =>
                                setPersonEdit(current =>
                                    current === undefined
                                        ? undefined
                                        : { ...current, group: newGroup, groupError: undefined },
                                )
                            }
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPersonEdit(undefined)}>Mégse</Button>
                    <Button variant="contained" onClick={handlePersonEditSubmit}>
                        Mentés
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={roomToRename !== undefined} onClose={() => setRoomToRename(undefined)}>
                <DialogTitle>Szoba átnevezése</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        variant="standard"
                        label="Szoba neve"
                        value={renameValue}
                        onChange={event => setRenameValue(event.target.value)}
                        onKeyDown={event => {
                            if (event.key === "Enter") {
                                handleRenameSubmit();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRoomToRename(undefined)}>Mégse</Button>
                    <Button onClick={handleRenameSubmit}>Átnevezés</Button>
                </DialogActions>
            </Dialog>
            <RoomImportDialog camp={camp} open={isImportOpen} onClose={() => setIsImportOpen(false)} />
        </div>
    );
};
