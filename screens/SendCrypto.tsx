import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigation, RouteProp, useRoute } from "@react-navigation/native";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatAmount } from "../libs/formatNumber";
import CustomLoading from "../components/CustomLoading";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import { TradeIntent } from "./Rates";
import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
import TextInputField from "../components/TextInputField";
import NoWallet from "../components/NoWallet";

type CryptoSellScreenParams = {
  CryptoSell: {
    intent: TradeIntent;
  };
};

const schema = Yup.object().shape({
  amount: Yup.number()
    .typeError("Enter a valid amount")
    .positive("Amount must be greater than 0")
    .required("Amount is required"),
  wallet_address: Yup.string().required("Wallet address is required"),
  asset_id: Yup.string().required(),
});

export default function SendScreen() {
  const navigation: any = useNavigation();
  const route = useRoute<RouteProp<CryptoSellScreenParams, "CryptoSell">>();
  const { apiGet } = useAxios();
  const { intent } = route.params;
  const [btcEquivalent, setBtcEquivalent] = useState("0.00000000");
  const [displayAmount, setDisplayAmount] = useState("");
  const selectedAssetUuid = intent?.assetId ?? "";

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: parseFloat(intent?.amount ?? "0"),
      asset_id: intent?.assetId ?? "",
    },
    mode: "onChange",
  });

  const {
    data: assetDetails,
    isFetching,
    refetch,
  } = useQuery({
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

  const balance = Number(assetDetails?.balance ?? 0);
  const price = Number(assetDetails?.market_current_value ?? 0);
  const symbol = assetDetails?.symbol ?? "";
  const amount = watch("amount");

  const hasInsufficientBalance = useMemo(() => {
    if (!amount) return false;

    if (!assetDetails) return true;

    return amount > assetDetails.balance * assetDetails?.market_current_value;
  }, [amount, assetDetails]);

  const updateConversion = useCallback(
    (usd: number) => {
      if (!isNaN(usd) && assetDetails?.market_current_value) {
        const marketValue = Number(assetDetails.market_current_value);
        if (marketValue > 0) {
          const cryptoAmount = usd / marketValue;
          setBtcEquivalent(cryptoAmount.toFixed(8));
        } else {
          setBtcEquivalent("0.00000000");
        }
      } else {
        setBtcEquivalent("0.00000000");
      }
    },
    [assetDetails],
  );

  const canSubmit = isValid && hasInsufficientBalance && amount > 0;

  useEffect(() => {
    if (amount && amount > 0) {
      updateConversion(amount);
    } else {
      setBtcEquivalent("0.00000000");
    }
  }, [amount, updateConversion]);

  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
      url: "/wallets/user/withdraw-crypto",
    };
    navigation.navigate("ConfirmCryptoWithdrawTransaction" as never, {
      payload,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "right", "left"]}>
      <ScrollView contentContainerStyle={{ flex: 1 }}>
        {!assetDetails?.wallet_id ? (
          <NoWallet
            selectedAssetUuid={selectedAssetUuid}
            onSuccess={() => {
              refetch();
            }}
          />
        ) : (
          <View style={styles.container}>
            <View style={{ gap: 10 }}>
              <View>
                <Text style={styles.label}>
                  Enter the amount you want to send
                </Text>

                <Controller
                  control={control}
                  name="amount"
                  render={({ field: { onBlur, onChange } }) => (
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
                  Approximately {btcEquivalent} {assetDetails?.symbol}
                </Text>
              </View>

              <View style={{ marginVertical: 4 }}>
                <TextInputField
                  label="Wallet Address"
                  control={control}
                  name="wallet_address"
                  placeholder="Enter destination wallet address"
                />
              </View>

              <View
                style={{
                  backgroundColor: "#EFF7EC",
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={[styles.note, { color: "black" }]}>
                  {assetDetails?.symbol} Balance and Network Fee Breakdown
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
                    Wallet Balance in USD:
                  </Text>
                  <Text style={styles.balance}>
                    {`${balance} ${symbol} = ${formatAmount(balance * price, {
                      currency: "USD",
                    })}`}
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
                    Network Fee::
                  </Text>
                  <Text style={styles.balance}>
                    {formatAmount(2.0, { currency: "USD" })}
                  </Text>
                </View>
              </View>

              {hasInsufficientBalance && (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningText}>
                    Insufficient balance! You need {btcEquivalent}{" "}
                    {assetDetails?.symbol} but you only have {balance}{" "}
                    {assetDetails.symbol}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              disabled={canSubmit}
              style={[
                styles.button,
                {
                  backgroundColor: canSubmit
                    ? COLORS.fadePrimary
                    : COLORS.secondary,
                  borderRadius: 100,
                  paddingVertical: 16,
                  marginTop: 30,
                },
              ]}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CustomLoading loading={isFetching} />
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
  label: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    marginBottom: normalize(8),
  },
  error: {
    color: "red",
    fontSize: normalize(14),
    fontFamily: getFontFamily("400"),
    marginBottom: normalize(10),
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
  approx: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("700"),
    marginBottom: normalize(9),
    color: COLORS.primary,
  },
  balance: {
    fontSize: normalize(21),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(4),
  },
  rate: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(4),
  },
  min: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(4),
    color: "black",
  },
  note: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("700"),
    color: "#ffffff",
    marginBottom: normalize(15),
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
