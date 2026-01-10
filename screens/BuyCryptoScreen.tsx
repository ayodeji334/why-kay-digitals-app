import React, { useCallback, useMemo, useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatAmount } from "../libs/formatNumber";
import CustomLoading from "../components/CustomLoading";
import { SelectInput } from "../components/SelectInputField";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";

// Validation schema
const schema = Yup.object().shape({
  asset_id: Yup.string().required("Select the crypto you want to convert from"),
  amount: Yup.number()
    .typeError("Enter a valid amount")
    .moreThan(0, "Must be more than 0")
    .required("Amount is required"),
});

export default function CryptoBuyScreen() {
  const navigation: any = useNavigation();
  const [btcEquivalent, setBtcEquivalent] = useState("0.00000");
  const [ngnAmount, setNgnAmount] = useState("₦0.00");
  const { apiGet } = useAxios();

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { amount: 0 },
    mode: "onChange",
  });

  const assestId = watch("asset_id");

  const fetchAssets = async (): Promise<any[]> => {
    try {
      const response = await apiGet("/wallets/user");
      // console.log(response);
      return response?.data?.data ?? [];
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      throw error;
    }
  };

  const { data, isFetching } = useQuery({
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

  const selectedAsset = useMemo(
    () => options.find(option => option.value === assestId),
    [options, assestId],
  );

  const balance = Number(selectedAsset?.balance ?? 0);
  const price = Number(selectedAsset?.market_price ?? 0);
  const symbol = selectedAsset?.symbol ?? "";

  const updateConversion = useCallback(
    (value: any) => {
      const usd = parseFloat(value);
      if (!isNaN(usd) && selectedAsset) {
        const marketValue = parseFloat(selectedAsset.market_price ?? "0");
        const sellRate = parseFloat(selectedAsset.sell_rate ?? "0");

        if (marketValue > 0) {
          const cryptoAmount = usd / marketValue;
          setBtcEquivalent(cryptoAmount.toFixed(8));
        } else {
          setBtcEquivalent("0.00000000");
        }

        if (sellRate > 0) {
          const ngn = usd * sellRate;
          setNgnAmount(`${formatAmount(ngn)}`);
        } else {
          setNgnAmount("₦0.00");
        }
      } else {
        setBtcEquivalent("0.00000000");
        setNgnAmount("₦0.00");
      }
    },
    [selectedAsset],
  );

  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
      url: "/wallets/user/buy-crypto",
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
      >
        <View style={styles.container}>
          <View>
            <View style={{ marginBottom: 10 }}>
              <SelectInput
                control={control}
                name="asset_id"
                label="Select asset you want to convert from"
                options={options}
                placeholder="Select an asset"
                title="Select an asset"
              />
            </View>
            <View>
              <Text style={styles.label}>Enter the amount you want to buy</Text>

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
                Approximately {btcEquivalent} {selectedAsset?.symbol}
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
                  Rate at which we get our US Dollar
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
                    {selectedAsset?.symbol} Balance
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
                  Rate: {formatAmount(selectedAsset?.sell_rate ?? 0)}/$
                </Text>
                <Text style={styles.min}>Network Fee: $0.00</Text>
              </View>

              <View style={styles.paymentContainer}>
                {/* <Text style={styles.note}>
                  Rate at which we get our US Dollar
                </Text> */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={styles.ngn}>You’re Paying:</Text>
                  <Text style={styles.ngn}>{ngnAmount}</Text>
                </View>
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
