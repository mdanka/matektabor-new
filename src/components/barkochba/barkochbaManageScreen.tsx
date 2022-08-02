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
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { Typography, TextField, Button, Paper, FormControl, InputLabel, FormHelperText } from "@mui/material";
import { getGlobalServices } from "../../services";
import { IPersonApi, ICampApi, ISelectOption, ICamp } from "../../commons";
import { PersonsSelector } from "./personsSelector";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import css from "./barkochbaManageScreen.module.scss";

export interface IBarkochbaManageScreenOwnProps {}

export interface IBarkochbaManageScreenStateProps {
    manageState: IBarkochbaManageState;
    availableCampsAsOptions: ISelectOption[];
    selectedCamp: ICamp | undefined;
    availableRoomsAsOptions: ISelectOption[];
    roomPeopleAsOptions: ISelectOption[];
    allPersonsAsOptions: ISelectOption[];
    allGroupsAsOptions: ISelectOption[];
}

export interface IBarkochbaManageScreenDispatchProps {
    update: (fields: Partial<IBarkochbaManageState>) => void;
}

export type IBarkochbaManageScreenProps = IBarkochbaManageScreenOwnProps &
    IBarkochbaManageScreenStateProps &
    IBarkochbaManageScreenDispatchProps;

class UnconnectedBarkochbaManageScreen extends React.Component<IBarkochbaManageScreenProps, {}> {
    public render() {
        return (
            <div>
                {this.renderPersonAdd()}
                {this.renderCampAdd()}
                {this.renderRoomEdit()}
            </div>
        );
    }

    private renderPersonAdd = () => {
        const { manageState } = this.props;
        const { newPersonName, newPersonGroup } = manageState;
        return (
            <Paper className={css.barkochbaManagePanel} elevation={2}>
                <Typography variant="h5">Új gyerek</Typography>
                <FormControl variant="standard">
                    <InputLabel shrink htmlFor="barkochba-manage-new-person-name">
                        Név
                    </InputLabel>
                    <TextField
                        variant="standard"
                        value={newPersonName}
                        onChange={this.getTextFieldUpdater("newPersonName")}
                        className={css.barkochbaManageInput}
                        placeholder="Tóth János"
                        label="Név"
                        id="barkochba-manage-new-person-name" />
                </FormControl>
                {this.renderGroupSelector("newPersonGroup", newPersonGroup)}
                <Button variant="contained" color="primary" onClick={this.handleNewPersonAdd}>
                    Létrehozás
                </Button>
            </Paper>
        );
    };

    private renderCampAdd = () => {
        const { manageState } = this.props;
        const { newCampGroup, newCampNumber } = manageState;
        return (
            <Paper className={css.barkochbaManagePanel} elevation={2}>
                <Typography variant="h5">Új tábor</Typography>
                {this.renderGroupSelector("newCampGroup", newCampGroup)}
                <FormControl variant="standard">
                    <InputLabel shrink htmlFor="barkochba-manage-new-camp-number">
                        Sorszám
                    </InputLabel>
                    <TextField
                        variant="standard"
                        value={newCampNumber}
                        onChange={this.getTextFieldUpdater("newCampNumber")}
                        className={css.barkochbaManageInput}
                        label="Sorszám"
                        placeholder="3"
                        type="number"
                        error={this.isNewCampNumberError(newCampNumber)}
                        id="barkochba-manage-new-camp-number" />
                    <FormHelperText>Pl. "3", mint a "Beluga/3"-ban</FormHelperText>
                </FormControl>
                <Button variant="contained" color="primary" onClick={this.handleNewCampAdd}>
                    Létrehozás
                </Button>
            </Paper>
        );
    };

