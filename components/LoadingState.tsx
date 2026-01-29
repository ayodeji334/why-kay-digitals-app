import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { normalize, getFontFamily } from "../constants/settings";
import { COLORS } from "../constants/colors";

interface LoadingProps {
  message?: string;
}

const LoadingState: React.FC<LoadingProps> = ({
  message = "Loading Data...",
}) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={styles.spinner}
      />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    marginBottom: 12,
  },
  loadingText: {
    fontSize: normalize(18),
    color: "#000",
    fontFamily: getFontFamily("700"),
  },
});

export default LoadingState;
