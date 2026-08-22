// import React from "react";
// import {
//   View,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   StatusBar,
//   Share as ShareElement,
//   Alert,
//   ImageBackground,
// } from "react-native";
// import {
//   ArrowRight2,
//   Copy,
//   DocumentDownload,
//   Coin,
// } from "iconsax-react-nativejs";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useNavigation } from "@react-navigation/native";
// import { getFontFamily, normalize } from "../constants/settings";
// import Clipboard from "@react-native-clipboard/clipboard";
// import { showSuccess } from "../utlis/toast";
// import { useAuthStore } from "../stores/authSlice";
// import { COLORS } from "../constants/colors";
// import CustomIcon from "../components/CustomIcon";
// import { ShareIcon } from "../assets";
// import { AppText } from "../components/AppText";
// import { useColors } from "../hooks/useTheme";

// interface StepCardProps {
//   step: number;
//   title: string;
//   description: string;
//   IconComponent: React.ComponentType<any>;
// }

// const StepCard: React.FC<StepCardProps> = ({ title, description }) => {
//   const colors = useColors();
//   const styles = makeStyles(colors);

//   return (
//     <View style={styles.stepCard}>
//       {/* <View style={styles.stepHeader}>
//       <View style={styles.stepNumber}>
//         <AppText style={styles.stepNumberText}>{step}</AppText>
//       </View>
//       <IconComponent variant="Outline" size={18} color="#E89E00" />
//     </View> */}
//       <AppText style={styles.stepTitle}>{title}</AppText>
//       <AppText style={styles.stepDescription}>{description}</AppText>
//     </View>
//   );
// };

// const ReferralAndEarnScreen: React.FC = () => {
//   const navigation = useNavigation();
//   const [isCopied, setIsCopied] = React.useState(false);
//   const user = useAuthStore(state => state.user);
//   const colors = useColors();
//   const styles = makeStyles(colors);

//   const handleCopyCode = () => {
//     Clipboard.setString(user?.referral_code);
//     showSuccess("Copied to clipboard!");
//     setIsCopied(true);
//     setTimeout(() => {
//       setIsCopied(false);
//     }, 3000);
//   };

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

//   const handleViewReferralHistory = () => {
//     navigation.navigate("ReferralHistory" as never);
//   };

//   return (
//     <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {/* <ImageBackground
//           source={require("../assets/wallet-banner.png")}
//           style={styles.balanceCard}
//         >
//           <View style={styles.balanceAmountContainer}>
//             <AppText style={[styles.sectionTitle, { color: "white" }]}>
//               Reward balance
//             </AppText>
//             <AppText style={styles.balanceAmount}>₦0.00</AppText>
//           </View>
//         </ImageBackground> */}

//         <View style={styles.referralCodeContainer}>
//           <View
//             style={{
//               alignItems: "center",
//               justifyContent: "center",
//               flex: 1,
//             }}
//           >
//             <AppText style={styles.sectionTitle}>Referral Code</AppText>
//             <View style={styles.referralCodeInfo}>
//               <AppText style={styles.referralCodeName}>
//                 {user?.username}
//               </AppText>
//             </View>
//             <View style={styles.referralActions}>
//               <TouchableOpacity
//                 activeOpacity={0.8}
//                 style={styles.referralButton}
//                 onPress={handleCopyCode}
//               >
//                 <Copy size={13} color={COLORS.primary} />
//                 <AppText style={styles.referralButtonText}>
//                   {isCopied ? "Copied" : "Copy"}
//                 </AppText>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 activeOpacity={0.8}
//                 style={styles.referralButton}
//                 onPress={handleShareCode}
//               >
//                 <CustomIcon
//                   source={ShareIcon}
//                   size={18}
//                   color={COLORS.primary}
//                 />
//                 <AppText style={styles.referralButtonText}>Share</AppText>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         <View style={[styles.section, { marginVertical: 40 }]}>
//           <AppText
//             style={[styles.sectionTitle, { fontFamily: getFontFamily(800) }]}
//           >
//             How to refer
//           </AppText>
//           <View style={styles.stepsContainer}>
//             <StepCard
//               step={1}
//               title="Copy Code"
//               description="Copy or share your referral code to your friend and family"
//               IconComponent={Copy}
//             />
//             <StepCard
//               step={2}
//               title="Download the app"
//               description="Download and install the app and register with your Referral code"
//               IconComponent={DocumentDownload}
//             />
//             <StepCard
//               step={3}
//               title="You Earn ₦₦₦"
//               description="Then you your rewards 🤑🤑🤑"
//               IconComponent={Coin}
//             />
//           </View>
//         </View>

