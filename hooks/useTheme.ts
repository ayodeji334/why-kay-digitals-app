// import { create } from "zustand";
// import { Appearance, ColorSchemeName } from "react-native";

// type ThemeMode = "light" | "dark" | "system";

// interface ThemeColors {
//   background: string;
//   surface: string;
//   surfaceSecondary: string;
//   border: string;
//   borderLight: string;
//   text: string;
//   textSecondary: string;
//   textMuted: string;
//   primary: string;
//   primaryLight: string;
//   primaryDark: string;
//   error: string;
//   errorLight: string;
//   success: string;
//   successLight: string;
//   warning: string;
//   warningLight: string;
//   overlay: string;
//   shadow: string;
//   inputBackground: string;
//   tabBarBackground: string;
// }

// interface ThemeStore {
//   mode: ThemeMode;
//   resolvedTheme: "light" | "dark";
//   colors: ThemeColors;
//   setMode: (mode: ThemeMode) => void;
//   _syncSystemTheme: (scheme: ColorSchemeName) => void;
// }

// const LIGHT_COLORS: ThemeColors = {
//   background: "#FFFFFF",
//   surface: "#fff",
//   surfaceSecondary: "#F1F5F9",
//   border: "#E2E8F0",
//   borderLight: "#F1F5F9",
//   text: "#0F172A",
//   textSecondary: "#334155",
//   textMuted: "#64748B",
//   primary: "#00863B",
//   primaryLight: "#D1FAE5",
//   primaryDark: "#047857",
//   error: "#DC2626",
//   errorLight: "#FEE2E2",
//   success: "#00863B",
//   successLight: "#D1FAE5",
//   warning: "#D97706",
//   warningLight: "#FEF3C7",
//   overlay: "rgba(0,0,0,0.5)",
//   shadow: "rgba(0,0,0,0.08)",
//   inputBackground: "#F8FAFC",
//   tabBarBackground: "#FFFFFF",
// };

// const DARK_COLORS: ThemeColors = {
//   background: "#030712",
//   surface: "#050b16",
//   surfaceSecondary: "#050115",
//   border: "#334155",
//   borderLight: "#1E293B",
//   text: "#F8FAFC",
//   textSecondary: "#CBD5E1",
//   textMuted: "#94A3B8",
//   primary: "#00863B",
//   primaryLight: "#064E3B",
//   primaryDark: "#059669",
//   error: "#F87171",
//   errorLight: "#450A0A",
//   success: "#00863B",
//   successLight: "#064E3B",
//   warning: "#FBBF24",
//   warningLight: "#451A03",
//   overlay: "rgba(0,0,0,0.7)",
//   shadow: "rgba(0,0,0,0.3)",
//   inputBackground: "#1E293B",
//   tabBarBackground: "#1E293B",
// };

// const resolveColors = (resolved: "light" | "dark") =>
//   resolved === "dark" ? DARK_COLORS : LIGHT_COLORS;

// const getResolved = (mode: ThemeMode, system: any): "light" | "dark" => {
//   if (mode === "system") return system === "dark" ? "dark" : "light";
//   return mode;
// };

// export const useThemeStore = create<ThemeStore>((set, get) => {
//   const systemScheme = Appearance.getColorScheme();
//   const initialResolved = getResolved("system", systemScheme);

//   return {
//     mode: "system",
//     resolvedTheme: initialResolved,
//     colors: resolveColors(initialResolved),

//     setMode: mode => {
//       const systemScheme = Appearance.getColorScheme();
//       const resolved = getResolved(mode, systemScheme);
//       set({
//         mode,
//         resolvedTheme: resolved,
//         colors: resolveColors(resolved),
//       });
//     },

//     _syncSystemTheme: scheme => {
//       const { mode } = get();
//       if (mode === "system") {
//         const resolved = getResolved("system", scheme);
//         set({ resolvedTheme: resolved, colors: resolveColors(resolved) });
//       }
//     },
//   };
// });

