import { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button } from "@mui/material";

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
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "50vh",
                    padding: 4,
                    gap: 2,
                }}>
                    <Typography variant="h5" color="error">
                        Hoppá! Valami hiba történt.
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        {this.state.error?.message}
                    </Typography>
                    <Button variant="contained" onClick={this.handleReload}>
                        Oldal újratöltése
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}
