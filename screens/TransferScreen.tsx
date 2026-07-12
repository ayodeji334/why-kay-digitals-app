import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  Controller,
  useForm,
  UseFormClearErrors,
  UseFormSetError,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigation } from "@react-navigation/native";
import CustomLoading from "../components/CustomLoading";
// import SaveAsBeneficiarySwitch from "../components/SaveAsBeneficiarySwitch";
import ConfirmationModal from "../components/ConfirmationModal";
import TabSwitcher, { TabOption } from "../components/TabSwitcher";
import { COLORS } from "../constants/colors";
import { normalize, getFontFamily } from "../constants/settings";
import BalanceCard from "../components/Dashboard/BalanceCard";
import { formatAmount } from "../libs/formatNumber";
import TextInputField from "../components/TextInputField";
import { SelectInput } from "../components/SelectInputField";
import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
import { useWallets } from "../hooks/useWallet";
import { useSummaryDetail } from "../hooks/useSummaryDetail";
import useAxios from "../hooks/useAxios";
import { useResetFormOnMount } from "../hooks/useResetFormOnMount";
import { AppText } from "../components/AppText";

// const fiatSchema = yup.object({
//   username: yup.string().required("Username is required"),
//   amount: yup
//     .number()
//     .typeError("Enter a valid amount")
//     .min(100, "Minimum amount you can transfer is ₦100")
//     .max(300000, "Maximum amount you can transfer is ₦300,000")
//     .required(),
//   description: yup.string().optional(),
// });

// const cryptoSchema = yup.object({
//   username: yup.string().required("Username is required"),
//   amount: yup
//     .number()
//     .typeError("Enter a valid amount")
//     .min(2, "The amount is too small. The minimum is 6 USD")
//     .required(),
//   asset_id: yup.string().required("Select a cryptocurrency"),
// });

interface ValidationState {
  isChecking: boolean;
  isValid: boolean | null;
}

export function useUsernameValidation(
  setError: UseFormSetError<any>,
  clearErrors: UseFormClearErrors<any>,
  debounceMs = 600,
) {
  const [state, setState] = useState<ValidationState>({
    isChecking: false,
    isValid: null,
  });
  const { post } = useAxios();

  const validate = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>;

      return (username: string) => {
        clearTimeout(timer);

        if (!username || username.length < 3) {
          setState({ isChecking: false, isValid: null });
          clearErrors("username");
          return;
        }

        setState(prev => ({ ...prev, isChecking: true }));

        timer = setTimeout(async () => {
          try {
            const { data } = await post("/users/user/validate-username", {
              username,
            });

            if (data.success) {
              setState({ isChecking: false, isValid: true });
              clearErrors("username");
            } else {
              setState({ isChecking: false, isValid: false });
              setError("username", {
                type: "manual",
                message: "Username cannot be verified",
              });
            }
          } catch {
            setState({ isChecking: false, isValid: false });
            setError("username", {
              type: "manual",
              message: "Could not verify username",
            });
          }
        }, debounceMs);
      };
    })(),
    [setError, clearErrors],
  );

  const reset = useCallback(() => {
    setState({ isChecking: false, isValid: null });
    clearErrors("username");
  }, [clearErrors]);

  return { ...state, validate, reset };
}

export type TransferTab = "fiat" | "crypto";

const base = {
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),
  amount: yup
    .number()
    .typeError("Enter a valid amount")
    .moreThan(0, "Amount must be greater than 0")
    .required("Amount is required"),
};

export const getTransferSchema = (tab: TransferTab): yup.AnyObjectSchema => {
  if (tab === "fiat") {
    return yup.object({
      ...base,
      description: yup.string().required("Narration is required"),
      asset_id: yup.string().optional(),
    });
  }

  return yup.object({
    ...base,
    asset_id: yup.string().required("Please select an asset"),
    description: yup.string().optional(),
  });
};

// export const getTransferSchema = (tab: TransferTab) => {
//   const base = {
//     username: yup
//       .string()
//       .min(3, "Username must be at least 3 characters")
//       .required("Username is required"),
//     amount: yup
//       .number()
//       .typeError("Enter a valid amount")
//       .moreThan(0, "Amount must be greater than 0")
//       .required("Amount is required"),
//   };

