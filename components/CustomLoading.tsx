import React from "react";
import { View, Modal, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { useColors } from "../hooks/useTheme";

type CustomLoadingProps = {
  loading: boolean;
  color?: string;
};

export default function CustomLoading({
  loading,
  color = COLORS.secondary,
}: CustomLoadingProps) {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <Modal
      visible={loading}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.modalBackground}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={color} />
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    modalBackground: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      alignItems: "center",
    },
    loaderContainer: {
      backgroundColor: colors.overlay,
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
    },
  });
