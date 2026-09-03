import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { getFontFamily, normalize } from "../constants/settings";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";

// Mirrors the backend request timeout (see createAxiosClient in
// api/axios.ts) so the progress bar's pace actually reflects how long
// verification can realistically take, instead of an arbitrary fixed
// animation that finishes in a few seconds regardless of the real request.
const REQUEST_TIMEOUT_MS = 180000;
// The bar eases toward this cap and holds there rather than ever reaching
// 100% on its own — it should never visually "finish" before the request
// actually resolves. The parent unmounts this component on success/error,
// which is the only true completion signal.
const PROGRESS_CAP = 0.94;

const steps = [
  "Analyzing facial features...",
  "Cross-referencing documents...",
  "Finalizing verification...",
];
const STEP_INTERVAL_MS = 3000;

export default function IdentityVerifying({ loading }: { loading: boolean }) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const [stepIndex, setStepIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) return;

    const stepTimer = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setStepIndex(prev => (prev + 1) % steps.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, STEP_INTERVAL_MS);

    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: PROGRESS_CAP,
      duration: REQUEST_TIMEOUT_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false, // animating `width` can't use the native driver
    }).start();

    return () => clearInterval(stepTimer);
  }, [loading, fadeAnim, progressAnim]);

  if (!loading) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.primary} />

          <AppText style={styles.title}>Verifying your Identity</AppText>

          <Animated.View style={{ opacity: fadeAnim }}>
            <AppText style={styles.stepText}>{steps[stepIndex]}</AppText>
          </Animated.View>

          <View style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressBar, { width: progressWidth }]}
            />
          </View>

          <AppText style={styles.disclaimer}>
            Please do not close the app or go back.
          </AppText>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    card: {
      width: "100%",
      alignItems: "center",
      marginTop: -200,
    },
    title: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginTop: 20,
    },
    stepText: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.primary,
      marginBottom: 24,
    },
    progressTrack: {
      width: "80%",
      height: 3,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: "hidden",
      marginBottom: 16,
    },
    progressBar: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    disclaimer: {
      fontSize: normalize(12),
      fontFamily: getFontFamily("700"),
      color: colors.textMuted,
      textAlign: "center",
    },
  });