//         <TouchableOpacity
//           activeOpacity={0.8}
//           style={styles.historyButton}
//           onPress={handleViewReferralHistory}
//         >
//           <AppText style={styles.historyButtonText}>
//             View Referral History
//           </AppText>
//           <ArrowRight2 size={12} color="#fff" />
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const makeStyles = (colors: ReturnType<typeof useColors>) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: colors.background,
//     },
//     content: {
//       flex: 1,
//       padding: 20,
//     },
//     section: {
//       padding: 0,
//     },
//     sectionTitle: {
//       fontSize: normalize(20),
//       fontFamily: getFontFamily("400"),
//       color: colors.text,
//       marginBottom: 13,
//     },
//     balanceSection: {
//       padding: 20,
//       backgroundColor: colors.inputBackground,
//       marginBottom: 8,
//     },
//     balanceHeader: {
//       marginBottom: 16,
//     },
//     balanceCard: {
//       borderRadius: 20,
//       padding: 20,
//       marginVertical: 20,
//       overflow: "hidden",
//       gap: 10,
//     },
//     balanceAmountContainer: {
//       marginTop: 8,
//       borderRadius: 20,
//     },
//     balanceAmount: {
//       fontSize: normalize(26),
//       fontFamily: getFontFamily("800"),
//       color: colors.text,
//     },
//     balanceActions: {
//       backgroundColor: colors.text,
//       borderRadius: 12,
//       overflow: "hidden",
//     },
//     referralCodeContainer: {
//       borderWidth: 1,
//       borderColor: colors.border,
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       borderRadius: 10,
//       paddingVertical: 20,
//       backgroundColor: colors.inputBackground,
//     },
//     referralCodeInfo: {
//       flex: 1,
//       alignItems: "center",
//     },
//     referralCodeName: {
//       fontSize: normalize(28),
//       fontFamily: getFontFamily("800"),
//       color: colors.text,
//       marginBottom: 4,
//     },
//     referralCode: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("800"),
//       color: "#6B7280",
//     },
//     referralActions: {
//       flexDirection: "row",
//       gap: 12,
//     },
//     referralButton: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingHorizontal: 12,
//       paddingVertical: 8,
//       borderRadius: 8,
//       gap: 6,
//       marginTop: 10,
//     },
//     referralButtonText: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("700"),
//       color: colors.text,
//     },
//     stepsContainer: {
//       gap: 1,
//       borderRadius: 12,
//       borderWidth: 1,
//       borderColor: colors.border,
//       backgroundColor: colors.inputBackground,
//       padding: 5,
//     },
//     stepCard: {
//       padding: 10,
//     },
//     stepHeader: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       marginBottom: 12,
//     },
//     stepNumber: {
//       width: 25,
//       height: 25,
//       borderRadius: 16,
//       backgroundColor: "#E89E00",
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     stepNumberText: {
//       fontSize: normalize(20),
//       fontFamily: getFontFamily("700"),
//       color: colors.background,
//     },
//     stepTitle: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("800"),
//       color: colors.text,
//       marginBottom: 8,
//     },
//     stepDescription: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("400"),
//       color: colors.textMuted,
//       lineHeight: 20,
//     },
//     historyButton: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: COLORS.secondary,
//       marginVertical: 20,
//       paddingVertical: 16,
//       borderRadius: 40,
//       gap: 8,
//     },
//     historyButtonText: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("800"),
//       color: "#fff",
//     },
//   });

// export default ReferralAndEarnScreen;
import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share as ShareElement,
  Alert,
} from "react-native";
import {
  ArrowRight2,
  Copy,
  DocumentDownload,
  Coin,
} from "iconsax-react-nativejs";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { getFontFamily, normalize } from "../constants/settings";
import Clipboard from "@react-native-clipboard/clipboard";
import { showSuccess } from "../utlis/toast";
import { useAuthStore } from "../stores/authSlice";
import { COLORS } from "../constants/colors";
import CustomIcon from "../components/CustomIcon";
import { ShareIcon } from "../assets";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import { useServiceCharges } from "../hooks/useServiceCharges";
import { formatAmount, formatNumber } from "../libs/formatNumber";
import useAxios from "../hooks/useAxios";

