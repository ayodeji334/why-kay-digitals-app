import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  // TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BVNForm from "../components/forms/BVNVerificationForm";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { COLORS } from "../constants/colors";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import { useStyles } from "../hooks/useStyles";

export default function BVNVerificationScreen() {
  const styles = useStyles(makeStyles);

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <>
          <AppText style={styles.subtitle}>
            We'll match your BVN details with a live selfie to confirm your
            identity. This process is quick and secure.
          </AppText>
          <View style={styles.formSection}>
            <BVNForm />
          </View>
        </>
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
      color: "#666",
      marginBottom: normalizeSpacing(16),
    },
    editButton: {
      backgroundColor: COLORS.primary,
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
