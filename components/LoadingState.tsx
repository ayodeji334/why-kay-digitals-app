import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { normalize, getFontFamily } from "../constants/settings";
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
        size="large"
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
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      padding: 24,
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 10,
    },
    spinner: {
      marginBottom: 12,
    },
    loadingText: {
      fontSize: normalize(18),
      color: colors.text,
      fontFamily: getFontFamily("700"),
    },
  });

export default LoadingState;
