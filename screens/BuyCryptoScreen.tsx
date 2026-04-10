import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatAmount } from "../libs/formatNumber";
import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
import { useAssets } from "../hooks/useAssets";
import { useFiatBalance } from "../hooks/useFiatBalance";
import { TradeIntent } from "../libs/types";
import { showError } from "../utlis/toast";
import useAxios from "../hooks/useAxios";

type CryptoBuyScreenParams = {
  CryptoBuy: {
    intent: TradeIntent;
  };
};

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

const schema = Yup.object().shape({
  asset_id: Yup.string().required("Select the crypto you want to convert from"),
  amount: Yup.number()
    .typeError("Enter a valid amount")
    .min(1, "The amount is too small. The minimum is 6 USD")
    .required("Amount is required"),
});

function calculateBuyFeeBreakdown(
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

function calculateFeeBreakdown(
  amount: number,
  marketPrice: number,
  buyRate: number,
  symbol: string,
) {
  const STABLECOINS = ["USDT"];
  const isStablecoin = STABLECOINS.includes(symbol.toUpperCase());

  const coinAmount = amount / marketPrice;
  const platformFeeUsd = isStablecoin ? 0 : amount * 0.001;
  const platformFeeCoin = isStablecoin ? 0 : coinAmount * 0.001;
  const totalCostUsd = amount + platformFeeUsd;
  const totalCostNgn = buyRate > 0 ? totalCostUsd * buyRate : 0;

  console.log(
    amount,
    marketPrice,
    buyRate,
    platformFeeUsd,
    platformFeeCoin,
    totalCostUsd,
    totalCostNgn,
  );

  return {
    assetValueEquivalent: coinAmount.toFixed(8),
    ngnAmount: buyRate > 0 ? formatAmount(totalCostNgn) : "0.00",
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
    },
    symbol,
  };
}

