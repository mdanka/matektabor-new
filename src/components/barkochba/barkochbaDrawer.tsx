import { List, ListItemText, ListItem, Divider, ListItemIcon, Link, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import TableChartIcon from "@mui/icons-material/TableChart";
import { Link as RouterLink } from "react-router-dom";
import { StoryBrowser } from "./storyBrowser";
import { getNavUrl, Page } from "../../utils/navUtils";

const BarkochbaExportLink = (props: object) => (
    <RouterLink to={getNavUrl[Page.BarkochbaExport](undefined)} {...props} />
);

const BarkochbaManageLink = (props: object) => (
    <RouterLink to={getNavUrl[Page.BarkochbaManage]()} {...props} />
);

export function BarkochbaDrawer() {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "100vh" }}>
            <Box sx={{width: 1, flexShrink: 0 }}>
                <List>
                    <Link
                        variant="body1"
                        color="inherit"
                        component={BarkochbaExportLink}
                        underline="hover"
                    >
                        <ListItem button sx={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                            <ListItemIcon>
                                <TableChartIcon />
                            </ListItemIcon>
                            <ListItemText primary="Áttekintő táblázatok" />
                        </ListItem>
                    </Link>
                    <Link
                        variant="body1"
                        color="inherit"
                        component={BarkochbaManageLink}
                        underline="hover"
                    >
                        <ListItem button sx={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                            <ListItemIcon>
                                <EditIcon />
                            </ListItemIcon>
                            <ListItemText primary="Táborok szerkesztése" />
                        </ListItem>
                    </Link>
                </List>
                <Divider />
            </Box>
            <Box sx={{flexGrow: 1, width: 1, overflowX: "hidden", overflowY: "auto" }}>
                <StoryBrowser />
            </Box>
        </Box>
    );
}