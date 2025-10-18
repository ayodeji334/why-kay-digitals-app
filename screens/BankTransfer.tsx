import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import useAxios from "../api/axios";
import { showSuccess, showError } from "../utlis/toast";
import Clipboard from "@react-native-clipboard/clipboard";
import InfoCard from "../components/InfoCard";
import {
  Check,
  CopySuccess,
  InfoCircle,
  WalletAdd,
} from "iconsax-react-nativejs";
import CustomLoading from "../components/CustomLoading";
import { useAuthStore } from "../stores/authSlice";

const BankTransferScreen = () => {
  const route = useRoute();
  const { apiGet } = useAxios();
  const navigation = useNavigation();
  const { amount }: any = route.params;
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Get user bank accounts from store
  const user = useAuthStore(state => state.user);
  const bankAccounts = user?.bank_accounts || [];
  const primaryBankAccount =
    bankAccounts.find((account: any) => account.is_primary) || bankAccounts[0];

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

  const checkPaymentStatus = async () => {
    try {
      setIsCheckingPayment(true);
      const response = await apiGet("/payments/status");

      if (response.data?.success) {
        const paymentStatus = response.data.data.status;

        if (paymentStatus === "successful") {
          showSuccess("Payment received successfully!");
          navigation.navigate("DepositSuccess" as never);
        } else if (paymentStatus === "pending") {
          showError("Payment is still processing. Please wait a few minutes.");
        } else {
          showError("Payment not found. Please try again.");
        }
      } else {
        showError("Unable to check payment status");
      }
    } catch (error) {
      showError("Failed to check payment status");
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const handleIHaveMadeDeposit = () => {
    Alert.alert(
      "Confirm Deposit",
      `Have you transferred exactly ₦${parseFloat(
        amount,
      ).toLocaleString()} to your virtual account?`,
      [
        {
          text: "No, Cancel",
          style: "cancel",
        },
        {
          text: "Yes, I have",
          onPress: checkPaymentStatus,
        },
      ],
    );
  };

  // Empty state component
  const EmptyBankAccountsState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <WalletAdd size={40} color="#666" />
      </View>
      <Text style={styles.emptyTitle}>No Virtual Account Found</Text>
      <Text style={styles.emptyDescription}>
        You need to create a virtual account before you can make deposits. This
        only takes a moment and is required for secure transactions.
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate("Verification" as never)}
      >
        <Text style={styles.emptyButtonText}>Create Virtual Account</Text>
      </TouchableOpacity>
    </View>
  );

  // Show empty state if no bank accounts
  if (!primaryBankAccount) {
    return (
      <SafeAreaView
        edges={["right", "bottom", "left"]}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.emptyContainer}
        >
          <EmptyBankAccountsState />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Transfer to your virtual account
          </Text>
          <Text style={styles.instructionText}>
            Make a bank transfer to any of these account numbers and your Whykay
            Digitals Wallet will be funded immediately in your fiat wallet.
          </Text>
        </View>

        {/* Virtual Account Details */}
        <View style={styles.accountSection}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Account Name</Text>
            <View style={styles.copyableField}>
              <Text style={styles.detailValue} numberOfLines={1}>
                {primaryBankAccount.account_name}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Bank Name</Text>
            <View style={styles.copyableField}>
              <Text style={styles.detailValue}>
                {primaryBankAccount.bank_name}
              </Text>
            </View>
          </View>

          {/* Account Number */}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Account Number</Text>
            <View style={styles.copyableField}>
              <Text style={[styles.detailValue, styles.accountNumber]}>
                {primaryBankAccount.account_number}
              </Text>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Amount to Transfer</Text>
            <View style={styles.amountDisplay}>
              <Text style={styles.amountText}>
                ₦{parseFloat(amount).toLocaleString()}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              copyToClipboard(
                primaryBankAccount.account_number,
                "accountNumber",
              )
            }
            style={styles.copyButton}
          >
            <Text
              style={{
                color: "white",
                fontSize: normalize(19),
                fontFamily: getFontFamily(700),
              }}
            >
              Tap to copy account details
            </Text>
            {copiedField === "accountNumber" ? (
              <Check size={13} color="white" />
            ) : (
              <CopySuccess size={13} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Show additional accounts if available */}
        {bankAccounts.length > 1 && (
          <View style={styles.additionalAccounts}>
            <Text style={styles.additionalTitle}>Additional Accounts</Text>
            {bankAccounts
              .filter((account: any) => !account.is_primary)
              .map((account: any, index: number) => (
                <View
                  key={account.account_number}
                  style={styles.additionalAccount}
                >
                  <View style={styles.additionalAccountInfo}>
                    <Text style={styles.additionalBankName}>
                      {account.bank_name}
                    </Text>
                    <Text style={styles.additionalAccountNumber}>
                      {account.account_number}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      copyToClipboard(
                        account.account_number,
                        `account-${index}`,
                      )
                    }
                    style={styles.additionalCopyButton}
                  >
                    <CopySuccess size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        )}

        <InfoCard
          IconComponent={InfoCircle}
          title="Important Notes:"
          description={[
            "Transfers typically reflect within 5-10 minutes",
            "Transfer exactly the amount shown above",
            "Use only the account details provided above",
            "This virtual account is dedicated to your profile",
          ]}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.primaryButton}
            onPress={handleIHaveMadeDeposit}
            disabled={isCheckingPayment}
          >
            {isCheckingPayment ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>I have made deposit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomLoading loading={isCheckingPayment} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000000",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: normalize(14),
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
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
    fontSize: normalize(20),
    fontFamily: getFontFamily("800"),
    color: "#000000",
    marginBottom: 8,
    lineHeight: 22,
  },
  instructionText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    lineHeight: 20,
    color: "#666666",
  },
  accountSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginVertical: 24,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    overflow: "hidden",
  },
  accountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  accountTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000000",
  },
  primaryBadge: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryBadgeText: {
    color: "#FFFFFF",
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
  detailItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  detailLabel: {
    marginBottom: 4,
    fontSize: normalize(18),
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
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    flex: 1,
  },
  accountNumber: {
    fontSize: normalize(26),
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
    fontSize: normalize(19),
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
    color: "#000",
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
  },
});

export default BankTransferScreen;
