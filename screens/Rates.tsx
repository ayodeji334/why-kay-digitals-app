import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import CustomLoading from "../components/CustomLoading";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SelectInput } from "../components/SelectInputField";
import { formatAmount, formatNumber } from "../libs/formatNumber";
import { useNavigation } from "@react-navigation/native";
import useAxios from "../hooks/useAxios";

export type TradeIntent = {
  assetId?: string;
  symbol?: string;
  action?: "buy" | "sell" | "deposit";
  source?: "home" | "rates" | "wallet";
  amount?: string;
  rate?: number;
};

export default function CryptoRatesScreen() {
  const [activeTab, setActiveTab] = useState("sell");
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [cryptoOptions, setCryptoOptions] = useState<Array<any>>([]);
  const [rateBreakdown, setRateBreakdown] = useState<string>("");
  const { apiGet } = useAxios();
  const navigation: any = useNavigation();

  const crypto: any = useMemo(
    () => cryptoOptions.find((c: any) => c.value === selectedCrypto),
    [selectedCrypto, cryptoOptions],
  );

  const currentRate: number = useMemo(() => {
    if (!amount || !selectedCrypto) return 0;

    if (!crypto || !crypto.rates) return 0;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return 0;

    const rate = crypto.rates.find((r: any) =>
      activeTab === "sell" ? r.type === "buy" : r.type === "sell",
    );

    if (!rate) return 0;

    const category = rate.categories.find(
      (cat: any) =>
        amountNum >= parseFloat(cat.min_amount) &&
        amountNum < parseFloat(cat.max_amount),
    );

    const rateValue = category
      ? parseFloat(category.value)
      : parseFloat(rate.default_value);

    setRateBreakdown(`$1 - ${formatAmount(rateValue)}`);

    return amountNum * rateValue;
  }, [amount, crypto, activeTab]);

  const coinAmount = useMemo(() => {
    if (!amount) return 0;

    if (!crypto || !crypto.market_value) return 0;

    const amountNum = parseFloat(amount);
    const marketValueNum = parseFloat(crypto.market_value);

    if (isNaN(amountNum) || isNaN(marketValueNum) || marketValueNum === 0)
      return 0;

    return amountNum / marketValueNum;
  }, [amount, crypto]);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["rates"],
    queryFn: async () => {
      try {
        const res = await apiGet("/crypto-assets");
        return res?.data?.data;
      } catch (error) {
        throw error;
      }
    },
  });

  const getRateForCrypto = useMemo(() => {
    if (!selectedCrypto || !data?.assets) return 0;

    const crypto = data.assets.find(
      (asset: any) => asset.name === selectedCrypto,
    );
    if (!crypto) return 0;

    const rateType = activeTab === "sell" ? "sell" : "buy";
    const rates = crypto.rates.filter((rate: any) => rate.type === rateType);

    if (rates.length === 0) return 0;

    // Use the latest rate (assuming higher ID means more recent)
    const latestRate = rates.reduce((latest: any, current: any) =>
      current.id > latest.id ? current : latest,
    );

    // If amount is provided, check for category-specific rates
    if (amount) {
      const amountNum = parseFloat(amount);
      if (
        !isNaN(amountNum) &&
        latestRate.categories &&
        latestRate.categories.length > 0
      ) {
        const matchingCategory = latestRate.categories.find((category: any) => {
          const min = parseFloat(category.min_amount);
          const max = parseFloat(category.max_amount);
          return amountNum >= min && amountNum <= max;
        });

        if (matchingCategory) {
          return parseFloat(matchingCategory.value);
        }
      }
    }

    // Return default value if no category matches or no amount provided
    return parseFloat(latestRate.default_value);
  }, [selectedCrypto, activeTab, amount, data]);

  // const onPress = () => {
  //   if (!selectedCrypto) {
  //     Alert.alert("Error", "Please select a cryptocurrency");
  //     return;
  //   }

  //   if (activeTab === "buy") {
  //     navigation.navigate("BuyCrypto", {
  //       crypto,
  //       amount,
  //       rate: currentRate,
  //     });
  //   } else {
  //     navigation.navigate("SellCrypto", {
  //       crypto,
  //       amount,
  //       rate: currentRate,
  //     });
  //   }
  // };

  const onPress = () => {
    if (!selectedCrypto) {
      Alert.alert("Error", "Please select a cryptocurrency");
      return;
    }

    const intent: TradeIntent = {
      assetId: crypto.value,
      symbol: crypto.symbol,
      action: activeTab === "buy" ? "buy" : "sell",
      source: "rates",
      amount,
      rate: currentRate,
    };

    if (activeTab === "buy") {
      navigation.navigate("BuyCrypto", { intent });
    } else {
      navigation.navigate("SellCrypto", { intent });
    }
  };

  useEffect(() => {
    if (data?.assets) {
      const options = data.assets.map((asset: any) => ({
        label: asset.name,
        value: asset.uuid,
        symbol: asset.symbol,
        logo_url: asset.logo_url,
        rates: asset.rates,
        market_value: asset?.market_current_value,
        is_buy_enabled: asset.is_buy_enabled,
        is_sell_enabled: asset.is_sell_enabled,
      }));

      setCryptoOptions(options);

      if (!selectedCrypto && options.length > 0) {
        setSelectedCrypto(options[0].name);
      }
    }
  }, [data]);

  useEffect(() => {
    if (cryptoOptions.length > 0) {
      const updatedOptions = cryptoOptions.map((option: any) => ({
        ...option,
        rate: getRateForCrypto,
      }));
      setCryptoOptions(updatedOptions);
    }
  }, [getRateForCrypto]);

  return (
    <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            colors={["#E89E00"]}
          />
        }
      >
        <View style={styles.tabs}>
          {["sell", "buy"].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab ? styles.activeTab : {}]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={
                  activeTab === tab
                    ? styles.activeTabText
                    : styles.inactiveTabText
                }
              >
                {tab === "sell" ? "Sell Rates" : "Buy Rates"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <SelectInput
          label="Cryptocurrency"
          options={cryptoOptions}
          onChange={setSelectedCrypto}
          title="Select Crypto Wallet"
        />

        <View style={{ marginBottom: 12 }}>
          <Text style={styles.label}>Amount in USD ($)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholderTextColor={"#a6a6a6ff"}
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
          />
        </View>
        {rateBreakdown ? (
          <Text
            style={{
              marginBottom: 5,
              fontSize: normalize(18),
              fontFamily: getFontFamily("700"),
            }}
          >
            {rateBreakdown}
          </Text>
        ) : null}

        <View style={{ marginVertical: 12 }}>
          <Text style={styles.label}>Expected Amount (₦)</Text>
          <View style={styles.rateBox}>
            <Text style={styles.rateText}>{formatAmount(currentRate)}</Text>
          </View>
          {!!amount && (
            <Text
              style={{
                marginTop: 6,
                fontSize: normalize(18),
                fontFamily: getFontFamily("700"),
              }}
            >
              {formatNumber(coinAmount, false, 9)} {crypto?.symbol}
            </Text>
          )}
        </View>

        <TouchableOpacity
          // onPress={() => {
          //   // Alert.alert(
          //   //   "Coming Soon!",
          //   //   "The feature is not available for now. Kindly check back later",
          //   // );
          // }}
          onPress={onPress}
          activeOpacity={0.8}
          style={styles.tradeButton}
        >
          <Text style={styles.tradeButtonText}>Trade Crypto</Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.label,
            { textAlign: "center", fontFamily: getFontFamily("400") },
          ]}
        >
          Note: This is an estimated rate. Actual rate may differ.
        </Text>
      </ScrollView>

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabs: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#F3F4F6",
    padding: 5,
    borderRadius: 10,
    top: -15,
  },
  tab: { flex: 1, padding: 12, alignItems: "center" },
  activeTab: { backgroundColor: COLORS.primary, borderRadius: 8 },
  activeTabText: {
    color: "#fff",
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
  inactiveTabText: {
    color: "#374151",
    fontFamily: getFontFamily("800"),
    fontSize: normalize(18),
  },
  label: {
    marginBottom: 6,
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000000ff",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    marginTop: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 15,
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
  rateBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  rateText: {
    fontSize: normalize(28),
    fontFamily: getFontFamily("900"),
    color: "#111827",
  },
  tradeButton: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 16,
  },
  tradeButtonText: {
    color: "#fff",
    fontFamily: getFontFamily("900"),
    fontSize: normalize(18),
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: normalize(12), color: "#6B7280" },
});
