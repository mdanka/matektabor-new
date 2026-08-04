import { MouseEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import TagIcon from "@mui/icons-material/Tag";
import PersonIcon from "@mui/icons-material/Person";
import StarRateIcon from "@mui/icons-material/StarRate";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { IBarkochbaOrdering } from "../../store/state";
import { selectBarkochbaOrdering } from "../../store/selectors";
import { setBarkochbaOrdering } from "../../store";
import css from "./barkochbaSortingSelector.module.scss";

interface ISortingOption {
    value: IBarkochbaOrdering;
    label: string;
    title: string;
    Icon: typeof TagIcon;
    direction: "asc" | "desc";
}

const SORTING_OPTIONS: ISortingOption[] = [
    {
        value: "storyNumber",
        label: "Sorszám",
        title: "Rendezés sorszám szerint, növekvő sorrendben",
        Icon: TagIcon,
        direction: "asc",
    },
    {
        value: "knowNumber",
        label: "Hallották",
        title: "Rendezés aszerint, hányan hallották, csökkenő sorrendben",
        Icon: PersonIcon,
        direction: "desc",
    },
    {
        value: "starNumber",
        label: "Kedvelés",
        title: "Rendezés a kedvelések száma szerint, csökkenő sorrendben",
        Icon: StarRateIcon,
        direction: "desc",
    },
];

export function BarkochbaSortingSelector() {
    const dispatch = useDispatch();
    const ordering = useSelector(selectBarkochbaOrdering);

    const handleChange = (_event: MouseEvent<HTMLElement>, newOrdering: IBarkochbaOrdering | null) => {
        if (newOrdering === null) {
            return;
        }
        dispatch(setBarkochbaOrdering({ barkochbaOrdering: newOrdering }));
    };

    return (
        <div className={css.barkochbaSortingSelector}>
            <Typography
                component="div"
                variant="caption"
                color="text.secondary"
                className={css.barkochbaSortingSelectorCaption}
            >
                <SwapVertIcon fontSize="inherit" />
                Rendezés
            </Typography>
            <ToggleButtonGroup
                value={ordering}
                exclusive
                onChange={handleChange}
                size="small"
                color="primary"
                fullWidth
                aria-label="Rendezés"
            >
                {SORTING_OPTIONS.map(({ value, label, title, Icon, direction }) => (
                    <ToggleButton
                        key={value}
                        value={value}
                        title={title}
                        aria-label={title}
                        sx={{
                            gap: 0.5,
                            px: 0.5,
                            textTransform: "none",
                            whiteSpace: "nowrap",
                            lineHeight: 1.2,
                            fontSize: "0.75rem",
                        }}
                    >
                        <Icon sx={{ fontSize: 15 }} />
                        {label}
                        {ordering === value &&
                            (direction === "asc" ? (
                                <ArrowUpwardIcon sx={{ fontSize: 12 }} />
                            ) : (
                                <ArrowDownwardIcon sx={{ fontSize: 12 }} />
                            ))}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </div>
    );
}
