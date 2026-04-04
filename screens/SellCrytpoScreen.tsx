import React, { useCallback, useEffect, useMemo, useState } from "react";
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

type CryptoSellScreenParams = {
  CryptoSell: {
    intent: TradeIntent;
  };
};

type FeeBreakdown = {
  coinAmount: string;
  grossUsd: number;
  netAmountUsd: string;
  netNgn: string;
  currentSellRate: number;
  currentMarketPrice: number;
};

const STABLECOINS = ["USDT", "USDC"];

const schema = Yup.object().shape({
  asset_id: Yup.string().required("Select the crypto you want to sell"),
  amount: Yup.number()
    .typeError("Enter a valid amount")
    .min(1, "The amount is too small. The minimum is 1 USD")
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
  const [latestNgnAmount, setLatestNgnAmount] = useState("0.00");
  const selectedAssetUuid = intent.assetId ?? "";

  const {
    control,
    watch,
    handleSubmit,
    setValue,
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
    queryKey: ["asset-detail", selectedAssetUuid],
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
  const isStablecoin = STABLECOINS.includes(symbol.toUpperCase());

  const balanceUsd = useMemo(() => {
    return Number(assetDetails?.balance ?? "0") * marketPrice;
  }, [assetDetails?.balance, marketPrice]);

  const maxSellableUsd = useMemo(() => {
    if (isStablecoin) return balanceUsd;
    return balanceUsd / (1 + FEE_RATE);
  }, [balanceUsd, isStablecoin]);

  const onSubmit = async (values: any) => {
    try {
      const res = await apiGet(`/crypto-assets/${selectedAssetUuid}/rates`);
      const latestRates = res?.data?.asset ?? null;

      if (!latestRates) {
        showError("Unable to fetch latest rates.");
        return;
      }

      const currentSellRate = parseFloat(latestRates.sell_rate ?? "0");
      const usedSellRate = parseFloat(
        latestFeeBreakdown?.currentSellRate ?? "0",
      );

      const sellRateChanged =
        currentSellRate > 0 && currentSellRate !== usedSellRate;

      if (sellRateChanged) {
        const recalculated = calculateSellFeeBreakdown(
          values.amount,
          marketPrice,
          currentSellRate,
        );

        setLatestFeeBreakdown(recalculated.feeBreakdown);
        setLatestNgnAmount(recalculated.ngnAmount);

        showError(
          "Sell rate has changed. Prices recalculated — please review before continuing.",
        );

        return;
      }

      const payload = {
        ...values,
        url: "/wallets/user/sell-crypto",
      };

      navigation.navigate("ConfirmTransaction" as never, { payload });
    } catch (error) {
      showError("Error checking rates. Try again.");
    }
  };

  const hasInsufficientBalance = useMemo(() => {
    if (!amount || !assetDetails) return false;
    return amount > maxSellableUsd;
  }, [amount, maxSellableUsd]);

  const insufficientBalanceMessage = useMemo(() => {
    if (!hasInsufficientBalance) return null;
    return `You can only sell ${formatAmount(maxSellableUsd, {
      currency: "USD",
    })} of your balance`;
  }, [hasInsufficientBalance, maxSellableUsd, symbol]);

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

  useEffect(() => {
    if (
      assetDetails?.sell_rate &&
      amount > 0 &&
      marketPrice > 0 &&
      assetDetails
    ) {
      const recalculated = calculateSellFeeBreakdown(
        amount,
        marketPrice,
        latestFeeBreakdown?.currentSellRate ??
          parseFloat(assetDetails.sell_rate),
      );

      setLatestFeeBreakdown(recalculated.feeBreakdown);
      setLatestNgnAmount(recalculated.ngnAmount);
    }
  }, [
    assetDetails?.sell_rate,
    amount,
    latestFeeBreakdown?.currentSellRate,
    marketPrice,
    assetDetails,
  ]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "right", "left"]}>
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
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

                {/* <Text style={styles.approx}>
                  Approximately {assetValueEquivalent} {symbol}
                </Text> */}

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
                        { currency: "USD" },
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

              {hasInsufficientBalance && (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningText}>
                    {insufficientBalanceMessage}
                  </Text>
                </View>
              )}
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
    fontFamily: getFontFamily("700"),
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
