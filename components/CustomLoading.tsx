import React from "react";
import { View, Modal, ActivityIndicator, StyleSheet } from "react-native";
import { useColors } from "../hooks/useTheme";

type CustomLoadingProps = {
  loading: boolean;
  color?: string;
};

export default function CustomLoading({ loading, color }: CustomLoadingProps) {
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
          <ActivityIndicator size={20} color={colors.primary} />
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
      backgroundColor: "white",
      padding: 10,
      borderRadius: 10,
      alignItems: "center",
    },
  });
