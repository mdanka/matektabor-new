import * as React from "react";
import { useSelector } from "react-redux";
import { TextField, FormControl, FormHelperText } from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { ISelectOption } from "../../commons";
import { selectGroupsAsSelectOptions, stringToSelectOption } from "../../store";

const groupFilter = createFilterOptions<ISelectOption>();

interface IGroupSelectorProps {
    value: string | undefined;
    error?: string | undefined;
    onChange: (value: string | undefined) => void;
}

export const GroupSelector: React.FC<IGroupSelectorProps> = ({ value, error, onChange }) => {
    const allGroupsAsOptions = useSelector(selectGroupsAsSelectOptions);
    return (
        <FormControl variant="standard" fullWidth error={error !== undefined}>
            <Autocomplete
                options={allGroupsAsOptions}
                value={value === undefined || value === "" ? null : stringToSelectOption(value)}
                onChange={(_event, newValue) => onChange(newValue === null ? undefined : newValue.value)}
                filterOptions={(options, params) => {
                    const filtered = groupFilter(options, params);
                    const inputValue = params.inputValue.trim();
                    if (inputValue !== "") {
                        filtered.push({ value: inputValue, label: `Új: "${inputValue}"` });
                    }
                    return filtered;
                }}
                renderInput={params => (
                    <TextField
                        {...params}
                        label="Csoport"
                        placeholder="Pl. Beluga"
                        variant="filled"
                        error={error !== undefined}
                    />
                )}
                getOptionLabel={(option: ISelectOption) => option.label}
            />
            <FormHelperText>{error ?? "Pl. \"Beluga\""}</FormHelperText>
        </FormControl>
    );
};
