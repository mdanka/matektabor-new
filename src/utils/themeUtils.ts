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
            "Times New Roman",
        ].join(","),
    }
});
