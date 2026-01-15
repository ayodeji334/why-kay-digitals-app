import React, { useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigation } from "@react-navigation/native";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatAmount } from "../libs/formatNumber";
import { useQueries } from "@tanstack/react-query";
import CustomLoading from "../components/CustomLoading";
import { SelectInput } from "../components/SelectInputField";
import useAxios from "../hooks/useAxios";

const schema = Yup.object().shape({
  from_asset: Yup.string().required(
    "Select the crypto you want to convert from",
  ),
  to_asset: Yup.string()
    .required("Select the crypto you want to convert to")
    .test(
      "different-asset",
      "Asset to convert to must be different from asset to convert from",
      function (value) {
        const { from_asset } = this.parent;
        return value !== from_asset;
      },
    ),
  amount: Yup.number()
    .typeError("Enter a valid amount")
    .min(0, "Must be more than 0")
    .required("Amount is required"),
});

export default function CryptoSwapScreen() {
  const { apiGet } = useAxios();

  const fetchAssets = async (): Promise<any[]> => {
    try {
      const response = await apiGet("/wallets/user");
      return response?.data?.data ?? [];
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      throw error;
    }
  };

  const fetchAvailableAssets = async (): Promise<any> => {
    try {
      const response = await apiGet("/crypto-assets");
      return response.data?.data?.assets;
    } catch (error) {
      throw error;
    }
  };

  const queries = useQueries({
    queries: [
      {
        queryKey: ["assets"],
        queryFn: fetchAvailableAssets,
      },
      {
        queryKey: ["user-assets"],
        queryFn: fetchAssets,
      },
    ],
  });

  const availableAssets = queries[0].data ?? [];
  const userAssets = queries[1].data ?? [];
  const isLoading = queries.some(q => q.isLoading);

  const options = useMemo(
    () =>
      Array.isArray(userAssets)
        ? userAssets.map(asset => ({
            id: asset?.asset_id ?? asset?.uuid ?? "",
            label: asset?.asset_name ?? asset?.name ?? "",
            value: asset?.asset_id ?? asset?.uuid ?? "",
            symbol: asset?.symbol ?? "",
            logo_url: asset?.asset_logo_url ?? asset?.logo ?? "",
            buy_rate: asset?.buy_rate,
            sell_rate: asset?.sell_rate,
            market_price: asset?.market_current_value ?? asset?.price ?? 0,
            balance: asset?.balance,
          }))
        : [],
    [userAssets],
  );

  const availableAssetOptions = useMemo(
    () =>
      Array.isArray(availableAssets)
        ? availableAssets.map(asset => ({
            label: asset?.asset_name ?? asset?.name ?? "",
            value: asset?.asset_id ?? asset?.uuid ?? "",
            symbol: asset?.symbol ?? "",
            id: asset?.asset_id ?? asset?.uuid ?? "",
            logo_url:
              asset?.asset_logo_url ?? asset?.logo ?? asset?.logo_url ?? "",
            buy_rate: asset?.buy_rate,
            sell_rate: asset?.sell_rate,
            market_price: asset?.market_current_value ?? asset?.price ?? 0,
            balance: asset?.balance,
          }))
        : [],
    [availableAssets],
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { amount: 0, from_asset: "", to_asset: "" },
    mode: "onChange",
  });

  const navigation: any = useNavigation();
  const fromAssetId = watch("from_asset");
  const toAssetId = watch("to_asset");
  const amount = watch("amount");
  const fromAsset = options.find(opt => opt.value === fromAssetId);
  const toAsset = availableAssetOptions.find(opt => opt.value === toAssetId);

  // From asset balance
  const balance = Number(fromAsset?.balance ?? 0);
  const price = Number(fromAsset?.market_price ?? 0);
  const symbol = fromAsset?.symbol ?? "";

  const { btcEquivalent, ngnAmount } = useMemo(() => {
    const usd = Number(amount);

    if (!usd || !fromAsset || !toAsset) {
      return {
        btcEquivalent: "0.00000000",
        ngnAmount: "0.00000000",
      };
    }

    const fromMarketPrice = Number(fromAsset.market_price ?? 1);
    const sellRate = Number(fromAsset.sell_rate ?? 1);
    const toMarketPrice = Number(toAsset.market_price ?? 1);
    const fromCoinAmount = usd / fromMarketPrice;

    if (!toMarketPrice || toMarketPrice <= 0) {
      return {
        btcEquivalent: fromCoinAmount.toFixed(8),
        ngnAmount: "0.00000000", // fallback
      };
    }

    // USD → NGN → To coin
    const ngn = usd * sellRate;
    const toCoinAmount = ngn / toMarketPrice;

    return {
      btcEquivalent: fromCoinAmount.toFixed(8),
      ngnAmount: toCoinAmount.toFixed(8),
    };
  }, [amount, fromAsset, toAsset]);

  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
      url: "/wallets/user/swap-crypto",
    };
    navigation.navigate("ConfirmTransaction" as never, {
      payload,
    });
  };

  const onRefresh = async () => {
    await Promise.all(queries.map(q => q.refetch()));
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "right", "left"]}>
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          backgroundColor: "white",
        }}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={isLoading} />
        }
      >
        <View style={styles.container}>
          <View>
            <View style={{ marginBottom: 4 }}>
              <SelectInput
                control={control}
                name="from_asset"
                label="Select asset(coin) you want to convert from"
                options={options}
                placeholder="Select an asset(coin)"
                title="Select an asset"
              />
            </View>
            <View style={{ marginVertical: 4 }}>
              <SelectInput
                control={control}
                name="to_asset"
                label="Select asset(coin) you want to convert to"
                options={availableAssetOptions}
                placeholder="Select an asset(coin)"
                title="Select an asset"
              />
            </View>
            <View style={{ marginVertical: 4 }}>
              <Text style={styles.label}>Amount (USD)</Text>

              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="$0.0 USD"
                    keyboardType="numeric"
                    onBlur={onBlur}
                    onChangeText={val => {
                      onChange(val);
                    }}
                    value={value.toString()}
                  />
                )}
              />
              {errors.amount && (
                <Text style={styles.error}>{errors.amount.message}</Text>
              )}
              <Text style={styles.approx}>
                Approximately {btcEquivalent} {fromAsset?.symbol}
              </Text>
            </View>
            <View
              style={{
                marginVertical: 10,
                backgroundColor: "#EFF7EC",
                padding: 10,
                borderRadius: 10,
              }}
            >
              <Text style={[styles.note, { color: "black" }]}>
                Your balance & rate
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 5,
                }}
              >
                <Text style={[styles.balance]}>
                  {fromAsset?.symbol} Balance
                </Text>
                <Text style={styles.balance}>
                  {`${balance} ${symbol} = ${formatAmount(
                    balance * price,
                    false,
                    "USD",
                  )}`}
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
                Exchange rate: {formatAmount(fromAsset?.buy_rate ?? 0)}/$
              </Text>
              <Text style={styles.min}>
                Estimated Network Fee:{" "}
                {formatAmount(amount * 0.01, false, "USD")}
              </Text>
            </View>
            <View style={styles.paymentContainer}>
              <Text style={styles.note}>You’ll receive</Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.ngn}>Estimated amount:</Text>
                <Text style={styles.ngn}>
                  {ngnAmount} {toAsset?.symbol}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
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
  label: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    marginBottom: normalize(8),
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: normalize(8),
    padding: normalize(16),
    fontSize: normalize(26),
    fontFamily: getFontFamily("700"),
    marginBottom: normalize(10),
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
  balance: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(4),
  },
  fee: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(4),
  },
  rate: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(4),
  },
  min: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(4),
    color: COLORS.primary,
  },
  note: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("700"),
    color: "#ffffff",
    marginBottom: normalize(10),
  },
  ngn: {
    color: "#fff",
    fontSize: normalize(25),
    fontFamily: getFontFamily("800"),
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: normalize(14),
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
});
