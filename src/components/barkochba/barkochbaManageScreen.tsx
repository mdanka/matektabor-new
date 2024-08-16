import * as React from "react";
import {
    IAppState,
    IBarkochbaManageState,
    selectBarkochbaManageState,
    SetBarkochbaManageState,
    selectCampsAsSelectOptions,
    selectCamp,
    selectCampRoomPeopleAsOptions,
    selectCampRoomsAsOptions,
    campToSelectOption,
    selectPersonsAsSelectOptions,
    selectGroupsAsSelectOptions,
    stringToSelectOption,
} from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { Typography, TextField, Button, Paper, FormControl, FormHelperText } from "@mui/material";
import { ISelectOption } from "../../commons";
import { PersonsSelector } from "./personsSelector";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import css from "./barkochbaManageScreen.module.scss";
import { useDataService } from "../../hooks/useDataService";

export const BarkochbaManageScreen: React.FC = () => {
    const dispatch = useDispatch();

    const manageState = useSelector(selectBarkochbaManageState);
    const availableCampsAsOptions = useSelector(selectCampsAsSelectOptions);
    const selectedCamp = useSelector((state: IAppState) =>
        manageState.roomsSelectionCampId !== undefined
            ? selectCamp(state, manageState.roomsSelectionCampId)
            : undefined
    );
    const availableRoomsAsOptions = useSelector((state: IAppState) =>
        manageState.roomsSelectionCampId !== undefined
            ? selectCampRoomsAsOptions(state, manageState.roomsSelectionCampId)
            : []
    );
    const roomPeopleAsOptions = useSelector((state: IAppState) =>
        manageState.roomsSelectionCampId !== undefined && manageState.roomsSelectionRoomName !== undefined
            ? selectCampRoomPeopleAsOptions(
                state,
                manageState.roomsSelectionCampId,
                manageState.roomsSelectionRoomName
            )
            : []
    );
    const allPersonsAsOptions = useSelector(selectPersonsAsSelectOptions);
    const allGroupsAsOptions = useSelector(selectGroupsAsSelectOptions);
    const { createPerson, createCamp, createRoom, updateCampRoom } = useDataService();

    const update = (fields: Partial<IBarkochbaManageState>) => {
        dispatch(SetBarkochbaManageState.create(fields));
    };

    const getTextFieldUpdater = (fieldName: keyof IBarkochbaManageState) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const value = event.target.value;
        update({ [fieldName]: value });
    };

    const getAutoCompleteFieldUpdater = (fieldName: keyof IBarkochbaManageState) => (
        _event: React.ChangeEvent<unknown>,
        value: ISelectOption | null
    ) => {
        const newValue = value ? value.value : undefined;
        update({ [fieldName]: newValue });
    };

    const handleNewPersonAdd = () => {
        const { newPersonName, newPersonGroup } = manageState;
        if (!newPersonName || !newPersonGroup) {
            console.error("Nem lehet személyt létrehozni üres névvel vagy csoporttal.");
            return;
        }
        const newPerson = { name: newPersonName, group: newPersonGroup };
        createPerson(newPerson);
        update({ newPersonName: "", newPersonGroup: "" });
    };

    const handleNewCampAdd = () => {
        const { newCampGroup, newCampNumber } = manageState;
        const newCampNumberParsed = parseInt(newCampNumber);
        if (isNewCampNumberError(newCampNumber)) {
            console.error("A tábor számának - meglepetés - nem-negatív egész számnak kell lennie.");
            return;
        }
        if (!newCampGroup || !newCampNumber) {
            console.error("Nem lehet tábort létrehozni üres névvel vagy számmal");
            return;
        }
        const newCamp = { group: newCampGroup, number: newCampNumberParsed, rooms: {} };
        createCamp(newCamp);
        update({ newCampGroup: "", newCampNumber: "" });
    };

    const handleNewRoomAdd = (newRoomName: string) => {
        if (!selectedCamp) {
            console.error("Előbb válassz tábort.");
            return;
        }
        if (!newRoomName) {
            console.error("Nem lehet szobát létrehozni üres névvel.");
            return;
        }
        createRoom(selectedCamp, newRoomName);
    };

    const handleCampChange = (_event: React.ChangeEvent<unknown>, value: ISelectOption | null) => {
        const newCampId = value ? value.value : undefined;
        update({ roomsSelectionCampId: newCampId });
    };

    const handleRoomChange = (_event: React.ChangeEvent<unknown>, value: ISelectOption | null) => {
        if (value && !availableRoomsAsOptions.includes(value)) {
            handleNewRoomAdd(value.value);
        }
        const newRoomName = value ? value.value : undefined;
        update({ roomsSelectionRoomName: newRoomName });
    };

    const handleRoomPersonsChange = (values: ISelectOption[]) => {
        if (!selectedCamp || !manageState.roomsSelectionRoomName) {
            return;
        }
        const peopleIds = values.map(value => value.value);
        updateCampRoom(selectedCamp, manageState.roomsSelectionRoomName, peopleIds);
    };

    const isNewCampNumberError = (value: string) => {
        const valueInt = parseInt(value);
        return value !== "" && (isNaN(valueInt) || valueInt < 0 || valueInt.toString() !== value);
    };

    const renderGroupSelector = (fieldName: keyof IBarkochbaManageState, value: string | null) => (
        <FormControl variant="standard">
            <Autocomplete
                className={css.barkochbaManageInput}
                options={allGroupsAsOptions}
                value={value == null ? null : stringToSelectOption(value)}
                onChange={getAutoCompleteFieldUpdater(fieldName)}
                filterOptions={(options, params) => {
                    const filter = createFilterOptions<ISelectOption>();
                    const filtered = filter(options, params);
                    if (params.inputValue) {
                        filtered.push({ value: params.inputValue, label: `Új: "${params.inputValue}"` });
                    }
                    return filtered;
                }}
                renderInput={params => (
                    <TextField {...params} label="Csoport" placeholder="Pl. Beluga" variant="filled" />
                )}
                getOptionLabel={(option: ISelectOption) => option.label}
            />
            <FormHelperText>Pl. "Beluga"</FormHelperText>
        </FormControl>
    );

    const renderPersonAdd = () => {
        const { newPersonName, newPersonGroup } = manageState;
        return (
            <Paper className={css.barkochbaManagePanel} elevation={2}>
                <Typography variant="h5">Új gyerek</Typography>
                <FormControl variant="standard">
                    <TextField
                        variant="filled"
                        value={newPersonName}
                        onChange={getTextFieldUpdater("newPersonName")}
                        className={css.barkochbaManageInput}
                        placeholder="Tóth János"
                        label="Név"
                    />
                </FormControl>
                {renderGroupSelector("newPersonGroup", newPersonGroup)}
                <Button variant="contained" color="primary" onClick={handleNewPersonAdd}>
                    Létrehozás
                </Button>
            </Paper>
        );
    };

    const renderCampAdd = () => {
        const { newCampGroup, newCampNumber } = manageState;
        return (
            <Paper className={css.barkochbaManagePanel} elevation={2}>
                <Typography variant="h5">Új tábor</Typography>
                {renderGroupSelector("newCampGroup", newCampGroup)}
                <FormControl variant="standard">
                    <TextField
                        variant="filled"
                        value={newCampNumber}
                        onChange={getTextFieldUpdater("newCampNumber")}
                        className={css.barkochbaManageInput}
                        label="Sorszám"
                        placeholder="3"
                        type="number"
                        error={isNewCampNumberError(newCampNumber)}
                    />
                    <FormHelperText>Pl. "3", mint a "Beluga/3"-ban</FormHelperText>
                </FormControl>
                <Button variant="contained" color="primary" onClick={handleNewCampAdd}>
                    Létrehozás
                </Button>
            </Paper>
        );
    };

    const renderRoomEdit = () => {
        const { roomsSelectionRoomName } = manageState;
        const currentCampOption = selectedCamp ? campToSelectOption(selectedCamp) : null;
        const currentRoomOption = roomsSelectionRoomName ? { value: roomsSelectionRoomName, label: roomsSelectionRoomName } : null;
        return (
            <Paper className={css.barkochbaManagePanel} elevation={2}>
                <Typography variant="h5">Szobabeosztás</Typography>
                <Typography className={css.barkochbaManageSubtitle} variant="subtitle1">
                    Melyik tábor?
                </Typography>
                <div>
                    <Autocomplete
                        options={availableCampsAsOptions}
                        value={currentCampOption}
                        onChange={handleCampChange}
                        renderInput={params => (
                            <TextField {...params} label="Tábor" placeholder="Válassz tábort" variant="filled" />
                        )}
                        getOptionLabel={(option: ISelectOption) => option.label}
                    />
                </div>
                {currentCampOption && (
                    <div>
                        <Typography className={css.barkochbaManageSubtitle} variant="subtitle1">
                            Melyik szoba?
                        </Typography>
                        <Typography variant="subtitle2">
                            Új szoba létrehozásához csak gépeld be a szoba nevét.
                        </Typography>
                        <div>
                            <Autocomplete
                                options={availableRoomsAsOptions}
                                value={currentRoomOption}
                                onChange={handleRoomChange}
                                filterOptions={(options, params) => {
                                    const filter = createFilterOptions<ISelectOption>();
                                    const filtered = filter(options, params);
                                    if (params.inputValue) {
                                        filtered.push({ value: params.inputValue, label: `Új: "${params.inputValue}"` });
                                    }
                                    return filtered;
                                }}
                                renderInput={params => (
                                    <TextField {...params} label="Szoba" placeholder="Válassz szobát" variant="filled" />
                                )}
                                getOptionLabel={(option: ISelectOption) => option.label}
                            />
                        </div>
                    </div>
                )}
                {currentCampOption && currentRoomOption && (
                    <div>
                        <Typography className={css.barkochbaManageSubtitle} variant="subtitle1">
                            A szoba lakói
                        </Typography>
                        <div>
                            <PersonsSelector
                                allPersons={allPersonsAsOptions}
                                selectedPersons={roomPeopleAsOptions}
                                onChange={handleRoomPersonsChange}
                            />
                        </div>
                    </div>
                )}
            </Paper>
        );
    };
    
    return (
        <div>
            {renderPersonAdd()}
            {renderCampAdd()}
            {renderRoomEdit()}
        </div>
    );
};
