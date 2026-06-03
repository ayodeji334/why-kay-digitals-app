import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { getFontFamily, normalize } from "../constants/settings";
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

const CANCEL_COOLDOWN_MS = 3000;

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
  const { assets, isLoading, refetch } = useAssets();
  const { data, refetch: refetchUserWallets } = useWallets();
  const axios = useAxios();

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
          label: `${wallet?.name} (${wallet?.symbol})`,
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

  console.log(userWallets, "userWallets in swap screen");

  const fromAssetId = watch("from_asset");
  const toAssetId = watch("to_asset");
  const amount = watch("amount");
  const fromAsset = userWallets.find((opt: any) => opt.value === fromAssetId);
  const selectedSymbol = fromAsset?.symbol ?? "";
  const symbol = fromAsset?.symbol ?? "";

  const { data: supportedPairs, isFetching } = useQuery({
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
        label: option.symbol,
        value: option.id,
      }));
  }, [assets, availableConversions]);

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
    // const payload = {
    //   ...values,
    //   amount: Number(values.amount),
    //   url: "/wallets/user/swap-crypto",
    // };

    swapMutation.mutate(values);
    // navigation.navigate("ConfirmTransaction" as never, {
    //   payload,
    // });
  };

  const onRefresh = async () => {
    refetch();
    refetchUserWallets();
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

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["bottom", "right", "left"]}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{
          backgroundColor: "white",
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={isLoading} />
        }
      >
        <View style={styles.container}>
          <View>
            <View style={{ marginBottom: 4 }}>
              <SelectInput
                control={control}
                name="from_asset"
                label="Select asset(coin) you want to convert from"
                options={userWallets}
                placeholder="Select an asset(coin)"
                title="Select from your wallet"
                showWalletPrice={true}
              />
              <Text style={styles.walletBalance}>
                Wallet Balance: {balance} {symbol}
                {" ≈ "}
                {formatAmount(price * balance, {
                  currency: "USD",
                  decimalPlace: 5,
                })}
              </Text>
            </View>

            <View style={{ marginVertical: 4 }}>
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
                title="Select an asset"
              />
            </View>
            <View style={{ marginVertical: 4 }}>
              <Text style={styles.label}>Amount (USD)</Text>
              <Controller
                control={control}
                name="amount"
                render={({ field: { onBlur } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.dollarSign}>$</Text>
                    <TextInput
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
                <Text style={styles.error}>{errors.amount.message}</Text>
              )}
              {fromAsset && amount > 0 && (
                <Text style={styles.approx}>
                  Approximately {fromAmount} will debited from your {symbol}{" "}
                  wallet
                </Text>
              )}
            </View>

            {insufficientBalance && fromAsset && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  Insufficient balance! You need {requiredAssetAmount}{" "}
                  {fromAsset.symbol} but you only have {balance}{" "}
                  {fromAsset.symbol}
                </Text>
              </View>
            )}
          </View>

          <View>
            <TouchableOpacity
              style={[
                styles.button,
                (!canSubmit || swapMutation.isPending || isCooldown) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={!canSubmit || swapMutation.isPending || isCooldown}
            >
              <Text style={styles.buttonText}>
                {swapMutation.isPending
                  ? "Please Wait"
                  : isCooldown
                  ? "Loading... Please wait"
                  : "Continue"}
              </Text>
            </TouchableOpacity>

            <View style={{ paddingVertical: 10 }}>
              <Text
                style={{
                  color: "#3b3b3bff",
                  fontFamily: getFontFamily("400"),
                  textAlign: "center",
                }}
              >
                The market prices are volatile. Estimated amounts may change due
                to market fluctuations between initiating and completing your
                swap.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: normalize(20),
    backgroundColor: "#fff",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  walletBalance: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: normalize(4),
  },
  label: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    marginBottom: normalize(8),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: normalize(16),
    paddingVertical: 1,
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
  },
  // input: {
  //   borderWidth: 1,
  //   borderColor: "#ccc",
  //   borderRadius: normalize(8),
  //   padding: normalize(16),
  //   fontSize: normalize(26),
  //   fontFamily: getFontFamily("700"),
  //   marginBottom: normalize(10),
  // },
  error: {
    color: "red",
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    marginBottom: normalize(10),
  },
  approx: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(9),
    color: COLORS.primary,
  },
  balance: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(4),
  },
  fee: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(4),
  },
  rate: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(4),
  },
  min: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(4),
    color: COLORS.primary,
  },
  note: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("700"),
    color: "#ffffff",
    marginBottom: normalize(10),
  },
  ngn: {
    color: "#fff",
    fontSize: normalize(25),
    fontFamily: getFontFamily("800"),
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: normalize(19),
    fontFamily: getFontFamily("700"),
  },
  paymentContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: 9,
    marginVertical: 20,
    padding: 14,
  },
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
});