// export const useColors = () => useThemeStore(s => s.colors);
// export const useThemeMode = () => useThemeStore(s => s.mode);
// export const useResolvedTheme = () => useThemeStore(s => s.resolvedTheme);
// export const useSetThemeMode = () => useThemeStore(s => s.setMode);
import { create } from "zustand";
import { Appearance, ColorSchemeName } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  border: string;
  borderLight: string;
  tabTopBorderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  error: string;
  errorLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  overlay: string;
  shadow: string;
  inputBackground: string;
  tabBarBackground: string;
  infoCardBackgroundColor?: string;
}

interface ThemeStore {
  mode: ThemeMode;
  resolvedTheme: "light" | "dark";
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  _syncSystemTheme: (scheme: ColorSchemeName) => void;
}

const LIGHT_COLORS: ThemeColors = {
  background: "#FFFFFF",
  surface: "#fff",
  surfaceSecondary: "#F1F5F9",
  border: "#cacaca",
  borderLight: "#F1F5F9",
  tabTopBorderLight: "#c5c5c5",
  text: "#0F172A",
  textSecondary: "#334155",
  textMuted: "#64748B",
  primary: "#00863B",
  primaryLight: "#00863B",
  primaryDark: "#047857",
  error: "#DC2626",
  errorLight: "#FEE2E2",
  success: "#00863B",
  successLight: "#D1FAE5",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  overlay: "rgba(0,0,0,0.5)",
  shadow: "rgba(0,0,0,0.08)",
  inputBackground: "#F8FAFC",
  tabBarBackground: "#FFFFFF",
  infoCardBackgroundColor: "#5AB2431A",
};

const DARK_COLORS: ThemeColors = {
  background: "#030712",
  surface: "#050b16",
  surfaceSecondary: "#050115",
  border: "#334155",
  borderLight: "#1E293B",
  tabTopBorderLight: "#a1a1a1",
  text: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",
  primary: "#00863B",
  primaryLight: "#72FFB0",
  primaryDark: "#059669",
  error: "#F87171",
  errorLight: "#450A0A",
  success: "#00863B",
  successLight: "#064E3B",
  warning: "#FBBF24",
  warningLight: "#451A03",
  overlay: "rgba(0,0,0,0.7)",
  shadow: "rgba(0,0,0,0.3)",
  inputBackground: "#1E293B",
  tabBarBackground: "#1E293B",
  infoCardBackgroundColor: "#334155",
};

const resolveColors = (resolved: "light" | "dark") =>
  resolved === "dark" ? DARK_COLORS : LIGHT_COLORS;

const getResolved = (
  mode: ThemeMode,
  system: ColorSchemeName,
): "light" | "dark" => {
  if (mode === "system") return system === "dark" ? "dark" : "light";
  return mode;
};

export const useThemeStore = create<ThemeStore>((set, get) => {
  const systemScheme = Appearance.getColorScheme();
  const initialResolved = getResolved("system", systemScheme);

  return {
    mode: "system",
    resolvedTheme: initialResolved,
    colors: resolveColors(initialResolved),

    setMode: mode => {
      const systemScheme = Appearance.getColorScheme();
      const resolved = getResolved(mode, systemScheme);
      set({
        mode,
        resolvedTheme: resolved,
        colors: resolveColors(resolved),
      });
    },

    _syncSystemTheme: scheme => {
      const { mode } = get();
      if (mode === "system") {
        const resolved = getResolved("system", scheme);
        set({ resolvedTheme: resolved, colors: resolveColors(resolved) });
      }
    },
  };
});

Appearance.addChangeListener(({ colorScheme }) => {
  useThemeStore.getState()._syncSystemTheme(colorScheme);
});

export const useColors = () => useThemeStore(s => s.colors);
export const useThemeMode = () => useThemeStore(s => s.mode);
export const useResolvedTheme = () => useThemeStore(s => s.resolvedTheme);
export const useSetThemeMode = () => useThemeStore(s => s.setMode);
