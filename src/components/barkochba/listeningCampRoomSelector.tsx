import * as React from "react";
import { ISelectOption, ICamp } from "../../commons";
import {
    IAppState,
    selectCampsAsSelectOptions,
    selectCurrentListeningCampRoomCampAsSelectOption,
    selectCurrentListeningCampRoomNamesAsSelectOptions,
    SetCurrentListeningCampRoom,
    SetCurrentListeningPersonIds,
} from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import {
    selectCurrentListeningCampRoomNameAsSelectOption,
    selectCurrentListeningCampRoomCamp,
} from "../../store/selectors";
import { AutoCompleteSelector } from "./autoCompleteSelector";
import { ValueType } from "react-select/lib/types";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { TextField } from "@material-ui/core";

export interface IListeningCampRoomSelectorOwnProps {}

export interface IListeningCampRoomSelectorStateProps {
    allCamps: ISelectOption[];
    selectedCamp: ISelectOption | null;
    allRooms: ISelectOption[];
    selectedRoom: ISelectOption | null;
    selectedCampData: ICamp | null;
}

export interface IListeningCampRoomSelectorDispatchProps {
    setSelectedCamp: (camp: ISelectOption | null) => void;
    setSelectedRoom: (camp: ICamp, room: ISelectOption | null) => void;
}

export type IListeningCampRoomSelectorProps = IListeningCampRoomSelectorOwnProps &
    IListeningCampRoomSelectorStateProps &
    IListeningCampRoomSelectorDispatchProps;

class UnconnectedListeningCampRoomSelector extends React.Component<IListeningCampRoomSelectorProps, {}> {
    public render() {
        const { selectedCamp } = this.props;
        return (
            <div className="listening-camp-room-selector">
                {this.renderCampSelector()}
                {selectedCamp !== null && this.renderRoomSelector()}
            </div>
        );
    }

    private renderCampSelector = () => {
        const { allCamps, selectedCamp } = this.props;
        return (
            <div className="listening-camp-room-selector-camp">
                <Autocomplete
                    options={allCamps}
                    value={selectedCamp}
                    onChange={this.handleCampChange}
                    placeholder="Válassz tábort"
                    renderInput={(params) => <TextField {...params} label="Tábor" variant="outlined" />}
                    getOptionLabel={(option: ISelectOption) => option.label}
                />
            </div>
        );
    };

    private renderRoomSelector = () => {
        const { allRooms, selectedRoom } = this.props;
        return (
            <div className="listening-camp-room-selector-room">
                <AutoCompleteSelector
                    options={allRooms}
                    value={selectedRoom}
                    onChange={this.handleRoomChange}
                    placeholder="Válassz szobát"
                    isClearable={true}
                />
            </div>
        );
    };

    private handleCampChange = (_event: React.ChangeEvent<{}>, value: unknown) => {
        const { setSelectedCamp } = this.props;
        this.handleValueChange(value as ISelectOption | null, setSelectedCamp);
    };

    private handleRoomChange = (value: ValueType<ISelectOption>) => {
        const { setSelectedRoom, selectedCampData } = this.props;
        this.handleValueChange(value, (selectedRoom: ISelectOption | null) =>
            selectedCampData === null ? null : setSelectedRoom(selectedCampData, selectedRoom),
        );
    };

    private handleValueChange = (
        value: ValueType<ISelectOption>,
        setter: (value: ISelectOption | null) => void,
    ) => {
        if (value == null) {
            setter(null);
            return;
        }
        setter(value as ISelectOption);
    };
}

function mapStateToProps(
    state: IAppState,
    _ownProps: IListeningCampRoomSelectorOwnProps,
): IListeningCampRoomSelectorStateProps {
    return {
        allCamps: selectCampsAsSelectOptions(state),
        selectedCamp: selectCurrentListeningCampRoomCampAsSelectOption(state) ?? null,
        allRooms: selectCurrentListeningCampRoomNamesAsSelectOptions(state),
        selectedRoom: selectCurrentListeningCampRoomNameAsSelectOption(state) ?? null,
        selectedCampData: selectCurrentListeningCampRoomCamp(state) ?? null,
    };
}

function mapDispatchToProps(
    dispatch: Dispatch,
    _ownProps: IListeningCampRoomSelectorOwnProps,
): IListeningCampRoomSelectorDispatchProps {
    return {
        setSelectedCamp: (camp: ISelectOption | null) => {
            const currentListeningCampRoom =
                camp === null
                    ? { campId: undefined, roomName: undefined }
                    : { campId: camp.value, roomName: undefined };
            dispatch(SetCurrentListeningCampRoom.create({ currentListeningCampRoom }));
        },
        setSelectedRoom: (camp: ICamp, roomOption: ISelectOption | null) => {
            const { id: campId, rooms } = camp;
            const { value: roomName } = roomOption === null ? { value: undefined } : roomOption;
            const currentListeningCampRoom = { campId, roomName };
            dispatch(SetCurrentListeningCampRoom.create({ currentListeningCampRoom }));
            if (roomName === undefined) {
                return;
            }
            const currentListeningPersonIds = rooms[roomName];
            if (currentListeningPersonIds === undefined) {
                return;
            }
            dispatch(SetCurrentListeningPersonIds({ currentListeningPersonIds }));
        },
    };
}

export const ListeningCampRoomSelector = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedListeningCampRoomSelector);
