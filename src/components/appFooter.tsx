import { Box } from "@mui/material";
import { CONTACT_HREF } from "../utils";
import { lighten } from "@mui/material/styles";

export function AppFooter() {
    return (
        <Box sx={(theme) => ({
            height: "80px",
            color: "black",
            backgroundColor: lighten(theme.palette.primary.main, 0.3),
            padding: "10px 20px 10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        })}>
            <Box sx={{ display: "inline-block", fontFamily: "Roboto" }}>
                <a className="underline inherit-color" href={CONTACT_HREF}>
                    Kérdésed van? Írj emailt!
                </a>
            </Box>
        </Box>
    );
}