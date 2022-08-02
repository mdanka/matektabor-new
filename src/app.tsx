import React from 'react';
import { Provider } from "react-redux";
import { Store } from "redux";
import { MatektaborApp } from "./components";
import { ThemeProvider } from "@mui/material";
import { StylesProvider } from "@mui/styles";
import { LIGHT_THEME } from "./utils";
// import './App.css';

export interface IAppProps {
  store: Store<any>;
}

function App({ store }: IAppProps) {
    return (
        <Provider store={store as Store<any>}>
            <ThemeProvider theme={LIGHT_THEME}>
                <StylesProvider injectFirst>
                    <MatektaborApp />
                </StylesProvider>
            </ThemeProvider>
        </Provider>
    );
}

export default App;
