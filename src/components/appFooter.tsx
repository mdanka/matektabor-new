import { Box } from "@mui/material";
import { CONTACT_HREF } from "../utils";

export function AppFooter() {
    return (
        <Box sx={(theme) => ({
            height: "80px",
            color: "black",
            backgroundColor: theme.palette.primary.main,
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