import React from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  normalize,
  getFontFamily,
  normalizeSpacing,
} from "../constants/settings";
import { COLORS } from "../constants/colors";
import { Bank, Personalcard, WalletAdd } from "iconsax-react-nativejs";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../stores/authSlice";
import { AppText } from "./AppText";
import { hasVerifiedIdentity } from "../libs/kyc";
import { useColors, useResolvedTheme } from "../hooks/useTheme";
import { useStyles } from "../hooks/useStyles";

// Either document creates the deposit account (PalmPay): BVN-based when the
// user has one, otherwise NIN-based.
const ID_OPTIONS = [
  {
    key: "bvn",
    Icon: Bank,
    title: "BVN",
    description: "Your 11-digit Bank Verification Number",
  },
  {
    key: "nin",
    Icon: Personalcard,
    title: "NIN",
    description: "Your 11-digit National Identification Number",
  },
];

const STEPS = [
  "Verify your phone number",
  "Verify your BVN or NIN (with a quick selfie the first time)",
  "Your account number is created automatically, usually within seconds",
];

/**
 * Shown on the deposit screen until the user has verified a BVN or NIN.
 */
export default function KYCStatusScreen() {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);
  const colors = useColors();
  const styles = useStyles(makeStyles);
  // Shadows only read on light backgrounds; dark mode uses the border instead.
  const isDark = useResolvedTheme() === "dark";
  // Verified with either document (BVN or NIN).
  const isAlreadyVerified = hasVerifiedIdentity(user);

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.top}>
          <View style={styles.headerSection}>
            <View style={styles.iconCircle}>
              <WalletAdd
                size={30}
                color={colors.primaryLight}
                variant="Linear"
              />
            </View>
            <AppText style={styles.emptyTitle}>Get your account number</AppText>
            <AppText style={styles.emptyDescription}>
              Verify your identity with your BVN or your NIN and we'll create a
              personal account number for your deposits.
            </AppText>
          </View>

          <View style={[styles.requirementsCard, !isDark && styles.cardShadow]}>
            <AppText style={styles.cardTitle}>Verify with either</AppText>

            {ID_OPTIONS.map(({ key, Icon, title, description }, index) => (
              <React.Fragment key={key}>
                {index > 0 && (
                  <View style={styles.orRow}>
                    <View style={styles.orLine} />
                    <AppText style={styles.orText}>or</AppText>
                    <View style={styles.orLine} />
                  </View>
                )}
                <View style={styles.requirementRow}>
                  <View style={styles.requirementIcon}>
                    <Icon size={16} color={colors.primaryLight} />
                  </View>
                  <View style={styles.requirementText}>
                    <AppText style={styles.itemHeader}>{title}</AppText>
                    <AppText style={styles.itemSub}>{description}</AppText>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>

          <View style={styles.steps}>
            <AppText style={styles.stepsTitle}>How it works</AppText>
            {STEPS.map((step, index) => (
              <View key={step} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <AppText style={styles.stepNumberText}>{index + 1}</AppText>
                </View>
                <AppText style={styles.stepText}>{step}</AppText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Verification" as never)}
            activeOpacity={0.8}
            style={[styles.emptyButton, !isDark && styles.buttonShadow]}
            accessibilityRole="button"
          >
            <AppText style={styles.emptyButtonText}>
              {isAlreadyVerified ? "Continue " : "Start "} KYC Verification
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.laterButton}
            accessibilityRole="button"
          >
            <AppText style={styles.laterButtonText}>I'll do it later</AppText>
          </TouchableOpacity>
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
    content: {
      flexGrow: 1,
      justifyContent: "space-between",
      padding: normalizeSpacing(20),
    },
    top: { width: "100%" },
    headerSection: {
      alignItems: "center",
      marginBottom: normalizeSpacing(22),
    },
    iconCircle: {
      width: 55,
      height: 55,
      borderRadius: 50,
      backgroundColor: colors.infoCardBackgroundColor,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: normalizeSpacing(24),
    },
    emptyTitle: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      textAlign: "center",
    },
    emptyDescription: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.textSecondary,
      textAlign: "center",
      paddingHorizontal: normalizeSpacing(10),
    },
    requirementsCard: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: normalizeSpacing(20),
      width: "100%",
      marginBottom: normalizeSpacing(20),
    },
    cardShadow: {
      borderColor: "#e7e7e7",
      // shadowColor: "#000",
      // shadowOffset: { width: 0, height: 2 },
      // shadowOpacity: 0.05,
      // shadowRadius: 10,
      // elevation: 2,
    },
    cardTitle: {
      fontSize: normalize(19),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalizeSpacing(20),
    },
    orRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: normalizeSpacing(10),
      marginVertical: normalizeSpacing(12),
    },
    orLine: { flex: 1, height: 1, backgroundColor: colors.border },
    orText: {
      fontSize: normalize(15),
      fontFamily: getFontFamily("700"),
      color: colors.textMuted,
      textTransform: "uppercase",
    },
    steps: {
      width: "100%",
      gap: normalizeSpacing(12),
      marginBottom: normalizeSpacing(24),
    },
    stepsTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    stepRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: normalizeSpacing(10),
    },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.primary,
    },
    stepNumberText: {
      color: "#fff",
      fontSize: normalize(14),
      fontFamily: getFontFamily("800"),
    },
    stepText: {
      flex: 1,
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.textSecondary,
    },
    requirementRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    requirementIcon: {
      width: 30,
      height: 30,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginRight: normalizeSpacing(12),
      backgroundColor: colors.infoCardBackgroundColor,
    },
    requirementText: { flex: 1 },
    itemHeader: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: colors.text,
    },
    itemSub: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
    },
    buttonGroup: {
      width: "100%",
      gap: 12,
      paddingBottom: normalizeSpacing(20),
    },
    emptyButton: {
      width: "100%",
      paddingVertical: normalizeSpacing(14),
      borderRadius: 160,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.primary,
    },
    buttonShadow: {
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    emptyButtonText: {
      color: "#fff",
      fontSize: normalize(16),
      fontFamily: getFontFamily("700"),
    },
    laterButton: {
      width: "100%",
      paddingVertical: normalizeSpacing(14),
      borderRadius: 160,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.primaryLight,
    },
    laterButtonText: {
      fontSize: normalize(16),
      fontFamily: getFontFamily("700"),
      color: colors.primaryLight,
    },
  });
