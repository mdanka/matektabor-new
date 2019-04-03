import * as React from "react";
import { getGlobalServices } from "../services";

export interface ILoginProps {
    redirectUrl: string | undefined;
}

export class Login extends React.Component<ILoginProps, {}> {
    private ref: React.RefObject<HTMLDivElement>;

    constructor(props: ILoginProps) {
        super(props);
        this.ref = React.createRef();
    }

    public componentDidMount() {
        const { redirectUrl } = this.props;
        if (this.ref.current == null) {
            return;
        }
        const globalServices = getGlobalServices();
        if (globalServices !== undefined) {
            globalServices.firebaseAuthUiService.authStart(this.ref.current, redirectUrl);
        }
    }

    public render() {
        return (
            <div className="login-screen">
                <div className="login-widget" ref={this.ref} />
            </div>
        );
    }
}
