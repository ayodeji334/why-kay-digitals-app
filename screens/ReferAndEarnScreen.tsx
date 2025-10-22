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
} from "react-native";
import {
  ArrowRight2,
  Copy,
  Share,
  DocumentDownload,
  Coin,
} from "iconsax-react-nativejs";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { getFontFamily, normalize, width } from "../constants/settings";
import Clipboard from "@react-native-clipboard/clipboard";
import { showSuccess } from "../utlis/toast";

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  IconComponent: React.ComponentType<any>;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  title,
  description,
  IconComponent,
}) => (
  <View style={styles.stepCard}>
    <View style={styles.stepHeader}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{step}</Text>
      </View>
      <IconComponent variant="Outline" size={18} color="#E89E00" />
    </View>
    <Text style={styles.stepTitle}>{title}</Text>
    <Text style={styles.stepDescription}>{description}</Text>
  </View>
);

const ReferralAndEarnScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isCopied, setIsCopied] = React.useState(false);
  const referralCode = "XHDU4563ER";

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    showSuccess("Copied to clipboard!");
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const handleShareCode = async () => {
    try {
      const result = await ShareElement.share({
        message: `Hey! Use my referral code *${referralCode}* to sign up and enjoy rewards! 🎉`,
      });

      if (result.action === ShareElement.sharedAction) {
        if (result.activityType) {
          console.log("Shared via:", result.activityType);
        } else {
          console.log("Referral code shared");
        }
      } else if (result.action === ShareElement.dismissedAction) {
        console.log("Share dismissed");
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
        <View style={styles.balanceCard}>
          <Text style={[styles.sectionTitle, { color: "white" }]}>
            Reward balance
          </Text>
          <Text style={styles.balanceAmount}>₦0.00</Text>
        </View>

        <View style={styles.section}>
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
                <Text style={styles.referralCodeName}>{referralCode}</Text>
              </View>
              <View style={styles.referralActions}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.referralButton}
                  onPress={handleCopyCode}
                >
                  <Copy size={10} color="#000" />
                  <Text style={styles.referralButtonText}>
                    {isCopied ? "Copied" : "Copy"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.referralButton}
                  onPress={handleShareCode}
                >
                  <Share size={10} color="#000" />
                  <Text style={styles.referralButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* How to Refer Section */}
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
              title="You Earn ₦NNN"
              description="Then you your rewards 💬💬💬"
              IconComponent={Coin}
            />
          </View>
        </View>

        {/* View Referral History Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.historyButton}
          onPress={handleViewReferralHistory}
        >
          <Text style={styles.historyButtonText}>View Referral History</Text>
          <ArrowRight2 size={12} color="#000" />
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
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
    backgroundColor: "green",
    gap: 14,
  },
  balanceAmountContainer: {
    marginTop: 8,
  },
  balanceAmount: {
    fontSize: normalize(24),
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
    borderColor: "#dbdbdbff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 20,
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
    backgroundColor: "#E89E0015",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 10,
  },
  referralButtonText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
  },
  stepsContainer: {
    gap: 16,
  },
  stepCard: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
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
    color: "#6B7280",
    lineHeight: 20,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E89E00",
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 40,
    gap: 8,
  },
  historyButtonText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
  },
});

export default ReferralAndEarnScreen;
