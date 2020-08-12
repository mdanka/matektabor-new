import * as React from "react";
import { getGlobalServices } from "../services";
import css from "./loginProtector.module.scss";

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
            <div className={css.loginScreen}>
                <div ref={this.ref} />
            </div>
        );
    }
}
