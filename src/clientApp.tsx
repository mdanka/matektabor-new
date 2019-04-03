import "es6-shim";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createAppStore, IAppState } from "./store";
import { App } from "./app";
import { BrowserRouter } from "react-router-dom";
import { initializeAndGetClientSideServices } from "./services";
import { Store } from "redoodle";

interface IClientAppProps {
    store: Store<IAppState>;
}

export class ClientApp extends React.Component<IClientAppProps, {}> {
    public render() {
        const { store } = this.props;
        return (
            <BrowserRouter>
                <App store={store} />
            </BrowserRouter>
        );
    }
}

const appElement = document.getElementById("app");
const store = createAppStore();
initializeAndGetClientSideServices(store);

if (appElement != null) {
    ReactDOM.render(<ClientApp store={store} />, appElement);
}
