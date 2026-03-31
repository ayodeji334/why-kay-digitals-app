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

type CryptoBuyScreenParams = {
  CryptoBuy: {
    intent: TradeIntent;
  };
};

const schema = Yup.object().shape({
  asset_id: Yup.string().required("Select the crypto you want to convert from"),
  amount: Yup.number()
    .typeError("Enter a valid amount")
    .moreThan(0, "Must be more than 0")
    .required("Amount is required"),
});

export default function CryptoBuyScreen() {
  const route = useRoute<RouteProp<CryptoBuyScreenParams, "CryptoBuy">>();
  const { intent } = route.params;
  const navigation: any = useNavigation();
  const selectedAssetUuid = intent.assetId ?? "";
  const [displayAmount, setDisplayAmount] = useState("");
  const { fiatBalance } = useFiatBalance();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
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

  const amount = watch("amount");

  const { ngnAmount, feeBreakdown } = useMemo(() => {
    if (!isNaN(amount) && assetDetails && amount > 0) {
      const marketValue = parseFloat(assetDetails.market_current_value ?? "0");
      const buyRate = parseFloat(
        assetDetails.buy_rate ?? assetDetails.latest_buy_rate ?? "0",
      );
      const symbol = assetDetails.symbol ?? "";

      const stablecoins = ["USDT", "USDC"];
      const isStablecoin = stablecoins.includes(symbol.toUpperCase());

      let cryptoAmount = "0.00000000";
      let ngn = "0.00";
      let feeBreakdown = null;

      if (marketValue > 0) {
        const coinAmount = amount / marketValue;
        const platformFeeUsd = isStablecoin ? 0 : amount * 0.001;
        const platformFeeCoin = isStablecoin ? 0 : coinAmount * 0.001;
        const totalCostUsd = amount + platformFeeUsd; // buying costs more
        const totalCostNgn = buyRate > 0 ? totalCostUsd * buyRate : 0;

        cryptoAmount = coinAmount.toFixed(8);

        if (buyRate > 0) {
          ngn = formatAmount(totalCostNgn);
        }

        feeBreakdown = {
          grossUsd: amount,
          coinAmount: coinAmount.toFixed(8),
          platformFeeUsd: platformFeeUsd.toFixed(2),
          platformFeeCoin: platformFeeCoin.toFixed(8),
          totalCostUsd: totalCostUsd.toFixed(2),
          totalCostNgn: buyRate > 0 ? totalCostNgn : "0.00",
          isStablecoin,
        };
      }

      return {
        assetValueEquivalent: cryptoAmount,
        ngnAmount: ngn,
        feeBreakdown,
      };
    }

    return {
      assetValueEquivalent: "0.00000000",
      ngnAmount: "0.00",
      feeBreakdown: null,
    };
  }, [amount, assetDetails]);

  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
      url: "/wallets/user/buy-crypto",
    };

    navigation.navigate("ConfirmTransaction" as never, {
      payload,
    });
  };

  const hasInsufficientBalance = useMemo(() => {
    if (!feeBreakdown?.totalCostNgn) return false;
    return feeBreakdown?.totalCostNgn > fiatBalance;
  }, [feeBreakdown?.totalCostNgn, fiatBalance]);

  useEffect(() => {
    if (intent?.amount) {
      const numericAmount = Number(intent.amount);
      if (!isNaN(numericAmount)) {
        setDisplayAmount(formatWithCommas(numericAmount.toString()));
      }

      setValue("amount", numericAmount);
    }
  }, [intent?.amount]);

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

              {hasInsufficientBalance && (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningText}>
                    Insufficient balance! Your current fiat balance is{" "}
                    {formatAmount(fiatBalance, { currency: "NGN" })} which is
                    less than {ngnAmount}{" "}
                  </Text>
                </View>
              )}
              {/* <Text style={styles.approx}>
                Approximately {assetValueEquivalent} {assetDetails?.symbol}
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
                      assetDetails?.buy_rate ??
                        assetDetails?.latest_buy_rate ??
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
                      Number(assetDetails?.market_current_value) || 0,
                      { currency: "USD" },
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
            disabled={hasInsufficientBalance}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.buttonText}>Continue</Text>
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
