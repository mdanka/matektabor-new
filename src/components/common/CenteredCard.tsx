import { ReactNode } from "react";
import { Box, Paper } from "@mui/material";

interface CenteredCardProps {
    children: ReactNode;
    minHeight?: string;
}

export function CenteredCard({ children, minHeight = "calc(100vh - 120px)" }: CenteredCardProps) {
    return (
        <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight,
            padding: { xs: "24px 16px", sm: "40px" },
        }}>
            <Paper
                elevation={0}
                sx={{
                    maxWidth: 400,
                    width: "100%",
                    padding: { xs: "32px 24px", sm: "40px" },
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                {children}
            </Paper>
        </Box>
    );
}
