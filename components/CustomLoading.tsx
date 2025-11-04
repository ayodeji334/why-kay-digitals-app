import React from "react";
import { View, Modal, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors"; // adjust path

type CustomLoadingProps = {
  loading: boolean;
  color?: string;
};

export default function CustomLoading({
  loading,
  color = COLORS.secondary,
}: CustomLoadingProps) {
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

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
});
