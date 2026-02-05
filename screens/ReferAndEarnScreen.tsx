import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Share as ShareElement,
  Alert,
  ImageBackground,
} from "react-native";
import {
  ArrowRight2,
  Copy,
  DocumentDownload,
  Coin,
} from "iconsax-react-nativejs";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { getFontFamily, normalize } from "../constants/settings";
import Clipboard from "@react-native-clipboard/clipboard";
import { showSuccess } from "../utlis/toast";
import { useAuthStore } from "../stores/authSlice";
import { COLORS } from "../constants/colors";
import CustomIcon from "../components/CustomIcon";
import { ShareIcon } from "../assets";

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  IconComponent: React.ComponentType<any>;
}

const StepCard: React.FC<StepCardProps> = ({ title, description }) => (
  <View style={styles.stepCard}>
    {/* <View style={styles.stepHeader}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{step}</Text>
      </View>
      <IconComponent variant="Outline" size={18} color="#E89E00" />
    </View> */}
    <Text style={styles.stepTitle}>{title}</Text>
    <Text style={styles.stepDescription}>{description}</Text>
  </View>
);

const ReferralAndEarnScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isCopied, setIsCopied] = React.useState(false);
  const user = useAuthStore(state => state.user);

  const handleCopyCode = () => {
    Clipboard.setString(user?.referral_code);
    showSuccess("Copied to clipboard!");
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

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

  const handleViewReferralHistory = () => {
    navigation.navigate("ReferralHistory" as never);
  };

  return (
    <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={require("../assets/wallet-banner.png")}
          style={styles.balanceCard}
        >
          <View style={styles.balanceAmountContainer}>
            <Text style={[styles.sectionTitle, { color: "white" }]}>
              Reward balance
            </Text>
            <Text style={styles.balanceAmount}>₦0.00</Text>
          </View>
        </ImageBackground>

        <View style={styles.referralCodeContainer}>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Text style={styles.sectionTitle}>Referral Code</Text>
            <View style={styles.referralCodeInfo}>
              <Text style={styles.referralCodeName}>{user?.referral_code}</Text>
            </View>
            <View style={styles.referralActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.referralButton}
                onPress={handleCopyCode}
              >
                <Copy size={13} color={COLORS.primary} />
                <Text style={styles.referralButtonText}>
                  {isCopied ? "Copied" : "Copy"}
                </Text>
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
                <Text style={styles.referralButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.section, { marginVertical: 40 }]}>
          <Text
            style={[styles.sectionTitle, { fontFamily: getFontFamily(800) }]}
          >
            How to refer
          </Text>
          <View style={styles.stepsContainer}>
            <StepCard
              step={1}
              title="Copy Code"
              description="Copy or share your referral code to your friend and family"
              IconComponent={Copy}
            />
            <StepCard
              step={2}
              title="Download the app"
              description="Download and install the app and register with your Referral code"
              IconComponent={DocumentDownload}
            />
            <StepCard
              step={3}
              title="You Earn ₦₦₦"
              description="Then you your rewards 🤑🤑🤑"
              IconComponent={Coin}
            />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.historyButton}
          onPress={handleViewReferralHistory}
        >
          <Text style={styles.historyButtonText}>View Referral History</Text>
          <ArrowRight2 size={12} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    padding: 0,
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("400"),
    color: "#000",
    marginBottom: 13,
  },
  balanceSection: {
    padding: 20,
    backgroundColor: "#F8F9FA",
    marginBottom: 8,
  },
  balanceHeader: {
    marginBottom: 16,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    overflow: "hidden",
    gap: 10,
  },
  balanceAmountContainer: {
    marginTop: 8,
    borderRadius: 20,
  },
  balanceAmount: {
    fontSize: normalize(26),
    fontFamily: getFontFamily("800"),
    color: "#fff",
  },
  balanceActions: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000",
  },
  menuItemSubtitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#6B7280",
    marginTop: 2,
  },
  referralCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 16,
  },
  referralCodeContainer: {
    borderWidth: 1,
    borderColor: "#4A9237",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 20,
    backgroundColor: "#EFF7EC",
  },
  referralCodeInfo: {
    flex: 1,
    alignItems: "center",
  },
  referralCodeName: {
    fontSize: normalize(28),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 4,
  },
  referralCode: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#6B7280",
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
    color: COLORS.primary,
  },
  stepsContainer: {
    gap: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#373737ff",
    backgroundColor: "#F9FAFB",
    padding: 5,
  },
  stepCard: {
    padding: 10,
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  stepNumber: {
    width: 25,
    height: 25,
    borderRadius: 16,
    backgroundColor: "#E89E00",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("700"),
    color: "#fff",
  },
  stepTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: "#565466",
    lineHeight: 20,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.secondary,
    marginVertical: 20,
    paddingVertical: 16,
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