interface StepCardProps {
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ title, description }) => {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <View style={styles.stepCard}>
      <AppText style={styles.stepTitle}>{title}</AppText>
      <AppText style={styles.stepDescription}>{description}</AppText>
    </View>
  );
};

// Matches the summary shape returned by /users/user/referral-history
interface ReferralSummary {
  points_balance: number;
  total_worth_naira: string;
}

const DEFAULT_MIN_REFERRAL_VOLUME = 200; // fallback if service_charges hasn't loaded yet

const ReferralAndEarnScreen: React.FC = () => {
  const navigation = useNavigation();
  const { apiGet } = useAxios();
  const [isCopied, setIsCopied] = React.useState(false);
  const user = useAuthStore(state => state.user);
  const colors = useColors();
  const styles = makeStyles(colors);

  const { getCharge } = useServiceCharges();

  // Pulled from service_charges so the copy below stays accurate even if
  // the threshold changes on the backend without an app update.
  const minVolumeCharge = getCharge("referral_min_transaction_volume");
  const minReferralVolume = minVolumeCharge?.value
    ? parseFloat(minVolumeCharge.value)
    : DEFAULT_MIN_REFERRAL_VOLUME;

  const formattedMinVolume = formatAmount(minReferralVolume, {
    currency: "USD",
    decimalPlace: 0,
  });

  // Reuses the same summary the History screen shows, so the points balance
  // here always matches what's on that screen.
  const { data } = useQuery<{ data: ReferralSummary }>({
    queryKey: ["referralHistory"],
    queryFn: async () => {
      const response = await apiGet<{ data: ReferralSummary }>(
        "/users/user/referral-history",
      );
      return response.data;
    },
  });

  // const pointsBalance = data?.data?.points_balance ?? 0;
  // const totalWorthNaira = data?.data?.total_worth_naira
  //   ? parseFloat(data.data.total_worth_naira)
  //   : 0;

  const handleCopyCode = () => {
    if (!user?.username) return;
    Clipboard.setString(user.username);
    showSuccess("Copied to clipboard!");
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const handleShareCode = async () => {
    if (!user?.username) return;
    try {
      const result = await ShareElement.share({
        message: `Hey! Use my referral code *${user.username}* to sign up on WhyKayDigitals — once you trade ${formattedMinVolume} in crypto, we both earn rewards!`,
      });

      if (result.action === ShareElement.sharedAction) {
        // shared successfully
      } else if (result.action === ShareElement.dismissedAction) {
        // user dismissed the share sheet
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleViewReferralHistory = () => {
    navigation.navigate("ReferralHistory" as never);
  };

  return (
    <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.referralCodeContainer}>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <AppText style={styles.sectionTitle}>Referral Code</AppText>
            <View style={styles.referralCodeInfo}>
              <AppText style={styles.referralCodeName}>
                {user?.username}
              </AppText>
            </View>
            <View style={styles.referralActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.referralButton}
                onPress={handleCopyCode}
              >
                <Copy size={13} color={COLORS.primary} />
                <AppText style={styles.referralButtonText}>
                  {isCopied ? "Copied" : "Copy"}
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.referralButton}
                onPress={handleShareCode}
              >
                <CustomIcon
                  source={ShareIcon}
                  size={18}
                  color={COLORS.primary}
                />
                <AppText style={styles.referralButtonText}>Share</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* <View style={styles.pointsCard}>
          <View style={{ flex: 1 }}>
            <AppText style={styles.pointsLabel}>Your Points Balance</AppText>
            <AppText style={styles.pointsValue}>
              {formatNumber(pointsBalance)} pts
            </AppText>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <AppText style={styles.pointsLabel}>Worth</AppText>
            <AppText style={styles.pointsValue}>
              {formatAmount(totalWorthNaira, {
                currency: "NGN",
                decimalPlace: 2,
              })}
            </AppText>
          </View>
        </View> */}

        <View style={[styles.section, { marginVertical: 30 }]}>
          <AppText
            style={[styles.sectionTitle, { fontFamily: getFontFamily("800") }]}
          >
            How to earn
          </AppText>
          <View style={styles.stepsContainer}>
            <StepCard
              title="Share your code"
              description="Send your referral code to friends and family so they can join with it."
            />
            <StepCard
              title="You earn points instantly"
              description="As soon as they sign up with your code, points land in your balance."
            />
            <StepCard
              title="Points mature into cash value"
              description={`Once your friend's crypto successful transactions volume reaches ${formattedMinVolume}, your points convert to Naira and are ready to spend.`}
            />
            <StepCard
              title="Spend your rewards every day"
              description={`Use your matured points to pay for airtime, data, and utility bills — no extra steps, no waiting.`}
            />
          </View>
        </View>

        {/* <View style={styles.redeemBanner}>
          <AppText style={styles.redeemBannerTitle}>
            Spend your rewards every day
          </AppText>
          <AppText style={styles.redeemBannerText}>
            Use your matured points to pay for airtime, data, and utility bills
            — no extra steps, no waiting.
          </AppText>
        </View> */}

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.historyButton}
          onPress={handleViewReferralHistory}
        >
          <AppText style={styles.historyButtonText}>
            View Referral History
          </AppText>
          <ArrowRight2 size={12} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      padding: 0,
    },
    sectionTitle: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.text,
      marginBottom: 13,
    },
    referralCodeContainer: {
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: 10,
      paddingVertical: 20,
      backgroundColor: colors.inputBackground,
    },
    referralCodeInfo: {
      flex: 1,
      alignItems: "center",
    },
    referralCodeName: {
      fontSize: normalize(25),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: 4,
    },
    referralActions: {
      flexDirection: "row",
      gap: 12,
    },
    referralButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
      marginTop: 10,
    },
    referralButtonText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: colors.text,
    },
    pointsCard: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: COLORS.primary,
      borderRadius: 10,
      padding: 16,
      marginTop: 12,
    },
    pointsLabel: {
      fontSize: normalize(14),
      fontFamily: getFontFamily("400"),
      color: "#fff",
      marginBottom: 4,
    },
    pointsValue: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("800"),
      color: "#fff",
    },
    stepsContainer: {
      gap: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
      padding: 5,
    },
    stepCard: {
      padding: 10,
    },
    stepTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: 8,
    },
    stepDescription: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.text,
      lineHeight: 20,
    },
    redeemBanner: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
    },
    redeemBannerTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: 6,
    },
    redeemBannerText: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
      lineHeight: 20,
    },
    historyButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.secondary,
      marginVertical: 20,
      paddingVertical: normalize(16),
      borderRadius: 40,
      gap: 8,
    },
    historyButtonText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: "#fff",
    },
  });

export default ReferralAndEarnScreen;
