import React, { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomLoading from "../components/CustomLoading";
import SaveAsBeneficiarySwitch from "../components/SaveAsBeneficiarySwitch";
import { COLORS } from "../constants/colors";
import { normalize, getFontFamily } from "../constants/settings";
import BalanceLimitCard from "../components/BalanceLimitCard";
// import WithdrawalForm from "../components/WithdrawalForm";
import BankAccountSelector from "./BankAccountSelector";
import BankAccountModal from "./BankAccountModal";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ConfirmationModal from "../components/ConfirmationModal";
import useAxios from "../hooks/useAxios";
import { useSummaryDetail } from "../hooks/useSummaryDetail";
import { formatWithCommas } from "./SwapCryptoScreen";
import { formatAmount } from "../libs/formatNumber";
import InfoCard from "../components/InfoCard";

const schema = yup.object({
  amount: yup
    .number()
    .typeError("Enter a valid amount")
    .min(1000, "Minimum is ₦1,000")
    .max(3000000, "Maximum is ₦3,000,000")
    .required("Enter withdrawal amount"),
  bank_code: yup.string().required("Select a bank"),
  account_number: yup
    .string()
    .length(10, "Account number must be 10 digits")
    .required("Enter account number"),
});

export default function WithdrawScreen() {
  const { apiGet } = useAxios();
  const navigation: any = useNavigation();
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [accountDetails, setAccountDetails] = useState<any>(null);
  const [amountFormated, setAmount] = useState("");

  const {
    isLoading,
    walletSummary,
    refetch: refetchWallet,
  } = useSummaryDetail();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const bankCode = watch("bank_code");
  const amount = watch("amount");

  const currentWalletBalance = walletSummary?.withdrawable_balance ?? 0;
  const dailyLimit = walletSummary?.daily_limit ?? 0;
  const todayVolume = walletSummary?.total_today ?? 0;

  const exceedsDailyLimit = useMemo(() => {
    if (!amount || !dailyLimit) return false;

    return amount + todayVolume > dailyLimit;
  }, [amount, dailyLimit]);

  const { data: banksData, refetch: refetchBanks } = useQuery({
    queryKey: ["banks"],
    queryFn: async () => {
      return apiGet("/banks")
        .then(res => res?.data?.data || [])
        .catch(err => {
          throw err;
        });
    },
    refetchOnWindowFocus: true,
    staleTime: 800000,
  });

  const bankOptions: any = useMemo(() => {
    if (Array.isArray(banksData)) {
      return banksData.map((bank: any) => ({
        label: bank.name?.toUpperCase(),
        value: bank.code,
        logo_url: !!bank?.logo
          ? bank?.logo
          : "https://placehold.co/600x400/png",
      }));
    }
    return [];
  }, [banksData]);

  const onSubmit = (values: any) => {
    const payload = {
      account_number: values.account_number,
      bank_code: values.bank_code,
      amount: values.amount,
      type: "WITHDRAWAL",
      url: "/transactions/withdrawal",
      save_as_beneficiary: saveBeneficiary,
      meta: {},
      bank_name: selectedBank ?? "",
    };

    if (parseInt(values.amount) > 50000) {
      setPendingPayload(payload);
      setShowConfirmModal(true);

      return;
    }

    navigation.navigate("ConfirmTransaction" as never, { payload });
  };

  const handleProceed = () => {
    setShowConfirmModal(false);
    setLoading(false);

    navigation.navigate("ConfirmTransaction" as never, {
      payload: pendingPayload,
    });
  };

  const selectedBank: string =
    bankOptions.find((bank: any) => bank.value === bankCode)?.label || null;

  const feeBreakdown = useMemo(() => {
    if (!amount || isNaN(amount)) {
      return {
        stampDuty: 0,
        withdrawalFee: 0,
        totalFees: 0,
        totalDebit: 0,
      };
    }

    const stampDuty = amount >= 10000 ? 50 : 0;
    const withdrawalFee = 100;

    const totalFees = stampDuty + withdrawalFee;
    const totalDebit = amount + totalFees;

    return {
      stampDuty,
      withdrawalFee,
      totalFees,
      totalDebit,
    };
  }, [amount]);

  const isBalanceSufficient = useMemo(() => {
    if (!amount) return true;
    return feeBreakdown.totalDebit <= (currentWalletBalance ?? 0);
  }, [amount, feeBreakdown.totalDebit, currentWalletBalance]);

  const isDisabled =
    !amount ||
    amount < 1000 ||
    !isBalanceSufficient ||
    exceedsDailyLimit ||
    isSubmitting;

  useFocusEffect(
    useCallback(() => {
      refetchWallet();
      refetchBanks();
    }, [refetchWallet]),
  );

  return (
    <SafeAreaView
      edges={["right", "bottom"]}
      style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={async () => {
              setIsRefreshing(true);
              try {
                await refetchWallet();
                await refetchBanks();
              } finally {
                setIsRefreshing(false);
              }
            }}
            colors={[COLORS.secondary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <BalanceLimitCard walletSummary={walletSummary} />

        <View style={styles.amountBox}>
          <View style={{ marginBottom: 2, marginTop: 10 }}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.dollarSign}>₦</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholderTextColor={"#aeaeaeff"}
                placeholder="0.00"
                value={amountFormated}
                onChangeText={text => {
                  const numericText = text.replace(/,/g, "");
                  const parsed = parseFloat(numericText);

                  const formatted = formatWithCommas(numericText);
                  setValue("amount", parsed);
                  setAmount(formatted);
                }}
              />
            </View>
          </View>
          {errors.amount?.message ? (
            <Text style={styles.warningText}>{errors.amount?.message}</Text>
          ) : undefined}
          <Text style={styles.amountNote}>Minimum of ₦1,000</Text>
        </View>

        {amount ? (
          <View style={styles.feeBreakdownContainer}>
            <Text style={styles.feeBreakdownTitle}>Transaction Summary</Text>

            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Amount</Text>
              <Text style={styles.feeValue}>{formatAmount(amount || 0)}</Text>
            </View>

            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Withdrawal Fee</Text>
              <Text style={styles.feeValue}>
                {formatAmount(feeBreakdown.withdrawalFee)}
              </Text>
            </View>

            {feeBreakdown.stampDuty > 0 && (
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Stamp Duty</Text>
                <Text style={styles.feeValue}>
                  {formatAmount(feeBreakdown.stampDuty)}
                </Text>
              </View>
            )}

            <View style={styles.feeDivider} />

            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Total Debit</Text>
              <Text style={styles.feeValue}>
                {formatAmount(feeBreakdown.totalDebit)}
              </Text>
            </View>
          </View>
        ) : undefined}

        {isBalanceSufficient && exceedsDailyLimit && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              This amount exceeds your daily transfer limit of{" "}
              {formatAmount(walletSummary?.daily_limit ?? 0)}. Please reduce the
              amount or upgrade your limit.
            </Text>
          </View>
        )}

        {!isBalanceSufficient && !!amount && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              Insufficient balance. You need{" "}
              {formatAmount(feeBreakdown.totalDebit)} to complete this
              withdrawal (including fees).
            </Text>
          </View>
        )}

        <InfoCard
          title="Important Notice!"
          description={[
            "Withdrawal of ₦10,000 and above will attract a ₦50 stamp duty charge in line with government regulations.",
            "A fee of ₦100 will be charge on every withdrawal",
          ]}
        />

        <BankAccountSelector
          bankName={selectedBank}
          accountName={accountDetails?.accountName || null}
          accountNumber={accountDetails?.accountNumber || null}
          setShowBankModal={setShowBankModal}
        />

        {(errors.account_number?.message || errors?.bank_code?.message) && (
          <Text
            style={{
              paddingVertical: 10,
              color: "red",
              fontFamily: getFontFamily("800"),
              fontSize: 12,
            }}
          >
            You need to add a bank account
          </Text>
        )}

        <SaveAsBeneficiarySwitch
          value={saveBeneficiary}
          onValueChange={setSaveBeneficiary}
          disabled={loading}
        />

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSubmit(onSubmit)}
          style={{
            backgroundColor: !isDisabled ? COLORS.secondary : "#ccc",
            borderRadius: 100,
            paddingVertical: 14,
            marginTop: 30,
          }}
          disabled={isDisabled}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: normalize(18),
              textAlign: "center",
              fontFamily: getFontFamily("700"),
            }}
          >
            Continue
          </Text>
        </TouchableOpacity>

        <CustomLoading loading={isLoading} />
      </ScrollView>

      <BankAccountModal
        visible={showBankModal}
        onClose={() => setShowBankModal(false)}
        bankOptions={bankOptions}
        setAccountDetails={setAccountDetails}
        setValue={setValue}
      />

      <ConfirmationModal
        data={{ amount }}
        handleProceed={handleProceed}
        setShowConfirmModal={setShowConfirmModal}
        showConfirmModal={showConfirmModal && amount > 50000}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  warningContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "rgba(255, 0, 0, 0.03)",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.3)",
  },
  feeBreakdownContainer: {
    backgroundColor: "#5AB2431A",
    borderRadius: 12,
    padding: 16,
    gap: 10,
    marginTop: 10,
  },
  feeBreakdownTitle: {
    color: "#000",
    fontFamily: getFontFamily("800"),
    fontSize: 13,
    marginBottom: 4,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feeLabel: {
    color: "#000",
    fontFamily: getFontFamily("700"),
    fontSize: 12,
    flex: 1,
  },
  feeValue: {
    color: "#000",
    fontFamily: getFontFamily("900"),
    fontSize: 12,
    textAlign: "right",
    flex: 1,
  },
  feeDivider: {
    height: 1,
    backgroundColor: "#b1b1b1",
  },
  feeWarning: {
    backgroundColor: "#3a1a1a",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  feeWarningText: {
    color: "#ff6b6b",
    fontFamily: getFontFamily("400"),
    fontSize: 18,
  },
  warningText: {
    color: "#db0b0bff",
    fontSize: normalize(17),
    fontFamily: getFontFamily("800"),
    textAlign: "center",
  },
  amountBox: { marginTop: 24 },
  amountNote: {
    color: "#000",
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
    marginBottom: 9,
    marginTop: 3,
  },
  label: {
    marginBottom: 6,
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000000ff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    gap: 5,
  },
  input: {
    flex: 1,
    paddingVertical: normalize(16),
    fontSize: normalize(26),
    fontFamily: getFontFamily("800"),
    color: "#000",
  },
  dollarSign: {
    fontSize: normalize(26),
    fontFamily: getFontFamily("800"),
    color: "#000",
    paddingLeft: 15,
  },
});
