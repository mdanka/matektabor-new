import { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

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
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "50vh",
                    padding: { xs: 2, sm: 4 },
                }}>
                    <Paper
                        elevation={0}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                            padding: { xs: "32px 24px", sm: "40px" },
                            maxWidth: 400,
                            width: "100%",
                            borderRadius: 4,
                            border: "1px solid",
                            borderColor: "divider",
                        }}
                    >
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
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}
