import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
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
import { useColors } from "../hooks/useTheme";

const BANK_NAME = "Boost Microfinance Bank ( Boost MFB )";

const BankTransferScreen = () => {
  const { apiGet } = useAxios();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore(state => state.user);
  const refreshUser = useAuthStore(state => state.refreshUser);
  const navigation: any = useNavigation();
  const colors = useColors();
  const styles = makeStyles(colors);

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
      await Promise.all([refetch(), refreshUser()]);
    } finally {
      setRefreshing(false);
    }
  };

  const copyToClipboard = async (text: string | undefined, field: string) => {
    if (!text) return;

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

  const renderCopyIcon = (field: string) =>
    copiedField === field ? (
      <Check size={16} color={COLORS.primary} />
    ) : (
      <CopySuccess size={16} color={COLORS.primary} />
    );

  const renderCopyRow = (
    label: string,
    value: string | undefined,
    field: string,
    valueStyle?: any,
  ) => (
    <View style={styles.detailItem}>
      <AppText style={styles.detailLabel}>{label}</AppText>
      <TouchableOpacity
        hitSlop={5}
        activeOpacity={0.7}
        onPress={() => copyToClipboard(value, field)}
        style={styles.copyableField}
      >
        <AppText style={[styles.detailValue, valueStyle]} numberOfLines={1}>
          {value}
        </AppText>
        <View style={styles.rowIconButton}>{renderCopyIcon(field)}</View>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return <CustomLoading loading={isLoading} />;
  }

  const hasNoVirtualAccount =
    user?.bvn_verification_status === "VERIFIED" &&
    data &&
    Object.keys(data).length <= 0;

  if (hasNoVirtualAccount) {
    return (
      <SafeAreaView
        edges={["right", "bottom", "left"]}
        style={styles.container}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
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
            <TouchableOpacity
              activeOpacity={0.89}
              hitSlop={10}
              style={styles.emptyButton}
              onPress={onRefresh}
            >
              <AppText style={styles.emptyButtonText}>Try again</AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      {user?.bvn_verification_status !== "VERIFIED" ? (
        <KYCStatusScreen />
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
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
            {renderCopyRow("Account Name", data?.account_name, "accountName")}
            {renderCopyRow("Bank Name", BANK_NAME, "bankName")}
            {renderCopyRow(
              "Account Number",
              data?.account_number,
              "accountNumber",
              styles.accountNumber,
            )}
          </View>

          <InfoCard
            IconComponent={<InfoCircle size={18} />}
            title="Important Notes:"
            description={[
              "Payments must be made using the same name registered on your Whykay account",
              "⁠Transfers typically reflect in your account within 5–10 minutes.",
              "⁠A transaction fee will be deducted from your wallet balance for each deposit.",
              "⁠Deposits attract a 1% processing fee, capped at a maximum of ₦2,000 for transactions of ₦200,000 and above.",
              "⁠If a payment is made using a name that does not match your registered account details, the funds will be placed on hold for 7 business days for review. If the payment cannot be verified, a refund will be processed.",
              // "Transfers typically reflect within 5-10 minutes",
              // "A transaction fee will be deducted from your wallet balance for each deposit",
              // "If payment is made using a name that does not match your registered details, the funds will be held for 5 business days for review before a refund is processed.",
              // "Deposits into your account attract a processing fee of 1% of the transaction amount, capped at a maximum of ₦2,000 for transaction of ₦200,000 and above",
            ]}
          />

          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              activeOpacity={0.8}
              hitSlop={10}
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

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    buttonWrapper: {
      marginTop: normalizeSpacing(10),
      paddingBottom: normalizeSpacing(20),
    },
    button: {
      backgroundColor: COLORS.secondary,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 100,
      marginTop: normalizeSpacing(30),
      justifyContent: "center",
      alignContent: "center",
    },
    buttonText: {
      color: "#fff",
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
      textAlign: "center",
    },
    scrollView: { flex: 1, paddingHorizontal: normalizeSpacing(20) },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: normalizeSpacing(30),
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: normalizeSpacing(0),
      marginTop: normalizeSpacing(-150),
    },
    emptyIcon: {
      width: 40,
      height: 40,
      borderRadius: 40,
      backgroundColor: "#F8F9FA",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: normalizeSpacing(20),
    },
    emptyTitle: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("900"),
      color: colors.text,
      marginBottom: normalizeSpacing(12),
      textAlign: "center",
    },
    emptyDescription: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.text,
      textAlign: "center",
      marginBottom: normalizeSpacing(20),
    },
    emptyButton: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: normalizeSpacing(44),
      paddingVertical: normalizeSpacing(14),
      borderRadius: 800,
      width: "100%",
    },
    emptyButtonText: {
      color: "#FFFFFF",
      fontSize: normalize(19),
      fontFamily: getFontFamily("700"),
    },
    section: { marginBottom: normalizeSpacing(16) },
    sectionTitle: {
      fontSize: normalize(19),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalizeSpacing(8),
    },
    instructionText: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.text,
    },
    accountSection: {
      backgroundColor: colors.infoCardBackgroundColor,
      borderRadius: 12,
      marginVertical: normalizeSpacing(24),
      borderWidth: 0.5,
      borderColor: colors.border,
      overflow: "hidden",
    },
    detailItem: {
      paddingVertical: normalizeSpacing(12),
      paddingHorizontal: normalizeSpacing(15),
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    detailLabel: {
      marginBottom: normalizeSpacing(2),
      fontSize: normalize(16),
      fontFamily: getFontFamily("700"),
      color: colors.text,
    },
    copyableField: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: normalizeSpacing(4),
      gap: 10,
    },
    rowIconButton: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: COLORS.fadeBackgroundPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    detailValue: {
      color: colors.text,
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
  });

export default BankTransferScreen;
