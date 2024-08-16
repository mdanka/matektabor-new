import { useSelector, useDispatch } from "react-redux";
import { Select, MenuItem, SelectChangeEvent, FormControl, InputLabel } from "@mui/material";
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
        <FormControl className={css.barkochbaSortingSelector} variant="filled">
            <InputLabel id="barkochba-sorting-selector-label">Rendezés</InputLabel>
            <Select
                labelId="barkochba-sorting-selector-label"
                variant="filled"
                className={css.barkochbaSortingSelector}
                value={ordering}
                onChange={handleChange}
            >
                <MenuItem value={"storyNumber"}>Sorszám</MenuItem>
                <MenuItem value={"knowNumber"}>Hányan hallották</MenuItem>
                <MenuItem value={"starNumber"}>Kedvelések száma</MenuItem>
            </Select>
        </FormControl>
    );
}