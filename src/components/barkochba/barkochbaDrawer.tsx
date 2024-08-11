import { List, ListItemText, ListItem, Divider, ListItemIcon, Link } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import TableChartIcon from "@mui/icons-material/TableChart";
import { Link as RouterLink } from "react-router-dom";
import { StoryBrowser } from "./storyBrowser";
import { getNavUrl, Page } from "../../utils/navUtils";
import css from "./barkochbaDrawer.module.scss";

const BarkochbaExportLink = (props: any) => (
    <RouterLink to={getNavUrl[Page.BarkochbaExport](undefined)} {...props} />
);

const BarkochbaManageLink = (props: any) => (
    <RouterLink to={getNavUrl[Page.BarkochbaManage]()} {...props} />
);

export function BarkochbaDrawer() {
    return (
        <div className={css.barkochbaDrawer}>
            <div className={css.barkochbaDrawerNavigation}>
                <List>
                    <Link
                        variant="body1"
                        color="inherit"
                        component={BarkochbaExportLink}
                        underline="hover"
                    >
                        <ListItem button className={css.barkochbaDrawerListItem}>
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
                        <ListItem button className={css.barkochbaDrawerListItem}>
                            <ListItemIcon>
                                <EditIcon />
                            </ListItemIcon>
                            <ListItemText primary="Táborok szerkesztése" />
                        </ListItem>
                    </Link>
                </List>
                <Divider />
            </div>
            <div className={css.barkochbaDrawerStoryBrowser}>
                <StoryBrowser />
            </div>
        </div>
    );
}