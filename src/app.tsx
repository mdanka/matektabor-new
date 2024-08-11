import React from 'react';
import { Provider } from "react-redux";
import { Store } from "redux";
import { MatektaborApp } from "./components";
import { ThemeProvider, Theme, StyledEngineProvider } from "@mui/material";
import { StylesProvider } from "@mui/styles";
import { LIGHT_THEME } from "./utils";
import { FirebaseAppProvider } from 'reactfire';
import { FirebaseComponents } from './services/FirebaseComponents';


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


// import './App.css';

const FIREBASE_APP_CONFIG = {
    apiKey: "AIzaSyCe-gLA62Z68YVh_8jx-wCXuXksT-ZD3ws",
    authDomain: "matektabor.miklosdanka.com",
    databaseURL: "https://barkochba-app.firebaseio.com",
    projectId: "barkochba-app",
    storageBucket: "barkochba-app.appspot.com",
    messagingSenderId: "134084998344",
};

export interface IAppProps {
  store: Store<any>;
}

function App({ store }: IAppProps) {
    return (
        <Provider store={store as Store<any>}>
            <FirebaseAppProvider firebaseConfig={FIREBASE_APP_CONFIG}>
                <FirebaseComponents>
                    <StyledEngineProvider injectFirst>
                        <ThemeProvider theme={LIGHT_THEME}>
                            <StylesProvider injectFirst>
                                <MatektaborApp />
                            </StylesProvider>
                        </ThemeProvider>
                    </StyledEngineProvider>
                </FirebaseComponents>
            </FirebaseAppProvider>
        </Provider>
    );
}

export default App;
