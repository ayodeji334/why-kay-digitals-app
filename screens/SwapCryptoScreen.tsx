import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigation } from "@react-navigation/native";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomLoading from "../components/CustomLoading";
import { SelectInput } from "../components/SelectInputField";
import { useWallets } from "../hooks/useWallet";
import { useAssets } from "../hooks/useAssets";
import useAxios from "../hooks/useAxios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { showError } from "../utlis/toast";
import { formatAmount } from "../libs/formatNumber";
import { useQuoteStore } from "../stores/quoteStore";
import RequestErrorState from "../components/RequestErrorState";
import { showValue } from "../libs/requestError";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";

export const formatWithCommas = (value: string) => {
  if (!value) return "";

  // Remove all non-digit characters except decimal point
  let cleaned = value.replace(/[^\d.]/g, "");

  // Ensure only one decimal point
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    // If multiple decimal points, keep only the first one
    cleaned = parts[0] + "." + parts.slice(1).join("");
  }

  // Split into whole and decimal parts
  const [whole, decimal] = cleaned.split(".");

  // Handle whole number part
  let formattedWhole = "";
  if (whole) {
    // Remove leading zeros (but keep at least one digit)
    const trimmedWhole = whole.replace(/^0+/, "");
    if (trimmedWhole === "" && (decimal !== undefined || value.includes("."))) {
      formattedWhole = "0";
    } else if (trimmedWhole === "") {
      formattedWhole = "";
    } else {
      // Add thousand separators
      formattedWhole = parseInt(trimmedWhole, 10).toLocaleString("en-US");
    }
  }

  // Handle decimal part
  if (decimal !== undefined) {
    return `${formattedWhole || "0"}.${decimal.slice(0, 8)}`;
  }

  // If user typed a decimal point but no decimal digits yet
  if (value.includes(".") && decimal === undefined) {
    return `${formattedWhole || "0"}.`;
  }

  return formattedWhole;
};

export const parseToNumber = (value: string): number => {
  const numeric = value.replace(/,/g, "");
  return Number(numeric) || 0;
};

const schema = Yup.object().shape({
  from_asset: Yup.string().required(
    "Select the crypto you want to convert from",
  ),
  to_asset: Yup.string()
    .required("Select the crypto you want to convert to")
    .test(
      "different-asset",
      "You cannot convert to the same asset",
      function (value) {
        const { from_asset } = this.parent;
        return value !== from_asset;
      },
    ),
  amount: Yup.number()
    .typeError("Enter a valid amount")
    .min(0.01, "Amount must be at least 0.01")
    .required("Amount is required"),
});