    private renderRoomEdit = () => {
        const {
            availableCampsAsOptions,
            availableRoomsAsOptions,
            roomPeopleAsOptions,
            selectedCamp,
            manageState,
            allPersonsAsOptions,
        } = this.props;
        const { roomsSelectionRoomName } = manageState;
        const currentCampOption = selectedCamp === undefined ? null : campToSelectOption(selectedCamp);
        const currentRoomOption =
            roomsSelectionRoomName === undefined
                ? null
                : { value: roomsSelectionRoomName, label: roomsSelectionRoomName };
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
                        onChange={this.handleCampChange}
                        renderInput={params => (
                            <TextField {...params} label="Tábor" placeholder="Válassz tábort" variant="standard" />
                        )}
                        getOptionLabel={(option: ISelectOption) => option.label}
                    />
                </div>
                {currentCampOption !== null && (
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
                                onChange={this.handleRoomChange}
                                disabled={currentCampOption === undefined}
                                filterOptions={(options, params) => {
                                    const filter = createFilterOptions<ISelectOption>();
                                    const filtered = filter(options, params);
                                    // Suggest the creation of a new value
                                    if (params.inputValue !== "") {
                                        filtered.push({
                                            value: params.inputValue,
                                            label: `Új: "${params.inputValue}"`,
                                        });
                                    }
                                    return filtered;
                                }}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        label="Szoba"
                                        placeholder="Válassz szobát"
                                        variant="standard"
                                    />
                                )}
                                getOptionLabel={(option: ISelectOption) => option.label}
                            />
                        </div>
                    </div>
                )}
                {currentCampOption !== null && currentRoomOption !== null && (
                    <div>
                        <Typography className={css.barkochbaManageSubtitle} variant="subtitle1">
                            A szoba lakói
                        </Typography>
                        <div>
                            <PersonsSelector
                                allPersons={allPersonsAsOptions}
                                selectedPersons={roomPeopleAsOptions}
                                onChange={this.handleRoomPersonsChange}
                                disabled={currentCampOption === undefined || currentRoomOption === undefined}
                            />
                        </div>
                    </div>
                )}
            </Paper>
        );
    };

    private renderGroupSelector = (fieldName: keyof IBarkochbaManageState, value: string) => {
        const { allGroupsAsOptions } = this.props;
        return (
            <FormControl variant="standard">
                <InputLabel shrink htmlFor="barkochba-manage-new-person-name">
                    Csoport
                </InputLabel>
                <Autocomplete
                    className={css.barkochbaManageInput}
                    options={allGroupsAsOptions}
                    value={stringToSelectOption(value)}
                    onChange={this.getAutoCompleteFieldUpdater(fieldName)}
                    filterOptions={(options, params) => {
                        const filter = createFilterOptions<ISelectOption>();
                        const filtered = filter(options, params);
                        // Suggest the creation of a new value
                        if (params.inputValue !== "") {
                            filtered.push({
                                value: params.inputValue,
                                label: `Új: "${params.inputValue}"`,
                            });
                        }
                        return filtered;
                    }}
                    renderInput={params => (
                        <TextField {...params} label="Csoport" placeholder="Pl. Beluga" variant="standard" />
                    )}
                    getOptionLabel={(option: ISelectOption) => option.label}
                />
                <FormHelperText>Pl. "Beluga"</FormHelperText>
            </FormControl>
        );
    };

    private getTextFieldUpdater = (fieldName: keyof IBarkochbaManageState) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { update } = this.props;
        const value = event.target.value;
        update({ [fieldName]: value });
    };

    private getAutoCompleteFieldUpdater = (fieldName: keyof IBarkochbaManageState) => (
        _event: React.ChangeEvent<{}>,
        value: ISelectOption | null,
    ) => {
        const { update } = this.props;
        const newValue = value == null ? undefined : (value as ISelectOption).value;
        update({ [fieldName]: newValue });
    };

    private handleNewPersonAdd = () => {
        const { manageState, update } = this.props;
        const { newPersonName, newPersonGroup } = manageState;
        if (newPersonName === "" || newPersonGroup === "") {
            console.error("Nem lehet személyt létrehozni üres névvel vagy csoporttal.");
            return;
        }
        const newPerson: IPersonApi = {
            name: newPersonName,
            group: newPersonGroup,
        };
        const globalServices = getGlobalServices();
        if (globalServices === undefined) {
            return;
        }
        const { dataService } = globalServices;
        dataService.createPerson(newPerson);
        update({ newPersonName: "", newPersonGroup: "" });
    };

    private handleNewCampAdd = () => {
        const { manageState, update } = this.props;
        const { newCampGroup, newCampNumber } = manageState;
        const newCampNumberParsed = parseInt(newCampNumber);
        if (this.isNewCampNumberError(newCampNumber)) {
            console.error("A tábor számának - meglepetés - nem-negatív egész számnak kell lennie.");
            return;
        }
        if (newCampGroup === "" || newCampNumber === "") {
            console.error("Nem lehet tábort létrehozni üres névvel vagy számmal");
            return;
        }
        const newCamp: ICampApi = {
            group: newCampGroup,
            number: newCampNumberParsed,
            rooms: {},
        };
        const globalServices = getGlobalServices();
        if (globalServices === undefined) {
            return;
        }
        const { dataService } = globalServices;
        dataService.createCamp(newCamp);
        update({ newCampGroup: "", newCampNumber: "" });
    };

    private handleNewRoomAdd = (newRoomName: string) => {
        const { selectedCamp } = this.props;
        if (selectedCamp === undefined) {
            console.error("Előbb válassz tábort.");
            return;
        }
        if (newRoomName === "") {
            console.error("Nem lehet szobát létrehozni üres névvel.");
            return;
        }
        const globalServices = getGlobalServices();
        if (globalServices === undefined) {
            return;
        }
        const { dataService } = globalServices;
        dataService.createRoom(selectedCamp, newRoomName);
    };

    private handleCampChange = (_event: React.ChangeEvent<{}>, value: ISelectOption | null) => {
        const { update } = this.props;
        const newCampId = value == null ? undefined : value.value;
        update({ roomsSelectionCampId: newCampId });
    };

    private handleRoomChange = (_event: React.ChangeEvent<{}>, value: ISelectOption | null) => {
        const { availableRoomsAsOptions } = this.props;
        if (value !== null && !availableRoomsAsOptions.includes(value)) {
            this.handleNewRoomAdd(value.value);
        }
        const { update } = this.props;
        const newRoomName = value == null ? undefined : value.value;
        update({ roomsSelectionRoomName: newRoomName });
    };

    private handleRoomPersonsChange = (values: ISelectOption[]) => {
        const { manageState, selectedCamp } = this.props;
        const { roomsSelectionRoomName } = manageState;
        if (selectedCamp === undefined || roomsSelectionRoomName === undefined) {
            return;
        }
        const peopleIds = values.map(value => value.value);
        const globalServices = getGlobalServices();
        if (globalServices === undefined) {
            return;
        }
        const { dataService } = globalServices;
        dataService.updateCampRoom(selectedCamp, roomsSelectionRoomName, peopleIds);
    };

    private isNewCampNumberError = (value: string) => {
        const valueInt = parseInt(value);
        return value !== "" && (isNaN(valueInt) || valueInt < 0 || valueInt.toString() !== value);
    };
}

