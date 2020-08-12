import { createMuiTheme } from "@material-ui/core";

export const DARK_THEME = createMuiTheme({
    palette: {
        type: "dark",
        primary: {
            main: "#ffc40d",
        },
        secondary: {
            main: "#1363A5",
        },
    },
});

export const LIGHT_THEME = createMuiTheme({
    palette: {
        type: "light",
        primary: {
            main: "#ffc40d",
        },
        secondary: {
            main: "#1363A5",
        },
    },
});
