import React from "react";
import { View, Text, StyleSheet } from "react-native";
import BalanceCard from "./Dashboard/BalanceCard";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { AppText } from "./AppText";

export default function BalanceLimitCard({ walletSummary }: any) {
  const navigation = useNavigation<any>();
  const progress =
    walletSummary && walletSummary.daily_limit
      ? walletSummary.total_today / walletSummary.daily_limit
      : 0;

  return (
    <>
      <BalanceCard
        balance={walletSummary?.withdrawable_balance}
        title="Withdrawal Balance"
        showTransactionsButton={false}
        showActionButtons={false}
      />

      <AppText
        style={{
          fontFamily: getFontFamily(700),
          fontSize: normalize(18),
          color: "black",
          borderRadius: 10,
        }}
      >
        Note: The balance shown above is your{" "}
        <AppText style={{ fontFamily: getFontFamily("900") }}>
          withdrawable balance
        </AppText>
        — the amount you can withdraw from the platform. It does not include
        your total balance, which may contain deposits that are reserved for
        trading only
      </AppText>

      <View style={styles.limitContainer}>
        <View style={styles.limitHeader}>
          <AppText style={styles.limitLabel}>
            Daily Limit: ₦{walletSummary?.daily_limit?.toLocaleString() || "0"}
          </AppText>
          <AppText
            onPress={() => navigation.navigate("Verification" as any)}
            style={styles.upgradeText}
          >
            Upgrade Limit
          </AppText>
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
          <AppText style={styles.limitValue}>
            ₦
            {walletSummary?.total_today
              ? walletSummary?.total_today?.toLocaleString()
              : "0"}
          </AppText>
          <AppText style={styles.limitValue}>
            ₦
            {walletSummary?.daily_limit
              ? walletSummary?.daily_limit?.toLocaleString()
              : "0"}
          </AppText>
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
    fontSize: normalize(18),
    color: "#000",
    fontFamily: getFontFamily("700"),
  },
  upgradeText: {
    fontSize: normalize(18),
    color: COLORS.secondary,
    fontFamily: getFontFamily("700"),
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginTop: 18,
  },
  progressBarFill: {
    height: 4,
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
