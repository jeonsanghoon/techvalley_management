"use client";

import { createTheme, type PaletteMode } from "@mui/material/styles";
import { paperClasses } from "@mui/material/Paper";
import { kepple, neonBlue, nevada, stormGrey } from "./colors";

export function createTechvalleyTheme(mode: PaletteMode = "light") {
  const isDark = mode === "dark";
  const borderSubtle = isDark ? "rgba(255, 255, 255, 0.22)" : nevada[200];
  const borderStrong = isDark ? "rgba(255, 255, 255, 0.32)" : nevada[300];
  const surfaceRaised = isDark ? "#181c22" : "#ffffff";
  const surfaceSunken = isDark ? "#12161c" : nevada[50];

  return createTheme({
    palette: {
      mode,
      primary: {
        main: neonBlue[500],
        light: neonBlue[400],
        dark: neonBlue[700],
        contrastText: "#ffffff",
      },
      secondary: {
        main: isDark ? nevada[400] : nevada[700],
        light: nevada[500],
        dark: nevada[900],
        contrastText: "#ffffff",
      },
      success: {
        main: kepple[500],
        light: kepple[400],
        dark: kepple[600],
        contrastText: "#ffffff",
      },
      warning: {
        main: "#fb9c0c",
        light: "#ffbb1f",
        dark: "#de7101",
        contrastText: "#ffffff",
      },
      error: {
        main: "#f04438",
        light: "#f97970",
        dark: "#de3024",
        contrastText: "#ffffff",
      },
      info: {
        main: "#04aad6",
        light: "#10bee8",
        dark: "#0787b3",
        contrastText: "#ffffff",
      },
      background: {
        default: isDark ? nevada[950] : "#ffffff",
        paper: isDark ? surfaceRaised : "#ffffff",
      },
      text: {
        primary: isDark ? "#f9fafb" : stormGrey[900],
        secondary: isDark ? nevada[400] : stormGrey[500],
      },
      divider: borderSubtle,
      grey: nevada,
    },
    typography: {
      fontFamily:
        'var(--font-inter), "Inter", "Malgun Gothic", "맑은 고딕", -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: 14,
      h1: { fontSize: "1.75rem", fontWeight: 600, lineHeight: 1.25 },
      h2: { fontSize: "1.375rem", fontWeight: 600, lineHeight: 1.3 },
      h3: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.35 },
      h4: { fontSize: "1.75rem", fontWeight: 600, lineHeight: 1.25 },
      h5: { fontSize: "1.375rem", fontWeight: 600, lineHeight: 1.3 },
      h6: { fontSize: "1.0625rem", fontWeight: 600, lineHeight: 1.35 },
      subtitle1: { fontSize: "0.9375rem", fontWeight: 600, lineHeight: 1.45 },
      subtitle2: { fontSize: "0.8125rem", fontWeight: 600, lineHeight: 1.45 },
      body1: { fontSize: "0.875rem", lineHeight: 1.55 },
      body2: { fontSize: "0.8125rem", lineHeight: 1.55 },
      caption: { fontSize: "0.75rem", lineHeight: 1.45 },
      overline: {
        fontSize: "0.6875rem",
        fontWeight: 700,
        lineHeight: 1.4,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      },
      button: { fontSize: "0.8125rem", textTransform: "none", fontWeight: 500 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            colorScheme: isDark ? "dark" : "light",
          },
          body: {
            backgroundColor: isDark ? nevada[950] : "#ffffff",
            color: isDark ? "#f9fafb" : stormGrey[900],
            scrollbarColor: isDark ? `${nevada[700]} ${nevada[950]}` : `${nevada[300]} transparent`,
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: isDark ? 0 : 1, variant: isDark ? "outlined" : "elevation" },
        styleOverrides: {
          root: {
            borderRadius: 10,
            ...(isDark
              ? {
                  border: `1px solid ${borderSubtle}`,
                  boxShadow: "none",
                  backgroundImage: "none",
                  bgcolor: surfaceRaised,
                }
              : {
                  [`&.${paperClasses.elevation1}`]: {
                    boxShadow:
                      "0 5px 22px 0 rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06)",
                  },
                }),
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: isDark
            ? {
                borderBottom: `1px solid ${borderSubtle}`,
                bgcolor: surfaceSunken,
                color: "#f9fafb",
              }
            : {},
          title: {
            fontSize: "0.8125rem",
            fontWeight: 600,
            lineHeight: 1.45,
            color: isDark ? "#f9fafb" : stormGrey[900],
          },
          subheader: {
            color: isDark ? nevada[400] : stormGrey[500],
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            ...(isDark && {
              bgcolor: surfaceRaised,
            }),
          },
          outlined: {
            border: `1px solid ${borderSubtle}`,
            ...(isDark && {
              boxShadow: "none",
              bgcolor: surfaceRaised,
            }),
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: borderSubtle },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: borderSubtle,
          },
          head: {
            ...(isDark && {
              bgcolor: nevada[900],
              borderBottom: `1px solid ${borderStrong}`,
            }),
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderColor: borderSubtle,
          },
          root: {
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: borderStrong,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: neonBlue[500],
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
          icon: {
            fontSize: "18px !important",
            width: 18,
            height: 18,
            marginLeft: 8,
            flexShrink: 0,
          },
          label: { paddingLeft: 8, paddingRight: 10 },
          outlined: {
            borderColor: borderSubtle,
          },
        },
      },
      MuiSvgIcon: {
        defaultProps: { fontSize: "small" },
        styleOverrides: {
          root: {
            display: "inline-block",
            width: "1em",
            height: "1em",
            flexShrink: 0,
            boxSizing: "content-box",
          },
          fontSizeSmall: { fontSize: "1.125rem" },
          fontSizeMedium: { fontSize: "1.25rem" },
        },
      },
      MuiIconButton: {
        defaultProps: { size: "small" },
        styleOverrides: {
          root: {
            "& .MuiSvgIcon-root": { fontSize: "1.25rem" },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8, textTransform: "none", fontWeight: 500, boxShadow: "none" },
          contained: {
            boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
            "&:hover": { boxShadow: "0px 2px 6px rgba(99, 91, 255, 0.24)" },
          },
          outlined: {
            borderColor: borderSubtle,
            "&:hover": {
              borderColor: borderStrong,
            },
          },
          startIcon: {
            "& .MuiSvgIcon-root": { fontSize: "1.125rem" },
          },
        },
      },
      MuiTextField: {
        defaultProps: { size: "small" },
      },
      MuiSelect: {
        defaultProps: { size: "small" },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          root: { minWidth: 0 },
          primary: { lineHeight: 1.45 },
          secondary: { fontSize: "0.75rem", lineHeight: 1.45 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { fontSize: "0.8125rem", fontWeight: 600, minHeight: 40 },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            maxHeight: "calc(100dvh - 80px)",
            overflowY: "auto",
            ...(isDark && {
              border: `1px solid ${borderSubtle}`,
            }),
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: isDark
            ? {
                borderBottom: `1px solid ${borderSubtle}`,
              }
            : {},
        },
      },
    },
  });
}

/** @deprecated createTechvalleyTheme('light') 사용 */
export const deviasTheme = createTechvalleyTheme("light");
