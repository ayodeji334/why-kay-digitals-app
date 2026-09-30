import React from "react";
import { StatusBar, StatusBarProps } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useColors, useResolvedTheme } from "../hooks/useTheme";

/**
 * The app's single, theme-driven status bar — rendered once in App.tsx.
 * Screens should NOT render their own <StatusBar>: every mounted instance
 * overrides the others, so the style would depend on which screen mounted
 * last rather than the one on show.
 */
export const ThemedStatusBar = () => {
  const colors = useColors();
  const resolvedTheme = useResolvedTheme();
  return (
    <StatusBar
      barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
      backgroundColor={colors.background}
    />
  );
};

/**
 * For a screen that needs a different status bar (e.g. a dark hero). It only
 * applies while that screen is focused, then the themed bar takes over again.
 * (Native-stack's `statusBarStyle` option can't be used on iOS here because
 * UIViewControllerBasedStatusBarAppearance is false.)
 */
export const FocusAwareStatusBar = (props: StatusBarProps) => {
  const isFocused = useIsFocused();
  return isFocused ? <StatusBar {...props} /> : null;
};
