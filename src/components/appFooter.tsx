import { Box, Link } from "@mui/material";
import { CONTACT_HREF } from "../utils";
import { lighten } from "@mui/material/styles";

export function AppFooter() {
    return (
        <Box component="footer" sx={(theme) => ({
            height: "80px",
            color: "text.primary",
            backgroundColor: lighten(theme.palette.primary.main, 0.5),
            padding: "10px 20px 10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderTop: "1px solid",
            borderColor: theme.palette.divider,
        })}>
            <Box sx={{ display: "inline-block" }}>
                <Link href={CONTACT_HREF} underline="hover" color="inherit">
                    Kérdésed van? Írj emailt!
                </Link>
            </Box>
        </Box>
    );
}
