import React, { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
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
import KYCStatusScreen from "../components/KYCStatusScreen";
import { useAuthStore } from "../stores/authSlice";

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
  const user = useAuthStore(state => state.user);

  const {
    data: walletSummary,
    refetch: refetchWallet,
    isFetching: isLoading,
  } = useQuery({
    queryKey: ["wallet-summary"],
    queryFn: async () =>
      (await apiGet("/transactions/user/daily-summary")).data.data,
    refetchOnWindowFocus: true,
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const bankCode = watch("bank_code");
  const amount = watch("amount");

  const currentWalletBalance: number = useMemo(() => {
    return walletSummary?.balance ?? 0;
  }, [walletSummary?.balance]);

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
      {user?.bvn_verification_status !== "VERIFIED" ? (
        <KYCStatusScreen />
      ) : (
        <>
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

            <WithdrawalForm control={control} />

            {isBalanceSufficient && !!amount && (
              <Text
                style={{
                  fontFamily: getFontFamily(700),
                  fontSize: normalize(15),
                  color: "red",
                  marginBottom: 10,
                  textAlign: "center",
                  borderRadius: 10,
                  backgroundColor: "#fff0f0ff",
                  padding: 20,
                  paddingHorizontal: 30,
                }}
              >
                You do not have enough funds in your wallet to complete this
                withdrawal. Please top up your wallet and try again.
              </Text>
            )}

            <BankAccountSelector
              bankName={
                bankOptions.find((bank: any) => bank.value === bankCode)
                  ?.label || null
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
        </>
      )}
    </SafeAreaView>
  );
}
