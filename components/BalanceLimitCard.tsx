import React from "react";
import { View, Text, StyleSheet } from "react-native";
import BalanceCard from "./Dashboard/BalanceCard";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";

export default function BalanceLimitCard({ walletSummary }: any) {
  const progress =
    walletSummary && walletSummary.daily_limit
      ? walletSummary.total_today / walletSummary.daily_limit
      : 0;

  return (
    <>
      <BalanceCard
        balance={walletSummary?.balance}
        title="Wallet Balance"
        showTransactionsButton={false}
        showActionButtons={false}
      />

      <View style={styles.limitContainer}>
        <View style={styles.limitHeader}>
          <Text style={styles.limitLabel}>
            Daily Limit: ₦{walletSummary?.daily_limit?.toLocaleString() || "0"}
          </Text>
          <Text style={styles.upgradeText}>Upgrade Limit</Text>
        </View>

        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(progress * 100, 100)}%` },
            ]}
          />
        </View>

        <View style={styles.limitRange}>
          <Text style={styles.limitValue}>
            ₦{walletSummary?.total_today?.toLocaleString() || "0"}
          </Text>
          <Text style={styles.limitValue}>
            ₦{walletSummary?.daily_limit?.toLocaleString() || "0"}
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  limitContainer: {
    marginTop: 20,
    backgroundColor: "#EFF7EC",
    padding: 10,
    borderRadius: 10,
  },
  limitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  limitLabel: {
    fontSize: normalize(16),
    color: "#000",
    fontFamily: getFontFamily("700"),
  },
  upgradeText: {
    fontSize: normalize(16),
    color: COLORS.secondary,
    fontFamily: getFontFamily("700"),
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginTop: 18,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 3,
  },
  limitRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  limitValue: {
    fontFamily: getFontFamily("800"),
    fontSize: normalize(18),
  },
});
