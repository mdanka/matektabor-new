import * as React from "react";
import { ISelectOption } from "../../commons";
import { ActionMeta, ValueType } from "react-select/lib/types";
import { AutoCompleteSelector } from "./autoCompleteSelector";

export interface IPersonsSelectorProps {
    className?: string;
    allPersons: ISelectOption[];
    selectedPersons: ISelectOption[];
    onChange: (values: ISelectOption[], action: ActionMeta) => void;
    disabled?: boolean;
}

export class PersonsSelector extends React.Component<IPersonsSelectorProps, {}> {
    public render() {
        const { allPersons, selectedPersons, disabled, className } = this.props;
        return (
            <AutoCompleteSelector
                className={className}
                options={allPersons}
                value={selectedPersons}
                onChange={this.handlePersonsWhoKnowChange}
                placeholder="Keress egy gyerek nevére"
                isMulti
                disabled={disabled}
            />
        );
    }

    private handlePersonsWhoKnowChange = (value: ValueType<ISelectOption>, action: ActionMeta) => {
        const { onChange } = this.props;
        if (value == null) {
            onChange([], action);
            return;
        }
        onChange(value as ISelectOption[], action);
    };
}
