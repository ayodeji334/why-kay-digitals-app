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
import { TradeIntent } from "./Rates";
import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
import { useAssets } from "../hooks/useAssets";
import { useFiatBalance } from "../hooks/useFiatBalance";
import { useAuthStore } from "../stores/authSlice";
import KYCStatusScreen from "../components/KYCStatusScreen";

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
  const user = useAuthStore(state => state.user);
  // const isAlreadyVerified = useMemo(
  //   () =>
  //     user?.bvn_verification_status === "VERIFIED" ||
  //     user?.nin_verification_status === "VERIFIED",
  //   [user.bvn_verification_status, user?.nin_verification_status],
  // );

  const { assets } = useAssets();

  const assetDetails = useMemo(
    () =>
      Array.isArray(assets)
        ? assets.find(a => a.uuid === selectedAssetUuid)
        : null,
    [assets],
  );

  const usd = watch("amount");

  const { assetValueEquivalent, ngnAmount } = useMemo(() => {
    if (!isNaN(usd) && assetDetails) {
      const marketValue = parseFloat(assetDetails.market_current_value || 0);
      const sellRate = parseFloat(assetDetails.sell_rate || 0);

      let cryptoAmount = 0;
      let ngn = 0;

      if (marketValue > 0) {
        cryptoAmount = usd / marketValue;
      }

      if (sellRate > 0) {
        ngn = usd * sellRate;
      }

      return { assetValueEquivalent: cryptoAmount, ngnAmount: ngn };
    }
    return { assetValueEquivalent: 0, ngnAmount: 0 };
  }, [usd, assetDetails]);

  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
      url: "/wallets/user/buy-crypto",
    };

    navigation.navigate("ConfirmTransaction" as never, {
      payload,
    });
  };

  // if (!isAlreadyVerified) {
  //   return <KYCStatusScreen />;
  // }

  const hasInsufficientBalance = useMemo(() => {
    if (!ngnAmount) return false;
    return ngnAmount > fiatBalance;
  }, [ngnAmount, fiatBalance]);

  useEffect(() => {
    if (intent?.amount) {
      const numericAmount = Number(intent.amount);
      if (!isNaN(numericAmount)) {
        setDisplayAmount(formatWithCommas(numericAmount.toString()));
      }
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
                  Exchange Rate, and Network Fee Breakdown
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
                    {assetDetails?.symbol} Exchange Rate:
                  </Text>
                  <Text style={styles.balance}>
                    {formatAmount(
                      assetDetails?.sell_rate ??
                        assetDetails?.latest_sell_rate ??
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
                    {assetDetails?.symbol} Network Fee:
                  </Text>
                  <Text style={styles.balance}>
                    {formatAmount(2, { currency: "USD" })}
                  </Text>
                </View>
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
                  <Text style={styles.ngn}>{formatAmount(ngnAmount)}</Text>
                </View>
              </View>
            </View>

            {hasInsufficientBalance && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  Insufficient balance! Your current fiat balance is{" "}
                  {formatAmount(fiatBalance, { currency: "USD" })} which is less
                  than {formatAmount(ngnAmount || 0, { currency: "USD" })}{" "}
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
    width: 32,
    height: 32,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "#cdcdcdff",
  },
  balance: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(4),
  },
  fee: {
    fontSize: normalize(18),
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
  ngn: {
    color: "#fff",
    fontSize: normalize(22),
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
    padding: 10,
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
