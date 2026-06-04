import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  useNavigation,
  RouteProp,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatAmount } from "../libs/formatNumber";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
import NoWallet from "../components/NoWallet";
import CustomLoading from "../components/CustomLoading";
import { TradeIntent } from "../libs/types";
import { showError } from "../utlis/toast";
import { useResetFormOnMount } from "../hooks/useResetFormOnMount";

type CryptoSellScreenParams = {
  CryptoSell: {
    intent: TradeIntent;
  };
};

/**
 * Returns true when the relative difference between current and used
 * values exceeds tolerancePercent (e.g. 1.23 means 1.23%).
 */
function relativeChangeExceeded(
  current: number,
  used: number,
  tolerancePercent = 1.23,
): boolean {
  if (!isFinite(current) || !isFinite(used) || used <= 0) return false;
  const diff = Math.abs(current - used);
  const relativePercent = (diff / used) * 100;
  return relativePercent > tolerancePercent;
}

type FeeBreakdown = {
  coinAmount: string;
  grossUsd: number;
  netAmountUsd: string;
  netNgn: string;
  currentSellRate: number;
  currentMarketPrice: number;
};

const STABLECOINS = ["USDT"];

const schema = Yup.object().shape({
  asset_id: Yup.string().required("Select the crypto you want to sell"),
  amount: Yup.number()
    .min(1, "The amount should not be less than $1")
    .typeError("Enter a valid amount")
    .required("Amount is required"),
});

function calculateSellFeeBreakdown(
  amount: number,
  marketPrice: number,
  sellRate: number,
) {
  const coinAmount = amount / marketPrice;
  const ngnValue = sellRate > 0 ? amount * sellRate : 0;

  return {
    assetValueEquivalent: coinAmount.toFixed(8),
    ngnAmount: sellRate > 0 ? formatAmount(ngnValue) : "0.00",
    feeBreakdown: {
      coinAmount: coinAmount.toFixed(8),
      grossUsd: amount,
      netAmountUsd: amount.toFixed(2),
      netNgn: sellRate > 0 ? formatAmount(ngnValue) : "0.00",
      currentSellRate: sellRate,
      currentMarketPrice: marketPrice,
    },
  };
}

