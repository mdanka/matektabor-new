import * as React from "react";
import { ISelectOption } from "../../commons";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { TextField } from "@material-ui/core";

export interface IPersonsSelectorProps {
    className?: string;
    allPersons: ISelectOption[];
    selectedPersons: ISelectOption[];
    onChange: (values: ISelectOption[]) => void;
    disabled?: boolean;
}

export class PersonsSelector extends React.Component<IPersonsSelectorProps, {}> {
    public render() {
        const { allPersons, selectedPersons, disabled, className } = this.props;
        return (
            <Autocomplete
                multiple
                className={className}
                options={allPersons}
                value={selectedPersons}
                onChange={this.handlePersonsWhoKnowChange}
                disabled={disabled}
                renderInput={params => (
                    <TextField {...params} placeholder="Keress egy gyerek nevére" variant="standard" />
                )}
                getOptionLabel={(option: ISelectOption) => option.label}
            />
        );
    }

    private handlePersonsWhoKnowChange = (_event: React.ChangeEvent<{}>, value: ISelectOption[]) => {
        this.props.onChange(value);
    };
}
