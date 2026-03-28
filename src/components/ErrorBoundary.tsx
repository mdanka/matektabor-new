import { Component, ErrorInfo, ReactNode } from "react";
import { Typography, Button } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { CenteredCard } from "./common";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <CenteredCard minHeight="50vh">
                    <ErrorOutlineIcon sx={{ fontSize: 48, color: "error.main" }} />
                    <Typography variant="h5" color="error" align="center">
                        Hoppá! Valami hiba történt.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                        {this.state.error?.message}
                    </Typography>
                    <Button variant="contained" color="secondary" onClick={this.handleReload} fullWidth>
                        Oldal újratöltése
                    </Button>
                </CenteredCard>
            );
        }

        return this.props.children;
    }
}
