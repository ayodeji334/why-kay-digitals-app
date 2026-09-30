import React from "react";
import { View, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { AppText } from "./AppText";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { COLORS } from "../constants/colors";
import { useColors } from "../hooks/useTheme";
import { formatAmount } from "../libs/formatNumber";
import { useStyles } from "../hooks/useStyles";

interface FundingSourceSelectorProps {
  usePoints: boolean;
  onUsePointsChange: (value: boolean) => void;
  pointsBalance: number;
  pointsWorth: number;
  fiatBalance: number | string;
  disabled?: boolean;
}

/**
 * The points+wallet funding toggle shared across every bill-purchase screen
 * (data, airtime, electricity, betting). Blended semantics: usePoints=true
 * means "apply points first, wallet covers the rest" — not "pay entirely
 * with points" — so the label always shows both balances once points are on.
 *
 * When the user has no points to spend, there's nothing to toggle, so we
 * skip the switch entirely and just show the wallet balance as plain text.
 */
export function FundingSourceSelector({
  usePoints,
  onUsePointsChange,
  pointsBalance,
  pointsWorth,
  fiatBalance,
  disabled = false,
}: FundingSourceSelectorProps) {
  const styles = useStyles(makeStyles);

  const hasPoints = pointsWorth > 0;
  const fiatDisplay = formatAmount((fiatBalance as number) ?? 0, {
    decimalPlace: 2,
  });

  // No points available — nothing to toggle, so no switch, no interaction.
  if (!hasPoints) {
    return (
      <View style={styles.plainRow}>
        <AppText style={styles.balanceLabel}>
          Wallet Balance: {fiatDisplay}
        </AppText>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={() => onUsePointsChange(!usePoints)}
      style={styles.fundingSourceRow}
    >
      <View style={{ flex: 1 }}>
        <AppText style={styles.balanceLabel}>
          {usePoints
            ? `${pointsBalance} pts (${
                formatAmount(pointsWorth, { decimalPlace: 2 }) ?? 0
              }) + Wallet ${fiatDisplay}`
            : `Wallet Balance: ${fiatDisplay}`}
        </AppText>
        <AppText style={styles.fundingSourceHint}>
          {usePoints
            ? "Referral Bonus Point applied first, wallet covers the rest"
            : "Tap to apply your referral points first"}
        </AppText>
      </View>
      <Switch
        value={usePoints}
        onValueChange={onUsePointsChange}
        disabled={disabled}
        trackColor={{ false: "#D1D5DB", true: COLORS.secondary }}
        thumbColor="#fff"
        style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
      />
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    plainRow: {
      paddingVertical: normalizeSpacing(6),
      marginTop: normalizeSpacing(8),
      marginBottom: normalizeSpacing(8),
    },
    fundingSourceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: normalizeSpacing(9),
      marginTop: normalizeSpacing(8),
      marginBottom: normalizeSpacing(8),
    },
    balanceLabel: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalizeSpacing(4),
    },
    fundingSourceHint: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
    },
  });
