import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
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
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatAmount } from "../libs/formatNumber";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
import NoWallet from "../components/NoWallet";
import RequestErrorState from "../components/RequestErrorState";
import CustomLoading from "../components/CustomLoading";
import { TradeIntent } from "../libs/types";
import { showError } from "../utlis/toast";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import { buildCryptoAmountSchema } from "./BuyCryptoScreen";
import { useCryptoLimits } from "../hooks/useCryptoLimits";
import { useServiceCharges } from "../hooks/useServiceCharges";

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

const STABLECOINS = ["USDT"];

const DEFAULT_SELL_FEE_RATE = 0.001; // fallback decimal rate (0.1%) if backend charge isn't loaded yet

/**
 * The platform fee is charged on top of the amount being sold: the user is paid
 * the full `amount` in NGN, and `amount + fee` worth of coin is debited from
 * their wallet.
 *
 * @param sellFeeRate Decimal fee rate, e.g. 0.018 for 1.8%.
 */
function calculateSellFeeBreakdown(
  amount: number,
  marketPrice: number,
  sellRate: number,
  isStablecoin = false,
  sellFeeRate = DEFAULT_SELL_FEE_RATE,
) {
  const coinAmount = marketPrice > 0 ? amount / marketPrice : 0;
  const platformFeeUsd = isStablecoin ? 0 : amount * sellFeeRate;
  const platformFeeCoin = isStablecoin ? 0 : coinAmount * sellFeeRate;
  const totalDebitUsd = amount + platformFeeUsd;
  const totalDebitCoin = coinAmount + platformFeeCoin;
  const ngnValue = sellRate > 0 ? amount * sellRate : 0;

  return {
    assetValueEquivalent: totalDebitCoin.toFixed(8),
    ngnAmount:
      sellRate > 0 ? formatAmount(ngnValue, { maxDecimalPlace: 2 }) : "0.00",
    feeBreakdown: {
      coinAmount: coinAmount.toFixed(8),
      grossUsd: amount,
      platformFeeUsd,
      platformFeeCoin: platformFeeCoin.toFixed(8),
      totalDebitUsd,
      totalDebitCoin: totalDebitCoin.toFixed(8),
      netAmountUsd: amount.toFixed(2),
      netNgn:
        sellRate > 0 ? formatAmount(ngnValue, { maxDecimalPlace: 2 }) : "0.00",
      isStablecoin,
      sellFeeRate,
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
  const {
    getCharge,
    refetch: refetchServiceCharges,
    isError: isChargesError,
    error: chargesError,
  } = useServiceCharges();
  const sellFeeCharge = getCharge("crypto_sell_fee");

  // Same convention as crypto_buy_fee: backend returns a percentage (e.g. "1.8").
  const sellFeeRate = useMemo(() => {
    const raw =
      sellFeeCharge?.value != null ? parseFloat(sellFeeCharge.value) : null;
    return raw != null && !isNaN(raw) ? raw / 100 : DEFAULT_SELL_FEE_RATE;
  }, [sellFeeCharge]);

  const selectedAssetUuid = intent.assetId ?? "";

  const schema = useMemo(
    () => buildCryptoAmountSchema(minSellAmount),
    [minSellAmount],
  );

  const [displayAmount, setDisplayAmount] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null);
  const [assetValueEquivalent, setAssetValueEquivalent] = useState<any>(0);
  const [ngnAmount, setNgnAmount] = useState("0");

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
    isError,
    error,
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

  const balanceUsd = useMemo(
    () => Number(assetDetails?.balance ?? "0") * Number(marketPrice),
    [assetDetails?.balance, marketPrice],
  );

  // amount + fee must fit in the balance, so max amount = balance / (1 + rate)
  const maxSellableUsd = useMemo(() => {
    if (isStablecoin) return balanceUsd;
    return balanceUsd / (1 + sellFeeRate);
  }, [balanceUsd, sellFeeRate, isStablecoin]);

  const hasInsufficientBalance = useMemo(() => {
    if (!amount || !assetDetails) return false;
    return amount > maxSellableUsd;
  }, [amount, maxSellableUsd, assetDetails]);

  const insufficientBalanceMessage = useMemo(() => {
    if (!amount || !assetDetails) return null;
    if (amount > balanceUsd) {
      return `Insufficient balance. Your total balance is worth ${formatAmount(
        balanceUsd,
        { currency: "USD", maxDecimalPlace: 2 },
      )}`;
    }
    return `You can only sell ${formatAmount(maxSellableUsd, {
      currency: "USD",
      maxDecimalPlace: 3,
    })} of your balance`;
  }, [maxSellableUsd, amount, assetDetails, balanceUsd]);

  const TOLERANCE_PERCENT = 1.23;

  const recalculate = useCallback(
    (amt: number, price: number, rate: number) => {
      const result = calculateSellFeeBreakdown(
        amt,
        price,
        rate,
        isStablecoin,
        sellFeeRate,
      );
      setAssetValueEquivalent(result.assetValueEquivalent);
      setFeeBreakdown({ ...result.feeBreakdown });
      setNgnAmount(result.ngnAmount);
    },
    [isStablecoin, sellFeeRate],
  );

  useEffect(() => {
    if (Number(marketPrice) <= 0) return;

    // Once a rate drift has been reviewed, keep recalculating against that
    // reviewed rate as the amount keeps changing — freezing here (as before)
    // meant hasInsufficientBalance stopped tracking the typed amount.
    if (rateOverriddenRef.current) {
      if (acknowledgedSellRateRef.current > 0) {
        recalculate(
          amount,
          Number(marketPrice),
          acknowledgedSellRateRef.current,
        );
      }

      return;
    }

    if (!assetDetails?.rates?.buy) return;

    const effectiveRate = resolveRateFromCategories(
      amount,
      assetDetails.rates.buy,
    );

    if (!effectiveRate || effectiveRate <= 0) return;

    recalculate(amount, Number(marketPrice), effectiveRate);
  }, [assetDetails?.rates?.buy, amount, marketPrice, recalculate]);

  useEffect(() => {
    if (assetDetails?.rates?.buy && amount >= 0) {
      acknowledgedSellRateRef.current = resolveRateFromCategories(
        amount,
        assetDetails.rates.buy,
      );
    } else if (assetDetails?.buy_rate) {
      acknowledgedSellRateRef.current = parseFloat(assetDetails.buy_rate);
    }
  }, [assetDetails?.rates?.buy, assetDetails?.buy_rate, amount]);

  useEffect(() => {
    if (Number(marketPrice) > 0) {
      acknowledgedMarketPriceRef.current = Number(marketPrice);
    }
  }, [marketPrice]);

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
      const sellRateData = latestRates.rates?.buy ?? null;
      const currentSellRate = sellRateData
        ? resolveRateFromCategories(values.amount, sellRateData)
        : parseFloat(latestRates.buy_rate ?? "0");

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
    } catch (error: any) {
      console.log(error?.response?.data);
      showError(
        error?.response?.data?.message ?? "Error checking rates. Try again.",
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    rateOverriddenRef.current = false;
    await Promise.all([refetch(), refetchServiceCharges()]);
    setRefreshing(false);
  };

  const isRateUnavailable = useMemo(() => {
    const sellRate = parseFloat(assetDetails?.buy_rate ?? "0");
    return !assetDetails?.rates?.buy || !sellRate || sellRate <= 0;
  }, [assetDetails?.rates?.buy, assetDetails?.buy_rate]);

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

  // A failed request isn't "no wallet": explain it and offer a retry, rather
  // than showing the create-wallet prompt or a form with missing rates. The
  // sell fee is required too, since the debit shown depends on it.
  const loadError =
    (isError && !assetDetails ? error : null) ??
    (isChargesError ? chargesError : null);

  if (loadError) {
    return (
      <RequestErrorState
        error={loadError}
        title="We couldn't load this coin"
        onRetry={() => Promise.all([refetch(), refetchServiceCharges()])}
      />
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingBottom: normalizeSpacing(10),
        backgroundColor: colors.background,
      }}
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
              <View style={{ marginBottom: normalizeSpacing(15) }}>
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
                      {assetDetails?.symbol ? ` (${assetDetails.symbol})` : ""}
                    </AppText>
                  </View>
                </View>
              </View>

              <View>
                {isRateUnavailable ? null : (
                  <>
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

                    {errors.amount ? (
                      <AppText style={styles.error}>
                        {errors.amount.message}
                      </AppText>
                    ) : (
                      hasInsufficientBalance &&
                      insufficientBalanceMessage && (
                        <AppText style={styles.error}>
                          {insufficientBalanceMessage}
                        </AppText>
                      )
                    )}

                    {amount > 0 &&
                      !errors.amount &&
                      !hasInsufficientBalance && (
                        <AppText style={styles.approx}>
                          Approximately {assetValueEquivalent} {symbol} will be
                          debited from your wallet
                        </AppText>
                      )}
                  </>
                )}

                {isRateUnavailable && (
                  <View style={styles.warningContainer}>
                    <AppText style={styles.warningText}>
                      Sell Rates for {assetDetails?.symbol ?? "this asset"} are
                      currently unavailable. Please check back later.
                    </AppText>
                  </View>
                )}

                {!isRateUnavailable ? (
                  <>
                    <View
                      style={{
                        marginVertical: normalizeSpacing(10),
                        backgroundColor: colors.inputBackground,
                        padding: normalizeSpacing(13),
                        borderRadius: 10,
                        gap: 8,
                      }}
                    >
                      <AppText style={[styles.note, { color: colors.text }]}>
                        Wallet Balance, Exchange Rate & Fee Breakdown
                      </AppText>

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingVertical: normalizeSpacing(2),
                        }}
                      >
                        <AppText style={[styles.balance]}>
                          Wallet Balance:
                        </AppText>
                        <AppText style={styles.balance}>
                          {assetDetails?.balance || 0} {assetDetails?.symbol}
                        </AppText>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingVertical: normalizeSpacing(2),
                        }}
                      >
                        <AppText style={[styles.balance]}>
                          Balance in USD:
                        </AppText>
                        <AppText style={styles.balance}>
                          {formatAmount(
                            Number(assetDetails?.balance) * marketPrice || 0,
                            { currency: "USD", maxDecimalPlace: 2 },
                          )}
                        </AppText>
                      </View>

                      <View
                        style={{
                          height: 1,
                          backgroundColor: colors.border,
                          marginVertical: normalizeSpacing(4),
                        }}
                      />

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingVertical: normalizeSpacing(2),
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
                          paddingVertical: normalizeSpacing(2),
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

                      {feeBreakdown && amount > 0 && (
                        <>
                          <View
                            style={{
                              height: 1,
                              backgroundColor: colors.border,
                              marginVertical: normalizeSpacing(4),
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
                              {feeBreakdown?.totalDebitCoin}{" "}
                              {assetDetails?.symbol} (≈{" "}
                              {formatAmount(feeBreakdown?.grossUsd, {
                                currency: "USD",
                                maxDecimalPlace: 2,
                              })}
                              )
                            </AppText>
                          </View>

                          <View
                            style={{
                              height: 1,
                              backgroundColor: colors.border,
                              marginVertical: normalizeSpacing(4),
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
                          paddingVertical: normalizeSpacing(2),
                        }}
                      >
                        <AppText style={styles.ngn}>You’ll be paid:</AppText>
                        <AppText style={styles.ngn}>{ngnAmount}</AppText>
                      </View>
                    </View>
                  </>
                ) : null}
              </View>
            </View>

            {isRateUnavailable ? null : (
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
            )}
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
      paddingHorizontal: normalizeSpacing(20),
      backgroundColor: colors.background,
      justifyContent: "space-between",
    },
    buttonDisabled: {
      backgroundColor: colors.inputBackground,
      opacity: 0.6,
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
    label: {
      fontSize: normalize(19),
      fontFamily: getFontFamily("800"),
      marginBottom: normalizeSpacing(8),
      color: colors.text,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: normalize(12),
      paddingHorizontal: normalizeSpacing(16),
      marginBottom: normalizeSpacing(10),
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
      marginRight: normalizeSpacing(5),
    },
    input: {
      flex: 1,
      paddingVertical: normalizeSpacing(10),
      fontSize: normalize(26),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    error: {
      color: colors.error,
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      marginBottom: normalizeSpacing(10),
    },
    approx: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      marginBottom: normalizeSpacing(9),
      color: colors.primaryLight,
    },
    balance: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      marginBottom: normalizeSpacing(4),
      color: colors.text,
    },
    rate: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("800"),
      marginBottom: normalizeSpacing(4),
      color: colors.text,
    },
    min: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("800"),
      marginBottom: normalizeSpacing(4),
      color: colors.text,
    },
    note: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalizeSpacing(10),
    },
    cryptoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: normalizeSpacing(10),
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
      paddingVertical: normalizeSpacing(14),
      borderRadius: normalize(208),
      alignItems: "center",
      marginBottom: normalizeSpacing(30),
    },
    buttonText: {
      color: "#fff",
      fontSize: normalize(19),
      fontFamily: getFontFamily("700"),
    },
    paymentContainer: {
      backgroundColor: COLORS.primary,
      borderRadius: 9,
      marginVertical: normalizeSpacing(20),
      padding: normalizeSpacing(14),
    },
  });
