import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Share as ShareElement,
  Alert,
} from "react-native";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { formatAmount } from "../libs/formatNumber";
import { useAuthStore } from "../stores/authSlice";

// Types
interface ReferralItem {
  id: string;
  name: string;
  email: string;
  date: string;
  amount: string;
  status: "completed" | "pending";
}

interface TabProps {
  active: boolean;
  title: string;
  count: number;
  onPress: () => void;
}

// Dummy Data
const COMPLETED_REFERRALS: ReferralItem[] = [
  // {
  //   id: "1",
  //   name: "John Smith",
  //   email: "john.smith@example.com",
  //   date: "24 Aug. 2025",
  //   amount: "500.00",
  //   status: "completed",
  // },
  // {
  //   id: "2",
  //   name: "Sarah Johnson",
  //   email: "sarah.j@example.com",
  //   date: "18 Aug. 2025",
  //   amount: "500.00",
  //   status: "completed",
  // },
  // {
  //   id: "3",
  //   name: "Michael Brown",
  //   email: "m.brown@example.com",
  //   date: "14 Aug. 2025",
  //   amount: "500.00",
  //   status: "completed",
  // },
];

const PENDING_REFERRALS: ReferralItem[] = [
  // {
  //   id: "4",
  //   name: "Emma Wilson",
  //   email: "emma.w@example.com",
  //   date: "22 Aug. 2025",
  //   amount: "500.00",
  //   status: "pending",
  // },
  // {
  //   id: "5",
  //   name: "Emma Wilson",
  //   email: "emma.w@example.com",
  //   date: "22 Aug. 2025",
  //   amount: "500.00",
  //   status: "pending",
  // },
];

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

const ReferralCard: React.FC<{ item: ReferralItem }> = ({ item }) => (
  <View style={styles.referralCard}>
    <View style={styles.referralHeader}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <Text style={styles.amount}>₦{item.amount}</Text>
    </View>
    <View style={styles.referralFooter}>
      <Text style={styles.date}>{item.date}</Text>
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

const ReferralHistoryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"signedUp" | "pending">(
    "signedUp",
  );
  const currentReferrals =
    activeTab === "signedUp" ? COMPLETED_REFERRALS : PENDING_REFERRALS;
  const signedUpCount = COMPLETED_REFERRALS.length;
  const pendingCount = PENDING_REFERRALS.length;
  const hasReferrals = currentReferrals.length > 0;

  return (
    <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsSection}>
          <StatCard
            direction="left"
            title="Pending Referrals Earnings"
            value="₦O.00"
          />
          <StatCard
            direction="right"
            title="Total Earned"
            value={formatAmount(100000)}
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
              <ReferralCard key={item.id} item={item} />
            ))
          ) : (
            <EmptyState type={activeTab} />
          )}
        </View>
      </ScrollView>
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
    color: "#000",
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
    backgroundColor: COLORS.secondary,
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
  },
  statValue: {
    fontSize: normalize(20),
    fontFamily: getFontFamily(800),
    color: "#000",
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
    fontSize: normalize(18),
    fontFamily: getFontFamily(800),
    color: "#000",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: normalize(18),
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
    fontSize: normalize(18),
    fontFamily: getFontFamily(700),
    color: "#989da6ff",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: normalize(18),
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
