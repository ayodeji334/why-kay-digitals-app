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
import { useNavigation } from "@react-navigation/native";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatAmount } from "../libs/formatNumber";
import { useQuery } from "@tanstack/react-query";
import CustomLoading from "../components/CustomLoading";
import { SelectInput } from "../components/SelectInputField";
import useAxios from "../hooks/useAxios";
import { useWalletStore } from "../stores/walletSlice";

export const formatWithCommas = (value: string) => {
  if (!value) return "";

  // Remove all non-digit characters except decimal point
  let cleaned = value.replace(/[^\d.]/g, "");

  // Ensure only one decimal point
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    // If multiple decimal points, keep only the first one
    cleaned = parts[0] + "." + parts.slice(1).join("");
  }

  // Split into whole and decimal parts
  const [whole, decimal] = cleaned.split(".");

  // Handle whole number part
  let formattedWhole = "";
  if (whole) {
    // Remove leading zeros (but keep at least one digit)
    const trimmedWhole = whole.replace(/^0+/, "");
    if (trimmedWhole === "" && (decimal !== undefined || value.includes("."))) {
      formattedWhole = "0";
    } else if (trimmedWhole === "") {
      formattedWhole = "";
    } else {
      // Add thousand separators
      formattedWhole = parseInt(trimmedWhole, 10).toLocaleString("en-US");
    }
  }

  // Handle decimal part
  if (decimal !== undefined) {
    return `${formattedWhole || "0"}.${decimal.slice(0, 8)}`;
  }

  // If user typed a decimal point but no decimal digits yet
  if (value.includes(".") && decimal === undefined) {
    return `${formattedWhole || "0"}.`;
  }

  return formattedWhole;
};

export const parseToNumber = (value: string): number => {
  const numeric = value.replace(/,/g, "");
  return Number(numeric) || 0;
};

const schema = Yup.object().shape({
  from_asset: Yup.string().required(
    "Select the crypto you want to convert from",
  ),
  to_asset: Yup.string()
    .required("Select the crypto you want to convert to")
    .test(
      "different-asset",
      "You cannot convert to the same asset",
      function (value) {
        const { from_asset } = this.parent;
        return value !== from_asset;
      },
    ),
  amount: Yup.number()
    .typeError("Enter a valid amount")
    .min(0.01, "Amount must be at least 0.01")
    .required("Amount is required"),
});

