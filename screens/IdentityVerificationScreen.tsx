import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import IdNumberForm from "../components/forms/IdNumberForm";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import { useStyles } from "../hooks/useStyles";

/** Collects the NIN for identity verification (see IdNumberForm). */
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
      >
        <AppText style={styles.subtitle}>
          We'll check your National Identification Number (NIN). If this is your
          first verification, we'll also take a quick live selfie to confirm
          it's you.
        </AppText>
        <View style={styles.formSection}>
          <IdNumberForm idType="nin" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollView: {
      flex: 1,
      paddingHorizontal: normalizeSpacing(20),
      backgroundColor: colors.background,
    },
    subtitle: {
      fontSize: normalize(17),
      color: colors.text,
      fontFamily: getFontFamily(400),
      paddingVertical: normalizeSpacing(20),
    },
    formSection: { marginBottom: normalizeSpacing(32) },
  });
