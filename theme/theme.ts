// theme/theme.ts — PNS design system
// Warm, human palette: Bangladesh green for trust, coral for warmth, amber for highlights.
import { alpha, createTheme, ThemeOptions } from "@mui/material/styles";
import type {} from "@mui/x-data-grid/themeAugmentation";

export const brand = {
  green: "#0F6E56",
  greenLight: "#3BA584",
  greenDark: "#0A4F3E",
  coral: "#E2553C",
  amber: "#F4A62A",
  ink: "#12241D",
  paper: "#F6F4EE",
  sky: "#2F6FDE",
};

export const fontStack = `"Plus Jakarta Sans", "Hind Siliguri", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

export const getDesignTokens = (mode: "light" | "dark"): ThemeOptions => {
  const light = mode === "light";
  const ink = light ? brand.ink : "#EAF2EE";
  const muted = light ? "#5A6B64" : "#9DB2AA";
  const line = light ? "rgba(18,36,29,0.10)" : "rgba(234,242,238,0.10)";
  const surface = light ? "#FFFFFF" : "#111F1A";
  const canvas = light ? brand.paper : "#0A1511";
  const primaryMain = light ? brand.green : "#3FC79A";

  return {
    palette: {
      mode,
      primary: light
        ? { main: brand.green, light: brand.greenLight, dark: brand.greenDark, contrastText: "#FFFFFF" }
        : { main: "#3FC79A", light: "#74DDB8", dark: "#23A27A", contrastText: "#06231A" },
      secondary: light
        ? { main: brand.coral, light: "#F07F68", dark: "#B83E28", contrastText: "#FFFFFF" }
        : { main: "#FF7A5C", light: "#FF9F88", dark: "#E2553C", contrastText: "#2A0B05" },
      warning: { main: brand.amber, contrastText: "#2B1A00" },
      info: { main: light ? brand.sky : "#6EA1FF" },
      success: { main: light ? "#1E8E5A" : "#4ADE95" },
      error: { main: light ? "#D23B3B" : "#FF6B6B" },
      background: { default: canvas, paper: surface },
      text: { primary: ink, secondary: muted },
      divider: line,
      action: {
        hover: light ? "rgba(15,110,86,0.06)" : "rgba(63,199,154,0.08)",
        selected: light ? "rgba(15,110,86,0.10)" : "rgba(63,199,154,0.14)",
      },
    },
    shape: { borderRadius: 4 },
    typography: {
      fontFamily: fontStack,
      h1: { fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 },
      h2: { fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1 },
      h3: { fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15 },
      h4: { fontWeight: 800, letterSpacing: "-0.015em" },
      h5: { fontWeight: 750, letterSpacing: "-0.01em" },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 700 },
      overline: { fontWeight: 800, letterSpacing: "0.14em" },
      button: { fontWeight: 700, textTransform: "none", letterSpacing: 0 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { scrollBehavior: "smooth", WebkitFontSmoothing: "antialiased" },
          body: {
            backgroundColor: canvas,
            fontFeatureSettings: '"ss01", "cv11"',
          },
          "::selection": { background: alpha(brand.amber, 0.45), color: ink },
          "*::-webkit-scrollbar": { width: 10, height: 10 },
          "*::-webkit-scrollbar-thumb": {
            background: light ? "rgba(18,36,29,0.18)" : "rgba(234,242,238,0.18)",
            borderRadius: 10,
            border: `2px solid ${canvas}`,
          },
          "@media (prefers-reduced-motion: reduce)": {
            "*, *::before, *::after": {
              animationDuration: "0.001ms !important",
              animationIterationCount: "1 !important",
              transitionDuration: "0.001ms !important",
            },
          },
          "@media print": {
            body: { backgroundColor: "#fff" },
            ".no-print": { display: "none !important" },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 10, padding: "8px 18px", transition: "transform .15s ease, box-shadow .2s ease, background-color .2s ease" },
          sizeLarge: { padding: "12px 24px", fontSize: "1rem" },
          sizeSmall: { padding: "5px 12px" },
          containedPrimary: {
            boxShadow: `0 6px 18px -8px ${alpha(primaryMain, 0.8)}`,
            "&:hover": { transform: "translateY(-1px)", boxShadow: `0 10px 24px -10px ${alpha(primaryMain, 0.9)}` },
          },
          containedSecondary: {
            "&:hover": { transform: "translateY(-1px)" },
          },
          outlined: { borderWidth: 1.5, "&:hover": { borderWidth: 1.5 } },
        },
      },
      MuiIconButton: { styleOverrides: { root: { borderRadius: 10 } } },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: "none" },
          outlined: { borderColor: line },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${line}`,
            boxShadow: light ? "0 1px 2px rgba(18,36,29,0.04), 0 8px 24px -16px rgba(18,36,29,0.18)" : "none",
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          title: { fontWeight: 750, fontSize: "1.05rem" },
          subheader: { fontSize: ".85rem" },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: light ? "#FFFFFF" : alpha("#FFFFFF", 0.02),
            "& .MuiOutlinedInput-notchedOutline": { borderColor: light ? "rgba(18,36,29,0.18)" : "rgba(234,242,238,0.16)" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: light ? "rgba(18,36,29,0.35)" : "rgba(234,242,238,0.32)" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: 2 },
            "&.Mui-focused": { boxShadow: `0 0 0 4px ${alpha(primaryMain, 0.12)}` },
          },
        },
      },
      MuiInputLabel: { styleOverrides: { root: { fontWeight: 500 } } },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 600 },
          sizeSmall: { height: 24, fontSize: ".75rem" },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: "inherit" },
        styleOverrides: { root: { backgroundImage: "none" } },
      },
      MuiDrawer: { styleOverrides: { paper: { backgroundImage: "none", borderColor: line } } },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 18, border: `1px solid ${line}` },
        },
      },
      MuiDialogTitle: { styleOverrides: { root: { fontWeight: 750 } } },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { backgroundColor: light ? brand.ink : "#EAF2EE", color: light ? "#fff" : brand.ink, fontWeight: 600, fontSize: ".75rem", borderRadius: 8, padding: "6px 10px" },
          arrow: { color: light ? brand.ink : "#EAF2EE" },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            "&.Mui-selected": { backgroundColor: alpha(primaryMain, light ? 0.1 : 0.16), color: primaryMain, "& .MuiListItemIcon-root": { color: primaryMain } },
            "&.Mui-selected:hover": { backgroundColor: alpha(primaryMain, light ? 0.14 : 0.2) },
          },
        },
      },
      MuiListItemIcon: { styleOverrides: { root: { minWidth: 38 } } },
      MuiTabs: { styleOverrides: { indicator: { height: 3, borderRadius: 3 } } },
      MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 700, minHeight: 44 } } },
      MuiAccordion: {
        defaultProps: { disableGutters: true, elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${line}`,
            borderRadius: 14,
            "&:before": { display: "none" },
            "&:not(:last-of-type)": { marginBottom: 12 },
            "&.Mui-expanded": { boxShadow: light ? "0 10px 30px -18px rgba(18,36,29,0.35)" : "none" },
          },
        },
      },
      MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: line },
          head: { fontWeight: 700, color: muted, fontSize: ".75rem", textTransform: "uppercase", letterSpacing: ".06em" },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: `1px solid ${line}`,
            borderRadius: 16,
            backgroundColor: surface,
            "--DataGrid-containerBackground": light ? "#FAF8F3" : alpha("#FFFFFF", 0.03),
            "--DataGrid-rowBorderColor": line,
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, fontSize: ".78rem", textTransform: "uppercase", letterSpacing: ".05em", color: muted },
            "& .MuiDataGrid-row:hover": { backgroundColor: alpha(primaryMain, 0.04) },
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus-within": { outline: "none" },
            "& .MuiDataGrid-toolbarContainer": { padding: "10px 12px", gap: 6, flexWrap: "wrap" },
          },
        },
      },
      MuiLinearProgress: { styleOverrides: { root: { borderRadius: 4 } } },
      MuiAvatar: { styleOverrides: { root: { fontWeight: 700 } } },
      MuiSnackbar: { defaultProps: { anchorOrigin: { vertical: "bottom", horizontal: "center" } } },
    },
  };
};

const theme = createTheme(getDesignTokens("light"));

export default theme;
