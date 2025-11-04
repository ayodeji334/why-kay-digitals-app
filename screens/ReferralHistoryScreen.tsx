import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Share as ShareElement,
  Alert,
  RefreshControl,
} from "react-native";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { formatAmount } from "../libs/formatNumber";
import { useAuthStore } from "../stores/authSlice";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../api/axios";
import { formatDate } from "../libs/formatDate";
import CustomLoading from "../components/CustomLoading";

// Types
interface ReferralItem {
  uuid: string;
  name: string;
  email: string;
  created_at: string;
  amount: string;
  status: "completed" | "pending";
}

interface TabProps {
  active: boolean;
  title: string;
  count: number;
  onPress: () => void;
}

const Tab: React.FC<TabProps> = ({ active, title, count, onPress }) => (
  <TouchableOpacity
    style={[styles.tab, active && styles.activeTab]}
    onPress={onPress}
  >
    <Text style={[styles.tabTitle, active && styles.activeTabTitle]}>
      {title}
    </Text>
    <Text style={[styles.countText, active && styles.activeCountText]}>
      ({count})
    </Text>
  </TouchableOpacity>
);

const EmptyState: React.FC<{ type: "signedUp" | "pending" }> = ({ type }) => {
  const user = useAuthStore(state => state.user);

  const handleShareCode = async () => {
    try {
      const result = await ShareElement.share({
        message: `Hey! Use my referral code *${user?.referral_code}* to sign up and enjoy rewards! 🎉`,
      });

      if (result.action === ShareElement.sharedAction) {
        // if (result.activityType) {
        // } else {
        // }
      } else if (result.action === ShareElement.dismissedAction) {
        // console.log("Share dismissed");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {type === "signedUp"
          ? "No Signed Up Referrals"
          : "No Pending Referrals"}
      </Text>
      <Text style={styles.emptyStateDescription}>
        {type === "signedUp"
          ? "When people sign up using your referral code, they'll appear here."
          : "Referrals that haven't completed their first trade will appear here."}
      </Text>
      <TouchableOpacity
        onPress={handleShareCode}
        activeOpacity={0.8}
        style={styles.inviteButton}
      >
        <Text style={styles.inviteButtonText}>Invite Friends</Text>
      </TouchableOpacity>
    </View>
  );
};

const capitalizeWords = (str: string) =>
  str.replace(/\b\w/g, char => char.toUpperCase());

const ReferralCard: React.FC<{ item: ReferralItem }> = ({ item }) => (
  <View style={styles.referralCard}>
    <View style={styles.referralHeader}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{capitalizeWords(item.name)}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <Text style={styles.amount}>{formatAmount(parseFloat(item.amount))}</Text>
    </View>
    <View style={styles.referralFooter}>
      <Text style={styles.date}>{formatDate(item.created_at)}</Text>
      <View
        style={[
          styles.statusBadge,
          item.status === "completed"
            ? { backgroundColor: "#EFF7EC" }
            : { backgroundColor: "#FFF7E6" },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            item.status === "completed"
              ? styles.completedText
              : styles.pendingText,
          ]}
        >
          {item.status === "completed" ? "Completed" : "Pending"}
        </Text>
      </View>
    </View>
  </View>
);

const StatCard: React.FC<{
  title: string;
  value: string;
  direction?: "right" | "left";
}> = ({ title, value, direction = "left" }) => (
  <View
    style={[
      styles.statCard,
      { alignItems: direction === "right" ? "flex-end" : "flex-start" },
    ]}
  >
    <Text
      style={[
        styles.statTitle,
        { textAlign: direction, fontSize: normalize(18) },
      ]}
    >
      {title}
    </Text>
    <Text
      style={[
        styles.statTitle,
        {
          textAlign: direction,
          fontSize: normalize(18),
          fontFamily: getFontFamily("800"),
        },
      ]}
    >
      {value}
    </Text>
  </View>
);

interface Referral {
  uuid: string;
  name: string;
  email: string;
  status: "completed" | "pending";
  amount: string;
  created_at: string;
}
interface ReferralResponse {
  success: boolean;
  message: string;
  data: {
    total_bonus: number;
    referrals: Referral[];
  };
}

export const useReferralHistory = () => {
  return;
};

const ReferralHistoryScreen: React.FC = () => {
  const { apiGet } = useAxios();
  const [activeTab, setActiveTab] = useState<"signedUp" | "pending">(
    "signedUp",
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      await refetch();
    } catch (error) {
      console.error("Failed to refresh referrals:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const referrals = data?.data.referrals ?? [];
  const totalBonus = data?.data.total_bonus ?? 0;

  const completedReferrals = useMemo(
    () => referrals.filter((r: any) => r.status === "completed"),
    [referrals],
  );
  const pendingReferrals = useMemo(
    () => referrals.filter((r: any) => r.status === "pending"),
    [referrals],
  );

  const currentReferrals =
    activeTab === "signedUp" ? completedReferrals : pendingReferrals;
  const signedUpCount = completedReferrals.length;
  const pendingCount = pendingReferrals.length;
  const hasReferrals = currentReferrals.length > 0;

  return (
    <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />

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
            title="Pending Referrals Earnings"
            value="₦0.00"
          />
          <StatCard
            direction="right"
            title="Total Earned"
            value={formatAmount(totalBonus)}
          />
        </View>

        <View style={styles.tabsContainer}>
          <Tab
            active={activeTab === "signedUp"}
            title="Signed Up"
            count={signedUpCount}
            onPress={() => setActiveTab("signedUp")}
          />
          <Tab
            active={activeTab === "pending"}
            title="Pending"
            count={pendingCount}
            onPress={() => setActiveTab("pending")}
          />
        </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("700"),
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("400"),
    color: "#6B7280",
    textAlign: "center",
    lineHeight: normalize(22),
    marginBottom: 24,
  },
  inviteButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 38,
  },
  inviteButtonText: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
    color: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily(800),
    color: "#000",
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statsSection: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#16A34A",
    borderWidth: 1,
    borderColor: "#e7e7e7",
    gap: 12,
    marginBottom: 30,
    borderRadius: 5,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    justifyContent: "space-between",
  },
  statTitle: {
    fontSize: normalize(15),
    fontFamily: getFontFamily(400),
    marginBottom: 8,
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
    padding: 7,
    marginTop: 10,
    marginBottom: 16,
    gap: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabTitle: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
  },
  activeTabTitle: {
    color: "#fff",
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
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
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    elevation: 2,
  },
  referralHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: normalize(17),
    fontFamily: getFontFamily(800),
    color: "#000",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
  },
  amount: {
    fontSize: normalize(18),
    fontFamily: getFontFamily(800),
  },
  referralFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: normalize(15),
    fontFamily: getFontFamily(700),
    color: "#989da6ff",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: normalize(14),
    fontFamily: getFontFamily(700),
  },
  completedText: {
    color: "#5AB243",
  },
  pendingText: {
    color: "#D97706",
  },
});

export default ReferralHistoryScreen;
