import * as React from "react";
import { ISelectOption } from "../../commons";
import Select from "react-select";
import { ActionMeta, ValueType } from "react-select/lib/types";
import { Typography, TextField, MenuItem, Chip, Paper, withStyles } from "@material-ui/core";
import CancelIcon from "@material-ui/icons/Cancel";
import { emphasize } from "@material-ui/core/styles/colorManipulator";
import * as classNames from "classnames";

export interface IPersonsSelectorProps {
    classes: any;
    theme: any;
    allPersons: ISelectOption[];
    selectedPersons: ISelectOption[];
    onChange: (values: ISelectOption[], action: ActionMeta) => void;
}

class UnstyledPersonsSelector extends React.Component<IPersonsSelectorProps, {}> {
    public render() {
        const { allPersons, selectedPersons, classes, theme } = this.props;

        const selectStyles = {
            input: (base: any) => ({
                ...base,
                color: theme.palette.text.primary,
                "& input": {
                    font: "inherit",
                },
            }),
        };

        return (
            <Select
                classes={classes}
                styles={selectStyles}
                textFieldProps={{
                    InputLabelProps: {
                        shrink: true,
                    },
                }}
                options={allPersons}
                components={components}
                value={selectedPersons}
                onChange={this.handlePersonsWhoKnowChange}
                placeholder="Keress egy gyerek nevére"
                isMulti
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

export const PersonsSelector = withStyles(styles as any, { withTheme: true })(UnstyledPersonsSelector);
