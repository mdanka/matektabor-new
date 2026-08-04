import * as React from "react";
import {
    IAppState,
    selectBarkochbaManageState,
    setBarkochbaManageState,
    selectCampsAsSelectOptions,
    selectCamp,
    campToSelectOption,
} from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { Typography, TextField, IconButton, Paper, Tooltip } from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import EditIcon from "@mui/icons-material/Edit";
import { ISelectOption } from "../../commons";
import css from "./barkochbaManageScreen.module.scss";
import { useDataService } from "../../hooks/useDataService";
import { useState } from "react";
import { CampRoomsOverview } from "./campRoomsOverview";
import { CampEditDialog } from "./campEditDialog";

interface ICampOption extends ISelectOption {
    /** Set on the creatable "Új tábor" option: the raw text the user typed. */
    inputValue?: string;
}

const campFilter = createFilterOptions<ICampOption>();

/** Splits input like "Beluga/3" into the group and number fields of a new camp. */
const parseNewCampInput = (input: string): { group: string; campNumber: string } => {
    const separatorIndex = input.lastIndexOf("/");
    if (separatorIndex === -1) {
        return { group: input.trim(), campNumber: "" };
    }
    return {
        group: input.slice(0, separatorIndex).trim(),
        campNumber: input.slice(separatorIndex + 1).trim(),
    };
};

export const BarkochbaManageScreen: React.FC = () => {
    const dispatch = useDispatch();

    const manageState = useSelector(selectBarkochbaManageState);
    const availableCampsAsOptions = useSelector(selectCampsAsSelectOptions);
    const selectedCamp = useSelector((state: IAppState) =>
        manageState.roomsSelectionCampId !== undefined
            ? selectCamp(state, manageState.roomsSelectionCampId)
            : undefined
    );
    const { createCamp, updateCamp } = useDataService();

    const [campDialog, setCampDialog] = useState<
        { mode: "create" | "edit"; group: string | undefined; campNumber: string } | undefined
    >(undefined);

    const selectCampId = (campId: string | undefined) => {
        dispatch(setBarkochbaManageState({ roomsSelectionCampId: campId }));
    };

    const handleCampChange = (_event: React.ChangeEvent<unknown>, value: ICampOption | null) => {
        if (value !== null && value.inputValue !== undefined) {
            const { group, campNumber } = parseNewCampInput(value.inputValue);
            setCampDialog({ mode: "create", group: group === "" ? undefined : group, campNumber });
            return;
        }
        selectCampId(value === null ? undefined : value.value);
    };

    const handleCampDialogSubmit = async (group: string, campNumber: number) => {
        if (campDialog?.mode === "edit" && selectedCamp !== undefined) {
            updateCamp(selectedCamp.id, { group, number: campNumber });
        } else {
            const campDocRef = await createCamp({ group, number: campNumber, rooms: {} });
            selectCampId(campDocRef.id);
        }
        setCampDialog(undefined);
    };

    const currentCampOption = selectedCamp ? campToSelectOption(selectedCamp) : null;

    return (
        <div className={css.barkochbaManageContainer}>
            <Paper className={css.barkochbaManagePanel} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: { xs: 3, sm: 4 } }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Szobabeosztás</Typography>
                <Typography className={css.barkochbaManageSubtitle} variant="subtitle1">
                    Melyik tábor?
                </Typography>
                <div className={css.barkochbaManageCampRow}>
                    <Autocomplete
                        sx={{ flex: 1, minWidth: 0 }}
                        options={availableCampsAsOptions as ICampOption[]}
                        value={currentCampOption}
                        onChange={handleCampChange}
                        filterOptions={(options, params) => {
                            const filtered = campFilter(options, params);
                            const inputValue = params.inputValue.trim();
                            if (inputValue !== "") {
                                filtered.push({
                                    value: "",
                                    label: `Új tábor: "${inputValue}"`,
                                    inputValue,
                                });
                            }
                            return filtered;
                        }}
                        renderInput={params => (
                            <TextField {...params} label="Tábor" placeholder="Válassz vagy hozz létre tábort" variant="filled" />
                        )}
                        getOptionLabel={(option: ICampOption) => option.label}
                    />
                    {selectedCamp && (
                        <Tooltip title="Tábor adatainak szerkesztése">
                            <IconButton
                                aria-label="Tábor szerkesztése"
                                onClick={() =>
                                    setCampDialog({
                                        mode: "edit",
                                        group: selectedCamp.group,
                                        campNumber: selectedCamp.number.toString(),
                                    })
                                }
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </div>
                {selectedCamp && <CampRoomsOverview camp={selectedCamp} />}
            </Paper>
            {campDialog !== undefined && (
                <CampEditDialog
                    title={campDialog.mode === "edit" ? "Tábor szerkesztése" : "Új tábor"}
                    submitLabel={campDialog.mode === "edit" ? "Mentés" : "Létrehozás"}
                    initialGroup={campDialog.group}
                    initialNumber={campDialog.campNumber}
                    onClose={() => setCampDialog(undefined)}
                    onSubmit={handleCampDialogSubmit}
                />
            )}
        </div>
    );
};
