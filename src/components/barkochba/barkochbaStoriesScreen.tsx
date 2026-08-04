import { useSelector } from "react-redux";
import { Typography, Box, Skeleton } from "@mui/material";
import { selectHasAdminRole } from "../../store";
import { StoryManagementPanel } from "./storyManagementPanel";
import css from "./barkochbaManageScreen.module.scss";

export function BarkochbaStoriesScreen() {
    const hasAdminRole = useSelector(selectHasAdminRole);

    if (hasAdminRole === undefined) {
        return (
            <div className={css.barkochbaManageContainer}>
                <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3, width: "100%" }} />
            </div>
        );
    }

    if (!hasAdminRole) {
        return (
            <Box sx={{ padding: 5 }}>
                <Typography variant="h5" align="center">
                    Ez az oldal csak adminoknak érhető el.
                </Typography>
            </Box>
        );
    }

    return (
        <div className={css.barkochbaManageContainer}>
            <StoryManagementPanel />
        </div>
    );
}
