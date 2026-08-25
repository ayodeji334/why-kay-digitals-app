// import React, { useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Share as ShareElement,
//   Alert,
//   RefreshControl,
// } from "react-native";
// import { COLORS } from "../constants/colors";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { getFontFamily, normalize } from "../constants/settings";
// import { formatAmount } from "../libs/formatNumber";
// import { useAuthStore } from "../stores/authSlice";
// import { useQuery } from "@tanstack/react-query";
// import { formatDate } from "../libs/formatDate";
// import CustomLoading from "../components/CustomLoading";
// import useAxios from "../hooks/useAxios";
// import { AxiosError } from "axios";
// import { showError } from "../utlis/toast";
// import { AppText } from "../components/AppText";
// import { useColors } from "../hooks/useTheme";
// import TabSwitcher from "../components/TabSwitcher";

// interface ReferralItem {
//   uuid: string;
//   name?: string;
//   username?: string;
//   email: string;
//   created_at: string;
//   amount: string;
//   status: "completed" | "pending";
// }

// interface TabProps {
//   active: boolean;
//   title: string;
//   count: number;
//   onPress: () => void;
// }

// const Tab: React.FC<TabProps> = ({ active, title, count, onPress }) => {
//   const colors = useColors();
//   const styles = makeStyles(colors);

//   return (
//     <TouchableOpacity
//       style={[styles.tab, active && styles.activeTab]}
//       onPress={onPress}
//     >
//       <AppText style={[styles.tabTitle, active && styles.activeTabTitle]}>
//         {title}
//       </AppText>
//       <AppText style={[styles.countText, active && styles.activeCountText]}>
//         ({count})
//       </AppText>
//     </TouchableOpacity>
//   );
// };

// const EmptyState: React.FC<{ type: "signedUp" | "pending" }> = ({ type }) => {
//   const user = useAuthStore(state => state.user);
//   const colors = useColors();
//   const styles = makeStyles(colors);

//   const handleShareCode = async () => {
//     try {
//       const result = await ShareElement.share({
//         message: `Hey! Use my referral code *${user?.referral_code}* to sign up and enjoy rewards on WhyKayDigitals App!`,
//       });

//       if (result.action === ShareElement.sharedAction) {
//         // if (result.activityType) {
//         // } else {
//         // }
//       } else if (result.action === ShareElement.dismissedAction) {
//         // console.log("Share dismissed");
//       }
//     } catch (error: any) {
//       Alert.alert("Error", error.message);
//     }
//   };
//   return (
//     <View style={styles.emptyState}>
//       <AppText style={styles.emptyStateTitle}>
//         {type === "signedUp"
//           ? "No Signed Up Referrals"
//           : "No Pending Referrals"}
//       </AppText>
//       <AppText style={styles.emptyStateDescription}>
//         {type === "signedUp"
//           ? "When people sign up using your referral code, they'll appear here."
//           : "Referrals that haven't completed their first trade will appear here."}
//       </AppText>
//       <TouchableOpacity
//         onPress={handleShareCode}
//         activeOpacity={0.8}
//         style={styles.inviteButton}
//       >
//         <AppText style={styles.inviteButtonText}>Invite Friends</AppText>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const capitalizeWords = (str: string) =>
//   str.replace(/\b\w/g, char => char.toUpperCase());

// const ReferralCard: React.FC<{ item: ReferralItem }> = ({ item }) => {
//   const colors = useColors();
//   const styles = makeStyles(colors);

//   return (
//     <View style={styles.referralCard}>
//       <View style={styles.referralHeader}>
//         <View style={styles.userInfo}>
//           <AppText style={styles.userName}>
//             {item?.username || item?.name}
//           </AppText>
//           <AppText style={styles.userEmail}>
//             {item?.email && `${item.email}`}
//           </AppText>
//         </View>
//         <AppText style={styles.amount}>{parseFloat(item.amount)}</AppText>
//       </View>
//       <View style={styles.referralFooter}>
//         <AppText style={styles.date}>{formatDate(item.created_at)}</AppText>
//         <View
//           style={[
//             styles.statusBadge,
//             item.status === "completed"
//               ? { backgroundColor: "#EFF7EC" }
//               : { backgroundColor: "#FFF7E6" },
//           ]}
//         >
//           <AppText
//             style={[
//               styles.statusText,
//               item.status === "completed"
//                 ? styles.completedText
//                 : styles.pendingText,
//             ]}
//           >
//             {item.status === "completed" ? "Completed" : "Pending"}
//           </AppText>
//         </View>
//       </View>
//     </View>
//   );
// };

