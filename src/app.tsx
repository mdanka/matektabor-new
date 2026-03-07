import { Provider } from "react-redux";
import { MatektaborApp } from "./components";
import { ThemeProvider, StyledEngineProvider } from "@mui/material";
import { LIGHT_THEME } from "./utils";
import { FirebaseAppProvider } from "reactfire";
import { FirebaseComponents } from "./components/FirebaseComponents";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppStore } from "./store";

const FIREBASE_APP_CONFIG = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

export interface IAppProps {
  store: AppStore;
}

function App({ store }: IAppProps) {
    return (
        <ErrorBoundary>
            <Provider store={store}>
                <FirebaseAppProvider firebaseConfig={FIREBASE_APP_CONFIG}>
                    <FirebaseComponents>
                        <StyledEngineProvider injectFirst>
                            <ThemeProvider theme={LIGHT_THEME}>
                                <MatektaborApp />
                            </ThemeProvider>
                        </StyledEngineProvider>
                    </FirebaseComponents>
                </FirebaseAppProvider>
            </Provider>
        </ErrorBoundary>
    );
}

export default App;
