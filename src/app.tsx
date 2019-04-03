import "es6-shim";
import * as React from "react";
import { Provider } from "react-redux";
import { MatektaborApp } from "./components";
import { IAppState } from "./store";
import { Store } from "redoodle";

export interface IAppProps {
    store: Store<IAppState>;
}

export class App extends React.Component<IAppProps, {}> {
    public render() {
        const { store } = this.props;
        return (
            <Provider store={store}>
                <MatektaborApp />
            </Provider>
        );
    }
}
