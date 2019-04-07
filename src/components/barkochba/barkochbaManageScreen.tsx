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
} from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { Typography, TextField, Button, Paper } from "@material-ui/core";
import { getGlobalServices } from "../../services";
import { IPersonApi, ICampApi, ISelectOption, ICamp } from "../../commons";
import { AutoCompleteSelector } from "./autoCompleteSelector";
import { PersonsSelector } from "./personsSelector";
import { ValueType } from "react-select/lib/types";

export interface IBarkochbaManageScreenOwnProps {}

export interface IBarkochbaManageScreenStateProps {
    manageState: IBarkochbaManageState;
    availableCampsAsOptions: ISelectOption[];
    selectedCamp: ICamp | undefined;
    availableRoomsAsOptions: ISelectOption[];
    roomPeopleAsOptions: ISelectOption[];
    allPersonsAsOptions: ISelectOption[];
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
            <Paper className="barkochba-manage-panel">
                <Typography variant="h5">Új gyerek</Typography>
                <TextField
                    value={newPersonName}
                    onChange={this.getTextFieldUpdater("newPersonName")}
                    className="barkochba-manage-input-space"
                    label="Név"
                    placeholder="Tóth János"
                />
                <TextField
                    value={newPersonGroup}
                    onChange={this.getTextFieldUpdater("newPersonGroup")}
                    className="barkochba-manage-input-space"
                    label="Csoport"
                    placeholder="Beluga"
                />
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
            <Paper className="barkochba-manage-panel">
                <Typography variant="h5">Új tábor</Typography>
                <TextField
                    value={newCampGroup}
                    onChange={this.getTextFieldUpdater("newCampGroup")}
                    className="barkochba-manage-input-space"
                    label="Csoport"
                    placeholder="Beluga"
                />
                <TextField
                    value={newCampNumber}
                    onChange={this.getTextFieldUpdater("newCampNumber")}
                    className="barkochba-manage-input-space"
                    label="Szám"
                    placeholder="3"
                    type="number"
                />
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
        const currentCampOption = selectedCamp === undefined ? undefined : campToSelectOption(selectedCamp);
        const currentRoomOption =
            roomsSelectionRoomName === undefined
                ? undefined
                : { value: roomsSelectionRoomName, label: roomsSelectionRoomName };
        return (
            <Paper className="barkochba-manage-panel">
                <Typography variant="h5">Szobabeosztás</Typography>
                <Typography className="barkochba-manage-subtitle" variant="subtitle1">
                    Melyik tábor?
                </Typography>
                <div>
                    <AutoCompleteSelector
                        options={availableCampsAsOptions}
                        value={currentCampOption}
                        onChange={this.handleCampChange}
                        placeholder="Válassz tábort"
                    />
                </div>
                <Typography className="barkochba-manage-subtitle" variant="subtitle1">
                    Melyik szoba?
                </Typography>
                <Typography variant="subtitle2">Új szoba létrehozásához csak gépeld be a szoba nevét.</Typography>
                <div>
                    <AutoCompleteSelector
                        options={availableRoomsAsOptions}
                        value={currentRoomOption}
                        onChange={this.handleRoomChange}
                        placeholder="Válassz szobát"
                        disabled={currentCampOption === undefined}
                        creatable={true}
                        isValidNewOption={(value: string) => value !== ""}
                        onCreateOption={this.handleNewRoomAdd}
                    />
                </div>
                <Typography className="barkochba-manage-subtitle" variant="subtitle1">
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
            </Paper>
        );
    };

    private getTextFieldUpdater = (fieldName: keyof IBarkochbaManageState) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { update } = this.props;
        const value = event.target.value;
        update({ [fieldName]: value });
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
        if (isNaN(newCampNumberParsed)) {
            console.error("A tábor számának - meglepetés - számnak kell lennie.");
            return;
        }
        if (newCampGroup === "" || newCampNumber === "" || newCampNumberParsed < 0) {
            console.error("Nem lehet tábort létrehozni üres névvel vagy számmal, és negatív számmal sem.");
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
        this.handleRoomChange({ value: newRoomName, label: newRoomName });
    };

    private handleCampChange = (value: ValueType<ISelectOption>) => {
        const { update } = this.props;
        const newCampId = value == null ? undefined : (value as ISelectOption).value;
        update({ roomsSelectionCampId: newCampId });
    };

    private handleRoomChange = (value: ValueType<ISelectOption>) => {
        const { update } = this.props;
        const newRoomName = value == null ? undefined : (value as ISelectOption).value;
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
