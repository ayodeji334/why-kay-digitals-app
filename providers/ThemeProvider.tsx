import { useEffect } from "react";
import { Appearance } from "react-native";
import { useThemeStore } from "../hooks/useTheme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const syncSystemTheme = useThemeStore(s => s._syncSystemTheme);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      syncSystemTheme(colorScheme);
    });
    return () => sub.remove();
  }, [syncSystemTheme]);

  return <>{children}</>;
}