export default function CryptoSwapScreen() {
  const { apiGet } = useAxios();
  const [displayAmount, setDisplayAmount] = useState("");
  const navigation: any = useNavigation();
  const availableAssets = useWalletStore(state => state.wallets);

  const fetchAssets = async (): Promise<any[]> => {
    try {
      const response = await apiGet("/crypto-assets/available");
      return (
        response.data?.data?.map((asset: any) => {
          return {
            id: asset.asset_id,
            uuid: asset.asset_id,
            name: asset.asset_name,
            symbol: asset.symbol,
            logo_url: asset.logo_url,
            balance: asset.market_price ?? 0,
            rate: parseFloat(asset?.sell_rate ?? 0),
            change: Math.random() > 0.5 ? "up" : "down",
            changePercentage: (Math.random() * 20 - 10).toFixed(2),
          };
        }) ?? []
      );
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      throw error;
    }
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["assets"],
    queryFn: fetchAssets,
  });

  const options = useMemo(
    () =>
      (data &&
        data.map(option => ({
          ...option,
          label: option.name,
          value: option.id,
        }))) ||
      [],
    [data],
  );

  const userWallets = useMemo(
    () =>
      Array.isArray(availableAssets)
        ? availableAssets.map(asset => ({
            ...asset,
            label: asset?.asset_name ?? asset?.name ?? "",
            value: asset?.asset_id ?? asset?.uuid ?? "",
            symbol: asset?.symbol ?? "",
            logo_url: asset?.logo ?? "",
          }))
        : [],
    [availableAssets],
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { amount: 0 },
    mode: "onChange",
  });

  const fromAssetId = watch("from_asset");
  const toAssetId = watch("to_asset");
  const amount = watch("amount");
  const fromAsset = userWallets.find(opt => opt.value === fromAssetId);
  const toAsset = options.find(opt => opt.value === toAssetId);
  const balance = Number(fromAsset?.balance ?? 0);
  const price = Number(fromAsset?.market_price ?? 0);
  const symbol = fromAsset?.symbol ?? "";

  const { fromAmount, toCoinAmount } = useMemo(() => {
    if (!amount || !fromAsset || !toAsset) {
      return {
        fromAmount: "0.00000000",
        toCoinAmount: "0.00000000",
      };
    }

    const fromPrice = Number(fromAsset.market_price ?? 1);
    const toPrice = Number(toAsset.market_price ?? 1);

    if (!fromPrice || !toPrice) {
      return {
        fromAmount: "0.00000000",
        toCoinAmount: "0.00000000",
      };
    }

    return {
      fromAmount: (amount / fromPrice).toFixed(8),
      toCoinAmount: (amount / toPrice).toFixed(8),
    };
  }, [amount, fromAsset, toAsset]);

  // Calculate if user has insufficient balance
  const insufficientBalance = useMemo(() => {
    if (!fromAsset || !amount || amount <= 0) return false;

    const usdAmount = Number(amount);
    const userBalanceUSD = balance * price;

    return usdAmount > userBalanceUSD;
  }, [amount, balance, price, fromAsset]);

  // Calculate the required amount in the asset's own units
  const requiredAssetAmount = useMemo(() => {
    if (!fromAsset || !amount || amount <= 0) return "0";

    const fromMarketPrice = Number(fromAsset.market_price ?? 1);
    const usdAmount = Number(amount);

    return (usdAmount / fromMarketPrice).toFixed(8);
  }, [amount, fromAsset]);

  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
      amount: Number(values.amount),
      url: "/wallets/user/swap-crypto",
    };

    navigation.navigate("ConfirmTransaction" as never, {
      payload,
    });
  };

  const onRefresh = async () => {
    await refetch();
  };

  // Check if form can be submitted
  const canSubmit = isValid && !insufficientBalance && amount > 0;

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
                options={userWallets}
                placeholder="Select an asset(coin)"
                title="Select an asset"
              />
            </View>
            <View style={{ marginVertical: 4 }}>
              <SelectInput
                control={control}
                name="to_asset"
                label="Select asset(coin) you want to convert to"
                options={options}
                placeholder="Select an asset(coin)"
                title="Select an asset"
              />
            </View>
            <View style={{ marginVertical: 4 }}>
              <Text style={styles.label}>Amount (USD)</Text>
              <Controller
                control={control}
                name="amount"
                render={({ field: { onBlur } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.dollarSign}>$</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0.00"
                      placeholderTextColor="#999"
                      keyboardType="decimal-pad"
                      onBlur={onBlur}
                      value={displayAmount}
                      onChangeText={text => {
                        const formatted = formatWithCommas(text);
                        const numeric = parseToNumber(formatted);

                        setDisplayAmount(formatted);
                        setValue("amount", numeric, {
                          shouldValidate: true,
                        });
                      }}
                    />
                  </View>
                )}
              />

              {errors.amount && (
                <Text style={styles.error}>{errors.amount.message}</Text>
              )}
              {fromAsset && amount > 0 && (
                <Text style={styles.approx}>
                  Approximately {fromAmount} {fromAsset?.symbol}
                </Text>
              )}
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
                Your curent balance market value & fee
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 5,
                }}
              >
                <Text style={[styles.balance]}>
                  {fromAsset?.symbol || "Asset"} Wallet Balance
                </Text>
                <Text style={styles.balance}>
                  {fromAsset
                    ? `${balance} ${symbol} = ${formatAmount(
                        balance * price,
                        false,
                        "USD",
                      )}`
                    : "Select an asset"}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.min}>
                Estimated Network Fee:{" "}
                {formatAmount(amount * 0.01, false, "USD")}
              </Text>
            </View>
            <View style={styles.paymentContainer}>
              <Text style={styles.note}>You'll receive</Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.ngn}>Estimated amount:</Text>
                <Text style={styles.ngn}>
                  {toCoinAmount} {toAsset?.symbol || ""}
                </Text>
              </View>
            </View>
            {/* Insufficient balance warning */}
            {insufficientBalance && fromAsset && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  Insufficient balance! You need {requiredAssetAmount}{" "}
                  {fromAsset.symbol} but you only have {balance}{" "}
                  {fromAsset.symbol}
                </Text>
              </View>
            )}

            <View style={{ paddingVertical: 10 }}>
              <Text
                style={{
                  color: "#3b3b3bff",
                  fontFamily: getFontFamily("400"),
                  textAlign: "center",
                }}
              >
                Note: Cryptocurrency prices are volatile. Estimated amounts may
                change due to market fluctuations between initiating and
                completing your swap. Final conversion rates are determined at
                execution time. By proceeding, you acknowledge and accept these
                market risks.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={!canSubmit}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
}

// Styles remain the same...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: normalize(20),
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  label: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
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
    paddingVertical: normalize(16),
    fontSize: normalize(26),
    fontFamily: getFontFamily("700"),
    color: "#000",
  },
  // input: {
  //   borderWidth: 1,
  //   borderColor: "#ccc",
  //   borderRadius: normalize(8),
  //   padding: normalize(16),
  //   fontSize: normalize(26),
  //   fontFamily: getFontFamily("700"),
  //   marginBottom: normalize(10),
  // },
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
  buttonDisabled: {
    backgroundColor: "#cccccc",
    opacity: 0.6,
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
    fontSize: normalize(14),
    fontFamily: getFontFamily("600"),
    textAlign: "center",
  },
});
