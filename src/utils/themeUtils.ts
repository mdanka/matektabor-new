import { createTheme, adaptV4Theme } from "@mui/material/styles";

export const DARK_THEME = createTheme(adaptV4Theme({
    palette: {
        mode: "dark",
        primary: {
            main: "#ffc40d",
        },
        secondary: {
            main: "#1363A5",
        },
    },
}));

export const LIGHT_THEME = createTheme(adaptV4Theme({
    palette: {
        mode: "light",
        primary: {
            main: "#ffc40d",
        },
        secondary: {
            main: "#1363A5",
        },
    },
}));
