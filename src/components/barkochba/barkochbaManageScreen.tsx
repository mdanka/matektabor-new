import * as React from "react";
import {
    IAppState,
    IBarkochbaManageState,
    selectBarkochbaManageState,
    setBarkochbaManageState,
    selectCampsAsSelectOptions,
    selectCamp,
    campToSelectOption,
    selectGroupsAsSelectOptions,
    stringToSelectOption,
} from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { Typography, TextField, Button, Paper, FormControl, FormHelperText } from "@mui/material";
import { ISelectOption } from "../../commons";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import css from "./barkochbaManageScreen.module.scss";
import { useDataService } from "../../hooks/useDataService";
import { useState } from "react";
import { CampRoomsOverview } from "./campRoomsOverview";

export const BarkochbaManageScreen: React.FC = () => {
    const dispatch = useDispatch();
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const manageState = useSelector(selectBarkochbaManageState);
    const availableCampsAsOptions = useSelector(selectCampsAsSelectOptions);
    const selectedCamp = useSelector((state: IAppState) =>
        manageState.roomsSelectionCampId !== undefined
            ? selectCamp(state, manageState.roomsSelectionCampId)
            : undefined
    );
    const allGroupsAsOptions = useSelector(selectGroupsAsSelectOptions);
    const { createPerson, createCamp } = useDataService();

    const setFieldError = (field: string, message: string) => {
        setValidationErrors(prev => ({ ...prev, [field]: message }));
    };

    const clearFieldError = (field: string) => {
        setValidationErrors(prev => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const update = (fields: Partial<IBarkochbaManageState>) => {
        dispatch(setBarkochbaManageState(fields));
    };

    const getTextFieldUpdater = (fieldName: keyof IBarkochbaManageState) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const value = event.target.value;
        update({ [fieldName]: value });
        clearFieldError(fieldName);
    };

    const getAutoCompleteFieldUpdater = (fieldName: keyof IBarkochbaManageState) => (
        _event: React.ChangeEvent<unknown>,
        value: ISelectOption | null
    ) => {
        const newValue = value ? value.value : undefined;
        update({ [fieldName]: newValue });
        clearFieldError(fieldName);
    };

    const handleNewPersonAdd = () => {
        const { newPersonName, newPersonGroup } = manageState;
        if (!newPersonName) {
            setFieldError("newPersonName", "A név megadása kötelező.");
            return;
        }
        if (!newPersonGroup) {
            setFieldError("newPersonGroup", "A csoport megadása kötelező.");
            return;
        }
        const newPerson = { name: newPersonName, group: newPersonGroup };
        createPerson(newPerson);
        update({ newPersonName: "", newPersonGroup: "" });
    };

    const handleNewCampAdd = () => {
        const { newCampGroup, newCampNumber } = manageState;
        if (!newCampGroup) {
            setFieldError("newCampGroup", "A csoport megadása kötelező.");
            return;
        }
        if (!newCampNumber) {
            setFieldError("newCampNumber", "A sorszám megadása kötelező.");
            return;
        }
        if (isNewCampNumberError(newCampNumber)) {
            setFieldError("newCampNumber", "A tábor számának nem-negatív egész számnak kell lennie.");
            return;
        }
        const newCampNumberParsed = parseInt(newCampNumber);
        const newCamp = { group: newCampGroup, number: newCampNumberParsed, rooms: {} };
        createCamp(newCamp);
        update({ newCampGroup: "", newCampNumber: "" });
    };

    const handleCampChange = (_event: React.ChangeEvent<unknown>, value: ISelectOption | null) => {
        const newCampId = value ? value.value : undefined;
        update({ roomsSelectionCampId: newCampId });
    };

    const isNewCampNumberError = (value: string) => {
        const valueInt = parseInt(value);
        return value !== "" && (isNaN(valueInt) || valueInt < 0 || valueInt.toString() !== value);
    };

    const renderGroupSelector = (fieldName: keyof IBarkochbaManageState, value: string | null) => (
        <FormControl variant="standard" fullWidth error={!!validationErrors[fieldName]}>
            <Autocomplete
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
                    <TextField {...params} label="Csoport" placeholder="Pl. Beluga" variant="filled" error={!!validationErrors[fieldName]} />
                )}
                getOptionLabel={(option: ISelectOption) => option.label}
            />
            <FormHelperText>{validationErrors[fieldName] || "Pl. \"Beluga\""}</FormHelperText>
        </FormControl>
    );

    const renderPersonAdd = () => {
        const { newPersonName, newPersonGroup } = manageState;
        return (
            <Paper className={css.barkochbaManagePanel} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: { xs: 3, sm: 4 } }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Új gyerek</Typography>
                <div className={css.barkochbaManageFormStack}>
                    <FormControl variant="standard" fullWidth error={!!validationErrors.newPersonName}>
                        <TextField
                            variant="filled"
                            value={newPersonName}
                            onChange={getTextFieldUpdater("newPersonName")}
                            placeholder="Tóth János"
                            label="Név"
                            fullWidth
                            error={!!validationErrors.newPersonName}
                            helperText={validationErrors.newPersonName}
                        />
                    </FormControl>
                    {renderGroupSelector("newPersonGroup", newPersonGroup)}
                    <Button variant="contained" color="secondary" onClick={handleNewPersonAdd} sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}>
                        Létrehozás
                    </Button>
                </div>
            </Paper>
        );
    };

    const renderCampAdd = () => {
        const { newCampGroup, newCampNumber } = manageState;
        return (
            <Paper className={css.barkochbaManagePanel} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: { xs: 3, sm: 4 } }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Új tábor</Typography>
                <div className={css.barkochbaManageFormStack}>
                    {renderGroupSelector("newCampGroup", newCampGroup)}
                    <FormControl variant="standard" fullWidth error={!!validationErrors.newCampNumber}>
                        <TextField
                            variant="filled"
                            value={newCampNumber}
                            onChange={getTextFieldUpdater("newCampNumber")}
                            label="Sorszám"
                            placeholder="3"
                            type="number"
                            error={isNewCampNumberError(newCampNumber) || !!validationErrors.newCampNumber}
                            helperText={validationErrors.newCampNumber}
                            fullWidth
                        />
                        {!validationErrors.newCampNumber && (
                            <FormHelperText>Pl. "3", mint a "Beluga/3"-ban</FormHelperText>
                        )}
                    </FormControl>
                    <Button variant="contained" color="secondary" onClick={handleNewCampAdd} sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}>
                        Létrehozás
                    </Button>
                </div>
            </Paper>
        );
    };

    const renderRoomEdit = () => {
        const currentCampOption = selectedCamp ? campToSelectOption(selectedCamp) : null;
        return (
            <Paper className={css.barkochbaManagePanel} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: { xs: 3, sm: 4 } }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Szobabeosztás</Typography>
                <Typography className={css.barkochbaManageSubtitle} variant="subtitle1">
                    Melyik tábor?
                </Typography>
                <Autocomplete
                    options={availableCampsAsOptions}
                    value={currentCampOption}
                    onChange={handleCampChange}
                    renderInput={params => (
                        <TextField {...params} label="Tábor" placeholder="Válassz tábort" variant="filled" />
                    )}
                    getOptionLabel={(option: ISelectOption) => option.label}
                />
                {selectedCamp && <CampRoomsOverview camp={selectedCamp} />}
            </Paper>
        );
    };

    return (
        <div className={css.barkochbaManageContainer}>
            {renderPersonAdd()}
            {renderCampAdd()}
            {renderRoomEdit()}
        </div>
    );
};
