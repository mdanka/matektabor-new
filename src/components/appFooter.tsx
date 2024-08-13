import { ThemeProvider, StyledEngineProvider } from "@mui/material";
import { DARK_THEME, CONTACT_HREF } from "../utils";
import css from "./appFooter.module.scss";

export function AppFooter() {
    return (
        <div className={css.appFooter}>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={DARK_THEME}>
                    <span className={css.appFooterItem}>
                        <a className="underline inherit-color" href={CONTACT_HREF}>
                            Kérdésed van? Írj emailt!
                        </a>
                    </span>
                </ThemeProvider>
            </StyledEngineProvider>
        </div>
    );
}