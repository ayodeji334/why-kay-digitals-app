// import React from "react";
// import { View, Switch, StyleSheet } from "react-native";
// import { AppText } from "./AppText";
// import { getFontFamily, normalize } from "../constants/settings";
// import { COLORS } from "../constants/colors";
// import { useColors } from "../hooks/useTheme";
// import { formatAmount } from "../libs/formatNumber";

// interface FundingSourceSelectorProps {
//   usePoints: boolean;
//   onUsePointsChange: (value: boolean) => void;
//   pointsBalance: number;
//   pointsWorth: number;
//   fiatBalance: number | string;
//   disabled?: boolean;
// }

// /**
//  * The points+wallet funding toggle shared across every bill-purchase screen
//  * (data, airtime, electricity, betting). Blended semantics: usePoints=true
//  * means "apply points first, wallet covers the rest" — not "pay entirely
//  * with points" — so the label always shows both balances once points are on.
//  */
// export function FundingSourceSelector({
//   usePoints,
//   onUsePointsChange,
//   pointsBalance,
//   pointsWorth,
//   fiatBalance,
//   disabled = false,
// }: FundingSourceSelectorProps) {
//   const colors = useColors();
//   const styles = makeStyles(colors);

//   return (
//     <View style={styles.fundingSourceCard}>
//       <View style={styles.fundingSourceRow}>
//         <View style={{ flex: 1 }}>
//           <AppText style={styles.balanceLabel}>
//             {usePoints
//               ? `${pointsBalance} pts (${
//                   formatAmount(pointsWorth) ?? 0
//                 }) + Wallet ${formatAmount((fiatBalance as number) ?? 0, {
//                   decimalPlace: 2,
//                 })}`
//               : `Wallet Balance: ${formatAmount((fiatBalance as number) ?? 0, {
//                   decimalPlace: 2,
//                 })}`}
//           </AppText>
//           <AppText style={styles.fundingSourceHint}>
//             {usePoints
//               ? "Points applied first, wallet covers the rest"
//               : "Paying from your fiat wallet"}
//           </AppText>
//         </View>
//         <Switch
//           value={usePoints}
//           onValueChange={onUsePointsChange}
//           disabled={disabled || pointsWorth <= 0}
//           trackColor={{ false: "#D1D5DB", true: COLORS.secondary }}
//           thumbColor="#fff"
//           style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
//         />
//       </View>
//       {pointsWorth <= 0 && (
//         <AppText style={styles.fundingSourceHint}>
//           You don't have any points to spend yet.
//         </AppText>
//       )}
//     </View>
//   );
// }

// const makeStyles = (colors: ReturnType<typeof useColors>) =>
//   StyleSheet.create({
//     fundingSourceCard: {
//       paddingHorizontal: normalize(10),
//       paddingVertical: normalize(9),
//       backgroundColor: colors.inputBackground,
//       borderRadius: 12,
//       borderWidth: 1,
//       borderColor: colors.border,
//       marginTop: 8,
//       marginBottom: 8,
//     },
//     fundingSourceRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//     },
//     balanceLabel: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("800"),
//       // was hardcoded "#000000" in the original inline version — using
//       // colors.text now that this renders across multiple screens, so it
//       // actually respects dark mode everywhere it's dropped in.
//       color: colors.text,
//       marginBottom: 4,
//     },
//     fundingSourceHint: {
//       fontSize: normalize(14),
//       fontFamily: getFontFamily("400"),
//       color: colors.textMuted,
//     },
//   });
import React from "react";
import { View, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { AppText } from "./AppText";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { useColors } from "../hooks/useTheme";
import { formatAmount } from "../libs/formatNumber";

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
  const colors = useColors();
  const styles = makeStyles(colors);

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
      paddingVertical: normalize(6),
      marginTop: 8,
      marginBottom: 8,
    },
    fundingSourceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: normalize(9),
      marginTop: 8,
      marginBottom: 8,
    },
    balanceLabel: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: 4,
    },
    fundingSourceHint: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
    },
  });
