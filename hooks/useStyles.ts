import { useMemo } from "react";
import { useColors } from "./useTheme";

type ThemeColors = ReturnType<typeof useColors>;

/**
 * Builds a component's themed stylesheet once per theme instead of on every
 * render. Pass a factory defined at module level (not inside the component),
 * so its identity is stable:
 *
 *   const makeStyles = (colors: ThemeColors) => StyleSheet.create({ ... });
 *   const styles = useStyles(makeStyles);
 *
 * useColors() returns one of two constant palettes, so the styles are only
 * rebuilt when the user switches between light and dark mode.
 */
export const useStyles = <T>(make: (colors: ThemeColors) => T): T => {
  const colors = useColors();
  return useMemo(() => make(colors), [colors, make]);
};
