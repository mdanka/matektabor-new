import React, { useEffect, useRef } from "react";
import css from "./loginProtector.module.scss";
import { useFirebaseAuthUiService } from "../services/useFirebaseAuthUiService";

interface ILoginProps {
    redirectUrl: string | undefined;
}

export const Login: React.FC<ILoginProps> = ({ redirectUrl }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { authStart } = useFirebaseAuthUiService();

    useEffect(() => {
        if (ref.current) {
            authStart(ref.current, redirectUrl);
        }
    }, [redirectUrl, authStart]);

    return (
        <div className={css.loginScreen}>
            <div ref={ref} />
        </div>
    );
};