export default function CryptoSellScreen() {
  const navigation: any = useNavigation();
  const route = useRoute<RouteProp<CryptoSellScreenParams, "CryptoSell">>();
  const { apiGet } = useAxios();
  const { intent } = route.params;
  const [displayAmount, setDisplayAmount] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [latestFeeBreakdown, setLatestFeeBreakdown] = useState<any>(null);
  const [assetValueEquivalent, setAssetValueEquivalent] = useState<any>(0);
  const [latestNgnAmount, setLatestNgnAmount] = useState("0.00");
  const selectedAssetUuid = intent.assetId ?? "";

  const {
    control,
    watch,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: 0,
      asset_id: intent.assetId ?? "",
    },
    mode: "onChange",
  });

  const {
    data: assetDetails,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["asset-detail-sell", selectedAssetUuid],
    queryFn: async () => {
      if (!selectedAssetUuid) return null;
      try {
        const res = await apiGet(`/wallets/${selectedAssetUuid}`);
        return res?.data?.data ?? null;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!selectedAssetUuid,
  });

  const FEE_RATE = useMemo(
    () => 0.001 * Number(assetDetails?.balance ?? "0"),
    [assetDetails?.balance],
  );

  const marketPrice =
    latestFeeBreakdown?.currentMarketPrice ??
    assetDetails?.market_current_value ??
    0;

  const amount = watch("amount");
  const symbol = assetDetails?.symbol ?? "";
  const isStablecoin = useMemo(
    () => STABLECOINS.includes(symbol.toUpperCase()),
    [symbol],
  );

  const balanceUsd = useMemo(() => {
    return Number(assetDetails?.balance ?? "0") * marketPrice;
  }, [assetDetails?.balance, marketPrice]);

  const maxSellableUsd = useMemo(() => {
    if (isStablecoin) return balanceUsd;

    const feeUsd = FEE_RATE * marketPrice;
    return balanceUsd - feeUsd;
  }, [balanceUsd, FEE_RATE, marketPrice, isStablecoin]);

  const TOLERANCE_PERCENT = 1.23;

  const onSubmit = async (values: any) => {
    try {
      const res = await apiGet(`/crypto-assets/${selectedAssetUuid}/rates`);
      const latestRates = res?.data?.asset ?? null;

      if (!latestRates) {
        showError("Unable to fetch latest rates.");
        return;
      }

      const currentSellRate = parseFloat(latestRates.sell_rate ?? "0");
      const currentMarketPrice = parseFloat(
        latestRates.market_current_value ?? "0",
      );

      // Compare against last acknowledged values — not the original mount values
      const usedSellRate = acknowledgedSellRateRef.current;
      const usedMarketPrice = acknowledgedMarketPriceRef.current;

      const sellRateChanged =
        currentSellRate > 0 && currentSellRate !== usedSellRate;
      const marketPriceExceeded = relativeChangeExceeded(
        currentMarketPrice,
        usedMarketPrice,
        TOLERANCE_PERCENT,
      );

      if (sellRateChanged || marketPriceExceeded) {
        const recalculated = calculateSellFeeBreakdown(
          values.amount,
          currentMarketPrice,
          currentSellRate,
        );

        setAssetValueEquivalent(recalculated.assetValueEquivalent);
        setLatestFeeBreakdown({ ...recalculated.feeBreakdown });
        setLatestNgnAmount(recalculated.ngnAmount);

        // ← Update refs so the next submit uses the new values as baseline
        acknowledgedSellRateRef.current = currentSellRate;
        acknowledgedMarketPriceRef.current = currentMarketPrice;

        const reasons: string[] = [];
        if (sellRateChanged) reasons.push("Sell rate");
        if (marketPriceExceeded) reasons.push("Market price");

        showError(
          `${reasons.join(
            " and ",
          )} changed. Prices recalculated — please review before continuing.`,
        );
        return;
      }

      navigation.navigate("ConfirmTransaction" as never, {
        payload: { ...values, url: "/wallets/user/sell-crypto" },
      });
    } catch (error) {
      showError("Error checking rates. Try again.");
    }
  };

  // const onSubmit = async (values: any) => {
  //   try {
  //     const res = await apiGet(`/crypto-assets/${selectedAssetUuid}/rates`);
  //     const latestRates = res?.data?.asset ?? null;

  //     console.log(res);

  //     if (!latestRates) {
  //       showError("Unable to fetch latest rates.");
  //       return;
  //     }

  //     const currentSellRate = parseFloat(latestRates.sell_rate ?? "0");
  //     const currentMarketPrice = parseFloat(
  //       latestRates.market_current_value ?? "0",
  //     );

  //     // Compare against assetDetails (what was shown on mount) not latestFeeBreakdown
  //     const usedSellRate = parseFloat(assetDetails?.sell_rate ?? "0");
  //     const usedMarketPrice = parseFloat(String(marketPrice ?? "0"));

  //     const sellRateChanged =
  //       currentSellRate > 0 && currentSellRate !== usedSellRate;

  //     const marketPriceExceeded = relativeChangeExceeded(
  //       currentMarketPrice,
  //       usedMarketPrice,
  //       TOLERANCE_PERCENT,
  //     );

  //     console.log(marketPriceExceeded);

  //     console.log(sellRateChanged, usedSellRate, currentSellRate);

  //     if (sellRateChanged || marketPriceExceeded) {
  //       const recalculated = calculateSellFeeBreakdown(
  //         values.amount,
  //         currentMarketPrice,
  //         currentSellRate,
  //       );

  //       console.log(recalculated.feeBreakdown?.currentSellRate);

  //       setAssetValueEquivalent(recalculated.assetValueEquivalent);
  //       setLatestFeeBreakdown({
  //         ...recalculated.feeBreakdown,
  //         currentSellRate: recalculated.feeBreakdown?.currentSellRate,
  //       });
  //       setLatestNgnAmount(recalculated.ngnAmount);

  //       const reasons: string[] = [];
  //       if (sellRateChanged) reasons.push("Sell rate");
  //       if (marketPriceExceeded) reasons.push("Market price");

  //       showError(
  //         `${reasons.join(
  //           " and ",
  //         )} changed. Prices recalculated — please review before continuing.`,
  //       );
  //       return;
  //     }

  //     navigation.navigate("ConfirmTransaction" as never, {
  //       payload: { ...values, url: "/wallets/user/sell-crypto" },
  //     });
  //   } catch (error) {
  //     showError("Error checking rates. Try again.");
  //   }
  // };

  // const onSubmit = async (values: any) => {
  //   try {
  //     const res = await apiGet(`/crypto-assets/${selectedAssetUuid}/rates`);
  //     const latestRates = res?.data?.asset ?? null;

  //     if (!latestRates) {
  //       showError("Unable to fetch latest rates.");
  //       return;
  //     }

  //     // parse latest values
  //     const currentSellRate = parseFloat(latestRates.sell_rate ?? "0");
  //     const currentMarketPrice = parseFloat(
  //       latestRates.market_current_value ?? "0",
  //     );

  //     // parse previously used values (fallback to 0)
  //     const usedSellRate = parseFloat(
  //       latestFeeBreakdown?.currentSellRate ?? "0",
  //     );
  //     const usedMarketPrice = parseFloat(marketPrice ?? "0");

  //     // check if sell rate or market price changed beyond tolerance
  //     // const sellRateExceeded = relativeChangeExceeded(
  //     //   currentSellRate,
  //     //   usedSellRate,
  //     //   TOLERANCE_PERCENT,
  //     // );

  //     const sellRateChanged =
  //       currentSellRate > 0 && currentSellRate !== usedSellRate;

  //     const marketPriceExceeded = relativeChangeExceeded(
  //       currentMarketPrice,
  //       usedMarketPrice,
  //       TOLERANCE_PERCENT,
  //     );

  //     // If either exceeded tolerance, recalc, update UI and block navigation
  //     if (sellRateChanged || marketPriceExceeded) {
  //       const recalculated = calculateSellFeeBreakdown(
  //         values.amount,
  //         currentMarketPrice,
  //         currentSellRate ?? parseFloat(assetDetails.sell_rate),
  //       );

  //       console.log(recalculated.feeBreakdown);

  //       setAssetValueEquivalent(recalculated.assetValueEquivalent);
  //       setLatestFeeBreakdown(recalculated.feeBreakdown);
  //       setLatestNgnAmount(recalculated.ngnAmount);

  //       const reasons: string[] = [];
  //       if (sellRateChanged) reasons.push("Sell rate");
  //       if (marketPriceExceeded) reasons.push("Market price");

  //       showError(
  //         `${reasons.join(
  //           " and ",
  //         )} changed. Prices have been recalculated — please review before continuing.`,
  //       );

  //       return;
  //     }

  //     // If changes are within tolerance, optionally update fee state silently
  //     // (uncomment if you want the UI to reflect tiny changes without blocking)
  //     // const recalculated = calculateSellFeeBreakdown(values.amount, currentMarketPrice, currentSellRate);
  //     // setLatestFeeBreakdown(recalculated.feeBreakdown);
  //     // setLatestNgnAmount(recalculated.ngnAmount);

  //     const payload = {
  //       ...values,
  //       url: "/wallets/user/sell-crypto",
  //     };

  //     navigation.navigate("ConfirmTransaction" as never, { payload });
  //   } catch (error) {
  //     console.error("onSubmit rate check error:", error);
  //     showError("Error checking rates. Try again.");
  //   }
  // };

  // const onSubmit = async (values: any) => {
  //   try {
  //     const res = await apiGet(`/crypto-assets/${selectedAssetUuid}/rates`);
  //     const latestRates = res?.data?.asset ?? null;

  //     console.log(res);

  //     if (!latestRates) {
  //       showError("Unable to fetch latest rates.");
  //       return;
  //     }

  //     const currentSellRate = parseFloat(latestRates.sell_rate ?? "0");
  //     const usedSellRate = parseFloat(
  //       latestFeeBreakdown?.currentSellRate ?? "0",
  //     );

  //     const sellRateChanged =
  //       currentSellRate > 0 && currentSellRate !== usedSellRate;

  //     if (sellRateChanged) {
  //       const recalculated = calculateSellFeeBreakdown(
  //         values.amount,
  //         marketPrice,
  //         currentSellRate,
  //       );

  //       setLatestFeeBreakdown(recalculated.feeBreakdown);
  //       setLatestNgnAmount(recalculated.ngnAmount);

  //       showError(
  //         "Sell rate has changed. Prices recalculated — please review before continuing.",
  //       );

  //       return;
  //     }

  //     const payload = {
  //       ...values,
  //       url: "/wallets/user/sell-crypto",
  //     };

  //     navigation.navigate("ConfirmTransaction" as never, { payload });
  //   } catch (error) {
  //     showError("Error checking rates. Try again.");
  //   }
  // };

  const hasInsufficientBalance = useMemo(() => {
    if (!amount || !assetDetails) return false;
    return amount > maxSellableUsd;
  }, [amount, maxSellableUsd]);

  const insufficientBalanceMessage = useMemo(() => {
    if (!amount || !assetDetails) return null;

    const platformFeeUsd = amount * FEE_RATE;
    const totalUsd = amount + platformFeeUsd;

    console.log("Calculating insufficient balance message:");
    console.log("Amount:", amount);
    console.log("Platform Fee (USD):", platformFeeUsd);
    console.log("Total Cost (USD):", totalUsd);
    console.log("Balance in USD:", balanceUsd);
    console.log("Max Sellable USD:", maxSellableUsd);

    // if (amount > balanceUsd) {
    //   return `Insufficient balance. Your total balance is worth ${formatAmount(
    //     balanceUsd,
    //     {
    //       currency: "USD",
    //     },
    //   )}`;
    // }

    if (amount > balanceUsd) {
      return `Insufficient balance. Your total balance is worth ${formatAmount(
        balanceUsd,
        {
          currency: "USD",
        },
      )}`;
    }

    return `You can only sell ${formatAmount(maxSellableUsd, {
      currency: "USD",
      decimalPlace: 4,
    })} of your balance`;
  }, [maxSellableUsd, symbol, amount, assetDetails?.balance, balanceUsd]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  useEffect(() => {
    if (intent?.amount) {
      const numericAmount = Number(intent.amount);
      if (!isNaN(numericAmount)) {
        setDisplayAmount(formatWithCommas(numericAmount.toString()));
      }

      setValue("amount", numericAmount);
    }
  }, [intent?.amount]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useResetFormOnMount(
    reset,
    { amount: 0, asset_id: intent.assetId ?? "" },
    () => {
      setDisplayAmount("");
      setLatestFeeBreakdown(null);
      setAssetValueEquivalent(0);
      setLatestNgnAmount("0.00");
    },
  );

  useEffect(() => {
    if (!assetDetails?.sell_rate || marketPrice <= 0) return;

    const sellRate = parseFloat(assetDetails.sell_rate);

    if (!sellRate || sellRate <= 0) return;

    const recalculated = calculateSellFeeBreakdown(
      amount,
      marketPrice,
      sellRate,
    );

    console.log("recalculated: ", recalculated?.feeBreakdown);

    setAssetValueEquivalent(recalculated.assetValueEquivalent);
    setLatestFeeBreakdown({ ...recalculated.feeBreakdown });
    setLatestNgnAmount(recalculated.ngnAmount);
  }, [assetDetails?.sell_rate, amount, marketPrice]);

  const acknowledgedSellRateRef = useRef<number>(0);
  const acknowledgedMarketPriceRef = useRef<number>(0);

  // Set on mount when assetDetails loads
  useEffect(() => {
    if (assetDetails?.sell_rate) {
      acknowledgedSellRateRef.current = parseFloat(assetDetails.sell_rate);
    }
  }, [assetDetails?.sell_rate]);

  useEffect(() => {
    if (marketPrice > 0) {
      acknowledgedMarketPriceRef.current = marketPrice;
    }
  }, [marketPrice]);

  // useEffect(() => {
  //   if (
  //     assetDetails?.sell_rate &&
  //     // amount > 0 &&
  //     marketPrice > 0 &&
  //     assetDetails
  //   ) {
  //     const recalculated = calculateSellFeeBreakdown(
  //       amount,
  //       marketPrice,
  //       latestFeeBreakdown?.currentSellRate ??
  //         parseFloat(assetDetails.sell_rate),
  //     );

  //     console.log(
  //       "Recalculated fee breakdown due to dependency change:",
  //       recalculated,
  //     );

  //     setAssetValueEquivalent(recalculated.assetValueEquivalent);
  //     setLatestFeeBreakdown(recalculated.feeBreakdown);
  //     setLatestNgnAmount(recalculated.ngnAmount);
  //   }
  // }, [
  //   assetDetails?.sell_rate,
  //   amount,
  //   latestFeeBreakdown?.currentSellRate,
  //   marketPrice,
  //   assetDetails,
  // ]);

  console.log(latestFeeBreakdown);

  if (isLoading) {
    return <CustomLoading loading={true} />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "right", "left"]}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {!assetDetails?.wallet_id ? (
          <NoWallet
            selectedAssetUuid={selectedAssetUuid}
            onSuccess={() => {
              refetch();
            }}
          />
        ) : (
          <View style={styles.container}>
            <View>
              <View style={{ marginBottom: 15 }}>
                <View style={styles.cryptoRow}>
                  {assetDetails?.asset_logo_url && (
                    <Image
                      source={{ uri: assetDetails?.asset_logo_url ?? "" }}
                      style={styles.optionLogo}
                    />
                  )}
                  <View style={styles.cryptoInfo}>
                    <Text style={styles.optionName}>
                      {assetDetails?.asset_name}{" "}
                      {assetDetails?.symbol && ` (${assetDetails?.symbol})`}
                    </Text>
                  </View>
                </View>
              </View>

              <View>
                <Text style={styles.label}>
                  Enter the amount (in $ dollars) you want to buy
                </Text>

                <Controller
                  control={control}
                  name="amount"
                  render={({ field: { onChange, onBlur } }) => (
                    <View style={styles.inputContainer}>
                      <Text style={styles.dollarSign}>$</Text>
                      <TextInput
                        style={styles.input}
                        value={displayAmount}
                        placeholder="0.00"
                        placeholderTextColor="#999"
                        keyboardType="decimal-pad"
                        onBlur={onBlur}
                        onChangeText={text => {
                          const formatted = formatWithCommas(text);
                          const numeric = parseToNumber(formatted);
                          onChange(numeric);
                          setDisplayAmount(formatted);
                        }}
                      />
                    </View>
                  )}
                />
                {errors.amount && (
                  <Text style={styles.error}>{errors.amount.message}</Text>
                )}

                {/* Insufficient balance message with max sellable amount */}
                {hasInsufficientBalance && insufficientBalanceMessage && (
                  <Text style={styles.error}>{insufficientBalanceMessage}</Text>
                )}

                {!hasInsufficientBalance && (
                  <Text style={styles.approx}>
                    Approximately {assetValueEquivalent} {symbol}
                  </Text>
                )}

                <View
                  style={{
                    marginVertical: 10,
                    backgroundColor: "#EFF7EC",
                    padding: 10,
                    borderRadius: 10,
                    gap: 8,
                  }}
                >
                  <Text style={[styles.note, { color: "black" }]}>
                    Wallet Balance, Exchange Rate & Fee Breakdown
                  </Text>

                  {/* Wallet balance */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={[
                        styles.balance,
                        { fontFamily: getFontFamily("800") },
                      ]}
                    >
                      Wallet Balance:
                    </Text>
                    <Text style={styles.balance}>
                      {assetDetails?.balance || 0} {assetDetails?.symbol}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={[
                        styles.balance,
                        { fontFamily: getFontFamily("800") },
                      ]}
                    >
                      Balance in USD:
                    </Text>
                    <Text style={styles.balance}>
                      {formatAmount(
                        Number(assetDetails?.balance) * marketPrice || 0,
                        { currency: "USD", decimalPlace: 8 },
                      )}
                    </Text>
                  </View>

                  <View style={{ height: 1, backgroundColor: "#d4edda" }} />

                  {/* Rate */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={[
                        styles.balance,
                        { fontFamily: getFontFamily("800") },
                      ]}
                    >
                      Sell Rate:
                    </Text>
                    <Text style={styles.balance}>
                      {formatAmount(latestFeeBreakdown?.currentSellRate ?? 0)}/$
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={[
                        styles.balance,
                        { fontFamily: getFontFamily("800") },
                      ]}
                    >
                      Market Price:
                    </Text>
                    <Text style={styles.balance}>
                      {formatAmount(marketPrice || 0, {
                        currency: "USD",
                      })}
                      /{assetDetails?.symbol}
                    </Text>
                  </View>

                  {/* Fee breakdown — only show when amount is entered */}
                  {latestFeeBreakdown && amount > 0 && (
                    <>
                      <View style={{ height: 1, backgroundColor: "#d4edda" }} />

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={[
                            styles.balance,
                            { fontFamily: getFontFamily("800") },
                          ]}
                        >
                          You Sell:
                        </Text>
                        <Text style={styles.balance}>
                          {latestFeeBreakdown?.coinAmount}{" "}
                          {assetDetails?.symbol} (≈{" "}
                          {formatAmount(latestFeeBreakdown?.grossUsd, {
                            currency: "USD",
                          })}
                          )
                        </Text>
                      </View>

                      <View style={{ height: 1, backgroundColor: "#d4edda" }} />

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={[
                            styles.balance,
                            { fontFamily: getFontFamily("800") },
                          ]}
                        >
                          You'll Receive (₦):
                        </Text>
                        <Text
                          style={[
                            styles.balance,
                            {
                              fontFamily: getFontFamily("800"),
                            },
                          ]}
                        >
                          {latestFeeBreakdown?.netNgn}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.paymentContainer}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.ngn}>You’ll be paid:</Text>
                    <Text style={styles.ngn}>{latestNgnAmount}</Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                hasInsufficientBalance && styles.buttonDisabled,
              ]}
              disabled={hasInsufficientBalance}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: normalize(20),
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
    opacity: 0.6,
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
  label: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    marginBottom: normalize(8),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: normalize(12),
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
    paddingVertical: normalize(15),
    fontSize: normalize(26),
    fontFamily: getFontFamily("800"),
    color: "#000",
  },
  error: {
    color: "red",
    fontSize: normalize(19),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(10),
  },
  approx: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(9),
    color: COLORS.primary,
  },
  balance: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(4),
  },
  rate: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(4),
  },
  min: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(4),
    color: "black",
  },
  note: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("700"),
    color: "#ffffff",
    marginBottom: normalize(10),
  },
  cryptoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#9f9f9fff",
    borderRadius: 8,
    padding: 10,
  },
  cryptoInfo: { flex: 1 },
  optionName: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("800"),
    color: "#374151",
  },
  optionLogo: {
    width: 30,
    height: 30,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "#cdcdcdff",
  },
  ngn: {
    color: "#fff",
    fontSize: normalize(23),
    fontFamily: getFontFamily("800"),
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: normalize(208),
    alignItems: "center",
    marginBottom: 30,
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
});
