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
// Same send/verify OTP flow (and same /auth/phone-otp/* endpoints) as the
// KYC "verify your phone" prompt — reused as-is rather than duplicated,
// this screen just frames it as an update to an existing number.
import PhoneNumberForm from "../components/forms/PhoneVerificationForm";

type VerificationStep = "phone" | "otp";

export default function ChangePhoneNumberScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const [step, setStep] = useState<VerificationStep>("phone");

  const subtitle =
    step === "otp"
      ? "Enter the 6-digit code we just sent to confirm your new phone number."
      : "Update the phone number linked to your account. We'll send a one-time code to confirm it's yours before switching over.";

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <AppText style={styles.subtitle}>{subtitle}</AppText>
        <View style={styles.formSection}>
          <PhoneNumberForm onStepChange={setStep} />
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
