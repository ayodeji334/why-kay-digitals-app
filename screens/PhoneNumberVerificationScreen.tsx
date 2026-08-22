import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import PhoneNumberForm from "../components/forms/PhoneVerificationForm";

export default function PhoneNumberVerificationScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <AppText style={styles.subtitle}>
          Verify your phone number to secure your account and unlock deposits,
          withdrawals, and other services. We'll send a one-time code to confirm
          it's really you.
        </AppText>
        <View style={styles.formSection}>
          <PhoneNumberForm />
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
      paddingHorizontal: 20,
      backgroundColor: colors.background,
    },
    subtitle: {
      fontSize: normalize(18),
      color: colors.text,
      fontFamily: getFontFamily(700),
      paddingVertical: 20,
    },
    formSection: {
      marginBottom: 32,
    },
    infoSection: {
      backgroundColor: "#fff",
      borderRadius: 12,
      paddingVertical: 20,
      paddingHorizontal: 16,
      marginBottom: 20,
    },
    bulletText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: "#666",
      // lineHeight: 20,
      marginBottom: 16,
    },
    editButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: 12,
      borderRadius: 80,
      alignItems: "center",
      marginTop: 30,
    },
    editButtonText: {
      color: "#FFF",
      fontSize: normalize(16),
      fontFamily: getFontFamily(700),
    },
  });
