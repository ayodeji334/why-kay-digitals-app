import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  // TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import NINVerificationForm from "../components/forms/NINVerificationForm";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import { useStyles } from "../hooks/useStyles";

export default function IdentityVerificationScreen() {
  const styles = useStyles(makeStyles);

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <AppText style={styles.subtitle}>
          We'll authenticate your National Identification Number (NIN) by
          matching it with the details attached to your Bank Verfication Number
          (BVN) for secure identity verification. This process ensures
          regulatory compliance and account security.
        </AppText>

        <View style={styles.formSection}>
          <NINVerificationForm />
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
      flex: 1,
      paddingHorizontal: normalizeSpacing(20),
      backgroundColor: colors.background,
    },
    subtitle: {
      fontSize: normalize(18),
      color: colors.text,
      fontFamily: getFontFamily(400),
      paddingBottom: normalizeSpacing(20),
    },
    formSection: {
      marginBottom: normalizeSpacing(32),
    },
    infoSection: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingVertical: normalizeSpacing(20),
      paddingHorizontal: normalizeSpacing(16),
      marginBottom: normalizeSpacing(20),
    },
    bulletText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
      marginBottom: normalizeSpacing(16),
    },
    editButton: {
      backgroundColor: colors.primary,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 80,
      alignItems: "center",
      marginTop: normalizeSpacing(30),
    },
    editButtonText: {
      color: "#FFF",
      fontSize: normalize(16),
      fontFamily: getFontFamily(700),
    },
  });
