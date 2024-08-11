import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    selectCampsAsSelectOptions,
    selectCurrentListeningCampRoomCampAsSelectOption,
    selectCurrentListeningCampRoomNamesAsSelectOptions,
    SetCurrentListeningCampRoom,
    SetCurrentListeningPersonIds,
} from "../../store";
import {
    selectCurrentListeningCampRoomNameAsSelectOption,
    selectCurrentListeningCampRoomCamp,
} from "../../store/selectors";
import Autocomplete from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";
import css from "./listeningCampRoomSelector.module.scss";
import { ISelectOption } from "../../commons";

export function ListeningCampRoomSelector() {
    const dispatch = useDispatch();

    const allCamps = useSelector(selectCampsAsSelectOptions);
    const selectedCamp = useSelector(selectCurrentListeningCampRoomCampAsSelectOption) ?? null;
    const allRooms = useSelector(selectCurrentListeningCampRoomNamesAsSelectOptions);
    const selectedRoom = useSelector(selectCurrentListeningCampRoomNameAsSelectOption) ?? null;
    const selectedCampData = useSelector(selectCurrentListeningCampRoomCamp) ?? null;

    const handleCampChange = (_event: React.ChangeEvent<{}>, value: ISelectOption | null) => {
        const currentListeningCampRoom =
            value === null
                ? { campId: undefined, roomName: undefined }
                : { campId: value.value, roomName: undefined };
        dispatch(SetCurrentListeningCampRoom.create({ currentListeningCampRoom }));
    };

    const handleRoomChange = (_event: React.ChangeEvent<{}>, value: ISelectOption | null) => {
        if (!selectedCampData) return;

        const { id: campId, rooms } = selectedCampData;
        const roomName = value ? value.value : undefined;
        const currentListeningCampRoom = { campId, roomName };
        dispatch(SetCurrentListeningCampRoom.create({ currentListeningCampRoom }));

        if (roomName) {
            const currentListeningPersonIds = rooms[roomName];
            if (currentListeningPersonIds) {
                dispatch(SetCurrentListeningPersonIds.create({ currentListeningPersonIds }));
            }
        }
    };

    return (
        <div className={css.listeningCampRoomSelector}>
            <div className={css.listeningCampRoomSelectorCamp}>
                <Autocomplete
                    options={allCamps}
                    value={selectedCamp}
                    onChange={handleCampChange}
                    renderInput={(params) => <TextField {...params} placeholder="Válassz tábort" variant="standard" />}
                    getOptionLabel={(option: ISelectOption) => option.label}
                />
            </div>
            {selectedCamp && (
                <div className={css.listeningCampRoomSelectorRoom}>
                    <Autocomplete
                        options={allRooms}
                        value={selectedRoom}
                        onChange={handleRoomChange}
                        renderInput={(params) => <TextField {...params} placeholder="Válassz szobát" variant="standard" />}
                        getOptionLabel={(option: ISelectOption) => option.label}
                    />
                </div>
            )}
        </div>
    );
}