export default function CryptoBuyScreen() {
  const { apiGet } = useAxios();
  const route = useRoute<RouteProp<CryptoBuyScreenParams, "CryptoBuy">>();
  const { intent } = route.params;
  const navigation: any = useNavigation();
  const selectedAssetUuid = intent.assetId ?? "";
  const [displayAmount, setDisplayAmount] = useState("");
  const { fiatBalance } = useFiatBalance();
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null);
  const [ngnAmount, setNgnAmount] = useState("0.00");
  const [assetValueEquivalent, setAssetValueEquivalent] = useState<any>(0);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: 0,
      asset_id: intent?.assetId ?? "",
    },
    mode: "onChange",
  });

  const { assets } = useAssets();

  const assetDetails = useMemo(
    () =>
      Array.isArray(assets)
        ? assets.find(a => a.uuid === selectedAssetUuid)
        : null,
    [assets],
  );

  const marketPrice =
    feeBreakdown?.currentMarketPrice ?? assetDetails?.market_current_value ?? 0;
  const amount = watch("amount");

  const TOLERANCE_PERCENT = 1.23;

  const onSubmit = async (values: any) => {
    try {
      const res = await apiGet(`/crypto-assets/${selectedAssetUuid}/rates`);
      const latestRates = res?.data?.asset ?? null;

      if (!latestRates) {
        showError("Unable to fetch latest rates.");
        return;
      }

      // parse latest values
      const currentSellRate = parseFloat(latestRates.buy_rate ?? "0");
      const currentMarketPrice = parseFloat(
        latestRates.market_current_value ?? "0",
      );

      // parse previously used values (fallback to 0)
      const usedSellRate = parseFloat(feeBreakdown?.currentBuyRate ?? "0");
      const usedMarketPrice = parseFloat(marketPrice ?? "0");

      const sellRateChanged =
        currentSellRate > 0 && currentSellRate !== usedSellRate;
      const marketPriceExceeded = relativeChangeExceeded(
        currentMarketPrice,
        usedMarketPrice,
        TOLERANCE_PERCENT,
      );

      // If either exceeded tolerance, recalc, update UI and block navigation
      if (sellRateChanged || marketPriceExceeded) {
        const recalculated = calculateBuyFeeBreakdown(
          values.amount,
          currentMarketPrice,
          currentSellRate,
        );

        setFeeBreakdown(recalculated.feeBreakdown);
        setNgnAmount(recalculated.ngnAmount);

        const reasons: string[] = [];
        if (sellRateChanged) reasons.push("Buy rate");
        if (marketPriceExceeded) reasons.push("Market price");

        showError(
          `${reasons.join(
            " and ",
          )} changed. Prices have been recalculated — please review before continuing.`,
        );

        return; // block navigation
      }

      // If changes are within tolerance, optionally update fee state silently
      // (uncomment if you want the UI to reflect tiny changes without blocking)
      // const recalculated = calculateSellFeeBreakdown(values.amount, currentMarketPrice, currentSellRate);
      // setLatestFeeBreakdown(recalculated.feeBreakdown);
      // setLatestNgnAmount(recalculated.ngnAmount);

      const payload = {
        ...values,
        url: "/wallets/user/buy-crypto",
      };

      navigation.navigate("ConfirmTransaction" as never, { payload });
    } catch (error) {
      console.error("onSubmit rate check error:", error);
      showError("Error checking rates. Try again.");
    }
  };

  // const onSubmit = async (values: any) => {
  //   try {
  //     const res = await apiGet(`/crypto-assets/${selectedAssetUuid}/rates`);
  //     const latestRates = res?.data?.asset ?? null;

  //     if (!latestRates) {
  //       showError("Unable to fetch latest rates.");
  //       return;
  //     }

  //     const currentBuyRate = parseFloat(latestRates.buy_rate ?? "0");
  //     const usedBuyRate = parseFloat(
  //       feeBreakdown?.currentBuyRate ?? assetDetails?.buy_rate ?? "0",
  //     );

  //     if (currentBuyRate > 0 && currentBuyRate !== usedBuyRate) {
  //       const recalculated = calculateFeeBreakdown(
  //         values.amount,
  //         marketPrice,
  //         currentBuyRate,
  //         assetDetails?.symbol ?? "",
  //       );

  //       setFeeBreakdown(recalculated.feeBreakdown);
  //       setNgnAmount(recalculated.ngnAmount);

  //       showError(
  //         "Buy rate has changed. Prices recalculated — please review before continuing.",
  //       );
  //       return;
  //     }

  //     navigation.navigate("ConfirmTransaction" as never, {
  //       payload: { ...values, url: "/wallets/user/buy-crypto" },
  //     });
  //   } catch (error) {
  //     showError("Error checking rates. Try again.");
  //   }
  // };

  const hasInsufficientBalance = useMemo(() => {
    if (!feeBreakdown?.totalCostNgn) return false;
    return feeBreakdown?.totalCostNgn > fiatBalance;
  }, [feeBreakdown?.totalCostNgn, fiatBalance]);

  // message to show
  const insufficientBalanceMessage = useMemo(() => {
    if (!hasInsufficientBalance || !amount || !fiatBalance) return null;

    if (amount > fiatBalance) {
      return `Insufficient balance. Your total balance is ${formatAmount(
        fiatBalance,
        {
          currency: "NGN",
        },
      )}`;
    }

    // maximum fiat the user can spend including charges
    const maxBuyable =
      fiatBalance / (1 + (feeBreakdown?.isStablecoin ? 0 : 0.001));

    return `You can only buy up to ${formatAmount(maxBuyable, {
      currency: "NGN",
    })} with your current balance (including charges).`;
  }, [hasInsufficientBalance, fiatBalance, feeBreakdown]);

  useEffect(() => {
    if (intent?.amount) {
      const numericAmount = Number(intent.amount);
      if (!isNaN(numericAmount)) {
        setDisplayAmount(formatWithCommas(numericAmount.toString()));
      }

      setValue("amount", numericAmount);
    }
  }, [intent?.amount]);

  useEffect(() => {
    if (
      assetDetails?.buy_rate &&
      amount > 0 &&
      marketPrice > 0 &&
      assetDetails
    ) {
      const recalculated = calculateFeeBreakdown(
        amount,
        marketPrice,
        feeBreakdown?.currentBuyRate ?? parseFloat(assetDetails.buy_rate),
        assetDetails.symbol ?? "",
      );
      setAssetValueEquivalent(recalculated.assetValueEquivalent);
      setFeeBreakdown(recalculated.feeBreakdown);
      setNgnAmount(recalculated.ngnAmount);
    }
  }, [
    assetDetails?.buy_rate,
    amount,
    feeBreakdown?.currentBuyRate,
    marketPrice,
    assetDetails,
  ]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "right", "left"]}>
      <ScrollView
        contentContainerStyle={{
          flex: 1,
        }}
      >
        <View style={styles.container}>
          <View>
            <View style={{ marginBottom: 15 }}>
              <Text style={styles.label}>Coin</Text>
              <View style={styles.cryptoRow}>
                {assetDetails?.logo_url && (
                  <Image
                    source={{ uri: assetDetails?.logo_url ?? "" }}
                    style={styles.optionLogo}
                  />
                )}
                <View style={styles.cryptoInfo}>
                  <Text style={styles.optionName}>
                    {assetDetails?.symbol} {`(${assetDetails?.name})`}
                  </Text>
                </View>
              </View>
            </View>
            <View>
              <Text style={styles.label}>Enter the amount you want to buy</Text>
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

              {/* {hasInsufficientBalance && (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningText}>
                    {insufficientBalanceMessage}
                  </Text>
                </View>
              )} */}

              {hasInsufficientBalance && insufficientBalanceMessage && (
                <Text style={styles.error}>{insufficientBalanceMessage}</Text>
              )}

              <Text style={styles.approx}>
                Approximately {assetValueEquivalent} {assetDetails?.symbol}
              </Text>

              <View
                style={{
                  marginVertical: 10,
                  backgroundColor: "#EFF7EC",
                  padding: 10,
                  borderRadius: 10,
                  gap: 8,
                }}
              >
                <Text style={[styles.note]}>
                  Wallet Balance, Exchange Rate & Fee Breakdown
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={[styles.balance]}>Fiat Balance:</Text>
                  <Text style={styles.balance}>
                    {formatAmount(fiatBalance, { currency: "NGN" })}
                  </Text>
                </View>

                <View style={{ height: 1, backgroundColor: "#d4edda" }} />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={[styles.balance]}>Buy Rate:</Text>
                  <Text style={styles.balance}>
                    {formatAmount(
                      feeBreakdown?.currentBuyRate ??
                        assetDetails?.buy_rate ??
                        0,
                    )}
                    /$
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={[styles.balance]}>Market Price:</Text>
                  <Text style={styles.balance}>
                    {formatAmount(
                      Number(feeBreakdown?.marketCurrentPrice) || 0,
                      {
                        currency: "USD",
                      },
                    )}
                    /{assetDetails?.symbol}
                  </Text>
                </View>

                {feeBreakdown && amount > 0 && (
                  <>
                    <View style={{ height: 1, backgroundColor: "#d4edda" }} />

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={[styles.balance]}>You Buy:</Text>
                      <Text style={styles.balance}>
                        {feeBreakdown.coinAmount} {assetDetails?.symbol} (≈{" "}
                        {formatAmount(feeBreakdown.grossUsd, {
                          currency: "USD",
                        })}
                        )
                      </Text>
                    </View>

                    {!feeBreakdown.isStablecoin && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={[styles.balance]}>
                          Operational Fee (0.1%):
                        </Text>
                        <Text style={[styles.balance]}>
                          +{feeBreakdown.platformFeeCoin} {assetDetails?.symbol}{" "}
                          (≈ ${feeBreakdown.platformFeeUsd})
                        </Text>
                      </View>
                    )}

                    {feeBreakdown.isStablecoin && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={[styles.balance]}>Operational Fee:</Text>
                        <Text style={[styles.balance, { color: "#2e7d32" }]}>
                          No fee for {assetDetails?.symbol}
                        </Text>
                      </View>
                    )}

                    <View style={{ height: 1, backgroundColor: "#d4edda" }} />

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={[styles.balance]}>Total Cost (USD):</Text>
                      <Text style={[styles.balance]}>
                        {formatAmount(Number(feeBreakdown.totalCostUsd), {
                          currency: "USD",
                          decimalPlace: 3,
                        })}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={[styles.balance]}>You'll Pay (₦):</Text>
                      <Text style={[styles.balance]}>{ngnAmount}</Text>
                    </View>
                  </>
                )}
              </View>
              <View style={styles.paymentContainer}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: 9,
                  }}
                >
                  <Text style={styles.ngn}>You’re Paying:</Text>
                  <Text style={styles.ngn}>{ngnAmount}</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              hasInsufficientBalance && styles.buttonDisabled,
            ]}
            disabled={hasInsufficientBalance || isSubmitting}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Please wait..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: "#9f9f9fff",
    opacity: 0.6,
  },
  label: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(8),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9f9f9fff",
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    marginBottom: normalize(10),
    gap: 5,
  },
  dollarSign: {
    fontSize: normalize(26),
    fontFamily: getFontFamily("800"),
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
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    marginBottom: normalize(9),
    color: COLORS.primary,
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
    color: "#0a0a0aff",
  },
  optionLogo: {
    width: 30,
    height: 30,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "#cdcdcdff",
  },
  balance: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("700"),
    paddingVertical: 3,
  },
  fee: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    marginBottom: normalize(4),
  },
  rate: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("700"),
    marginBottom: normalize(4),
  },
  min: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("700"),
    marginBottom: normalize(4),
    color: "black",
  },
  note: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: normalize(10),
  },
  ngn: {
    color: "#fff",
    fontSize: normalize(22),
    fontFamily: getFontFamily("900"),
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: normalize(208),
    alignItems: "center",
    marginTop: 20,
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
    padding: 10,
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
    fontFamily: getFontFamily("700"),
    textAlign: "center",
  },
});
