import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { IBarkochbaOrdering } from "../../store/state";
import { selectBarkochbaOrdering } from "../../store/selectors";
import { SetBarkochbaOrdering } from "../../store/actions";
import css from "./barkochbaSortingSelector.module.scss";

export function BarkochbaSortingSelector() {
    const dispatch = useDispatch();
    const ordering = useSelector(selectBarkochbaOrdering);

    const handleChange = (event: SelectChangeEvent<"storyNumber" | "knowNumber" | "starNumber">) => {
        dispatch(SetBarkochbaOrdering.create({ barkochbaOrdering: event.target.value as IBarkochbaOrdering }));
    };

    return (
        <Select
            variant="standard"
            className={css.barkochbaSortingSelector}
            value={ordering}
            onChange={handleChange}
        >
            <MenuItem value={"storyNumber"}>Sorszám</MenuItem>
            <MenuItem value={"knowNumber"}>Hányan hallották</MenuItem>
            <MenuItem value={"starNumber"}>Kedvelések száma</MenuItem>
        </Select>
    );
}