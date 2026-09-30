import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { NavigationContext } from "@react-navigation/native";
import { CloudCross, Danger, WifiSquare } from "iconsax-react-nativejs";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";
import { COLORS } from "../constants/colors";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import {
  getRequestErrorKind,
  getRequestErrorMessage,
} from "../libs/requestError";
import { useStyles } from "../hooks/useStyles";

interface Props {
  /** The failed request's error; drives the icon and default message. */
  error?: unknown;
  /** Short headline, e.g. "Couldn't load Bitcoin details". */
  title?: string;
  /** Overrides the message derived from `error`. */
  message?: string;
  /** Re-runs the failed request(s). The button shows a spinner until it settles. */
  onRetry: () => unknown | Promise<unknown>;
  /** Button text; defaults to "Try again". */
  retryLabel?: string;
  /** Show a "Go back" link (default true on full-screen, false inline). */
  showBack?: boolean;
  /** Inline card inside a screen instead of a full-screen state. */
  compact?: boolean;
}

/**
 * Shown when data a screen needs failed to load, instead of rendering blanks,
 * "undefined", or misleading defaults.
 */
const RequestErrorState: React.FC<Props> = ({
  error,
  title = "We couldn't load this page",
  message,
  onRetry,
  retryLabel = "Try again",
  showBack,
  compact = false,
}) => {
  const colors = useColors();
  const styles = useStyles(makeStyles);
  // Read the context rather than useNavigation(), which throws outside a
  // navigator — the app-level crash screen renders above navigation.
  const navigation: any = useContext(NavigationContext);
  const [isRetrying, setIsRetrying] = useState(false);

  const kind = getRequestErrorKind(error);
  const Icon =
    kind === "offline" ? WifiSquare : kind === "server" ? CloudCross : Danger;
  const body = message ?? getRequestErrorMessage(error);
  const canGoBack =
    (showBack ?? !compact) && navigation?.canGoBack?.() === true;

  const handleRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <View style={compact ? styles.compactContainer : styles.fullContainer}>
      <View style={compact ? styles.compactCard : styles.content}>
        <View style={compact ? styles.compactIconWrap : styles.iconWrap}>
          <Icon
            size={normalize(compact ? 22 : 34)}
            color={colors.primary}
            variant="Bold"
          />
        </View>

        <AppText style={compact ? styles.compactTitle : styles.title}>
          {title}
        </AppText>
        <AppText style={compact ? styles.compactMessage : styles.message}>
          {body}
        </AppText>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            compact ? styles.compactButton : styles.button,
            isRetrying && styles.buttonBusy,
          ]}
          onPress={handleRetry}
          disabled={isRetrying}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
        >
          {isRetrying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <AppText style={styles.buttonText}>{retryLabel}</AppText>
          )}
        </TouchableOpacity>

        {canGoBack && (
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

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    fullContainer: {
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
      marginTop: -80,
    },
    iconWrap: {
      width: normalize(60),
      height: normalize(60),
      borderRadius: normalize(36),
      backgroundColor: colors.infoCardBackgroundColor,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: normalizeSpacing(18),
    },
    title: {
      fontFamily: getFontFamily("800"),
      fontSize: normalize(19),
      color: colors.text,
      textAlign: "center",
      marginBottom: normalizeSpacing(8),
    },
    message: {
      fontFamily: getFontFamily("400"),
      fontSize: normalize(16),
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
      marginTop: normalizeSpacing(30),
    },
    buttonBusy: {
      opacity: 0.7,
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

    compactContainer: {
      marginVertical: normalizeSpacing(10),
    },
    compactCard: {
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: normalizeSpacing(16),
    },
    compactIconWrap: {
      width: normalize(44),
      height: normalize(44),
      borderRadius: normalize(22),
      backgroundColor: colors.errorLight,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: normalizeSpacing(10),
    },
    compactTitle: {
      fontFamily: getFontFamily("800"),
      fontSize: normalize(18),
      color: colors.text,
      textAlign: "center",
      marginBottom: normalizeSpacing(4),
    },
    compactMessage: {
      fontFamily: getFontFamily("400"),
      fontSize: normalize(16),
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: normalizeSpacing(12),
    },
    compactButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 100,
      paddingVertical: normalizeSpacing(10),
      paddingHorizontal: normalizeSpacing(28),
      alignItems: "center",
    },
  });

export default RequestErrorState;
