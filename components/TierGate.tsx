import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Lock1 } from "iconsax-react-nativejs";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";
import { useUser } from "../stores/authSlice";
import { COLORS } from "../constants/colors";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import {
  FEATURE_LABELS,
  RestrictedFeature,
  getRestrictionMessage,
  isFeatureRestricted,
} from "../libs/tierAccess";
import { useStyles } from "../hooks/useStyles";

/** True when the signed-in user's tier can't use `feature`. */
export const useIsFeatureRestricted = (feature: RestrictedFeature) => {
  const user = useUser();
  return isFeatureRestricted(user?.tier_level, feature);
};

/** Full-screen "upgrade to unlock" state for a restricted feature. */
export const TierRestrictedState = ({
  feature,
}: {
  feature: RestrictedFeature;
}) => {
  const styles = useStyles(makeStyles);
  const navigation: any = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Lock1 size={normalize(34)} color={COLORS.primary} variant="Bulk" />
        </View>
        <AppText style={styles.title}>
          Upgrade to unlock {FEATURE_LABELS[feature].toLowerCase()}
        </AppText>
        <AppText style={styles.message}>
          {getRestrictionMessage(feature)}
        </AppText>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={() => navigation.navigate("Verification" as never)}
          accessibilityRole="button"
        >
          <AppText style={styles.buttonText}>Upgrade Account</AppText>
        </TouchableOpacity>

        {navigation.canGoBack?.() && (
          <TouchableOpacity
            hitSlop={10}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
          >
            <AppText style={styles.backText}>Go back</AppText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/**
 * Wraps a screen so users whose tier can't use `feature` see the upgrade
 * state instead — whichever button or link they opened it from. Used where
 * screens are registered in navigation/Navigation.tsx.
 */
export function withTierGate<P extends object>(
  feature: RestrictedFeature,
  Screen: React.ComponentType<P>,
) {
  const Gated = (props: P) => {
    const isRestricted = useIsFeatureRestricted(feature);
    if (isRestricted) return <TierRestrictedState feature={feature} />;
    return <Screen {...props} />;
  };
  Gated.displayName = `TierGate(${Screen.displayName ?? Screen.name})`;
  return Gated;
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: normalizeSpacing(28),
      backgroundColor: colors.background,
    },
    content: {
      alignItems: "center",
      maxWidth: 360,
      width: "100%",
    },
    iconWrap: {
      width: normalize(72),
      height: normalize(72),
      borderRadius: normalize(36),
      backgroundColor: colors.infoCardBackgroundColor,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: normalizeSpacing(18),
    },
    title: {
      fontFamily: getFontFamily("800"),
      fontSize: normalize(21),
      color: colors.text,
      textAlign: "center",
      marginBottom: normalizeSpacing(8),
    },
    message: {
      fontFamily: getFontFamily("400"),
      fontSize: normalize(17),
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: normalizeSpacing(24),
    },
    button: {
      backgroundColor: COLORS.primary,
      borderRadius: 100,
      paddingVertical: normalizeSpacing(14),
      alignSelf: "stretch",
      alignItems: "center",
      marginBottom: normalizeSpacing(14),
    },
    buttonText: {
      color: "#fff",
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
    },
    backText: {
      color: colors.textSecondary,
      fontFamily: getFontFamily("700"),
      fontSize: normalize(17),
      textDecorationLine: "underline",
    },
  });
