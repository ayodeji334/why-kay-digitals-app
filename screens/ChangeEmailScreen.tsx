import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import ChangeEmailForm from "../components/forms/ChangeEmailForm";

type VerificationStep = "email" | "otp";

export default function ChangeEmailScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const [step, setStep] = useState<VerificationStep>("email");

  const subtitle =
    step === "otp"
      ? "Enter the 6-digit code we just sent to your new email address to confirm it's really you."
      : "Update the email address linked to your account. We'll send a one-time code to the new address to confirm it's yours before switching over.";

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <AppText style={styles.subtitle}>{subtitle}</AppText>
        <View style={styles.formSection}>
          <ChangeEmailForm onStepChange={setStep} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flexGrow: 1,
      paddingHorizontal: normalizeSpacing(20),
      backgroundColor: colors.background,
    },
    subtitle: {
      fontSize: normalize(18),
      color: colors.text,
      fontFamily: getFontFamily(700),
      paddingVertical: normalizeSpacing(20),
    },
    formSection: {
      marginBottom: normalizeSpacing(32),
    },
  });
