import { Box } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { CONTACT_HREF } from "../utils";

export function AppFooter() {
    return (
        <Box component="footer" sx={{
            height: "56px",
            color: "text.secondary",
            backgroundColor: "background.default",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderTop: "1px solid",
            borderColor: "divider",
        }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: "14px", fontWeight: 500, fontFamily: "Inter, system-ui, sans-serif" }}>
                <EmailOutlinedIcon sx={{ fontSize: 16 }} />
                <a className="underline inherit-color" href={CONTACT_HREF}>
                    Kérdésed van? Írj emailt!
                </a>
            </Box>
        </Box>
    );
}
