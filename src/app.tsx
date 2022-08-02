import React from 'react';
import { Provider } from "react-redux";
import { Store } from "redux";
import { MatektaborApp } from "./components";
import { ThemeProvider, Theme, StyledEngineProvider } from "@mui/material";
import { StylesProvider } from "@mui/styles";
import { LIGHT_THEME } from "./utils";


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


// import './App.css';

export interface IAppProps {
  store: Store<any>;
}

function App({ store }: IAppProps) {
    return (
        <Provider store={store as Store<any>}>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={LIGHT_THEME}>
                    <StylesProvider injectFirst>
                        <MatektaborApp />
                    </StylesProvider>
                </ThemeProvider>
            </StyledEngineProvider>
        </Provider>
    );
}

export default App;
