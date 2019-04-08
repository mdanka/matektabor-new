import * as React from "react";
import { ISelectOption } from "../../commons";
import Select from "react-select";
import CreatableSelect from "react-select/lib/Creatable";
import { ActionMeta, ValueType } from "react-select/lib/types";
import { Typography, TextField, MenuItem, Chip, Paper, withStyles } from "@material-ui/core";
import CancelIcon from "@material-ui/icons/Cancel";
import { emphasize } from "@material-ui/core/styles/colorManipulator";
import * as classNames from "classnames";

export interface IAutoCompleteSelectorProps {
    classes: any;
    theme: any;
    onChange?: (value: ValueType<ISelectOption>, action: ActionMeta) => void;
    className?: string;
    placeholder?: string;
    isMulti?: boolean;
    value?: ValueType<ISelectOption>;
    options?: ISelectOption[];
    disabled?: boolean;
    creatable?: boolean;
    isClearable?: boolean;
    label?: string;
    isValidNewOption?: (inputValue: string) => boolean;
    onCreateOption?: (inputValue: string) => void;
}

class UnstyledAutoCompleteSelector extends React.Component<IAutoCompleteSelectorProps, {}> {
    public render() {
        const {
            className,
            creatable,
            disabled,
            isValidNewOption,
            onCreateOption,
            placeholder,
            isMulti,
            onChange,
            value,
            options,
            classes,
            theme,
            isClearable,
            label,
        } = this.props;

        const selectStyles = {
            input: (base: any) => ({
                ...base,
                color: theme.palette.text.primary,
                "& input": {
                    font: "inherit",
                },
            }),
        };

        return creatable ? (
            <CreatableSelect
                className={className}
                classes={classes}
                styles={selectStyles}
                textFieldProps={{
                    InputLabelProps: {
                        shrink: true,
                    },
                    label,
                    disabled,
                }}
                options={options}
                components={components}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                isMulti={isMulti}
                isDisabled={disabled}
                isValidNewOption={isValidNewOption}
                isClearable={isClearable}
                onCreateOption={onCreateOption}
            />
        ) : (
            <Select
                className={className}
                classes={classes}
                styles={selectStyles}
                textFieldProps={{
                    InputLabelProps: {
                        shrink: true,
                    },
                    label,
                    disabled,
                }}
                options={options}
                components={components}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                isMulti={isMulti}
                isDisabled={disabled}
                isClearable={isClearable}
            />
        );
    }
}

const styles = (theme: any) => ({
    root: {
        flexGrow: 1,
        height: 250,
    },
    input: {
        display: "flex",
        padding: 0,
    },
    valueContainer: {
        display: "flex",
        flexWrap: "wrap",
        flex: 1,
        alignItems: "center",
        overflow: "hidden",
    },
    chip: {
        margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
    },
    chipFocused: {
        backgroundColor: emphasize(
            theme.palette.type === "light" ? theme.palette.grey[300] : theme.palette.grey[700],
            0.08,
        ),
    },
    noOptionsMessage: {
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    },
    singleValue: {
        fontSize: 16,
    },
    placeholder: {
        position: "absolute",
        left: 2,
        fontSize: 16,
    },
    paper: {
        position: "absolute",
        zIndex: 1,
        marginTop: theme.spacing.unit,
        left: 0,
        right: 0,
    },
    divider: {
        height: theme.spacing.unit * 2,
    },
});

function NoOptionsMessage(props: any) {
    return (
        <Typography color="textSecondary" className={props.selectProps.classes.noOptionsMessage} {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function inputComponent({ inputRef, ...props }: any) {
    return <div ref={inputRef} {...props} />;
}

function Control(props: any) {
    return (
        <TextField
            fullWidth
            InputProps={{
                inputComponent,
                inputProps: {
                    className: props.selectProps.classes.input,
                    inputRef: props.innerRef,
                    children: props.children,
                    ...props.innerProps,
                },
            }}
            {...props.selectProps.textFieldProps}
        />
    );
}

function Option(props: any) {
    return (
        <MenuItem
            buttonRef={props.innerRef}
            selected={props.isFocused}
            component="div"
            style={{
                fontWeight: props.isSelected ? 500 : 400,
            }}
            {...props.innerProps}
        >
            {props.children}
        </MenuItem>
    );
}

function Placeholder(props: any) {
    return (
        <Typography color="textSecondary" className={props.selectProps.classes.placeholder} {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function SingleValue(props: any) {
    return (
        <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function ValueContainer(props: any) {
    return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

function MultiValue(props: any) {
    return (
        <Chip
            tabIndex={-1}
            label={props.children}
            className={classNames(props.selectProps.classes.chip, {
                [props.selectProps.classes.chipFocused]: props.isFocused,
            })}
            onDelete={props.removeProps.onClick}
            deleteIcon={<CancelIcon {...props.removeProps} />}
        />
    );
}

function Menu(props: any) {
    return (
        <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
            {props.children}
        </Paper>
    );
}

const components = {
    Control,
    Menu,
    MultiValue,
    NoOptionsMessage,
    Option,
    Placeholder,
    SingleValue,
    ValueContainer,
};

export const AutoCompleteSelector = withStyles(styles as any, { withTheme: true })(UnstyledAutoCompleteSelector);