//   if (tab === "fiat") {
//     return yup.object({
//       ...base,
//       description: yup
//         .string()
//         .required("Narration is required"),
//     });
//   }

//   return yup.object({
//     ...base,
//     asset_id: yup
//       .string()
//       .required("Please select an asset"),
//   });
// };

export default function TransferScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TransferTab>("crypto");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayAmount, setDisplayAmount] = useState("");

  const { data: { wallets = [], totalAssetValueBalance = 0 } = {} } =
    useWallets();
  const { isLoading, walletSummary, refetch } = useSummaryDetail();

  // single form, schema swaps when tab changes
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { isValid, isSubmitting, errors },
  } = useForm<any>({
    resolver: yupResolver(getTransferSchema(activeTab)),
    defaultValues: { username: "", amount: 0, description: "", asset_id: "" },
    mode: "onChange",
  });

  // username validation hook
  const {
    isChecking,
    isValid: usernameIsValid,
    validate: validateUsername,
    reset: resetUsernameValidation,
  } = useUsernameValidation(setError, clearErrors);

  // tab switching — reset form + schema + username validation
  const handleTabChange = (tab: string) => {
    const nextTab = tab as any;
    setActiveTab(nextTab);
    setDisplayAmount("");
    resetUsernameValidation();
    reset(
      { username: "", amount: 0, description: "", asset_id: "" },
      {
        keepErrors: false,
        keepDirty: false,
        keepTouched: false,
        keepIsValid: false,
      },
    );
  };

  // re-validate username whenever it changes
  const username = watch("username");
  const amount = watch("amount") || 0;
  const assetId = watch("asset_id");

  useEffect(() => {
    validateUsername(username);
  }, [username]);

  // wallets
  const userWallets: any[] = useMemo(() => {
    if (!wallets || wallets.length === 0) return [];
    return wallets
      .map((asset: any) => ({
        ...asset,
        label: `${asset?.name} (${asset?.symbol})`,
        value: asset.asset_id ?? asset.uuid ?? "",
        symbol: asset.symbol ?? "",
        logo_url: asset.logo ?? "",
        price: asset?.value,
      }))
      .sort((a: any, b: any) => {
        const priceDiff = Number(b.price) - Number(a.price);
        if (priceDiff !== 0) return priceDiff;
        return Number(b.balance) - Number(a.balance);
      });
  }, [wallets]);

  // derived state
  const dailyLimit = walletSummary?.daily_limit ?? 0;
  const todayVolume = walletSummary?.total_today ?? 0;
  const fiatBalance = walletSummary?.withdrawable_balance ?? 0;
  const cryptoLimit = walletSummary?.daily_crypto_transfer_limit ?? 0;

  const selectedCryptoWallet = useMemo(
    () => userWallets.find(w => w.asset_id === assetId),
    [userWallets, assetId],
  );

  const exceedsDailyLimit = useMemo(() => {
    if (activeTab !== "fiat" || !amount || !dailyLimit) return false;
    return amount + todayVolume > dailyLimit;
  }, [activeTab, amount, dailyLimit, todayVolume]);

  const hasInsufficientBalance = useMemo(() => {
    if (!amount) return false;
    if (activeTab === "fiat") return amount > fiatBalance;
    if (!selectedCryptoWallet) return true;
    return amount > selectedCryptoWallet?.price;
  }, [amount, activeTab, fiatBalance, selectedCryptoWallet?.price]);

  const progress = dailyLimit
    ? (walletSummary?.total_today ?? 0) / dailyLimit
    : 0;

  const isDisabled = useMemo(
    () =>
      !isValid ||
      isSubmitting ||
      hasInsufficientBalance ||
      exceedsDailyLimit ||
      amount <= 0 ||
      isChecking ||
      !usernameIsValid,
    [
      isValid,
      isSubmitting,
      hasInsufficientBalance,
      exceedsDailyLimit,
      amount,
      isChecking,
      usernameIsValid,
    ],
  );

  // submit ─
  const onSubmit = (values: any) => {
    if (activeTab === "fiat") {
      const payload = {
        username: values.username,
        amount: Number(values.amount),
        description: values.description,
        type: "TRANSFER",
        url: "/wallets/user/transfer",
      };

      if (values.amount > 50000) {
        setPendingPayload(payload);
        setShowConfirmModal(true);
        return;
      }

      navigation.navigate("ConfirmTransaction", { payload });
      return;
    }

    navigation.navigate("ConfirmTransaction", {
      payload: {
        username: values.username,
        amount: Number(values.amount),
        asset_id: values.asset_id,
        type: "CRYPTO_TRANSFER",
        url: "/wallets/user/transfer-crypto",
      },
    });
  };

  const handleProceed = () => {
    setShowConfirmModal(false);
    navigation.navigate("ConfirmTransaction", { payload: pendingPayload });
  };

  const tabOptions: TabOption[] = [
    { value: "crypto", label: "Crypto" },
    { value: "fiat", label: "Fiat" },
  ];

  useResetFormOnMount(reset, { amount: 0, username: "", assetId: "" }, () => {
    setDisplayAmount("");
  });

  return (
    <SafeAreaView
      edges={["right", "bottom"]}
      style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <TabSwitcher
        tabs={tabOptions}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        containerStyle={{ backgroundColor: "#f3f3f3ff", marginVertical: 10 }}
        activeTabStyle={{ backgroundColor: COLORS.primary }}
        activeTabTextStyle={{ color: "#fff" }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={async () => {
              setIsRefreshing(true);
              await refetch();
              setIsRefreshing(false);
            }}
            colors={[COLORS.secondary]}
          />
        }
      >
        <BalanceCard
          balance={
            activeTab === "crypto" ? totalAssetValueBalance : fiatBalance
          }
          title="Total Balance"
          showTransactionsButton={false}
          showActionButtons={false}
          currency={activeTab === "crypto" ? "USD" : "NGN"}
        />

        {activeTab === "crypto" && (
          <View style={styles.limitContainer}>
            <View style={styles.limitHeader}>
              <AppText style={styles.limitLabel}>
                Daily Limit: {formatAmount(cryptoLimit ?? 0) || "0"}
              </AppText>
              <AppText
                onPress={() => navigation.navigate("Verification" as any)}
                style={styles.upgradeText}
              >
                Upgrade Limit
              </AppText>
            </View>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(progress * 100, 100)}%` },
                ]}
              />
            </View>
            <View style={styles.limitRange}>
              <AppText style={styles.limitValue}>
                {formatAmount(walletSummary?.total_crypto_transfers_today, {
                  currency: "USD",
                }) ?? "0"}
              </AppText>
              <AppText style={styles.limitValue}>
                {formatAmount(cryptoLimit ?? 0, {
                  currency: "USD",
                }) || "0"}
              </AppText>
            </View>
          </View>
        )}

        {activeTab === "fiat" && (
          <View style={styles.limitContainer}>
            <View style={styles.limitHeader}>
              <AppText style={styles.limitLabel}>
                Daily Limit:{" "}
                {formatAmount(walletSummary?.daily_limit ?? 0) ?? "0"}
              </AppText>
              <AppText
                onPress={() => navigation.navigate("Verification" as any)}
                style={styles.upgradeText}
              >
                Upgrade Limit
              </AppText>
            </View>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(progress * 100, 100)}%` },
                ]}
              />
            </View>
            <View style={styles.limitRange}>
              <AppText style={styles.limitValue}>
                {formatAmount(walletSummary?.total_today ?? 0) ?? "0"}
              </AppText>
              <AppText style={styles.limitValue}>
                {formatAmount(walletSummary?.daily_limit ?? 0) ?? "0"}
              </AppText>
            </View>
          </View>
        )}

        {/* key forces the entire form to remount on tab change,
            clearing all field state and keyboard focus cleanly  */}
        <View key={activeTab} style={styles.form}>
          <TextInputField
            label="Username"
            control={control}
            name="username"
            placeholder="Enter recipient username"
          />

          {isChecking && (
            <View style={styles.usernameStatus}>
              <AppText style={styles.usernameChecking}>
                Validating username…
              </AppText>
            </View>
          )}

          {!isChecking && usernameIsValid === true && (
            <View style={styles.usernameStatus}>
              <AppText style={styles.usernameValid}>✓ Username found</AppText>
            </View>
          )}

          {activeTab === "crypto" && (
            <View style={{ marginVertical: 4 }}>
              <SelectInput
                control={control}
                name="asset_id"
                label="Choose Asset (coin)"
                options={userWallets}
                placeholder="Select an asset (coin)"
                title="Select an asset"
                showWalletPrice={true}
              />
            </View>
          )}

          <View style={{ marginVertical: 4 }}>
            <AppText style={styles.label}>
              Amount in {activeTab === "fiat" ? "Naira (₦)" : "Dollars (USD)"}
            </AppText>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onBlur, onChange } }) => (
                <View style={styles.inputContainer}>
                  <AppText style={styles.dollarSign}>
                    {activeTab === "fiat" ? "₦" : "$"}
                  </AppText>
                  <TextInput
                    maxFontSizeMultiplier={1}
                    allowFontScaling={false}
                    style={styles.input}
                    value={displayAmount}
                    placeholder="0.00"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                    onBlur={onBlur}
                    onChangeText={text => {
                      const formatted = formatWithCommas(text);
                      onChange(parseToNumber(formatted));
                      setDisplayAmount(formatted);
                    }}
                  />
                </View>
              )}
            />
            {errors.amount && (
              <AppText style={styles.error}>
                {errors?.amount?.message as string}
              </AppText>
            )}
          </View>

          {activeTab === "fiat" && (
            <View style={{ marginVertical: 4 }}>
              <TextInputField
                label="Narration"
                control={control}
                name="description"
                placeholder="Enter description"
              />
            </View>
          )}
        </View>

        {exceedsDailyLimit && (
          <View style={styles.warningContainer}>
            <AppText style={styles.warningText}>
              This amount exceeds your daily transfer limit of{" "}
              {formatAmount(walletSummary?.daily_limit ?? 0)}. Please reduce the
              amount or upgrade your limit.
            </AppText>
          </View>
        )}

        {!exceedsDailyLimit && hasInsufficientBalance && (
          <View style={styles.warningContainer}>
            <AppText style={styles.warningText}>
              You do not have enough balance to complete this transfer.
            </AppText>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSubmit(onSubmit)}
          disabled={isDisabled}
          style={{
            backgroundColor: isDisabled ? COLORS.fadePrimary : COLORS.secondary,
            borderRadius: 100,
            paddingVertical: 16,
            marginVertical: 30,
          }}
        >
          <AppText
            style={{
              color: "#fff",
              fontSize: normalize(18),
              textAlign: "center",
              fontFamily: getFontFamily("700"),
              opacity: isDisabled ? 0.4 : 1,
            }}
          >
            Continue
          </AppText>
        </TouchableOpacity>

        <CustomLoading loading={isLoading} />
      </ScrollView>

      {activeTab === "fiat" && (
        <ConfirmationModal
          data={{ amount }}
          showConfirmModal={showConfirmModal}
          setShowConfirmModal={setShowConfirmModal}
          handleProceed={handleProceed}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  limitContainer: {
    marginVertical: 10,
    backgroundColor: "#EFF7EC",
    padding: 10,
    borderRadius: 10,
  },
  usernameStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  usernameChecking: {
    fontSize: 12,
    color: "#888",
    fontFamily: getFontFamily("700"),
  },
  usernameValid: {
    fontSize: 12,
    color: "#077830", // green
    fontFamily: getFontFamily("700"),
  },
  usernameInvalid: {
    fontSize: 12,
    color: "#c21414", // red
    fontFamily: getFontFamily("700"),
  },
  warningContainer: {
    marginVertical: 12,
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
  error: {
    color: "red",
    fontSize: normalize(19),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(10),
  },
  form: { marginVertical: 10 },
  label: {
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: normalize(16),
    marginBottom: normalize(10),
    gap: 5,
  },
  dollarSign: {
    fontSize: normalize(26),
    fontFamily: getFontFamily("700"),
    color: "#000",
    marginRight: normalize(5),
  },
  input: {
    flex: 1,
    paddingVertical: normalize(16),
    fontSize: normalize(26),
    fontFamily: getFontFamily("700"),
    color: "#000",
    borderRadius: 10,
  },
  limitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  limitLabel: {
    fontSize: normalize(18),
    color: "#000",
    fontFamily: getFontFamily("700"),
  },
  upgradeText: {
    fontSize: normalize(18),
    color: COLORS.secondary,
    fontFamily: getFontFamily("700"),
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginTop: 18,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 3,
  },
  limitRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  limitValue: {
    fontFamily: getFontFamily("800"),
    fontSize: normalize(18),
  },
});
