import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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
import { showError } from "../utlis/toast";
import { formatWithCommas } from "./SwapCryptoScreen";
import { CryptoOption, Rate, TradeIntent, TradeTab } from "../libs/types";

const resolveRate = (
  rate: Rate,
  amountNum: number,
): {
  value: number;
  source: "category" | "base";
  label?: string;
  min?: string;
  max?: string;
} => {
  if (
    amountNum > 0 &&
    Array.isArray(rate.categories) &&
    rate.categories.length > 0
  ) {
    const matched = rate.categories.find(
      cat =>
        amountNum >= Number(cat.min_amount) &&
        amountNum < Number(cat.max_amount),
    );

    if (matched) {
      return {
        source: "category",
        value: Number(matched.value),
        label: matched.label,
        min: matched.min_amount,
        max: matched.max_amount,
      };
    }
  }

  return { source: "base", value: Number(rate.default_value) };
};

const getRateType = (tab: TradeTab): "buy" | "sell" =>
  tab === "sell" ? "buy" : "sell";

export default function CryptoRatesScreen() {
  const [activeTab, setActiveTab] = useState<TradeTab>("sell");
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [rawAmount, setRawAmount] = useState("");
  const [formattedAmount, setFormattedAmount] = useState("");

  const { apiGet } = useAxios();
  const navigation: any = useNavigation();

  const { data, isLoading } = useQuery({
    queryKey: ["rates"],
    queryFn: async () => {
      const res = await apiGet("/crypto-assets/available/rates");
      return res?.data?.data;
    },
    refetchInterval: 9000,
  });

  const cryptoOptions = useMemo<CryptoOption[]>(() => {
    if (!Array.isArray(data)) return [];
    return data.map((asset: any) => ({
      id: asset.uuid,
      value: asset.uuid,
      label: `${asset.symbol} (${asset.name})`,
      logo_url: asset.logo_url,
      symbol: asset.symbol,
      market_value: Number(asset.market_current_value ?? 0),
      rates: asset.rates ?? [],
      is_buy_enabled: asset.is_buy_enabled,
      is_sell_enabled: asset.is_sell_enabled,
    }));
  }, [data]);

  const crypto = useMemo(
    () => cryptoOptions.find(c => c.value === selectedCrypto) ?? null,
    [cryptoOptions, selectedCrypto],
  );

  const amountNum = useMemo(() => {
    const n = parseFloat(rawAmount);
    return isNaN(n) || n <= 0 ? 0 : n;
  }, [rawAmount]);

  const rateInfo = useMemo(() => {
    if (!crypto || !Array.isArray(crypto.rates)) return null;

    const rateType = getRateType(activeTab);
    const matchedRate = crypto.rates.find(r => r.type === rateType);
    if (!matchedRate) return null;

    const resolved = resolveRate(matchedRate, amountNum);

    return {
      ...resolved,
      totalNgn: amountNum > 0 ? amountNum * resolved.value : 0,
      coinAmount:
        amountNum > 0 && crypto.market_value > 0
          ? amountNum / crypto.market_value
          : 0,
    };
  }, [crypto, activeTab, amountNum]);

  const onPressTrade = useCallback(() => {
    if (!selectedCrypto || !crypto) {
      showError("Please select an asset");
      return;
    }

    const intent: TradeIntent = {
      assetId: crypto.value,
      symbol: crypto.symbol,
      action: activeTab,
      source: "rates",
      amount: rawAmount,
      rate: rateInfo?.totalNgn ?? 0,
    };

    navigation.navigate(activeTab === "buy" ? "BuyCrypto" : "SellCrypto", {
      intent,
    });
  }, [selectedCrypto, crypto, activeTab, rawAmount, rateInfo, navigation]);

  return (
    <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.tabs}>
          {(["sell", "buy"] as TradeTab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
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

        <View>
          <SelectInput
            label="Coin"
            options={cryptoOptions}
            onChange={setSelectedCrypto}
            title="Select an asset coin"
            placeholder="Select an asset coin"
          />

          <View style={{ marginBottom: 2, marginTop: 10 }}>
            <Text style={styles.label}>Amount in USD ($)</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholderTextColor="#aeaeaeff"
                placeholder="0.00"
                value={formattedAmount}
                onChangeText={text => {
                  const cleaned = text.replace(/[^0-9.]/g, "");
                  const parts = cleaned.split(".");
                  const safe =
                    parts.length > 2
                      ? `${parts[0]}.${parts.slice(1).join("")}`
                      : cleaned;

                  setRawAmount(safe);
                  const formatted = formatWithCommas(text);
                  setFormattedAmount(formatted);
                }}
              />
            </View>
          </View>

          <View style={{ marginVertical: 12 }}>
            <Text style={styles.label}>Expected Amount (₦)</Text>
            <View style={styles.rateBox}>
              <Text style={styles.rateText}>
                {formatAmount(rateInfo?.totalNgn ?? 0, { currency: "NGN" })}
              </Text>
            </View>
          </View>

          {selectedCrypto && amountNum > 0 && rateInfo && (
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Exchange Rate:</Text>
                <Text style={styles.infoValue}>
                  $1 = {formatAmount(rateInfo.value)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Rate Category:</Text>
                <Text style={styles.infoValue}>
                  {rateInfo.source === "category"
                    ? rateInfo.label
                    : "Default rate"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estimated Coin:</Text>
                <Text style={styles.infoValue}>
                  {formatNumber(rateInfo.coinAmount, { decimalPlace: 8 })}{" "}
                  {crypto?.symbol}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View>
          <TouchableOpacity
            onPress={onPressTrade}
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
        </View>
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
    borderRadius: 1000,
    top: -15,
  },
  tab: { flex: 1, padding: 10, alignItems: "center" },
  activeTab: { backgroundColor: COLORS.primary, borderRadius: 800 },
  activeTabText: {
    color: "#fff",
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
  },
  inactiveTabText: {
    color: "#000",
    fontFamily: getFontFamily("800"),
    fontSize: normalize(18),
  },
  label: {
    marginBottom: 6,
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000000ff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    gap: 5,
  },
  dollarSign: {
    fontSize: normalize(26),
    fontFamily: getFontFamily("800"),
    color: "#000",
    paddingLeft: 15,
  },
  input: {
    flex: 1,
    paddingVertical: normalize(16),
    fontSize: normalize(26),
    fontFamily: getFontFamily("800"),
    color: "#000",
  },
  // input: {
  //   width: "100%",
  //   paddingVertical: 10,
  //   color: "#1A1A1A",
  //   fontFamily: getFontFamily("700"),
  //   fontSize: normalize(28),
  //   backgroundColor: "#FFFFFF",
  // },
  infoContainer: {
    backgroundColor: "#5AB2431A",
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
  },
  infoValue: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: COLORS.darkBackground,
  },
  rateBreakdownRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#DEE2E6",
  },
  rateBreakdownText: {
    fontSize: normalize(14),
    fontFamily: getFontFamily("500"),
    color: "#6C757D",
    fontStyle: "italic",
    textAlign: "center",
  },
  coinEquivalentContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "rgba(232, 158, 0, 0.1)",
    borderRadius: 6,
    alignItems: "center",
  },
  coinEquivalentText: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
    color: COLORS.primary,
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
  rateBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eeeeee",
  },
  rateText: {
    fontSize: normalize(28),
    fontFamily: getFontFamily("800"),
    color: "#111827",
  },
  tradeButton: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 120,
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
