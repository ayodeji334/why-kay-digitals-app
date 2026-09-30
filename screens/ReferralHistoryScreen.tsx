import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share as ShareElement,
  Alert,
  RefreshControl,
} from "react-native";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { formatAmount, formatNumber } from "../libs/formatNumber";
import { useAuthStore } from "../stores/authSlice";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "../libs/formatDate";
import CustomLoading from "../components/CustomLoading";
import useAxios from "../hooks/useAxios";
import { AxiosError } from "axios";
import { showError } from "../utlis/toast";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import TabSwitcher from "../components/TabSwitcher";
import { useStyles } from "../hooks/useStyles";

// Matches the real API response — status is "pending" | "rewarded" (not
// "completed"), and value is expressed as points + naira_value, not a
// single cash "amount".
interface ReferralItem {
  uuid: string;
  username: string;
  email: string;
  created_at: string;
  points: number;
  naira_value: string;
  status: "pending" | "rewarded";
}

interface ReferralResponse {
  success: boolean;
  message: string;
  data: {
    points_balance: number;
    total_worth_naira: string;
    referrals: ReferralItem[];
  };
}

const EmptyState: React.FC<{ type: "rewarded" | "pending" }> = ({ type }) => {
  const user = useAuthStore(state => state.user);
  const styles = useStyles(makeStyles);

  const handleShareCode = async () => {
    try {
      // referral_code no longer exists as a separate field — username IS
      // the referral code now.
      const result = await ShareElement.share({
        message: `Hey! Use my referral code *${user?.username}* to sign up and enjoy rewards on WhyKayDigitals App!`,
      });

      if (result.action === ShareElement.sharedAction) {
        // no-op
      } else if (result.action === ShareElement.dismissedAction) {
        // no-op
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.emptyState}>
      <AppText style={styles.emptyStateTitle}>
        {type === "rewarded" ? "No Rewarded Referrals" : "No Pending Referrals"}
      </AppText>
      <AppText style={styles.emptyStateDescription}>
        {type === "rewarded"
          ? "When people you refer make their first deposit, they'll appear here."
          : "Referrals that haven't made their first deposit yet will appear here."}
      </AppText>
      <TouchableOpacity
        onPress={handleShareCode}
        activeOpacity={0.8}
        style={styles.inviteButton}
      >
        <AppText style={styles.inviteButtonText}>Invite Friends</AppText>
      </TouchableOpacity>
    </View>
  );
};

const ReferralCard: React.FC<{ item: ReferralItem }> = ({ item }) => {
  const styles = useStyles(makeStyles);
  const nairaValue = item.points || 0;

  return (
    <View style={styles.referralCard}>
      <View style={styles.referralHeader}>
        <View style={styles.userInfo}>
          <AppText style={styles.userName}>{item.username}</AppText>
          <AppText style={styles.userEmail}>{item.email}</AppText>
        </View>
        <AppText style={styles.amount}>{formatNumber(nairaValue)} pts</AppText>
      </View>
      <View style={styles.referralFooter}>
        <AppText style={styles.date}>{formatDate(item.created_at)}</AppText>
        <View
          style={[
            styles.statusBadge,
            item.status === "rewarded"
              ? { backgroundColor: "#EFF7EC" }
              : { backgroundColor: "#FFF7E6" },
          ]}
        >
          <AppText
            style={[
              styles.statusText,
              item.status === "rewarded"
                ? styles.completedText
                : styles.pendingText,
            ]}
          >
            {item.status === "rewarded" ? "Completed" : "Pending"}
          </AppText>
        </View>
      </View>
    </View>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  direction?: "right" | "left" | "center";
}> = ({ title, value, direction = "left" }) => {
  const styles = useStyles(makeStyles);
  const align =
    direction === "center"
      ? "center"
      : direction === "right"
      ? "flex-end"
      : "flex-start";

  return (
    <View style={[styles.statCard, { alignItems: align }]}>
      <AppText style={[styles.statTitle, { textAlign: direction }]}>
        {title}
      </AppText>
      <AppText
        style={[
          styles.statTitle,
          {
            textAlign: direction,
            fontSize: normalize(24),
            fontFamily: getFontFamily("800"),
          },
        ]}
      >
        {value}
      </AppText>
    </View>
  );
};

const ReferralHistoryScreen: React.FC = () => {
  const { apiGet } = useAxios();
  const [activeTab, setActiveTab] = useState<"rewarded" | "pending">(
    "rewarded",
  );

  const styles = useStyles(makeStyles);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshUser = useAuthStore(state => state.refreshUser);

  const { data, isLoading, refetch } = useQuery<ReferralResponse>({
    queryKey: ["referralHistory"],
    queryFn: async () => {
      const response = await apiGet<ReferralResponse>(
        "/users/user/referral-history",
      );
      return response.data;
    },
    refetchOnWindowFocus: true,
  });

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetch(), refreshUser()]);
    } catch (err) {
      if (err instanceof AxiosError) {
        showError(
          err.response?.data?.message || "Something went wrong. Try again.",
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const referrals: ReferralItem[] = useMemo(
    () => data?.data?.referrals ?? [],
    [data?.data?.referrals],
  );

  const rewardedReferrals = useMemo(
    () => referrals.filter(r => r.status === "rewarded"),
    [referrals],
  );
  const pendingReferrals = useMemo(
    () => referrals.filter(r => r.status === "pending"),
    [referrals],
  );

  // All three stats come straight from the referrals list, not from
  // points_balance/total_worth_naira — those two reflect the CURRENT
  // spendable balance, which drops on redemption. "Total points earned" and
  // "total value earned" should stay lifetime numbers regardless of what's
  // since been spent, so they're summed from each rewarded referral's own
  // locked points/naira_value instead.
  const pendingPointsTotal = useMemo(
    () => pendingReferrals.reduce((sum, r) => sum + (r.points ?? 0), 0),
    [pendingReferrals],
  );
  const totalPointsEarned = useMemo(
    () => rewardedReferrals.reduce((sum, r) => sum + (r.points ?? 0), 0),
    [rewardedReferrals],
  );
  const totalValueEarned = useMemo(
    () =>
      rewardedReferrals.reduce(
        (sum, r) => sum + (parseFloat(r.naira_value) || 0),
        0,
      ),
    [rewardedReferrals],
  );

  const currentReferrals =
    activeTab === "rewarded" ? rewardedReferrals : pendingReferrals;
  const hasReferrals = currentReferrals.length > 0;

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsSection}>
          <StatCard
            direction="left"
            title="Pending Points"
            value={`${pendingPointsTotal}`}
          />
          <StatCard
            direction="center"
            title="Points Earned"
            value={`${totalPointsEarned}`}
          />
          <StatCard
            direction="right"
            title="Value Earned"
            value={formatAmount(totalValueEarned, { decimalPlace: 2 })}
          />
        </View>

        <TabSwitcher
          tabs={[
            { label: "Completed", value: "rewarded" },
            { label: "Pending", value: "pending" },
          ]}
          activeTab={activeTab}
          onTabChange={value => setActiveTab(value as any)}
          containerStyle={styles.tabSwitcher}
          activeTabStyle={styles.activeTab}
          activeTabTextStyle={styles.activeTabText}
        />

        <View style={styles.referralsList}>
          {hasReferrals ? (
            currentReferrals.map(item => (
              <ReferralCard key={item.uuid} item={item} />
            ))
          ) : (
            <EmptyState type={activeTab} />
          )}
        </View>
      </ScrollView>

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: normalizeSpacing(60),
      paddingHorizontal: normalizeSpacing(40),
    },
    emptyStateTitle: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      textAlign: "center",
      marginBottom: normalizeSpacing(4),
    },
    emptyStateDescription: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: normalize(22),
      marginBottom: normalizeSpacing(20),
    },
    inviteButton: {
      backgroundColor: COLORS.secondary,
      paddingHorizontal: normalizeSpacing(20),
      paddingVertical: normalizeSpacing(14),
      borderRadius: 38,
    },
    inviteButtonText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: "#fff",
    },
    tabSwitcher: {
      backgroundColor: colors.inputBackground,
      marginVertical: normalizeSpacing(10),
    },
    activeTab: {
      backgroundColor: COLORS.primary,
      color: colors.text,
    },
    activeTabText: {
      color: "white",
    },
    header: {
      paddingHorizontal: normalizeSpacing(20),
      paddingTop: normalizeSpacing(16),
      paddingBottom: normalizeSpacing(8),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily(800),
      color: colors.text,
      textAlign: "center",
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: normalizeSpacing(20),
      marginTop: normalizeSpacing(20),
    },
    statsSection: {
      flexDirection: "row",
      padding: normalizeSpacing(16),
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
      marginBottom: normalizeSpacing(12),
      borderRadius: 10,
    },
    statCard: {
      flex: 1,
      borderRadius: 12,
      justifyContent: "space-between",
    },
    statTitle: {
      fontSize: normalize(17),
      fontFamily: getFontFamily(400),
      marginBottom: normalizeSpacing(8),
      textAlign: "right",
      color: "#fff",
    },
    statValue: {
      fontSize: normalize(20),
      fontFamily: getFontFamily(800),
      color: "#fff",
      textAlign: "right",
    },
    tabsContainer: {
      flexDirection: "row",
      padding: normalizeSpacing(7),
      marginTop: normalizeSpacing(10),
      marginBottom: normalizeSpacing(16),
      gap: 8,
      backgroundColor: "#F3F4F6",
      borderRadius: 1000,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: normalizeSpacing(8),
      paddingHorizontal: normalizeSpacing(12),
      backgroundColor: "#F3F4F6",
      borderRadius: 800,
      gap: 8,
    },
    tabTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
    },
    activeTabTitle: {
      color: "#fff",
    },
    countBadge: {
      paddingHorizontal: normalizeSpacing(8),
      paddingVertical: normalizeSpacing(2),
      borderRadius: 12,
    },
    activeCountBadge: {},
    countText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      textAlign: "center",
    },
    activeCountText: {
      color: "#fff",
    },
    referralsList: {
      gap: 12,
    },
    referralCard: {
      backgroundColor: colors.inputBackground,
      padding: normalizeSpacing(10),
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 2,
    },
    referralHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: normalizeSpacing(12),
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: normalize(17),
      fontFamily: getFontFamily(900),
      color: colors.text,
      marginBottom: normalizeSpacing(4),
      textTransform: "uppercase",
    },
    userEmail: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.text,
    },
    amount: {
      fontSize: normalize(18),
      fontFamily: getFontFamily(900),
      color: colors.text,
    },
    referralFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    date: {
      fontSize: normalize(15),
      fontFamily: getFontFamily(700),
      color: colors.textMuted,
    },
    statusBadge: {
      paddingHorizontal: normalizeSpacing(12),
      paddingVertical: normalizeSpacing(4),
      borderRadius: 12,
    },
    statusText: {
      fontSize: normalize(16),
      fontFamily: getFontFamily(800),
    },
    completedText: {
      color: "#176105",
    },
    pendingText: {
      color: "#c46b06",
    },
  });

export default ReferralHistoryScreen;