function mapStateToProps(
    state: IAppState,
    _ownProps: IBarkochbaManageScreenOwnProps,
): IBarkochbaManageScreenStateProps {
    const manageState = selectBarkochbaManageState(state);
    const { roomsSelectionCampId, roomsSelectionRoomName } = manageState;
    return {
        manageState,
        availableCampsAsOptions: selectCampsAsSelectOptions(state),
        selectedCamp: roomsSelectionCampId === undefined ? undefined : selectCamp(state, roomsSelectionCampId),
        availableRoomsAsOptions:
            roomsSelectionCampId === undefined ? [] : selectCampRoomsAsOptions(state, roomsSelectionCampId),
        roomPeopleAsOptions:
            roomsSelectionCampId === undefined
                ? []
                : selectCampRoomPeopleAsOptions(state, roomsSelectionCampId, roomsSelectionRoomName),
        allPersonsAsOptions: selectPersonsAsSelectOptions(state),
        allGroupsAsOptions: selectGroupsAsSelectOptions(state),
    };
}

function mapDispatchToProps(
    dispatch: Dispatch,
    _ownProps: IBarkochbaManageScreenOwnProps,
): IBarkochbaManageScreenDispatchProps {
    return {
        update: (fields: Partial<IBarkochbaManageState>) => {
            dispatch(SetBarkochbaManageState.create(fields));
        },
    };
}

export const BarkochbaManageScreen = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedBarkochbaManageScreen);
