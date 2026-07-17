import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  // ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
// import useAxios from "../api/axios";
import { showSuccess, showError } from "../utlis/toast";
import Clipboard from "@react-native-clipboard/clipboard";
import InfoCard from "../components/InfoCard";
import {
  Check,
  CopySuccess,
  InfoCircle,
  WalletAdd,
} from "iconsax-react-nativejs";
import { useAuthStore } from "../stores/authSlice";
import KYCStatusScreen from "../components/KYCStatusScreen";
import useAxios from "../hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import CustomLoading from "../components/CustomLoading";
import { useNavigation } from "@react-navigation/native";
import { AppText } from "../components/AppText";

const BankTransferScreen = () => {
  const { apiGet } = useAxios();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore(state => state.user);
  const navigation: any = useNavigation();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["userBankAccounts"],
    queryFn: async () => {
      try {
        const response = await apiGet(`/users/user/virtual-account`);
        return response.data.data || {};
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    enabled:
      user?.bvn_verification_status &&
      user?.bvn_verification_status === "VERIFIED" &&
      user?.banks &&
      user?.banks.length === 0,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      Clipboard.setString(text);
      showSuccess("Copied to clipboard");
      setCopiedField(field);

      setTimeout(() => {
        setCopiedField(null);
      }, 600);
    } catch (error) {
      showError("Failed to copy");
    }
  };

  if (isLoading) {
    return <CustomLoading loading={isLoading} />;
  }

  if (
    user?.bvn_verification_status === "VERIFIED" &&
    data &&
    Object.keys(data).length <= 0
  ) {
    return (
      <SafeAreaView
        edges={["right", "bottom", "left"]}
        style={styles.container}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <WalletAdd size={30} color="#000" />
            </View>
            <AppText style={styles.emptyTitle}>No Virtual Account</AppText>
            <AppText style={styles.emptyDescription}>
              You need to create a virtual account before you can make deposits.
              This only takes a moment and is required for secure transactions.
              Please ensure your BVN is verified to activate your virtual
              account.
            </AppText>
            <TouchableOpacity style={styles.emptyButton} onPress={onRefresh}>
              <AppText style={styles.emptyButtonText}>Try again</AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      {user?.bvn_verification_status !== "VERIFIED" ? (
        <KYCStatusScreen />
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>
              Transfer to your virtual account
            </AppText>
            <AppText style={styles.instructionText}>
              Make a bank transfer to the account number below and your fund
              will be creddited immediately into your account.
            </AppText>
          </View>

          <View style={styles.accountSection}>
            <View style={styles.detailItem}>
              <AppText style={styles.detailLabel}>Account Name</AppText>
              <View style={styles.copyableField}>
                <AppText style={styles.detailValue} numberOfLines={1}>
                  {data?.account_name}
                </AppText>
              </View>
            </View>

            <View style={styles.detailItem}>
              <AppText style={styles.detailLabel}>Bank Name</AppText>
              <View style={styles.copyableField}>
                <AppText style={styles.detailValue}>
                  Boost Microfinance Bank ( Boost MFB )
                </AppText>
              </View>
            </View>

            <View style={styles.detailItem}>
              <AppText style={styles.detailLabel}>Account Number</AppText>
              <View style={styles.copyableField}>
                <AppText style={[styles.detailValue, styles.accountNumber]}>
                  {data?.account_number}
                </AppText>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                copyToClipboard(data.account_number, "accountNumber")
              }
              style={styles.copyButton}
            >
              <AppText
                style={{
                  color: "white",
                  fontSize: normalize(17),
                  fontFamily: getFontFamily(700),
                }}
              >
                Tap to copy account details
              </AppText>
              {copiedField === "accountNumber" ? (
                <Check size={13} color="white" />
              ) : (
                <CopySuccess size={13} color="white" />
              )}
            </TouchableOpacity>
          </View>

          <InfoCard
            IconComponent={<InfoCircle size={18} />}
            title="Important Notes:"
            description={[
              "Deposits of ₦10,000 and above will attract a ₦50 stamp duty charge in line with government regulations.",
              "Transfers typically reflect within 5-10 minutes",
              "A transaction fee will be deducted from your wallet balance for each virtual account deposit",
              "If payment is made using a name that does not match your registered details, the funds will be held for 5 business days for review before a refund is processed.",
              "Deposits into your account attract a processing fee of 1% of the transaction amount, capped at a maximum of ₦2,000 for transaction of ₦200,000 and above",
            ]}
          />

          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.goBack()}
            >
              <AppText style={styles.buttonText}>
                I have transfer the money
              </AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  buttonWrapper: {
    marginTop: 10,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 100,
    marginTop: 30,
    justifyContent: "center",
    alignContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 0,
    marginTop: -150,
  },
  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("900"),
    color: "#000000",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: "black",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 16,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 44,
    paddingVertical: 10,
    borderRadius: 800,
    width: "100%",
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: normalize(19),
    fontFamily: getFontFamily("700"),
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("800"),
    color: "#000000",
    marginBottom: 8,
    lineHeight: 22,
  },
  instructionText: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
    color: "#000",
  },
  accountSection: {
    backgroundColor: "#addea11a",
    borderRadius: 12,
    marginVertical: 24,
    borderWidth: 0.5,
    borderColor: "#c8c8c8ff",
    overflow: "hidden",
  },
  detailItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 0.5,
    borderColor: "#c8c8c8ff",
  },
  detailLabel: {
    marginBottom: 2,
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
    color: "#666666",
  },
  copyableField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  detailValue: {
    color: "#000000",
    fontSize: normalize(17),
    fontFamily: getFontFamily("800"),
    flex: 1,
    textTransform: "uppercase",
  },
  accountNumber: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("800"),
    letterSpacing: 1,
  },
  copyButton: {
    padding: 4,
    backgroundColor: COLORS.primary,
    alignContent: "center",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 10,
  },
  amountDisplay: {
    paddingVertical: 4,
  },
  amountText: {
    fontSize: normalize(14),
    fontFamily: getFontFamily("800"),
  },
  additionalAccounts: {
    marginBottom: 24,
  },
  additionalTitle: {
    fontSize: normalize(14),
    fontFamily: getFontFamily("800"),
    color: "#000000",
    marginBottom: 12,
  },
  additionalAccount: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  additionalAccountInfo: {
    flex: 1,
  },
  additionalBankName: {
    fontSize: normalize(12),
    fontFamily: getFontFamily("700"),
    color: "#000000",
    marginBottom: 4,
  },
  additionalAccountNumber: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("800"),
    color: "#666666",
  },
  additionalCopyButton: {
    padding: 8,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 58,
    alignItems: "center",
    marginVertical: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
  },
});

export default BankTransferScreen;
