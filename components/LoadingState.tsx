import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import {
  normalize,
  getFontFamily,
  normalizeSpacing,
} from "../constants/settings";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";

interface LoadingProps {
  message?: string;
}

const LoadingState: React.FC<LoadingProps> = ({
  message = "Loading Data...",
}) => {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator
        size={40}
        color={colors.primary}
        style={styles.spinner}
      />
      <AppText style={styles.loadingText}>{message}</AppText>
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    loadingContainer: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: normalizeSpacing(24),
      alignItems: "center",
      justifyContent: "center",
      marginVertical: normalizeSpacing(10),
    },
    spinner: {
      marginBottom: normalizeSpacing(12),
    },
    loadingText: {
      fontSize: normalize(18),
      color: colors.text,
      fontFamily: getFontFamily("700"),
    },
  });

export default LoadingState;
