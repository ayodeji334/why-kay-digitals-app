import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";

export default function CaptureButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.67}>
      <View style={styles.outer}>
        <View style={styles.inner} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#FFC107",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  inner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFC107",
  },
});
