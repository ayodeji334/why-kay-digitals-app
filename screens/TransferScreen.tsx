import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  RefreshControl,
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
import ConfirmationModal from "../components/ConfirmationModal";
import TabSwitcher, { TabOption } from "../components/TabSwitcher";
import { COLORS } from "../constants/colors";
import {
  normalize,
  getFontFamily,
  normalizeSpacing,
} from "../constants/settings";
import BalanceCard from "../components/Dashboard/BalanceCard";
import { formatAmount } from "../libs/formatNumber";
import TextInputField from "../components/TextInputField";
import { SelectInput } from "../components/SelectInputField";
import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
import { useWallets } from "../hooks/useWallet";
import { useSummaryDetail } from "../hooks/useSummaryDetail";
import useAxios from "../hooks/useAxios";
import { showValue } from "../libs/requestError";
import { useResetFormOnMount } from "../hooks/useResetFormOnMount";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import { useStyles } from "../hooks/useStyles";

interface ValidationState {
  isChecking: boolean;
  isValid: boolean | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useEmailValidation(
  email: string,
  setError: UseFormSetError<any>,
  clearErrors: UseFormClearErrors<any>,
  debounceMs = 600,
) {
  const [state, setState] = useState<ValidationState>({
    isChecking: false,
    isValid: null,
  });
  const { post } = useAxios();

  const trimmed = email?.trim() ?? "";

  useEffect(() => {
    if (!EMAIL_REGEX.test(trimmed)) {
      setState({ isChecking: false, isValid: null });
      clearErrors("email");
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    setState({ isChecking: true, isValid: null });

    const timer = setTimeout(async () => {
      try {
        const { data } = await post(
          "/users/user/validate-email",
          { email: trimmed },
          { signal: controller.signal },
        );

        if (cancelled) return; // superseded by a newer keystroke

        if (data.success) {
          setState({ isChecking: false, isValid: true });
          clearErrors("email");
        } else {
          setState({ isChecking: false, isValid: false });
          setError("email", {
            type: "manual",
            message: "No account was found with that email",
          });
        }
      } catch (err: any) {
        if (
          cancelled ||
          err?.name === "CanceledError" ||
          err?.name === "AbortError"
        )
          return;
        setState({ isChecking: false, isValid: false });
        setError("email", {
          type: "manual",
          message: "Could not verify email",
        });
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(timer); // cancels a pending debounce
      controller.abort(); // cancels an in-flight request
    };
  }, [trimmed, debounceMs, post, setError, clearErrors]);

  const reset = useCallback(() => {
    setState({ isChecking: false, isValid: null });
    clearErrors("email");
  }, [clearErrors]);

  return { ...state, validate: undefined, reset };
}

export type TransferTab = "fiat" | "crypto";

const base = {
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Recipient email is required"),
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

export default function TransferScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TransferTab>("crypto");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayAmount, setDisplayAmount] = useState("");
  const styles = useStyles(makeStyles);

  const { data: { wallets = [], totalAssetValueBalance = 0 } = {} } =
    useWallets();
  const { isLoading, walletSummary, refetch } = useSummaryDetail();

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
    defaultValues: { email: "", amount: 0, description: "", asset_id: "" },
    mode: "onChange",
  });

  const handleTabChange = (tab: string) => {
    const nextTab = tab as any;
    setActiveTab(nextTab);
    setDisplayAmount("");
    resetUsernameValidation();
    reset(
      { email: "", amount: 0, description: "", asset_id: "" },
      {
        keepErrors: false,
        keepDirty: false,
        keepTouched: false,
        keepIsValid: false,
      },
    );
  };

  const email = watch("email");
  const amount = watch("amount") || 0;
  const assetId = watch("asset_id");

  const {
    isChecking,
    isValid: usernameIsValid,
    reset: resetUsernameValidation,
  } = useEmailValidation(email, setError, clearErrors);

  const userWallets: any[] = useMemo(() => {
    if (!wallets || wallets.length === 0) return [];
    return wallets
      .map((asset: any) => ({
        ...asset,
        label: `${showValue(asset?.name)} (${showValue(asset?.symbol)})`,
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
  const todayVolume = walletSummary?.total_fiat_transfer_today ?? 0;
  const fiatBalance = walletSummary?.withdrawable_balance ?? 0;
  const cryptoLimit = walletSummary?.daily_crypto_transfer_limit ?? 0;
  // null means the current tier has no monthly cap
  const monthlyLimit = walletSummary?.monthly_limit ?? null;
  const monthVolume = walletSummary?.total_fiat_transfers_this_month ?? 0;

  const selectedCryptoWallet = useMemo(
    () => userWallets.find(w => w.asset_id === assetId),
    [userWallets, assetId],
  );

  const exceedsDailyLimit = useMemo(() => {
    if (activeTab !== "fiat" || !amount || !dailyLimit) return false;
    return amount + todayVolume > dailyLimit;
  }, [activeTab, amount, dailyLimit, todayVolume]);

  const exceedsMonthlyLimit = useMemo(() => {
    if (activeTab !== "fiat" || !amount || !monthlyLimit) return false;
    return amount + monthVolume > monthlyLimit;
  }, [activeTab, amount, monthlyLimit, monthVolume]);

  const hasInsufficientBalance = useMemo(() => {
    if (!amount) return false;
    if (activeTab === "fiat") return amount > fiatBalance;
    if (!selectedCryptoWallet) return true;
    return amount > selectedCryptoWallet?.price;
  }, [amount, activeTab, fiatBalance, selectedCryptoWallet]);

  const progress = dailyLimit
    ? (walletSummary?.total_fiat_transfer_today ?? 0) / dailyLimit
    : 0;

  const isDisabled = useMemo(
    () =>
      !isValid ||
      isSubmitting ||
      hasInsufficientBalance ||
      exceedsDailyLimit ||
      exceedsMonthlyLimit ||
      amount <= 0 ||
      isChecking ||
      !usernameIsValid,
    [
      isValid,
      isSubmitting,
      hasInsufficientBalance,
      exceedsDailyLimit,
      exceedsMonthlyLimit,
      amount,
      isChecking,
      usernameIsValid,
    ],
  );

  // submit ─
  const onSubmit = (values: any) => {
    if (activeTab === "fiat") {
      const payload = {
        email: values.email,
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
        email: values.email,
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

  useResetFormOnMount(reset, { amount: 0, email: "", assetId: "" }, () => {
    setDisplayAmount("");
  });

  return (
    <SafeAreaView edges={["right", "bottom"]} style={styles.screenPadded}>
      <TabSwitcher
        tabs={tabOptions}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        containerStyle={styles.tabSwitcher}
        activeTabStyle={styles.activeTab}
        activeTabTextStyle={styles.activeTabText}
      />

      <ScrollView
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
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
                Daily Limit:{" "}
                {formatAmount(cryptoLimit ?? 0, {
                  decimalPlace: 2,
                  currency: "USD",
                }) || "0"}
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
                  decimalPlace: 2,
                }) ?? "0"}
              </AppText>
              <AppText style={styles.limitValue}>
                {formatAmount(cryptoLimit ?? 0, {
                  currency: "USD",
                  decimalPlace: 2,
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
                {formatAmount(walletSummary?.total_fiat_transfer_today ?? 0, {
                  decimalPlace: 2,
                }) ?? "0"}
              </AppText>
              <AppText style={styles.limitValue}>
                {formatAmount(walletSummary?.daily_limit ?? 0, {
                  decimalPlace: 2,
                }) ?? "0"}
              </AppText>
            </View>
          </View>
        )}

        {/* {activeTab === "fiat" && monthlyLimit && (
          <View style={styles.limitContainer}>
            <View style={styles.limitHeader}>
              <AppText style={styles.limitLabel}>
                Monthly Limit: {formatAmount(monthlyLimit)}
              </AppText>
            </View>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(
                      (monthVolume / monthlyLimit) * 100,
                      100,
                    )}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.limitRange}>
              <AppText style={styles.limitValue}>
                {formatAmount(monthVolume, { decimalPlace: 2 }) ?? "0"}
              </AppText>
              <AppText style={styles.limitValue}>
                {formatAmount(monthlyLimit, { decimalPlace: 2 }) ?? "0"}
              </AppText>
            </View>
          </View>
        )} */}

        {/* key forces the entire form to remount on tab change,
            clearing all field state and keyboard focus cleanly  */}
        <View key={activeTab} style={styles.form}>
          <TextInputField
            label="Recipient Email"
            control={control}
            name="email"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter recipient email address"
          />

          {isChecking && (
            <View style={styles.usernameStatus}>
              <AppText style={styles.usernameChecking}>
                Validating email…
              </AppText>
            </View>
          )}

          {!isChecking && usernameIsValid === true && (
            <View style={styles.usernameStatus}>
              <AppText style={styles.usernameValid}>Account found</AppText>
            </View>
          )}

          {activeTab === "crypto" && (
            <View style={{ marginVertical: normalizeSpacing(4) }}>
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

          <View style={{ marginVertical: normalizeSpacing(4) }}>
            <AppText style={styles.label}>Amount</AppText>
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
            <View style={{ marginVertical: normalizeSpacing(4) }}>
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

        {!exceedsDailyLimit && exceedsMonthlyLimit && (
          <View style={styles.warningContainer}>
            <AppText style={styles.warningText}>
              This amount exceeds your monthly transfer limit of{" "}
              {formatAmount(monthlyLimit ?? 0)}. Please reduce the amount or
              upgrade your limit.
            </AppText>
          </View>
        )}

        {!exceedsDailyLimit &&
          !exceedsMonthlyLimit &&
          hasInsufficientBalance &&
          !!assetId && (
            <View style={styles.warningContainer}>
              <AppText style={styles.warningText}>
                You do not have enough balance to complete this transfer.
              </AppText>
            </View>
          )}

        {!exceedsDailyLimit &&
          !exceedsMonthlyLimit &&
          hasInsufficientBalance &&
          !!amount && (
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
          hitSlop={10}
          style={[
            styles.continueButton,
            isDisabled && styles.continueButtonDisabled,
          ]}
        >
          <AppText
            style={[
              styles.continueButtonText,
              isDisabled && styles.continueButtonTextDisabled,
            ]}
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

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    continueButton: {
      backgroundColor: COLORS.secondary,
      borderRadius: 100,
      paddingVertical: normalizeSpacing(16),
      marginVertical: normalizeSpacing(30),
    },
    continueButtonDisabled: { backgroundColor: colors.surfaceSecondary },
    continueButtonText: {
      color: "#fff",
      fontSize: normalize(18),
      textAlign: "center",
      fontFamily: getFontFamily("700"),
    },
    continueButtonTextDisabled: { opacity: 0.4 },
    screenPadded: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: normalizeSpacing(16),
    },
    limitContainer: {
      marginVertical: normalizeSpacing(10),
      backgroundColor: colors.infoCardBackgroundColor,
      padding: normalizeSpacing(10),
      borderRadius: 10,
    },
    tabSwitcher: {
      backgroundColor: colors.inputBackground,
      marginVertical: normalizeSpacing(10),
    },
    activeTab: {
      backgroundColor: COLORS.primary,
      color: colors.text,
    },
    activeTabText: {
      color: "white",
    },
    usernameStatus: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: normalizeSpacing(4),
      gap: 6,
    },
    usernameChecking: {
      fontSize: normalize(18),
      color: colors.textMuted,
      fontFamily: getFontFamily("700"),
    },
    usernameValid: {
      fontSize: normalize(18),
      color: "#077830", // green
      fontFamily: getFontFamily("700"),
    },
    usernameInvalid: {
      fontSize: normalize(18),
      color: colors.error, // red
      fontFamily: getFontFamily("700"),
    },
    warningContainer: {
      marginVertical: normalizeSpacing(12),
      padding: normalizeSpacing(10),
      backgroundColor: "rgba(255, 0, 0, 0.03)",
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "rgba(255, 0, 0, 0.3)",
    },
    warningText: {
      color: colors.error,
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      textAlign: "center",
    },
    error: {
      color: colors.error,
      fontSize: normalize(19),
      fontFamily: getFontFamily("800"),
      marginBottom: normalizeSpacing(10),
    },
    form: { marginVertical: normalizeSpacing(10) },
    label: {
      fontFamily: getFontFamily("800"),
      fontSize: normalize(18),
      marginBottom: normalizeSpacing(4),
      color: colors.text,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: normalizeSpacing(16),
      marginBottom: normalizeSpacing(10),
      gap: 5,
    },
    dollarSign: {
      fontSize: normalize(23),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      marginRight: normalizeSpacing(5),
    },
    input: {
      flex: 1,
      paddingVertical: normalizeSpacing(14),
      fontSize: normalize(23),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      borderRadius: 10,
    },
    limitHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    limitLabel: {
      fontSize: normalize(18),
      color: colors.text,
      fontFamily: getFontFamily("700"),
    },
    upgradeText: {
      fontSize: normalize(18),
      color: colors.text,
      fontFamily: getFontFamily("700"),
    },
    progressBarBackground: {
      height: 4,
      backgroundColor: "#E5E7EB",
      borderRadius: 3,
      marginTop: normalizeSpacing(18),
    },
    progressBarFill: {
      height: 6,
      backgroundColor: COLORS.secondary,
      borderRadius: 3,
    },
    limitRange: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: normalizeSpacing(4),
    },
    limitValue: {
      fontFamily: getFontFamily("800"),
      fontSize: normalize(18),
      color: colors.text,
    },
  });
