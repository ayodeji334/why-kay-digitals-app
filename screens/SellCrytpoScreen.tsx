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
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import { buildCryptoAmountSchema } from "./BuyCryptoScreen";
import { useCryptoLimits } from "../hooks/useCryptoLimits";

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

// type FeeBreakdown = {
//   coinAmount: string;
//   grossUsd: number;
//   netAmountUsd: string;
//   netNgn: string;
//   currentSellRate: number;
//   currentMarketPrice: number;
// };

const STABLECOINS = ["USDT"];

const schema = Yup.object().shape({
  asset_id: Yup.string().required("Select the crypto you want to sell"),
  amount: Yup.number()
    .min(20, "The amount should not be less than $20")
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

export const resolveRateFromCategories = (
  amountUsd: number,
  rate: { default_value: string; categories: any[] },
): number => {
  const match = rate.categories?.find(
    cat =>
      amountUsd >= parseFloat(cat.min_amount) &&
      amountUsd <= parseFloat(cat.max_amount),
  );
  return parseFloat(match?.value ?? rate.default_value);
};

// Separate helper to get the matched category label for display
export const resolveCategoryLabel = (
  amountUsd: number,
  categories: any[],
): string => {
  const match = categories?.find(
    cat =>
      amountUsd >= parseFloat(cat.min_amount) &&
      amountUsd <= parseFloat(cat.max_amount),
  );
  return match?.label ?? "default rate";
};

export default function CryptoSellScreen() {
  const navigation: any = useNavigation();
  const route = useRoute<RouteProp<CryptoSellScreenParams, "CryptoSell">>();
  const { apiGet } = useAxios();
  const { intent } = route.params;
  const { minSellAmount } = useCryptoLimits();

  const selectedAssetUuid = intent.assetId ?? "";

  const schema = useMemo(
    () => buildCryptoAmountSchema(minSellAmount),
    [minSellAmount],
  );

  const [displayAmount, setDisplayAmount] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null);
  const [assetValueEquivalent, setAssetValueEquivalent] = useState<any>(0);
  const [ngnAmount, setNgnAmount] = useState("0.00");

  const acknowledgedSellRateRef = useRef<number>(0);
  const acknowledgedMarketPriceRef = useRef<number>(0);
  const rateOverriddenRef = useRef(false);

  const colors = useColors();
  const styles = makeStyles(colors);

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

  const amount = watch("amount");

  const {
    data: assetDetails,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["asset-detail-sell", selectedAssetUuid],
    queryFn: async () => {
      if (!selectedAssetUuid) return null;
      const res = await apiGet(`/wallets/${selectedAssetUuid}`);
      return res?.data?.data ?? null;
    },
    enabled: !!selectedAssetUuid,
  });

  const symbol = assetDetails?.symbol ?? "";

  const isStablecoin = useMemo(
    () => STABLECOINS.includes(symbol.toUpperCase()),
    [symbol],
  );

  const marketPrice = useMemo(
    () =>
      feeBreakdown?.currentMarketPrice ??
      assetDetails?.market_current_value ??
      0,
    [feeBreakdown?.currentMarketPrice, assetDetails?.market_current_value],
  );

  const FEE_RATE = useMemo(
    () => 0.001 * Number(assetDetails?.balance ?? "0"),
    [assetDetails?.balance],
  );

  const balanceUsd = useMemo(
    () => Number(assetDetails?.balance ?? "0") * Number(marketPrice),
    [assetDetails?.balance, marketPrice],
  );

  const maxSellableUsd = useMemo(() => {
    if (isStablecoin) return balanceUsd;
    const feeUsd = FEE_RATE * Number(marketPrice);
    return balanceUsd - feeUsd;
  }, [balanceUsd, FEE_RATE, marketPrice, isStablecoin]);

  const hasInsufficientBalance = useMemo(() => {
    if (!amount || !assetDetails) return false;
    return amount > maxSellableUsd;
  }, [amount, maxSellableUsd, assetDetails]);

  const insufficientBalanceMessage = useMemo(() => {
    if (!amount || !assetDetails) return null;
    if (amount > balanceUsd) {
      return `Insufficient balance. Your total balance is worth ${formatAmount(
        balanceUsd,
        { currency: "USD" },
      )}`;
    }
    return `You can only sell ${formatAmount(maxSellableUsd, {
      currency: "USD",
      decimalPlace: 4,
    })} of your balance`;
  }, [maxSellableUsd, amount, assetDetails, balanceUsd]);

  const TOLERANCE_PERCENT = 1.23;

  const recalculate = useCallback(
    (amt: number, price: number, rate: number) => {
      const result = calculateSellFeeBreakdown(amt, price, rate);
      setAssetValueEquivalent(result.assetValueEquivalent);
      setFeeBreakdown({ ...result.feeBreakdown });
      setNgnAmount(result.ngnAmount);
    },
    [],
  );

  // Effect: recalculate on amount / market price / sell rate change
  // useEffect(() => {
  //   if (!assetDetails?.sell_rate || Number(marketPrice) <= 0) return;
  //   if (rateOverriddenRef.current) return; // onSubmit owns the rate — don't overwrite

  //   const sellRate = parseFloat(assetDetails.sell_rate);
  //   if (!sellRate || sellRate <= 0) return;

  //   recalculate(amount, Number(marketPrice), sellRate);
  // }, [assetDetails?.sell_rate, amount, marketPrice, recalculate]);
  useEffect(() => {
    if (!assetDetails?.rates?.sell || Number(marketPrice) <= 0) return;
    if (rateOverriddenRef.current) return;

    const effectiveRate = resolveRateFromCategories(
      amount,
      assetDetails.rates.sell,
    );

    if (!effectiveRate || effectiveRate <= 0) return;

    recalculate(amount, Number(marketPrice), effectiveRate);
  }, [assetDetails?.rates?.sell, amount, marketPrice, recalculate]);

  // Effect: seed acknowledged refs on mount
  // useEffect(() => {
  //   if (assetDetails?.sell_rate) {
  //     acknowledgedSellRateRef.current = parseFloat(assetDetails.sell_rate);
  //   }
  // }, [assetDetails?.sell_rate]);
  useEffect(() => {
    if (assetDetails?.rates?.sell && amount >= 0) {
      acknowledgedSellRateRef.current = resolveRateFromCategories(
        amount,
        assetDetails.rates.sell,
      );
    } else if (assetDetails?.sell_rate) {
      acknowledgedSellRateRef.current = parseFloat(assetDetails.sell_rate);
    }
  }, [assetDetails?.rates?.sell, assetDetails?.sell_rate, amount]);

  useEffect(() => {
    if (Number(marketPrice) > 0) {
      acknowledgedMarketPriceRef.current = Number(marketPrice);
    }
  }, [marketPrice]);

  // Effect: pre-fill amount from intent
  // useEffect(() => {
  //   if (!intent?.amount) return;
  //   const numericAmount = Number(intent.amount);
  //   if (isNaN(numericAmount)) return;
  //   setDisplayAmount(formatWithCommas(numericAmount.toString()));
  //   setValue("amount", numericAmount);
  // }, [intent?.amount]);

  // // Focus refetch
  // useFocusEffect(
  //   useCallback(() => {
  //     refetch();
  //   }, [refetch]),
  // );

  // // Reset on mount
  // useResetFormOnMount(
  //   reset,
  //   { amount: 0, asset_id: intent.assetId ?? "" },
  //   () => {
  //     setDisplayAmount("");
  //     setFeeBreakdown(null);
  //     setAssetValueEquivalent(0);
  //     setNgnAmount("0.00");
  //     rateOverriddenRef.current = false;
  //   },
  // );

  useFocusEffect(
    useCallback(() => {
      // Reset first
      setDisplayAmount("");
      setFeeBreakdown(null);
      setAssetValueEquivalent(0);
      setNgnAmount("0.00");
      rateOverriddenRef.current = false;
      reset({ amount: 0, asset_id: intent.assetId ?? "" });

      // Then pre-fill from intent if available
      if (intent?.amount) {
        const numericAmount = Number(intent.amount);
        if (!isNaN(numericAmount) && numericAmount > 0) {
          setDisplayAmount(formatWithCommas(numericAmount.toString()));
          setValue("amount", numericAmount);
        }
      }

      // Refetch asset data
      refetch();
    }, [intent?.amount, intent?.assetId, refetch, reset, setValue]),
  );

  // Submit
  const onSubmit = async (values: any) => {
    try {
      const res = await apiGet(`/crypto-assets/${selectedAssetUuid}/rates`);
      const latestRates = res?.data?.asset ?? null;
      console.log(latestRates);

      if (!latestRates) {
        showError("Unable to fetch latest rates.");
        return;
      }

      const currentMarketPrice = parseFloat(
        latestRates.market_current_value ?? "0",
      );

      // Resolve the effective sell rate from categories based on the entered amount
      const sellRateData = latestRates.rates?.sell ?? null;
      const currentSellRate = sellRateData
        ? resolveRateFromCategories(values.amount, sellRateData)
        : parseFloat(latestRates.sell_rate ?? "0");

      // Resolve what rate was used when the screen last calculated
      const usedSellRate = acknowledgedSellRateRef.current;
      const usedMarketPrice = acknowledgedMarketPriceRef.current;

      // Resolve what category the user was shown previously vs now
      const previousCategory =
        sellRateData?.categories?.find(
          (cat: any) =>
            values.amount >= parseFloat(cat.min_amount) &&
            values.amount <= parseFloat(cat.max_amount),
        ) ?? null;

      const sellRateChanged =
        currentSellRate > 0 && currentSellRate !== usedSellRate;
      const marketPriceExceeded = relativeChangeExceeded(
        currentMarketPrice,
        usedMarketPrice,
        TOLERANCE_PERCENT,
      );

      if (sellRateChanged || marketPriceExceeded) {
        rateOverriddenRef.current = true;
        acknowledgedSellRateRef.current = currentSellRate;
        acknowledgedMarketPriceRef.current = currentMarketPrice;

        recalculate(values.amount, currentMarketPrice, currentSellRate);

        // Build a transparent message explaining exactly what changed
        const reasons: string[] = [];

        if (sellRateChanged) {
          const categoryLabel = previousCategory?.label ?? "default rate";
          reasons.push(
            `Sell rate changed from ${formatAmount(
              usedSellRate,
            )}/$ to ${formatAmount(currentSellRate)}/$ (${categoryLabel})`,
          );
        }

        if (marketPriceExceeded) {
          reasons.push(
            `Market price moved from ${formatAmount(usedMarketPrice, {
              currency: "USD",
            })} to ${formatAmount(currentMarketPrice, {
              currency: "USD",
            })} (>${TOLERANCE_PERCENT}% change)`,
          );
        }

        showError(
          `Prices updated — please review before continuing. ${reasons.join(
            "",
          )}`,
        );
        return;
      }

      navigation.navigate("ConfirmTransaction" as never, {
        payload: { ...values, url: "/wallets/user/sell-crypto" },
      });
    } catch {
      showError("Error checking rates. Try again.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    rateOverriddenRef.current = false;
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <CustomLoading loading={isLoading} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, paddingBottom: 10, backgroundColor: colors.background }}
      edges={["right", "left"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
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
                <AppText style={styles.label}>Coin</AppText>

                <View style={styles.cryptoRow}>
                  {assetDetails?.asset_logo_url && (
                    <Image
                      source={{ uri: assetDetails?.asset_logo_url ?? "" }}
                      style={styles.optionLogo}
                    />
                  )}
                  <View style={styles.cryptoInfo}>
                    <AppText style={styles.optionName}>
                      {assetDetails?.asset_name}{" "}
                      {assetDetails?.symbol && ` (${assetDetails?.symbol})`}
                    </AppText>
                  </View>
                </View>
              </View>

              <View>
                <AppText style={styles.label}>
                  Enter the amount (in $ dollars)
                </AppText>

                <Controller
                  control={control}
                  name="amount"
                  render={({ field: { onChange, onBlur } }) => (
                    <View
                      style={[
                        styles.inputContainer,
                        errors.amount && styles.errorBorder,
                      ]}
                    >
                      <AppText style={styles.dollarSign}>$</AppText>
                      <TextInput
                        style={styles.input}
                        value={displayAmount}
                        placeholder="0.00"
                        maxFontSizeMultiplier={1}
                        allowFontScaling={false}
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
                  <AppText style={styles.error}>
                    {errors.amount.message}
                  </AppText>
                )}

                {/* Insufficient balance message with max sellable amount */}
                {hasInsufficientBalance && insufficientBalanceMessage && (
                  <AppText style={styles.error}>
                    {insufficientBalanceMessage}
                  </AppText>
                )}

                {!hasInsufficientBalance && (
                  <AppText style={styles.approx}>
                    Approximately {assetValueEquivalent} {symbol}
                  </AppText>
                )}

                <View
                  style={{
                    marginVertical: 10,
                    backgroundColor: colors.inputBackground,
                    padding: 13,
                    borderRadius: 10,
                    gap: 8,
                  }}
                >
                  <AppText style={[styles.note, { color: colors.text }]}>
                    Wallet Balance, Exchange Rate & Fee Breakdown
                  </AppText>

                  {/* Wallet balance */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 2,
                    }}
                  >
                    <AppText style={[styles.balance]}>Wallet Balance:</AppText>
                    <AppText style={styles.balance}>
                      {assetDetails?.balance || 0} {assetDetails?.symbol}
                    </AppText>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 2,
                    }}
                  >
                    <AppText style={[styles.balance]}>Balance in USD:</AppText>
                    <AppText style={styles.balance}>
                      {formatAmount(
                        Number(assetDetails?.balance) * marketPrice || 0,
                        { currency: "USD", decimalPlace: 2 },
                      )}
                    </AppText>
                  </View>

                  <View
                    style={{
                      height: 1,
                      backgroundColor: colors.border,
                      marginVertical: 4,
                    }}
                  />

                  {/* Rate */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 2,
                    }}
                  >
                    <AppText
                      style={[
                        styles.balance,
                        { fontFamily: getFontFamily("800") },
                      ]}
                    >
                      Sell Rate:
                    </AppText>
                    <AppText style={styles.balance}>
                      {formatAmount(acknowledgedSellRateRef.current ?? 0)}/$
                    </AppText>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 2,
                    }}
                  >
                    <AppText
                      style={[
                        styles.balance,
                        { fontFamily: getFontFamily("800") },
                      ]}
                    >
                      Market Price:
                    </AppText>
                    <AppText style={styles.balance}>
                      {formatAmount(marketPrice || 0, {
                        currency: "USD",
                      })}
                      /{assetDetails?.symbol}
                    </AppText>
                  </View>

                  {/* Fee breakdown — only show when amount is entered */}
                  {feeBreakdown && amount > 0 && (
                    <>
                      <View
                        style={{
                          height: 1,
                          backgroundColor: colors.border,
                          marginVertical: 4,
                        }}
                      />

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <AppText
                          style={[
                            styles.balance,
                            { fontFamily: getFontFamily("800") },
                          ]}
                        >
                          You Sell:
                        </AppText>
                        <AppText style={styles.balance}>
                          {feeBreakdown?.coinAmount} {assetDetails?.symbol} (≈{" "}
                          {formatAmount(feeBreakdown?.grossUsd, {
                            currency: "USD",
                          })}
                          )
                        </AppText>
                      </View>

                      <View
                        style={{
                          height: 1,
                          backgroundColor: colors.border,
                          marginVertical: 4,
                        }}
                      />

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <AppText style={[styles.balance]}>
                          You'll Receive:
                        </AppText>
                        <AppText
                          style={[
                            styles.balance,
                            {
                              fontFamily: getFontFamily("800"),
                            },
                          ]}
                        >
                          {feeBreakdown?.netNgn}
                        </AppText>
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.paymentContainer}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 2,
                    }}
                  >
                    <AppText style={styles.ngn}>You’ll be paid:</AppText>
                    <AppText style={styles.ngn}>{ngnAmount}</AppText>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.89}
              style={[
                styles.button,
                hasInsufficientBalance && styles.buttonDisabled,
              ]}
              disabled={hasInsufficientBalance}
              onPress={handleSubmit(onSubmit)}
            >
              <AppText style={styles.buttonText}>Continue</AppText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: normalize(20),
      backgroundColor: colors.background,
      justifyContent: "space-between",
    },
    buttonDisabled: {
      backgroundColor: colors.inputBackground,
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
      color: colors.error,
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      textAlign: "center",
    },
    label: {
      fontSize: normalize(19),
      fontFamily: getFontFamily("800"),
      marginBottom: normalize(8),
      color: colors.text,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: normalize(12),
      paddingHorizontal: normalize(16),
      marginBottom: normalize(10),
      gap: 5,
    },
    errorBorder: {
      borderColor: colors.error,
      borderWidth: 1,
    },
    dollarSign: {
      fontSize: normalize(26),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      marginRight: normalize(5),
    },
    input: {
      flex: 1,
      paddingVertical: normalize(15),
      fontSize: normalize(26),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    error: {
      color: colors.error,
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      marginBottom: normalize(10),
    },
    approx: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      marginBottom: normalize(9),
      color: COLORS.primary,
    },
    balance: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      marginBottom: normalize(4),
      color: colors.text,
    },
    rate: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("800"),
      marginBottom: normalize(4),
      color: colors.text,
    },
    min: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("800"),
      marginBottom: normalize(4),
      color: colors.text,
    },
    note: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalize(10),
    },
    cryptoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
    },
    cryptoInfo: { flex: 1 },
    optionName: {
      fontSize: normalize(19),
      fontFamily: getFontFamily("800"),
      color: colors.text,
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
      fontSize: normalize(21),
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