export default function CryptoSwapScreen() {
  const [displayAmount, setDisplayAmount] = useState("");
  const navigation: any = useNavigation();
  const {
    assets,
    isLoading,
    isError: isAssetsError,
    error: assetsError,
    refetch,
  } = useAssets();
  const {
    data,
    isError: isWalletsError,
    error: walletsError,
    refetch: refetchUserWallets,
  } = useWallets();
  const axios = useAxios();
  const colors = useColors();
  const styles = makeStyles(colors);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { amount: 0 },
    mode: "onChange",
  });

  const userWallets = useMemo(() => {
    if (!Array.isArray(data?.wallets)) return [];

    return data.wallets
      .map((wallet: any) => {
        const matchingAsset = (assets ?? []).find(
          (a: any) => a.uuid === wallet.asset_id,
        );

        return {
          ...wallet,
          label: `${showValue(wallet?.name)} (${showValue(wallet?.symbol)})`,
          value: wallet?.asset_id ?? wallet?.uuid ?? "",
          symbol: wallet?.symbol ?? "",
          logo_url: wallet?.logo ?? "",
          total_price: wallet?.value,
          is_buy_enabled: matchingAsset?.is_buy_enabled ?? false,
          is_sell_enabled: matchingAsset?.is_sell_enabled ?? false,
          is_swap_enabled: matchingAsset?.is_swap_enabled ?? false,
        };
      })
      .sort((a: any, b: any) => {
        const aPrice = Number(a.total_price);
        const bPrice = Number(b.total_price);

        if (aPrice !== bPrice) return bPrice - aPrice;

        const aValue = Number(a.value);
        const bValue = Number(b.value);

        return bValue - aValue;
      });
  }, [data?.wallets, assets]);

  const fromAssetId = watch("from_asset");
  const toAssetId = watch("to_asset");
  const amount = watch("amount");
  const fromAsset = userWallets.find((opt: any) => opt.value === fromAssetId);
  const selectedSymbol = fromAsset?.symbol ?? "";
  const symbol = fromAsset?.symbol ?? "";

  const {
    data: supportedPairs,
    isFetching,
    isError: isPairsError,
    error: pairsError,
    refetch: refetchPairs,
  } = useQuery({
    queryKey: ["supported-pairs", symbol],
    queryFn: async () => {
      const response = await axios.apiGet("crypto/conversion/supported-pairs", {
        params: {
          accountType: "eb_convert_funding",
          fromAsset: symbol,
        },
      });
      return response.data?.data ?? [];
    },
    enabled: !!symbol,
    staleTime: 86400000,
  });

  const availableConversions = useMemo(() => {
    if (!supportedPairs || !selectedSymbol) return [];
    return supportedPairs;
  }, [supportedPairs, selectedSymbol]);

  const options = useMemo(() => {
    if (!assets || availableConversions.length === 0) return [];

    const allowedSymbols = availableConversions.map(
      (pair: any) => pair.to_coin,
    );

    return assets
      .filter((asset: any) => allowedSymbols.includes(asset.symbol))
      .map((option: any) => ({
        ...option,
        label: option.name,
        value: option.id,
      }));
  }, [assets, availableConversions]);

  console.log(options);

  const toAsset = options.find((opt: any) => opt.value === toAssetId);
  const balance = Number(fromAsset?.balance ?? 0);
  const price = Number(fromAsset?.price ?? 0);

  const { post } = useAxios();

  const { fromAmount } = useMemo(() => {
    if (!amount || !fromAsset?.price || !toAsset?.market_current_value) {
      return {
        fromAmount: 0,
        toCoinAmount: 0,
      };
    }

    const fromAssetMarketPrice = Number(fromAsset?.price || 0);
    const toAssetMarketPrice = Number(toAsset?.market_current_value || 0);

    if (!fromAssetMarketPrice || !toAssetMarketPrice) {
      return {
        fromAmount: 0,
        toCoinAmount: 0,
      };
    }

    return {
      fromAmount: (amount / fromAssetMarketPrice).toFixed(8),
      toCoinAmount: (amount / toAssetMarketPrice).toFixed(8),
    };
  }, [amount, fromAsset?.price, toAsset?.market_current_value]);

  const insufficientBalance = useMemo(() => {
    if (!fromAsset || !amount || amount <= 0) return false;

    const usdAmount = Number(amount);
    const userBalanceUSD = balance * price;

    return usdAmount > userBalanceUSD;
  }, [amount, balance, price, fromAsset]);

  const requiredAssetAmount = useMemo(() => {
    if (!fromAsset || !amount || amount <= 0) return "0";

    const fromMarketPrice = Number(fromAsset.price ?? 1);
    const usdAmount = Number(amount);

    return (usdAmount / fromMarketPrice).toFixed(8);
  }, [amount, fromAsset]);

  const swapMutation = useMutation({
    mutationFn: async (values: any) => {
      return await post("crypto/request-quote", {
        ...values,
        amount: Number(values.amount),
      });
    },
    onSuccess: response => {
      navigation.navigate("ConversionQuote" as never, {
        quote: response?.data?.data ?? {},
      });
    },
    onError: (error: any) => {
      showError(error.response?.data?.message ?? "Something went wrong");
    },
  });

  const onSubmit = async (values: any) => {
    swapMutation.mutate(values);
  };

  const onRefresh = async () => {
    await Promise.all([refetch(), refetchUserWallets()]);
  };

  useEffect(() => {
    setValue("to_asset", "", { shouldValidate: false });
  }, [fromAssetId, setValue]);

  // Trigger cooldown whenever screen re-focuses after a cancel
  const { lastCancelledAt, setLastCancelledAt } = useQuoteStore();
  const CANCEL_COOLDOWN_MS = 3000;
  const [isCooldown, setIsCooldown] = useState(false);

  useEffect(() => {
    if (!lastCancelledAt) return;

    setIsCooldown(true);
    const timeout = setTimeout(() => {
      setIsCooldown(false);
      setLastCancelledAt(null); // reset after cooldown
    }, CANCEL_COOLDOWN_MS);

    return () => clearTimeout(timeout);
  }, [lastCancelledAt]);

  const canSubmit =
    isValid && !insufficientBalance && amount > 0 && !isCooldown;

  // Without the coin list or the user's wallets there's nothing to swap from
  // or to — explain and offer a retry instead of empty selectors.
  const hasNoAssets = !Array.isArray(assets) || assets.length === 0;
  if ((isAssetsError && hasNoAssets) || (isWalletsError && !data)) {
    return (
      <RequestErrorState
        error={isAssetsError ? assetsError : walletsError}
        title="We couldn't load your wallets"
        onRetry={onRefresh}
      />
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["right", "left"]}
    >
      <ScrollView
        contentContainerStyle={{
          backgroundColor: colors.background,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={isLoading} />
        }
      >
        <View style={styles.container}>
          <View>
            <View style={{ marginBottom: normalizeSpacing(4) }}>
              <SelectInput
                control={control}
                name="from_asset"
                label="Select asset(coin) you want to convert from"
                options={userWallets}
                loading={isLoading}
                placeholder="Select an asset(coin)"
                title="Select from your wallet"
                showWalletPrice={true}
              />
              <AppText style={styles.walletBalance}>
                Wallet Balance: {balance} {symbol}
                {" ≈ "}
                {formatAmount(price * balance, {
                  currency: "USD",
                  decimalPlace: 2,
                })}
              </AppText>
            </View>

            <View style={{ marginVertical: normalizeSpacing(4) }}>
              <SelectInput
                control={control}
                name="to_asset"
                label="Select asset(coin) you want to convert to"
                options={options}
                placeholder={
                  isFetching
                    ? "Loading available pairs..."
                    : !fromAsset
                    ? "Select a source asset first"
                    : "Select an asset to convert to"
                }
                loading={isFetching}
                title="Select an asset"
              />
              {isPairsError && !supportedPairs && !!fromAsset && (
                <RequestErrorState
                  compact
                  error={pairsError}
                  title={`We couldn't load what ${symbol} can be swapped to`}
                  onRetry={() => refetchPairs()}
                />
              )}
            </View>
            <View style={{ marginVertical: normalizeSpacing(4) }}>
              <AppText style={styles.label}>Amount (USD)</AppText>
              <Controller
                control={control}
                name="amount"
                render={({ field: { onBlur } }) => (
                  <View style={styles.inputContainer}>
                    <AppText style={styles.dollarSign}>$</AppText>
                    <TextInput
                      maxFontSizeMultiplier={1}
                      allowFontScaling={false}
                      style={styles.input}
                      placeholder="0.00"
                      placeholderTextColor="#999"
                      keyboardType="decimal-pad"
                      onBlur={onBlur}
                      value={displayAmount}
                      onChangeText={text => {
                        const formatted = formatWithCommas(text);
                        const numeric = parseToNumber(formatted);

                        setDisplayAmount(formatted);
                        setValue("amount", numeric, {
                          shouldValidate: true,
                        });
                      }}
                    />
                  </View>
                )}
              />

              {errors.amount && (
                <AppText style={styles.error}>{errors.amount.message}</AppText>
              )}

              {fromAsset && amount > 0 && (
                <AppText style={styles.approx}>
                  Approximately {fromAmount} will debited from your {symbol}{" "}
                  wallet
                </AppText>
              )}
            </View>

            {insufficientBalance && fromAsset && (
              <View style={styles.warningContainer}>
                <AppText style={styles.warningText}>
                  Insufficient balance! You need {requiredAssetAmount}{" "}
                  {fromAsset.symbol} but you only have {balance}{" "}
                  {fromAsset.symbol}
                </AppText>
              </View>
            )}
          </View>

          <View>
            <TouchableOpacity
              activeOpacity={0.89}
              style={[
                styles.button,
                (!canSubmit || swapMutation.isPending || isCooldown) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={!canSubmit || swapMutation.isPending || isCooldown}
            >
              <AppText style={styles.buttonText}>
                {swapMutation.isPending
                  ? "Please Wait"
                  : isCooldown
                  ? "Loading... Please wait"
                  : "Continue"}
              </AppText>
            </TouchableOpacity>

            <View style={{ paddingVertical: normalizeSpacing(20) }}>
              <AppText
                style={{
                  color: colors.textMuted,
                  fontFamily: getFontFamily("400"),
                  textAlign: "center",
                  fontSize: normalize(18),
                }}
              >
                The market prices are volatile. Estimated amounts may change due
                to market fluctuations between initiating and completing your
                swap.
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>
      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: normalizeSpacing(20),
      backgroundColor: colors.background,
      justifyContent: "space-between",
      paddingBottom: normalizeSpacing(10),
    },
    walletBalance: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalizeSpacing(4),
    },
    label: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      marginBottom: normalizeSpacing(8),
      color: colors.text,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: normalizeSpacing(16),
      paddingVertical: normalizeSpacing(1),
      marginBottom: normalizeSpacing(10),
      gap: 5,
    },
    dollarSign: {
      fontSize: normalize(23),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginRight: normalizeSpacing(5),
    },
    input: {
      flex: 1,
      paddingVertical: normalizeSpacing(12),
      fontSize: normalize(22),
      fontFamily: getFontFamily("700"),
      color: colors.text,
    },
    error: {
      color: colors.error,
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      marginBottom: normalizeSpacing(10),
    },
    approx: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      marginBottom: normalizeSpacing(9),
      color: colors.text,
    },
    balance: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("800"),
      marginBottom: normalizeSpacing(4),
    },
    fee: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      marginBottom: normalizeSpacing(4),
    },
    rate: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      marginBottom: normalizeSpacing(4),
    },
    min: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("800"),
      marginBottom: normalizeSpacing(4),
      color: COLORS.primary,
    },
    note: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      color: "#ffffff",
      marginBottom: normalizeSpacing(10),
    },
    ngn: {
      color: "#fff",
      fontSize: normalize(25),
      fontFamily: getFontFamily("800"),
    },
    button: {
      backgroundColor: COLORS.primary,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 100,
      alignItems: "center",
      marginTop: normalizeSpacing(20),
    },
    buttonDisabled: {
      backgroundColor: "#cccccc",
      opacity: 0.6,
    },
    buttonText: {
      color: "#fff",
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
    },
    paymentContainer: {
      backgroundColor: COLORS.primary,
      borderRadius: 9,
      marginVertical: normalizeSpacing(20),
      padding: normalizeSpacing(14),
    },
    warningContainer: {
      marginTop: normalizeSpacing(12),
      padding: normalizeSpacing(10),
      backgroundColor: "rgba(255, 0, 0, 0.03)",
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "rgba(255, 0, 0, 0.3)",
    },
    warningText: {
      color: colors.error,
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      textAlign: "center",
    },
  });
