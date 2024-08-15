import { ISelectOption } from "../../commons";
import Autocomplete from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";
import { ChangeEvent } from "react";

interface IPersonsSelectorProps {
    className?: string;
    allPersons: ISelectOption[];
    selectedPersons: ISelectOption[];
    onChange: (values: ISelectOption[]) => void;
    disabled?: boolean;
}

export function PersonsSelector({
    className,
    allPersons,
    selectedPersons,
    onChange,
    disabled,
}: IPersonsSelectorProps) {
    const handlePersonsWhoKnowChange = (_event: ChangeEvent<unknown>, value: ISelectOption[]) => {
        onChange(value);
    };

    return (
        <Autocomplete
            multiple
            className={className}
            options={allPersons}
            value={selectedPersons}
            onChange={handlePersonsWhoKnowChange}
            disabled={disabled}
            renderInput={(params) => (
                <TextField {...params} placeholder="Keress egy gyerek nevére" variant="standard" />
            )}
            getOptionLabel={(option: ISelectOption) => option.label}
        />
    );
}