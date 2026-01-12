import React, { useCallback, useEffect, useState } from "react";
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
import CustomLoading from "../components/CustomLoading";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import { TradeIntent } from "./Rates";
import NoWalletAddress from "../components/NoWalletAddress";
import { showError } from "../utlis/toast";

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
  const [assetValueEquivalent, setAssetValueEquivalent] = useState("0.00000");
  const [ngnAmount, setNgnAmount] = useState("₦0.00");
  const { apiGet, post } = useAxios();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedChain, setSelectedChain] = useState<any | null>(null);

  const selectedAssetUuid = intent.assetId ?? "";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: parseFloat(intent?.amount as string) ?? 0,
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
      try {
        const res = await apiGet(`/wallets/user/${selectedAssetUuid}`);
        return res?.data?.data;
      } catch (error) {
        console.error("Failed to fetch asset details:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: true,
    enabled: !!selectedAssetUuid,
  });

  const balance = Number(assetDetails?.balance ?? 0);
  const price = Number(assetDetails?.market_current_value ?? 0);
  const symbol = assetDetails?.symbol ?? "";

  const updateConversion = useCallback(
    (value: any) => {
      const usd = parseFloat(value);
      if (!isNaN(usd) && assetDetails) {
        const marketValue = parseFloat(
          assetDetails.market_current_value ?? "0",
        );
        const sellRate = parseFloat(assetDetails.sell_rate ?? "0");

        if (marketValue > 0) {
          const cryptoAmount = usd / marketValue;
          setAssetValueEquivalent(cryptoAmount.toFixed(8));
        } else {
          setAssetValueEquivalent("0.00000000");
        }

        if (sellRate > 0) {
          const ngn = usd * sellRate;
          setNgnAmount(`${formatAmount(ngn)}`);
        } else {
          setNgnAmount("₦0.00");
        }
      } else {
        setAssetValueEquivalent("0.00000000");
        setNgnAmount("₦0.00");
      }
    },
    [assetDetails],
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

  const availableChains = Array.isArray(assetDetails?.available_chains)
    ? assetDetails.available_chains
    : [];

  const handleGenerateWallet = async () => {
    if (!selectedChain) return;

    setIsGenerating(true);

    try {
      await post(`wallets/user/${selectedAssetUuid}/generate-wallet`, {
        chainType: selectedChain.chain,
      });

      setSelectedChain(null);
      refetch();
    } catch (error) {
      showError("Failed to generate wallet address");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const defaultAmount = parseFloat(intent?.amount as string) ?? 0;
    if (defaultAmount > 0) {
      updateConversion(defaultAmount);
    }
  }, [assetDetails, intent?.amount, updateConversion]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "right", "left"]}>
      <ScrollView
        contentContainerStyle={{
          flex: 1,
        }}
      >
        {!assetDetails?.wallet_id ? (
          <NoWalletAddress
            availableChains={availableChains}
            isGenerating={isGenerating}
            onGenerateWallet={handleGenerateWallet}
            onSelectChain={chain => setSelectedChain(chain)}
            selectedChain={selectedChain}
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
                      {assetDetails?.symbol} Balance
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
                    Rate:{" "}
                    {formatAmount(
                      assetDetails?.sell_rate ??
                        assetDetails?.latest_sell_rate ??
                        0,
                    )}
                    /$
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
              style={styles.button}
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
    fontSize: normalize(23),
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
