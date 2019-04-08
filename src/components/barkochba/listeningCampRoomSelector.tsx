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

export interface IListeningCampRoomSelectorOwnProps {}

export interface IListeningCampRoomSelectorStateProps {
    allCamps: ISelectOption[];
    selectedCamp: ISelectOption | undefined;
    allRooms: ISelectOption[];
    selectedRoom: ISelectOption | undefined;
    selectedCampData: ICamp | undefined;
}

export interface IListeningCampRoomSelectorDispatchProps {
    setSelectedCamp: (camp: ISelectOption | undefined) => void;
    setSelectedRoom: (camp: ICamp, room: ISelectOption | undefined) => void;
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
                {selectedCamp !== undefined && this.renderRoomSelector()}
            </div>
        );
    }

    private renderCampSelector = () => {
        const { allCamps, selectedCamp } = this.props;
        return (
            <div className="listening-camp-room-selector-camp">
                <AutoCompleteSelector
                    options={allCamps}
                    value={selectedCamp}
                    onChange={this.handleCampChange}
                    placeholder="Válassz tábort"
                    isClearable={true}
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

    private handleCampChange = (value: ValueType<ISelectOption>) => {
        const { setSelectedCamp } = this.props;
        this.handleValueChange(value, setSelectedCamp);
    };

    private handleRoomChange = (value: ValueType<ISelectOption>) => {
        const { setSelectedRoom, selectedCampData } = this.props;
        this.handleValueChange(value, (selectedRoom: ISelectOption | undefined) =>
            selectedCampData === undefined ? undefined : setSelectedRoom(selectedCampData, selectedRoom),
        );
    };

    private handleValueChange = (
        value: ValueType<ISelectOption>,
        setter: (value: ISelectOption | undefined) => void,
    ) => {
        if (value == null) {
            setter(undefined);
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
        selectedCamp: selectCurrentListeningCampRoomCampAsSelectOption(state),
        allRooms: selectCurrentListeningCampRoomNamesAsSelectOptions(state),
        selectedRoom: selectCurrentListeningCampRoomNameAsSelectOption(state),
        selectedCampData: selectCurrentListeningCampRoomCamp(state),
    };
}

function mapDispatchToProps(
    dispatch: Dispatch,
    _ownProps: IListeningCampRoomSelectorOwnProps,
): IListeningCampRoomSelectorDispatchProps {
    return {
        setSelectedCamp: (camp: ISelectOption | undefined) => {
            const currentListeningCampRoom =
                camp === undefined
                    ? { campId: undefined, roomName: undefined }
                    : { campId: camp.value, roomName: undefined };
            dispatch(SetCurrentListeningCampRoom.create({ currentListeningCampRoom }));
        },
        setSelectedRoom: (camp: ICamp, roomOption: ISelectOption | undefined) => {
            const { id: campId, rooms } = camp;
            const { value: roomName } = roomOption === undefined ? { value: undefined } : roomOption;
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
