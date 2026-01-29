import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { COLORS } from "../constants/colors";
import { getFontFamily } from "../constants/settings";

const steps = [
  "Analyzing facial features...",
  "Cross-referencing documents...",
  "Finalizing verification...",
];

export default function IdentityVerifying({ loading }: { loading: boolean }) {
  const [stepIndex, setStepIndex] = useState(0);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      // Fade out current text
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Change text and fade back in
        setStepIndex(prev => (prev + 1) % steps.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [loading]);

  if (!loading) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={COLORS.primary} />

          <Text style={styles.title}>Verifying your Identity</Text>

          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.stepText}>{steps[stepIndex]}</Text>
          </Animated.View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${(stepIndex + 1) * 25}%` },
              ]}
            />
          </View>

          <Text style={styles.disclaimer}>
            Please do not close the app or go back.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginTop: 20,
  },
  stepText: {
    fontSize: 14,
    fontFamily: getFontFamily("400"),
    color: COLORS.primary,
    marginBottom: 24,
  },
  progressTrack: {
    width: "80%",
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: getFontFamily("700"),
    color: "#999",
    textAlign: "center",
  },
});
