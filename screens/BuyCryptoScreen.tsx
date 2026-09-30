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
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatAmount } from "../libs/formatNumber";
import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
import { useFiatBalance } from "../hooks/useFiatBalance";
import { TradeIntent } from "../libs/types";
import { showError } from "../utlis/toast";
import useAxios from "../hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import { resolveRateFromCategories } from "./SellCrytpoScreen";
import CustomLoading from "../components/CustomLoading";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import { useCryptoLimits } from "../hooks/useCryptoLimits";
import { useServiceCharges } from "../hooks/useServiceCharges";
import NoWallet from "../components/NoWallet";
import RequestErrorState from "../components/RequestErrorState";
import { showValue } from "../libs/requestError";
import { useAuthStore } from "../stores/authSlice";
import { useStyles } from "../hooks/useStyles";

type CryptoBuyScreenParams = {
  CryptoBuy: {
    intent: TradeIntent;
  };
};

const STABLECOINS = ["USDT"];
const TOLERANCE_PERCENT = 1.23;
const DEFAULT_BUY_FEE_RATE = 0.001; // fallback decimal rate (0.1%) if backend charge isn't loaded yet

function relativeChangeExceeded(
  current: number,
  used: number,
  tolerancePercent = TOLERANCE_PERCENT,
): boolean {
  if (!isFinite(current) || !isFinite(used) || used <= 0) return false;
  const diff = Math.abs(current - used);
  const relativePercent = (diff / used) * 100;
  return relativePercent > tolerancePercent;
}

export function buildCryptoAmountSchema(minAmount: number) {
  return Yup.object().shape({
    amount: Yup.number()
      .typeError("Enter a valid amount")
      .required("Amount is required")
      .min(minAmount, `Minimum amount is $${minAmount}`),
    asset_id: Yup.string().required(),
  });
}

/**
 * @param buyFeeRate Decimal fee rate, e.g. 0.018 for 1.8%. NOT a percentage
 * value like 1.8 — convert before calling (see getBuyFeeRate below).
 */
export function calculateBuyFeeBreakdown(
  amount: number,
  marketPrice: number,
  buyRate: number,
  symbol?: string,
  buyFeeRate = DEFAULT_BUY_FEE_RATE,
) {
  const isStablecoin = STABLECOINS.includes((symbol ?? "").toUpperCase());
  const coinAmount = marketPrice > 0 ? amount / marketPrice : 0;
  const platformFeeUsd = isStablecoin ? 0 : amount * buyFeeRate;
  const platformFeeCoin = isStablecoin ? 0 : coinAmount * buyFeeRate;
  const totalCostUsd = amount + platformFeeUsd;
  const totalCostNgn = buyRate > 0 ? totalCostUsd * buyRate : 0;

  return {
    assetValueEquivalent: coinAmount.toFixed(8),
    ngnAmount:
      buyRate > 0 ? formatAmount(totalCostNgn, { maxDecimalPlace: 2 }) : "0.00",
    feeBreakdown: {
      grossUsd: amount,
      coinAmount: coinAmount.toFixed(8),
      platformFeeUsd: platformFeeUsd.toFixed(3),
      platformFeeCoin: platformFeeCoin.toFixed(8),
      totalCostUsd: totalCostUsd.toFixed(3),
      totalCostNgn,
      isStablecoin,
      currentBuyRate: buyRate,
      marketCurrentPrice: marketPrice,
      buyFeeRate, // decimal rate actually used, for display
    },
  };
}

