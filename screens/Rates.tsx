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
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import CustomLoading from "../components/CustomLoading";
import { SelectInput } from "../components/SelectInputField";
import { formatAmount, formatNumber } from "../libs/formatNumber";
import { formatWithCommas } from "./SwapCryptoScreen";
import { showError } from "../utlis/toast";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import { useAssets } from "../hooks/useAssets";

export type TradeIntent = {
  assetId?: string;
  symbol?: string;
  action?: "buy" | "sell";
  source?: "rates";
  amount?: string;
  rate?: number;
};

export default function CryptoRatesScreen() {
  const navigation: any = useNavigation();
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("sell");
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const { assets, isRefetching, refetch, isLoading } = useAssets();

  const cryptoOptions = useMemo(() => {
    if (!Array.isArray(assets)) return [];

    return assets.map((asset: any) => ({
      id: asset.id,
      value: asset.id,
      label: `${asset.name}`,
      symbol: asset.symbol,
      logo_url: asset.logo_url,
      market_value: Number(asset.market_current_value),

      rates: [
        {
          type: "buy",
          default_value: Number(asset.buy_rate),
        },
        {
          type: "sell",
          default_value: Number(asset.sell_rate),
        },
      ],

      is_buy_enabled: asset.buy_rate > 0,
      is_sell_enabled: asset.sell_rate > 0,
    }));
  }, [assets]);

  /* -------------------- SELECTED CRYPTO -------------------- */
  const crypto = useMemo(() => {
    if (!selectedCrypto) return null;
    return cryptoOptions.find(option => option.value === selectedCrypto);
  }, [cryptoOptions, selectedCrypto]);

  /* -------------------- EXCHANGE RATE -------------------- */
  const exchangeRate = useMemo(() => {
    if (!crypto || !amount) return 0;

    const rateType = activeTab === "sell" ? "buy" : "sell";
    const rate: any = crypto.rates?.find((r: any) => r.type === rateType);
    if (!rate) return 0;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return 0;

    if (Array.isArray(rate.categories)) {
      const category = rate.categories.find((cat: any) => {
        const min = Number(cat.min_amount);
        const max = Number(cat.max_amount);
        return amountNum >= min && amountNum < max;
      });

      if (category) return Number(category.value);
    }

    return Number(rate.default_value);
  }, [crypto, amount, activeTab]);

  /* -------------------- EXPECTED NGN -------------------- */
  const currentRate = useMemo(() => {
    if (!amount || !exchangeRate) return 0;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return 0;

    return amountNum * exchangeRate;
  }, [amount, exchangeRate]);

  /* -------------------- COIN ESTIMATE -------------------- */
  const coinAmount = useMemo(() => {
    if (!crypto || !amount) return 0;

    const amountNum = parseFloat(amount);
    const marketValue = Number(crypto.market_value);

    if (isNaN(amountNum) || isNaN(marketValue) || marketValue === 0) {
      return 0;
    }

    return amountNum / marketValue;
  }, [crypto, amount]);

  const appliedRate = useMemo(() => {
    if (!crypto || !amount) return null;

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) return null;

    const rateType = activeTab === "sell" ? "buy" : "sell";
    const rate: any = crypto.rates?.find((r: any) => r.type === rateType);
    if (!rate) return null;

    if (Array.isArray(rate.categories)) {
      const category = rate.categories.find((cat: any) => {
        const min = Number(cat.min_amount);
        const max = Number(cat.max_amount);
        return amountNum >= min && amountNum < max;
      });

      if (category) {
        return {
          source: "category",
          label: category.label,
          value: Number(category.value),
        };
      }
    }

    return {
      source: "base",
      value: Number(rate.default_value),
    };
  }, [crypto, amount, activeTab]);

  /* -------------------- ACTION -------------------- */
  const onPress = () => {
    if (!crypto) {
      showError("Please select an asset");
      return;
    }

    const intent: TradeIntent = {
      assetId: crypto.value,
      symbol: crypto.symbol,
      action: activeTab,
      source: "rates",
      amount,
      rate: currentRate,
    };

    navigation.navigate(activeTab === "buy" ? "BuyCrypto" : "SellCrypto", {
      intent,
    });
  };

  return (
    <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Tabs */}
        <View style={styles.tabs}>
          {["sell", "buy"].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as "buy" | "sell")}
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

        {/* Asset */}
        <SelectInput
          label="Cryptocurrency"
          options={cryptoOptions}
          value={selectedCrypto}
          onChange={setSelectedCrypto}
          title="Select an asset Wallet"
          placeholder="Select an asset wallet"
        />

        {/* Amount */}
        <View style={{ marginTop: 12 }}>
          <Text style={styles.label}>Amount in USD ($)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0.00"
              value={amount}
              onChangeText={text => setAmount(formatWithCommas(text))}
            />
          </View>
        </View>

        {/* Expected */}
        <View style={{ marginVertical: 12 }}>
          <Text style={styles.label}>Expected Amount (₦)</Text>
          <View style={styles.rateBox}>
            <Text style={styles.rateText}>
              {formatAmount(currentRate, false, "NGN")}
            </Text>
          </View>
        </View>

        {/* Breakdown */}
        {crypto && amount && parseFloat(amount) > 0 && (
          <View style={styles.infoContainer}>
            <InfoRow
              label="Exchange Rate"
              value={`$1 = ${formatAmount(exchangeRate)}`}
            />

            {appliedRate && (
              <InfoRow
                label="Rate Used"
                value={`₦${formatAmount(appliedRate.value)}`}
              />
            )}

            <InfoRow
              label={`Estimated ${crypto.symbol}`}
              value={`${formatNumber(coinAmount, false, 8)} ${crypto.symbol}`}
            />
          </View>
        )}

        <TouchableOpacity
          onPress={onPress}
          style={styles.tradeButton}
          activeOpacity={0.8}
        >
          <Text style={styles.tradeButtonText}>Trade Crypto</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
}

/* -------------------- SMALL PURE COMPONENT -------------------- */
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

/* -------------------- STYLES (UNCHANGED) -------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
  },
  dollarSign: {
    fontSize: normalize(26),
    fontFamily: getFontFamily("800"),
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: normalize(16),
    fontSize: normalize(26),
    fontFamily: getFontFamily("900"),
  },
  rateBox: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
  },
  rateText: {
    fontSize: normalize(28),
    fontFamily: getFontFamily("800"),
  },
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
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
  infoValue: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: COLORS.primary,
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
});
