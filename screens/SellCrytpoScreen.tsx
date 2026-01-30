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
import { TradeIntent } from "./Rates";
import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
import NoWallet from "../components/NoWallet";

type CryptoSellScreenParams = {
  CryptoSell: {
    intent: TradeIntent;
  };
};

const schema = Yup.object().shape({
  asset_id: Yup.string().required("Select the crypto you want to sell"),
  amount: Yup.number()
    .typeError("Enter a valid amount")
    .moreThan(0, "Must be more than 0")
    .required("Amount is required"),
});

export default function CryptoSellScreen() {
  const navigation: any = useNavigation();
  const route = useRoute<RouteProp<CryptoSellScreenParams, "CryptoSell">>();
  const { apiGet } = useAxios();
  const { intent } = route.params;
  const [displayAmount, setDisplayAmount] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  console.log(intent);

  const selectedAssetUuid = intent.assetId ?? "";

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: 0,
      asset_id: intent.assetId ?? "",
    },
    mode: "onChange",
  });

  const { data: assetDetails, refetch } = useQuery({
    queryKey: ["asset-detail", selectedAssetUuid],
    queryFn: async () => {
      if (!selectedAssetUuid) return null;
      try {
        const res = await apiGet(`/wallets/${selectedAssetUuid}`);
        return res?.data?.data ?? null;
      } catch (error) {
        console.error("Failed to fetch asset details:", error);
        throw error;
      }
    },
    enabled: !!selectedAssetUuid,
  });

  const amount = watch("amount");

  const { assetValueEquivalent, ngnAmount } = useMemo(() => {
    if (!isNaN(amount) && assetDetails) {
      const marketValue = parseFloat(assetDetails.market_current_value ?? "0");
      const sellRate = parseFloat(assetDetails.sell_rate ?? "0");
      let cryptoAmount = "0.00000000";
      let ngn = "0.00";
      if (marketValue > 0) {
        cryptoAmount = (amount / marketValue).toFixed(8);
      }
      if (sellRate > 0) {
        const nairaValue = amount * sellRate;
        ngn = `${formatAmount(nairaValue)}`;
      }
      return { assetValueEquivalent: cryptoAmount, ngnAmount: ngn };
    }
    return { assetValueEquivalent: "0.00000000", ngnAmount: "0.00" };
  }, [amount, assetDetails]);

  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
      url: "/wallets/user/sell-crypto",
    };
    navigation.navigate("ConfirmTransaction" as never, { payload });
  };

  const hasInsufficientBalance = useMemo(() => {
    if (!amount) return false;
    if (!assetDetails) return true;
    return amount > assetDetails?.balance * assetDetails?.market_current_value;
  }, [amount, assetDetails?.balance, assetDetails?.market_current_value]);

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
    }
  }, [intent?.amount]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

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
                <Text style={styles.approx}>
                  Approximately {assetValueEquivalent} {assetDetails?.symbol}
                </Text>
                <View
                  style={{
                    marginVertical: 10,
                    backgroundColor: "#EFF7EC",
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text style={[styles.note, { color: "black" }]}>
                    Wallet Balance, Exchange Rate, and Network Fee Breakdown
                  </Text>
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
                      Wallet balance:
                    </Text>
                    <Text style={styles.balance}>
                      {assetDetails?.balance || 0}
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
                      Wallet balance in USD:
                    </Text>
                    <Text style={styles.balance}>
                      {formatAmount(
                        Number(assetDetails?.balance) *
                          Number(assetDetails?.market_current_value) || 0,
                        false,
                        "USD",
                      )}
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
                      Exchange Rate:
                    </Text>
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
                    <Text
                      style={[
                        styles.balance,
                        { fontFamily: getFontFamily("800") },
                      ]}
                    >
                      Service Network Fee:
                    </Text>
                    <Text style={styles.balance}>
                      {formatAmount(2, false, "USD")}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={styles.rate}>
                    Rate:{" "}
                    {formatAmount(
                      assetDetails?.buy_rate ??
                        assetDetails?.latest_buy_rate ??
                        0,
                    )}
                    /$
                  </Text>
                  <Text style={styles.min}>Network Fee: $0.00</Text>
                </View>

                <View style={styles.paymentContainer}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.ngn}>You’ll be paid:</Text>
                    <Text style={styles.ngn}>{ngnAmount}</Text>
                  </View>
                </View>
              </View>

              {hasInsufficientBalance && (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningText}>
                    Insufficient balance! Your current balance worth is{" "}
                    {formatAmount(
                      Number(assetDetails?.balance) *
                        Number(assetDetails?.market_current_value) || 0,
                      false,
                      "USD",
                    )}{" "}
                    which is less than {formatAmount(amount, false, "USD")}
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

      {/* <CustomLoading loading={isFetching} /> */}
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
    borderRadius: normalize(8),
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
    paddingVertical: normalize(19),
    fontSize: normalize(26),
    fontFamily: getFontFamily("800"),
    color: "#000",
  },
  error: {
    color: "red",
    fontSize: normalize(14),
    fontFamily: getFontFamily("400"),
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
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#374151",
  },
  optionLogo: {
    width: 32,
    height: 32,
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