// const StatCard: React.FC<{
//   title: string;
//   value: string;
//   direction?: "right" | "left";
// }> = ({ title, value, direction = "left" }) => {
//   const colors = useColors();
//   const styles = makeStyles(colors);
//   return (
//     <View
//       style={[
//         styles.statCard,
//         { alignItems: direction === "right" ? "flex-end" : "flex-start" },
//       ]}
//     >
//       <AppText
//         style={[
//           styles.statTitle,
//           { textAlign: direction, fontSize: normalize(18) },
//         ]}
//       >
//         {title}
//       </AppText>
//       <AppText
//         style={[
//           styles.statTitle,
//           {
//             textAlign: direction,
//             fontSize: normalize(28),
//             fontFamily: getFontFamily("800"),
//           },
//         ]}
//       >
//         {value}
//       </AppText>
//     </View>
//   );
// };

// interface Referral {
//   uuid: string;
//   name: string;
//   email: string;
//   status: "completed" | "pending";
//   amount: string;
//   created_at: string;
// }
// interface ReferralResponse {
//   success: boolean;
//   message: string;
//   data: {
//     total_bonus: number;
//     referrals: Referral[];
//   };
// }

// export const useReferralHistory = () => {
//   return;
// };

// const ReferralHistoryScreen: React.FC = () => {
//   const { apiGet } = useAxios();
//   const [activeTab, setActiveTab] = useState<"signedUp" | "pending">(
//     "signedUp",
//   );

//   const colors = useColors();
//   const styles = makeStyles(colors);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   const { data, isLoading, refetch } = useQuery<ReferralResponse>({
//     queryKey: ["referralHistory"],
//     queryFn: async () => {
//       const response = await apiGet<ReferralResponse>(
//         "/users/user/referral-history",
//       );
//       return response.data;
//     },
//     refetchOnWindowFocus: true,
//   });

//   console.log(data, "Referral history data:");

//   const onRefresh = async () => {
//     setIsRefreshing(true);
//     try {
//       await refetch();
//     } catch (err) {
//       if (err instanceof AxiosError) {
//         showError(
//           err.response?.data?.message || "Something went wrong. Try again.",
//         );
//       }
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   const referrals: Referral[] = data?.data?.referrals ?? [];
//   const totalBonus: number = data?.data?.total_bonus ?? 0;

//   const completedReferrals = useMemo(
//     () => referrals.filter((r: any) => r.status === "completed"),
//     [referrals],
//   );
//   const pendingReferrals = useMemo(
//     () => referrals.filter(r => r.status === "pending"),
//     [referrals],
//   );

//   // Pending earnings = sum of amounts on pending referrals
//   const pendingEarnings = useMemo(
//     () => pendingReferrals.reduce((sum: any, r) => sum + (r.amount ?? 0), 0),
//     [pendingReferrals],
//   );

//   const currentReferrals =
//     activeTab === "signedUp" ? completedReferrals : pendingReferrals;
//   const hasReferrals = currentReferrals.length > 0;

//   return (
//     <SafeAreaView edges={["right", "left"]} style={styles.container}>
//       <ScrollView
//         style={styles.content}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
//         }
//       >
//         <View style={styles.statsSection}>
//           <StatCard
//             direction="left"
//             title="Pending Referrals Earnings"
//             value={formatAmount(pendingEarnings)}
//           />
//           <StatCard
//             direction="right"
//             title="Total Earned"
//             value={formatAmount(totalBonus)}
//           />
//         </View>

//         <TabSwitcher
//           tabs={[
//             { label: "Completed", value: "signedUp" },
//             { label: "Pending", value: "pending" },
//           ]}
//           activeTab={activeTab}
//           onTabChange={value => setActiveTab(value as any)}
//           containerStyle={styles.tabSwitcher}
//           activeTabStyle={styles.activeTab}
//           activeTabTextStyle={styles.activeTabText}
//         />

//         {/* <View style={styles.tabsContainer}>
//           <Tab
//             active={activeTab === "signedUp"}
//             title="Completed"
//             count={completedReferrals.length}
//             onPress={() => setActiveTab("signedUp")}
//           />
//           <Tab
//             active={activeTab === "pending"}
//             title="Pending"
//             count={pendingReferrals.length}
//             onPress={() => setActiveTab("pending")}
//           />
//         </View> */}

//         <View style={styles.referralsList}>
//           {hasReferrals ? (
//             currentReferrals.map(item => (
//               <ReferralCard key={item.uuid} item={item} />
//             ))
//           ) : (
//             <EmptyState type={activeTab} />
//           )}
//         </View>
//       </ScrollView>

//       <CustomLoading loading={isLoading} />
//     </SafeAreaView>
//   );
// };

// // const ReferralHistoryScreen: React.FC = () => {
// //   const { apiGet } = useAxios();
// //   const [activeTab, setActiveTab] = useState<"signedUp" | "pending">(
// //     "signedUp",
// //   );
// //   const [isRefreshing, setIsRefreshing] = useState(false);

