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
import WithdrawalForm from "../components/WithdrawalForm";
import BankAccountSelector from "./BankAccountSelector";
import BankAccountModal from "./BankAccountModal";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ConfirmationModal from "../components/ConfirmationModal";
import useAxios from "../hooks/useAxios";
import { useSummaryDetail } from "../hooks/useSummaryDetail";
import { formatWithCommas } from "./SwapCryptoScreen";

const schema = yup.object({
  amount: yup
    .number()
    .typeError("Enter a valid amount")
    .min(1000, "Minimum is ₦1,000")
    .max(300000, "Maximum is ₦300,000")
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
    // reValidateMode: "onChange",
  });

  const bankCode = watch("bank_code");
  const amount = watch("amount");

  const currentWalletBalance: number = useMemo(() => {
    return walletSummary?.withdrawable_balance ?? 0;
  }, [walletSummary?.withdrawable_balance]);

  const isBalanceSufficient = useMemo(() => {
    return currentWalletBalance < amount;
  }, [currentWalletBalance, amount]);

  const isDisabled =
    !amount || isSubmitting || loading || !bankCode || isBalanceSufficient;

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
  });

  const bankOptions: any = useMemo(() => {
    if (Array.isArray(banksData)) {
      return banksData.map((bank: any) => ({
        label: bank.name?.toUpperCase(),
        value: bank.code,
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
    };

    console.log(values);

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

          <Text style={styles.amountNote}>Minimum of ₦1,000</Text>
        </View>

        {isBalanceSufficient && !!amount && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              You do not have enough funds in your wallet to complete this
              withdrawal. Note: you can only withdraw from your crypto sales
              balance, not deposit balance.
            </Text>
          </View>
        )}

        <BankAccountSelector
          bankName={
            bankOptions.find((bank: any) => bank.value === bankCode)?.label ||
            null
          }
          accountName={accountDetails?.accountName || null}
          accountNumber={accountDetails?.accountNumber || null}
          setShowBankModal={setShowBankModal}
        />

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
            paddingVertical: 16,
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
            Withdraw
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
  warningText: {
    color: "#db0b0bff",
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    textAlign: "center",
  },
  amountBox: { marginTop: 24 },
  amountNote: {
    color: "#535353ff",
    fontSize: normalize(15),
    fontFamily: getFontFamily("700"),
    marginBottom: 9,
    marginTop: 3,
  },
  label: {
    marginBottom: 6,
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
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
