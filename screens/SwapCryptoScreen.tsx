import React, { useMemo, useState } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatAmount } from "../libs/formatNumber";
import useAxios from "../api/axios";
import { useQuery } from "@tanstack/react-query";
import CustomLoading from "../components/CustomLoading";
import { SelectInput } from "../components/SelectInputField";

// Validation schema
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
  const route: any = useRoute();
  const { apiGet } = useAxios();
  const { assetId } = route.params || {};
  const [btcEquivalent, setBtcEquivalent] = useState("0.00000");
  const [ngnAmount, setNgnAmount] = useState("0.00");

  const fetchAssets = async (): Promise<any[]> => {
    try {
      const response = await apiGet("/wallets/user/");
      return response?.data?.data ?? [];
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      throw error;
    }
  };

  const {
    data,
    isFetching: isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["users-assets"],
    queryFn: fetchAssets,
    refetchOnWindowFocus: true,
  });

  const options = useMemo(
    () =>
      Array.isArray(data)
        ? data.map(asset => ({
            label: asset?.asset_name,
            value: asset?.asset_id,
            symbol: asset?.symbol,
            logo_url: asset?.asset_logo_url,
            buy_rate: asset?.buy_rate,
            sell_rate: asset?.sell_rate,
            market_price: asset?.market_current_value,
            balance: asset?.balance,
          }))
        : [],
    [data],
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { amount: 0 },
    mode: "onChange",
  });

  const navigation: any = useNavigation();
  const fromAssetId = watch("from_asset");
  const toAssetId = watch("to_asset");
  const amount = watch("amount");
  const fromAsset = options.find(opt => opt.value === fromAssetId);
  const toAsset = options.find(opt => opt.value === toAssetId);

  // From asset balance
  const balance = Number(fromAsset?.balance ?? 0);
  const price = Number(fromAsset?.market_price ?? 0);
  const symbol = fromAsset?.symbol ?? "";

  const updateConversion = (value: any) => {
    const usd = parseFloat(value);
    if (!isNaN(usd) && fromAsset && toAsset) {
      // Amount of "from" coin using its market price
      const fromCoinAmount = usd / parseFloat(fromAsset.market_price ?? "1");

      // Convert USD to NGN using sell_rate of fromAsset
      const ngn = usd * parseFloat(fromAsset.sell_rate ?? "1");

      // Equivalent "to" coin: divide NGN by toAsset market price
      const toCoinAmount = ngn / parseFloat(toAsset.market_price ?? "1");

      setBtcEquivalent(fromCoinAmount.toFixed(8)); // from asset amount
      setNgnAmount(toCoinAmount.toFixed(8)); // to asset amount
    } else {
      setBtcEquivalent("0.00000000");
      setNgnAmount("0.00000000");
    }
  };

  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
      url: "/wallets/user/swap-crypto",
    };

    navigation.navigate("ConfirmTransaction" as never, {
      payload,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "right", "left"]}>
      <ScrollView
        contentContainerStyle={{
          flex: 1,
        }}
        refreshControl={
          <RefreshControl onRefresh={refetch} refreshing={isRefetching} />
        }
      >
        <View style={styles.container}>
          <View>
            <View>
              <SelectInput
                control={control}
                name="from_asset"
                label="Select asset you want to convert from"
                options={options}
                placeholder="Select an asset"
                title="Select an asset"
              />
            </View>
            <View>
              <SelectInput
                control={control}
                name="to_asset"
                label="Select asset you want to convert to"
                options={options}
                placeholder="Select an asset"
                title="Select an asset"
              />
            </View>
            <View>
              <Text style={styles.label}>
                Enter the amount you want to sell
              </Text>

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
                      updateConversion(val);
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
                Rate at which we get our US Dollar
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={[styles.balance, { fontFamily: getFontFamily("400") }]}
                >
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
                Rate: {formatAmount(fromAsset?.buy_rate ?? 0)}/$
              </Text>
              <Text style={styles.min}>
                Network Fee: {formatAmount(amount * 0.01, false, "USD")}
              </Text>
            </View>

            <View style={styles.paymentContainer}>
              <Text style={styles.note}>
                Rate at which we get our US Dollar
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.ngn}>You will get:</Text>
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