// //   const { data, isLoading, refetch } = useQuery<ReferralResponse>({
// //     queryKey: ["referralHistory"],
// //     queryFn: async () => {
// //       const response = await apiGet<ReferralResponse>(
// //         "/users/user/referral-history",
// //       );
// //       return response.data;
// //     },
// //     refetchOnWindowFocus: true,
// //   });

// //   console.log("Referral history data:", data);

// //   const onRefresh = async () => {
// //     setIsRefreshing(true);
// //     try {
// //       await refetch();
// //     } catch (err) {
// //       console.error("Failed to refresh referrals:", err);
// //       if (err instanceof AxiosError) {
// //         showError(
// //           err.response?.data?.message || "Something went wrong. Try again.",
// //         );
// //       }
// //     } finally {
// //       setIsRefreshing(false);
// //     }
// //   };

// //   const referrals = data?.data?.referrals ?? [];
// //   const totalBonus = data?.data?.total_bonus ?? 0;

// //   console.log(referrals);

// //   const completedReferrals = useMemo(
// //     () => referrals.filter((r: any) => r.status === "completed"),
// //     [referrals],
// //   );
// //   const pendingReferrals = useMemo(
// //     () => referrals.filter((r: any) => r.status === "pending"),
// //     [referrals],
// //   );

// //   const currentReferrals =
// //     activeTab === "signedUp" ? completedReferrals : pendingReferrals;

// //   const signedUpCount = completedReferrals.length;
// //   const pendingCount = pendingReferrals.length;
// //   const hasReferrals = currentReferrals.length > 0;

// //   return (
// //     <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
// //       <StatusBar barStyle="dark-content" />

// //       <ScrollView
// //         style={styles.content}
// //         showsVerticalScrollIndicator={false}
// //         refreshControl={
// //           <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
// //         }
// //       >
// //         <View style={styles.statsSection}>
// //           <StatCard
// //             direction="left"
// //             title="Pending Referrals Earnings"
// //             value="₦0.00"
// //           />

// //           <StatCard
// //             direction="right"
// //             title="Total Earned"
// //             value={formatAmount(totalBonus)}
// //           />
// //         </View>

// //         <View style={styles.tabsContainer}>
// //           <Tab
// //             active={activeTab === "signedUp"}
// //             title="Signed Up"
// //             count={signedUpCount}
// //             onPress={() => setActiveTab("signedUp")}
// //           />
// //           <Tab
// //             active={activeTab === "pending"}
// //             title="Pending"
// //             count={pendingCount}
// //             onPress={() => setActiveTab("pending")}
// //           />
// //         </View>

// //         <View style={styles.referralsList}>
// //           {hasReferrals ? (
// //             currentReferrals.map(item => (
// //               <ReferralCard key={item.uuid} item={item} />
// //             ))
// //           ) : (
// //             <EmptyState type={activeTab} />
// //           )}
// //         </View>
// //       </ScrollView>

// //       <CustomLoading loading={isLoading} />
// //     </SafeAreaView>
// //   );
// // };