export default function CryptoBuyScreen() {
  const { apiGet } = useAxios();
  const route = useRoute<RouteProp<CryptoBuyScreenParams, "CryptoBuy">>();
  const { intent } = route.params;
  const navigation: any = useNavigation();
  const selectedAssetUuid = intent.assetId ?? "";
  const {
    fiatBalance,
    isError: isBalanceError,
    error: balanceError,
    refetch: refetchBalance,
  } = useFiatBalance();
  const { minBuyAmount } = useCryptoLimits();
  const {
    getCharge,
    refetch: refetchServiceCharges,
    isError: isChargesError,
    error: chargesError,
  } = useServiceCharges();
  const refreshUser = useAuthStore(state => state.refreshUser);
  const buyFeeCharge = getCharge("crypto_buy_fee");

  // ASSUMPTION: backend returns buy_fee as a percentage number (e.g. "1.8"
  // for 1.8%), so it's divided by 100 to get the decimal rate used in
  // calculations. If the backend instead returns an already-decimal value
  // (e.g. "0.018"), remove the "/ 100" below.
  const buyFeeRate = useMemo(() => {
    const raw =
      buyFeeCharge?.value != null ? parseFloat(buyFeeCharge.value) : null;
    return raw != null && !isNaN(raw) ? raw / 100 : DEFAULT_BUY_FEE_RATE;
  }, [buyFeeCharge]);

  const schema = useMemo(
    () => buildCryptoAmountSchema(minBuyAmount),
    [minBuyAmount],
  );

  // Local state
  const [displayAmount, setDisplayAmount] = useState("");
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null);
  const [ngnAmount, setNgnAmount] = useState("0.00");
  const [assetValueEquivalent, setAssetValueEquivalent] = useState<any>(0);
  const [refreshing, setRefreshing] = useState(false);

  const acknowledgedBuyRateRef = useRef<number>(0);
  const acknowledgedMarketPriceRef = useRef<number>(0);
  const rateOverriddenRef = useRef(false);

  const styles = useStyles(makeStyles);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { amount: undefined, asset_id: intent?.assetId ?? "" },
    mode: "onChange",
  });

  const amount = watch("amount");

  // Asset details query
  const {
    data: assetDetails,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["asset-detail-buy", selectedAssetUuid],
    queryFn: async () => {
      if (!selectedAssetUuid) return null;
      const res = await apiGet(`/wallets/${selectedAssetUuid}`);
      return res?.data?.data ?? null;
    },
    enabled: !!selectedAssetUuid,
  });

  console.log(assetDetails);

  const marketPrice = useMemo(
    () =>
      feeBreakdown?.currentMarketPrice ??
      assetDetails?.market_current_value ??
      0,
    [feeBreakdown?.currentMarketPrice, assetDetails?.market_current_value],
  );

  const hasInsufficientBalance = useMemo(() => {
    if (!feeBreakdown?.totalCostNgn) return false;
    return feeBreakdown?.totalCostNgn > fiatBalance;
  }, [feeBreakdown?.totalCostNgn, fiatBalance]);

  const isRateUnavailable = useMemo(() => {
    const sellRate = parseFloat(assetDetails?.sell_rate ?? "0");
    return !assetDetails?.rates?.sell || !sellRate || sellRate <= 0;
  }, [assetDetails?.rates?.sell, assetDetails?.sell_rate]);

  const insufficientBalanceMessage = useMemo(() => {
    if (!hasInsufficientBalance || !amount || !fiatBalance) return null;

    // Compare like units: amount is USD, so it must be converted to NGN
    // before comparing against fiatBalance (previously compared directly,
    // which meant this branch could never trigger). This distinguishes
    // "can't afford even before fees" from "fees push it just over".
    const rawCostNgn = amount * (feeBreakdown?.currentBuyRate ?? 0);
    if (rawCostNgn > fiatBalance) {
      return `Insufficient balance. Your total balance is ${formatAmount(
        fiatBalance,
        {
          currency: "NGN",
          maxDecimalPlace: 2,
        },
      )}`;
    }

    const maxBuyable =
      fiatBalance / (1 + (feeBreakdown?.isStablecoin ? 0 : buyFeeRate));
    return `You can only buy up to ${formatAmount(maxBuyable, {
      currency: "NGN",
      maxDecimalPlace: 2,
    })} with your current balance (including charges).`;
  }, [hasInsufficientBalance, fiatBalance, feeBreakdown, amount, buyFeeRate]);

  // Recalculate helper
  const recalculate = useCallback(
    (amt: number, price: number, rate: number) => {
      const result = calculateBuyFeeBreakdown(
        amt,
        price,
        rate,
        assetDetails?.symbol,
        buyFeeRate,
      );
      setAssetValueEquivalent(result.assetValueEquivalent);
      setFeeBreakdown({ ...result.feeBreakdown });
      setNgnAmount(result.ngnAmount);
    },
    [assetDetails?.symbol, buyFeeRate],
  );

  useEffect(() => {
    if (Number(marketPrice) <= 0) return;

    // Once a rate drift has been reviewed, keep recalculating against that
    // reviewed rate as the amount keeps changing — freezing here (as before)
    // meant hasInsufficientBalance stopped tracking the typed amount.
    if (rateOverriddenRef.current) {
      if (acknowledgedBuyRateRef.current > 0) {
        recalculate(
          amount,
          Number(marketPrice),
          acknowledgedBuyRateRef.current,
        );
      }

      return;
    }

    if (!assetDetails?.rates?.sell) return;

    const effectiveRate = resolveRateFromCategories(
      amount,
      assetDetails.rates.sell,
    );
    if (!effectiveRate || effectiveRate <= 0) return;

    recalculate(amount, Number(marketPrice), effectiveRate);
  }, [assetDetails?.rates?.sell, amount, marketPrice, recalculate]);

  // Effect: seed acknowledged refs
  useEffect(() => {
    if (assetDetails?.rates?.sell && amount >= 0) {
      acknowledgedBuyRateRef.current = resolveRateFromCategories(
        amount,
        assetDetails.rates?.sell,
      );
    } else if (assetDetails?.sell_rate) {
      acknowledgedBuyRateRef.current = parseFloat(assetDetails.sell_rate);
    }
  }, [assetDetails?.rates?.sell, assetDetails?.sell_rate, amount]);

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

      if (!latestRates) {
        showError("Unable to fetch latest rates.");
        return;
      }

      const currentMarketPrice = parseFloat(
        latestRates.market_current_value ?? "0",
      );

      const buyRateData = latestRates.rates?.sell ?? null;
      const currentBuyRate = buyRateData
        ? resolveRateFromCategories(values.amount, buyRateData)
        : parseFloat(latestRates.sell_rate ?? "0");

      const usedBuyRate = acknowledgedBuyRateRef.current;
      const usedMarketPrice = acknowledgedMarketPriceRef.current;

      const previousCategory =
        buyRateData?.categories?.find(
          (cat: any) =>
            values.amount >= parseFloat(cat.min_amount) &&
            values.amount <= parseFloat(cat.max_amount),
        ) ?? null;

      const buyRateChanged =
        currentBuyRate > 0 && currentBuyRate !== usedBuyRate;
      const marketPriceExceeded = relativeChangeExceeded(
        currentMarketPrice,
        usedMarketPrice,
        TOLERANCE_PERCENT,
      );

      if (buyRateChanged || marketPriceExceeded) {
        rateOverriddenRef.current = true;
        acknowledgedBuyRateRef.current = currentBuyRate;
        acknowledgedMarketPriceRef.current = currentMarketPrice;

        recalculate(values.amount, currentMarketPrice, currentBuyRate);

        const reasons: string[] = [];

        if (buyRateChanged) {
          const categoryLabel = previousCategory?.label ?? "default rate";
          reasons.push(
            `Buy rate changed from ${formatAmount(
              usedBuyRate,
            )}/$ to ${formatAmount(currentBuyRate)}/$ (${categoryLabel})`,
          );
        }

        if (marketPriceExceeded) {
          reasons.push(
            `Market price moved from ${formatAmount(usedMarketPrice, {
              currency: "USD",
            })} to ${formatAmount(currentMarketPrice, { currency: "USD" })}`,
          );
        }

        showError(
          `Prices updated — please review before continuing.${reasons.join(
            "",
          )}`,
        );
        return;
      }

      navigation.navigate("ConfirmTransaction" as never, {
        payload: { ...values, url: "/wallets/user/buy-crypto" },
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
    await Promise.all([refetch(), refetchServiceCharges(), refreshUser()]);
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.screenCentered}>
        <CustomLoading loading={isLoading} />
      </View>
    );
  }

  // Failed to load: explain and offer a retry instead of rendering an empty
  // form with missing prices and rates.
  // Only block when there's nothing usable: a failed background refresh with
  // cached data keeps working. Without the price, fee or balance the totals
  // shown would be wrong, so each of them is required.
  const loadError =
    (isError && !assetDetails ? error : null) ??
    (isChargesError ? chargesError : null) ??
    (isBalanceError && fiatBalance === undefined ? balanceError : null);

  if (loadError) {
    return (
      <RequestErrorState
        error={loadError}
        title="We couldn't load this coin"
        onRetry={() =>
          Promise.all([refetch(), refetchServiceCharges(), refetchBalance()])
        }
      />
    );
  }

  if (!assetDetails) {
    return (
      <View style={styles.screen}>
        <NoWallet
          selectedAssetUuid={selectedAssetUuid}
          onSuccess={() => {
            refetch();
          }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["right", "left"]}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
                    {showValue(assetDetails?.symbol, "")}{" "}
                    {assetDetails?.asset_name
                      ? `(${assetDetails.asset_name})`
                      : ""}
                  </AppText>
                </View>
              </View>
            </View>

            {isRateUnavailable && (
              <View style={styles.warningContainer}>
                <AppText style={styles.warningText}>
                  Buy Rates for {assetDetails?.symbol ?? "this asset"} are
                  currently unavailable. Please check back later.
                </AppText>
              </View>
            )}

            {isRateUnavailable ? null : (
              <View>
                <AppText style={styles.label}>
                  Enter the amount you want to buy
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
                        style={[styles.input]}
                        value={displayAmount}
                        placeholder="0.00"
                        placeholderTextColor="#999"
                        keyboardType="decimal-pad"
                        onBlur={onBlur}
                        maxFontSizeMultiplier={1}
                        allowFontScaling={false}
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

                {!errors.amount && !hasInsufficientBalance && (
                  <AppText style={styles.approx}>
                    Approximately {assetValueEquivalent} {assetDetails?.symbol}
                  </AppText>
                )}

                <View style={styles.breakdownCard}>
                  <AppText style={[styles.note]}>
                    Wallet Balance, Exchange Rate & Fee Breakdown
                  </AppText>

                  <View style={styles.rowBetween}>
                    <AppText style={[styles.balance]}>Fiat Balance:</AppText>
                    <AppText style={styles.balance}>
                      {formatAmount(fiatBalance, {
                        currency: "NGN",
                        maxDecimalPlace: 2,
                      })}
                    </AppText>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.rowBetween}>
                    <AppText style={[styles.balance]}>Buy Rate:</AppText>
                    <AppText style={styles.balance}>
                      {formatAmount(
                        feeBreakdown?.currentBuyRate ??
                          assetDetails?.sell_rate ??
                          0,
                      )}
                      /$
                    </AppText>
                  </View>

                  <View style={styles.rowBetween}>
                    <AppText style={[styles.balance]}>Market Price:</AppText>
                    <AppText style={styles.balance}>
                      {formatAmount(
                        Number(feeBreakdown?.marketCurrentPrice) || 0,
                        {
                          currency: "USD",
                          maxDecimalPlace: 2,
                        },
                      )}
                      /{assetDetails?.symbol}
                    </AppText>
                  </View>

                  {feeBreakdown && amount > 0 && (
                    <>
                      <View style={styles.divider} />

                      <View style={styles.rowBetween}>
                        <AppText style={[styles.balance]}>You Buy:</AppText>
                        <AppText style={styles.balance}>
                          {feeBreakdown.coinAmount} {assetDetails?.symbol} (≈{" "}
                          {formatAmount(feeBreakdown.grossUsd, {
                            currency: "USD",
                            maxDecimalPlace: 2,
                          })}
                          )
                        </AppText>
                      </View>

                      {!feeBreakdown.isStablecoin && (
                        <View style={styles.rowBetween}>
                          <AppText style={[styles.balance]}>
                            Operational Fee (
                            {(
                              (buyFeeRate ?? feeBreakdown.buyFeeRate) * 100
                            ).toFixed(2)}
                            %):
                          </AppText>
                          <AppText style={[styles.balance]}>
                            +{feeBreakdown.platformFeeCoin}{" "}
                            {assetDetails?.symbol} (≈ $
                            {feeBreakdown.platformFeeUsd})
                          </AppText>
                        </View>
                      )}

                      {feeBreakdown.isStablecoin && (
                        <View style={styles.rowBetween}>
                          <AppText style={[styles.balance]}>
                            Operational Fee:
                          </AppText>
                          <AppText style={[styles.balance, styles.noFeeText]}>
                            No fee for {assetDetails?.symbol}
                          </AppText>
                        </View>
                      )}

                      <View style={styles.divider} />

                      <View style={styles.rowBetween}>
                        <AppText style={[styles.balance]}>
                          Total Cost (USD):
                        </AppText>
                        <AppText style={[styles.balance]}>
                          {formatAmount(
                            Number(feeBreakdown.totalCostUsd ?? 100),
                            {
                              currency: "USD",
                              maxDecimalPlace: 2,
                            },
                          )}
                        </AppText>
                      </View>

                      <View style={styles.rowBetween}>
                        <AppText style={[styles.balance]}>
                          You'll Pay (₦):
                        </AppText>
                        <AppText style={[styles.balance]}>{ngnAmount}</AppText>
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.paymentContainer}>
                  <View style={styles.paymentRow}>
                    <AppText style={styles.ngn}>You're Paying:</AppText>
                    <AppText style={styles.ngn}>{ngnAmount}</AppText>
                  </View>
                </View>
              </View>
            )}
          </View>

          {isRateUnavailable ? null : (
            <TouchableOpacity
              activeOpacity={0.89}
              style={[
                styles.button,
                hasInsufficientBalance && styles.buttonDisabled,
              ]}
              disabled={hasInsufficientBalance || isSubmitting}
              onPress={handleSubmit(onSubmit)}
            >
              <AppText style={styles.buttonText}>
                {isSubmitting ? "Please wait..." : "Continue"}
              </AppText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    screenCentered: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    screen: { flex: 1, backgroundColor: colors.background },
    safeArea: {
      flex: 1,
      paddingBottom: normalizeSpacing(20),
      backgroundColor: colors.background,
    },
    scrollContent: { flexGrow: 1 },
    breakdownCard: {
      marginVertical: normalizeSpacing(10),
      backgroundColor: colors.inputBackground,
      padding: normalizeSpacing(10),
      borderRadius: 10,
      gap: 8,
    },
    rowBetween: { flexDirection: "row", justifyContent: "space-between" },
    divider: { height: 1, backgroundColor: colors.border },
    noFeeText: { color: "#2e7d32" },
    paymentRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: normalizeSpacing(9),
    },
    container: {
      flex: 1,
      paddingHorizontal: normalizeSpacing(20),
      backgroundColor: colors.background,
      justifyContent: "space-between",
    },
    buttonDisabled: {
      backgroundColor: colors.border,
      opacity: 0.6,
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
      borderRadius: normalize(12),
      paddingHorizontal: normalizeSpacing(16),
      marginBottom: normalizeSpacing(10),
      gap: 5,
    },
    dollarSign: {
      fontSize: normalize(26),
      fontFamily: getFontFamily("800"),
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
      fontSize: normalize(19),
      fontFamily: getFontFamily("700"),
      marginBottom: normalizeSpacing(10),
    },
    errorBorder: {
      borderColor: colors.error,
      borderWidth: 1,
    },
    approx: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      marginBottom: normalizeSpacing(9),
      color: colors.primaryLight,
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
      borderColor: colors.border,
    },
    balance: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      paddingVertical: normalizeSpacing(3),
      color: colors.text,
    },
    fee: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      marginBottom: normalizeSpacing(4),
      color: colors.text,
    },
    rate: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      marginBottom: normalizeSpacing(4),
      color: colors.text,
    },
    min: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      marginBottom: normalizeSpacing(4),
      color: colors.text,
    },
    note: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalizeSpacing(10),
    },
    ngn: {
      color: "white",
      fontSize: normalize(22),
      fontFamily: getFontFamily("900"),
    },
    button: {
      backgroundColor: COLORS.primary,
      paddingVertical: normalizeSpacing(14),
      borderRadius: normalize(208),
      alignItems: "center",
      marginTop: normalizeSpacing(20),
      marginBottom: normalizeSpacing(30),
    },
    buttonText: {
      color: "#fff",
      fontSize: normalize(19),
      fontFamily: getFontFamily("700"),
    },
    paymentContainer: {
      backgroundColor: colors.primary,
      borderRadius: 9,
      marginVertical: normalizeSpacing(20),
      padding: normalizeSpacing(10),
    },
    warningContainer: {
      marginVertical: normalizeSpacing(12),
      padding: normalizeSpacing(10),
      backgroundColor: "rgba(255, 0, 0, 0.03)",
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.errorLight,
    },
    warningText: {
      color: colors.error,
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      textAlign: "center",
    },
  });
