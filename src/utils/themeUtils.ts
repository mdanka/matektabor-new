import { createTheme } from "@mui/material/styles";

export const LIGHT_THEME = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#ffc40d",
        },
        secondary: {
            main: "#1363A5",
        },
    },
    typography: {
        fontFamily: [
            "Roboto",
            "-apple-system",
            "BlinkMacSystemFont",
            "\"Segoe UI\"",
            "\"Helvetica Neue\"",
            "Arial",
            "sans-serif",
        ].join(","),
    },
    components: {
        MuiIconButton: {
            styleOverrides: {
                root: {
                    minWidth: 44,
                    minHeight: 44,
                },
            },
        },
    },
});