// const makeStyles = (colors: ReturnType<typeof useColors>) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: colors.background,
//     },
//     emptyState: {
//       alignItems: "center",
//       justifyContent: "center",
//       paddingVertical: 60,
//       paddingHorizontal: 40,
//     },
//     emptyStateImage: {
//       width: 120,
//       height: 120,
//       marginBottom: 24,
//     },
//     emptyStateTitle: {
//       fontSize: normalize(20),
//       fontFamily: getFontFamily("800"),
//       color: colors.text,
//       textAlign: "center",
//       marginBottom: 4,
//     },
//     emptyStateDescription: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("700"),
//       color: colors.textMuted,
//       textAlign: "center",
//       lineHeight: normalize(22),
//       marginBottom: 20,
//     },
//     inviteButton: {
//       backgroundColor: COLORS.secondary,
//       paddingHorizontal: 20,
//       paddingVertical: 8,
//       borderRadius: 38,
//     },
//     inviteButtonText: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("800"),
//       color: "#fff",
//     },
//     tabSwitcher: {
//       backgroundColor: colors.inputBackground,
//       marginVertical: 10,
//     },
//     activeTab: {
//       backgroundColor: COLORS.primary,
//       color: colors.text,
//     },
//     activeTabText: {
//       color: "white",
//     },
//     header: {
//       paddingHorizontal: 20,
//       paddingTop: 16,
//       paddingBottom: 8,
//       borderBottomWidth: 1,
//       borderBottomColor: colors.border,
//     },
//     headerTitle: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily(800),
//       color: colors.text,
//       textAlign: "center",
//     },
//     content: {
//       flexGrow: 1,
//       paddingHorizontal: 20,
//       marginTop: 20,
//     },
//     statsSection: {
//       flexDirection: "row",
//       padding: 16,
//       backgroundColor: colors.primary,
//       borderWidth: 1,
//       borderColor: colors.border,
//       gap: 12,
//       marginBottom: 30,
//       borderRadius: 10,
//     },
//     statCard: {
//       flex: 1,
//       borderRadius: 12,
//       justifyContent: "space-between",
//     },
//     statTitle: {
//       fontSize: normalize(15),
//       fontFamily: getFontFamily(400),
//       marginBottom: 8,
//       textAlign: "right",
//       color: "#fff",
//     },
//     statValue: {
//       fontSize: normalize(20),
//       fontFamily: getFontFamily(800),
//       color: "#fff",
//       textAlign: "right",
//     },
//     tabsContainer: {
//       flexDirection: "row",
//       padding: 7,
//       marginTop: 10,
//       marginBottom: 16,
//       gap: 8,
//       backgroundColor: "#F3F4F6",
//       borderRadius: 1000,
//     },
//     tab: {
//       flex: 1,
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "center",
//       paddingVertical: 8,
//       paddingHorizontal: 12,
//       backgroundColor: "#F3F4F6",
//       borderRadius: 800,
//       gap: 8,
//     },
//     // activeTab: {
//     //   backgroundColor: COLORS.primary,
//     // },
//     tabTitle: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("800"),
//     },
//     activeTabTitle: {
//       color: "#fff",
//     },
//     countBadge: {
//       paddingHorizontal: 8,
//       paddingVertical: 2,
//       borderRadius: 12,
//     },
//     activeCountBadge: {},
//     countText: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("400"),
//       textAlign: "center",
//     },
//     activeCountText: {
//       color: "#fff",
//     },
//     referralsList: {
//       gap: 12,
//     },
//     referralCard: {
//       backgroundColor: colors.inputBackground,
//       padding: 10,
//       borderRadius: 12,
//       borderWidth: 1,
//       borderColor: colors.border,
//       elevation: 2,
//     },
//     referralHeader: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "flex-start",
//       marginBottom: 12,
//     },
//     userInfo: {
//       flex: 1,
//     },
//     userName: {
//       fontSize: normalize(17),
//       fontFamily: getFontFamily(900),
//       color: colors.text,
//       marginBottom: 4,
//       textTransform: "uppercase",
//     },
//     userEmail: {
//       fontSize: normalize(17),
//       fontFamily: getFontFamily("400"),
//       color: colors.text,
//     },
//     amount: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily(900),
//       color: colors.text,
//     },
//     referralFooter: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//     },
//     date: {
//       fontSize: normalize(15),
//       fontFamily: getFontFamily(700),
//       color: colors.textMuted,
//     },
//     statusBadge: {
//       paddingHorizontal: 12,
//       paddingVertical: 4,
//       borderRadius: 12,
//     },
//     statusText: {
//       fontSize: normalize(16),
//       fontFamily: getFontFamily(800),
//     },
//     completedText: {
//       color: "#176105",
//     },
//     pendingText: {
//       color: "#c46b06",
//     },
//   });

// export default ReferralHistoryScreen;
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
import { getFontFamily, normalize } from "../constants/settings";
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
  const colors = useColors();
  const styles = makeStyles(colors);

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
  const colors = useColors();
  const styles = makeStyles(colors);
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
  const colors = useColors();
  const styles = makeStyles(colors);
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

  const colors = useColors();
  const styles = makeStyles(colors);
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

  const referrals: ReferralItem[] = data?.data?.referrals ?? [];

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
      paddingVertical: 60,
      paddingHorizontal: 40,
    },
    emptyStateTitle: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      textAlign: "center",
      marginBottom: 4,
    },
    emptyStateDescription: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: normalize(22),
      marginBottom: 20,
    },
    inviteButton: {
      backgroundColor: COLORS.secondary,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 38,
    },
    inviteButtonText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: "#fff",
    },
    tabSwitcher: {
      backgroundColor: colors.inputBackground,
      marginVertical: 10,
    },
    activeTab: {
      backgroundColor: COLORS.primary,
      color: colors.text,
    },
    activeTabText: {
      color: "white",
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
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
      paddingHorizontal: 20,
      marginTop: 20,
    },
    statsSection: {
      flexDirection: "row",
      padding: 16,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
      marginBottom: 12,
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
      borderRadius: 1000,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
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
      backgroundColor: colors.inputBackground,
      padding: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
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
      fontFamily: getFontFamily(900),
      color: colors.text,
      marginBottom: 4,
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
      paddingHorizontal: 12,
      paddingVertical: 4,
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
