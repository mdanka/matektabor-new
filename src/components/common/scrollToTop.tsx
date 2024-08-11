import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return <>{children}</>;
}