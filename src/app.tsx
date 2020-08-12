import React from 'react';
import { Provider } from "react-redux";
import { Store } from "redux";
import { MatektaborApp } from "./components";
import { MuiThemeProvider, StylesProvider } from "@material-ui/core";
import { LIGHT_THEME } from "./utils";
// import './App.css';

export interface IAppProps {
  store: Store<any>;
}

function App({ store }: IAppProps) {
    return (
        <Provider store={store as Store<any>}>
            <MuiThemeProvider theme={LIGHT_THEME}>
                <StylesProvider injectFirst>
                    <MatektaborApp />
                </StylesProvider>
            </MuiThemeProvider>
        </Provider>
    );
}

export default App;
