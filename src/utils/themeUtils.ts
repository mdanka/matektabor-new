import { createTheme } from "@mui/material/styles";

export const LIGHT_THEME = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#F5A623",
            light: "#FFF3D6",
            dark: "#C77F00",
        },
        secondary: {
            main: "#2563EB",
            light: "#DBEAFE",
            dark: "#1E40AF",
        },
        background: {
            default: "#FAFAF7",
            paper: "#FFFFFF",
        },
        text: {
            primary: "#1A1A2E",
            secondary: "#6B7280",
        },
        divider: "#E5E7EB",
        success: {
            main: "#16A34A",
        },
        error: {
            main: "#DC2626",
        },
    },
    typography: {
        fontFamily: ["Inter", "system-ui", "sans-serif"].join(","),
        h4: {
            fontWeight: 700,
        },
        h5: {
            fontWeight: 600,
        },
        subtitle1: {
            fontWeight: 600,
        },
        subtitle2: {
            fontWeight: 500,
        },
        button: {
            textTransform: "none" as const,
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        "none",
        "0 1px 2px rgba(0,0,0,0.04)",
        "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "0 2px 4px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04)",
        "0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)",
        "0 6px 8px rgba(0,0,0,0.05), 0 3px 5px rgba(0,0,0,0.04)",
        "0 8px 12px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.04)",
        "0 10px 15px rgba(0,0,0,0.05), 0 5px 8px rgba(0,0,0,0.04)",
        "0 12px 18px rgba(0,0,0,0.06), 0 6px 10px rgba(0,0,0,0.04)",
        "0 14px 20px rgba(0,0,0,0.06), 0 7px 12px rgba(0,0,0,0.04)",
        "0 16px 24px rgba(0,0,0,0.06), 0 8px 14px rgba(0,0,0,0.04)",
        "0 18px 28px rgba(0,0,0,0.06), 0 9px 16px rgba(0,0,0,0.04)",
        "0 20px 32px rgba(0,0,0,0.06), 0 10px 18px rgba(0,0,0,0.04)",
        "0 22px 36px rgba(0,0,0,0.07), 0 11px 20px rgba(0,0,0,0.04)",
        "0 24px 38px rgba(0,0,0,0.07), 0 12px 22px rgba(0,0,0,0.04)",
        "0 26px 40px rgba(0,0,0,0.07), 0 13px 24px rgba(0,0,0,0.04)",
        "0 28px 44px rgba(0,0,0,0.07), 0 14px 26px rgba(0,0,0,0.04)",
        "0 30px 48px rgba(0,0,0,0.08), 0 15px 28px rgba(0,0,0,0.04)",
        "0 32px 52px rgba(0,0,0,0.08), 0 16px 30px rgba(0,0,0,0.04)",
        "0 34px 56px rgba(0,0,0,0.08), 0 17px 32px rgba(0,0,0,0.04)",
        "0 36px 60px rgba(0,0,0,0.09), 0 18px 34px rgba(0,0,0,0.04)",
        "0 38px 64px rgba(0,0,0,0.09), 0 19px 36px rgba(0,0,0,0.04)",
        "0 40px 68px rgba(0,0,0,0.09), 0 20px 38px rgba(0,0,0,0.04)",
        "0 42px 72px rgba(0,0,0,0.10), 0 21px 40px rgba(0,0,0,0.04)",
        "0 44px 76px rgba(0,0,0,0.10), 0 22px 42px rgba(0,0,0,0.04)",
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: "10px 20px",
                    minHeight: 44,
                    transition: "all 0.2s ease",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    transition: "box-shadow 0.2s ease",
                },
            },
        },
        MuiAccordion: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: "12px !important",
                    border: `1px solid ${theme.palette.divider}`,
                    "&:before": {
                        display: "none",
                    },
                    "&:first-of-type": {
                        borderRadius: "12px !important",
                    },
                    "&:last-of-type": {
                        borderRadius: "12px !important",
                    },
                }),
            },
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    minHeight: 56,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: 8,
                    margin: "2px 8px",
                    minHeight: 48,
                    transition: "background-color 0.15s ease, border-color 0.15s ease",
                    "&.Mui-selected": {
                        backgroundColor: "transparent",
                        border: `2px solid ${theme.palette.secondary.main}`,
                        "&:hover": {
                            backgroundColor: "transparent",
                        },
                    },
                }),
            },
        },
        MuiSnackbarContent: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: "2px 6px",
                },
            },
        },
        MuiListSubheader: {
            styleOverrides: {
                root: {
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.05em",
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    minWidth: 44,
                    minHeight: 44,
                },
            },
        },
    },
});
