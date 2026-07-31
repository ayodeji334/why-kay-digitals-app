import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import CustomLoading from "../components/CustomLoading";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SelectInput } from "../components/SelectInputField";
import { formatAmount, formatNumber } from "../libs/formatNumber";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import useAxios from "../hooks/useAxios";
import { showError } from "../utlis/toast";
import { formatWithCommas } from "./SwapCryptoScreen";
import { CryptoOption, TradeIntent, TradeTab } from "../libs/types";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import TabSwitcher from "../components/TabSwitcher";

export default function CryptoRatesScreen() {
  const [activeTab, setActiveTab] = useState<string>("sell");
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [rawAmount, setRawAmount] = useState("");
  const [formattedAmount, setFormattedAmount] = useState("");
  const colors = useColors();
  const styles = makeStyles(colors);

  const { apiGet } = useAxios();
  const navigation: any = useNavigation();

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["rates"],
    queryFn: async () => {
      const res = await apiGet("/crypto-assets/available/rates");
      return res?.data?.data;
    },
  });

  console.log(data);

  // const cryptoOptions = useMemo<CryptoOption[]>(() => {
  //   if (!Array.isArray(data)) return [];
  //   return data.map((asset: any) => ({
  //     id: asset.uuid,
  //     value: asset.uuid,
  //     label: `${asset.symbol} (${asset.name})`,
  //     logo_url: asset.logo_url,
  //     symbol: asset.symbol,
  //     market_value: Number(asset.market_current_value ?? 0),
  //     rates: asset.rates ?? [],
  //     is_buy_enabled: asset.is_buy_enabled,
  //     is_sell_enabled: asset.is_sell_enabled,
  //   }));
  // }, [data]);

  // const crypto = useMemo(
  //   () => cryptoOptions.find(c => c.value === selectedCrypto) ?? null,
  //   [cryptoOptions, selectedCrypto],
  // );

  // const amountNum = useMemo(() => {
  //   const n = parseFloat(rawAmount);
  //   return isNaN(n) || n <= 0 ? 0 : n;
  // }, [rawAmount]);

  // const rateInfo = useMemo(() => {
  //   if (!crypto || !Array.isArray(crypto.rates)) return null;

  //   const matchedRate = crypto.rates.find(r => r.type === activeTab);
  //   if (!matchedRate) return null;

  //   const defaultValue = parseFloat(matchedRate.default_value ?? "0");
  //   // const categories = matchedRate.categories ?? [];

  //   // Resolve effective rate — match category by amount range, fallback to default
  //   let effectiveRate = defaultValue;
  //   let categoryLabel = "Default rate";
  //   let source: "category" | "default" = "default";

  //   // if (categories.length > 0 && amountNum > 0) {
  //   //   const matched = categories.find(
  //   //     (cat: any) =>
  //   //       amountNum >= parseFloat(cat.min_amount ?? "0") &&
  //   //       amountNum <= parseFloat(cat.max_amount ?? "0"),
  //   //   );

  //   //   if (matched) {
  //   //     effectiveRate = parseFloat(matched.value ?? "0");
  //   //     categoryLabel = matched.label ?? "Category rate";
  //   //     source = "category";
  //   //   }
  //   // }

  //   return {
  //     value: effectiveRate,
  //     label: categoryLabel,
  //     source,
  //     totalNgn: amountNum > 0 ? amountNum * effectiveRate : 0,
  //     coinAmount:
  //       amountNum > 0 && crypto.market_value > 0
  //         ? amountNum / crypto.market_value
  //         : 0,
  //   };
  // }, [crypto, activeTab, amountNum]);

  const cryptoOptions = useMemo<CryptoOption[]>(() => {
    if (!Array.isArray(data)) return [];
    return data.map((asset: any) => ({
      id: asset.uuid,
      value: asset.uuid,
      label: `${asset.symbol} (${asset.name})`,
      logo_url: asset.logo_url,
      symbol: asset.symbol,
      market_value: Number(asset.market_current_value ?? 0),
      buy_rate: Number(asset.buy_rate ?? 0),
      sell_rate: Number(asset.sell_rate ?? 0),
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
    if (!crypto) return null;

    const effectiveRate =
      activeTab === "buy" ? crypto.buy_rate : crypto.sell_rate;
    if (!effectiveRate) return null;

    return {
      value: effectiveRate,
      totalNgn: amountNum > 0 ? amountNum * effectiveRate : 0,
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

    if (!amountNum) {
      showError("Please enter the amount");
      return;
    }

    const intent: TradeIntent = {
      assetId: crypto.value,
      symbol: crypto.symbol,
      action: activeTab as any,
      source: "rates",
      amount: rawAmount,
      rate: rateInfo?.totalNgn ?? 0,
    };

    navigation.navigate(activeTab === "buy" ? "BuyCrypto" : "SellCrypto", {
      intent,
    });
  }, [selectedCrypto, crypto, activeTab, rawAmount, rateInfo, navigation]);

  const resetStates = useCallback(() => {
    setActiveTab("sell");
    setSelectedCrypto(() => null);
    setRawAmount("");
    setFormattedAmount("");
  }, []);

  useFocusEffect(resetStates);

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* {(["sell", "buy"] as TradeTab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <AppText
                style={
                  activeTab === tab
                    ? styles.activeTabText
                    : styles.inactiveTabText
                }
              >
                {tab === "sell" ? "Sell Rates" : "Buy Rates"}
              </AppText>
            </TouchableOpacity>
          ))}
           */}
        <TabSwitcher
          activeTab={activeTab}
          tabs={[
            {
              label: "Sell Rates",
              value: "sell",
            },
            {
              label: "Buy Rates",
              value: "buy",
            },
          ]}
          onTabChange={value => setActiveTab(value as TradeTab)}
          containerStyle={styles.tabSwitcher}
          activeTabStyle={styles.activeTab}
          activeTabTextStyle={styles.activeTabText}
        />

        <View style={{ marginTop: 20 }}>
          <SelectInput
            label="Coin"
            options={cryptoOptions}
            onChange={setSelectedCrypto}
            title="Select an asset coin"
            placeholder="Select an asset coin"
            value={selectedCrypto}
          />

          <View style={{ marginBottom: 2, marginTop: 10 }}>
            <AppText style={styles.label}>Amount</AppText>
            <View style={styles.inputContainer}>
              <AppText style={styles.dollarSign}>$</AppText>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholderTextColor="#aeaeaeff"
                placeholder="0.00"
                value={formattedAmount}
                maxFontSizeMultiplier={1}
                allowFontScaling={false}
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
            <AppText style={styles.label}>Expected Amount</AppText>
            <View style={styles.rateBox}>
              <AppText style={styles.dollarSign}>₦</AppText>
              <AppText style={styles.rateText}>
                {formatNumber(rateInfo?.totalNgn ?? 0, { decimalPlace: 2 })}
              </AppText>
            </View>
          </View>

          {selectedCrypto && amountNum > 0 && rateInfo && (
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <AppText style={styles.infoLabel}>Exchange Rate:</AppText>
                <AppText style={styles.infoValue}>
                  {formatAmount(rateInfo.value, { decimalPlace: 2 })}/$
                </AppText>
              </View>

              {/* <View style={styles.infoRow}>
                <AppText style={styles.infoLabel}>Rate Category:</AppText>
                <AppText style={styles.infoValue}>
                  {rateInfo.source === "category"
                    ? rateInfo.label
                    : "Default rate"}
                </AppText>
              </View> */}

              <View style={styles.infoRow}>
                <AppText style={styles.infoLabel}>Estimated Coin:</AppText>
                <AppText style={styles.infoValue}>
                  {formatNumber(rateInfo.coinAmount, { decimalPlace: 8 })}{" "}
                  {crypto?.symbol}
                </AppText>
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
            <AppText style={styles.tradeButtonText}>Trade Crypto</AppText>
          </TouchableOpacity>

          <AppText
            style={[
              styles.label,
              {
                textAlign: "center",
                fontFamily: getFontFamily("400"),
                fontSize: normalize(18),
              },
            ]}
          >
            Note: This is an estimated rate. Actual rate may differ.
          </AppText>
        </View>
      </ScrollView>

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    tabs: {
      flexDirection: "row",
      marginBottom: 16,
      backgroundColor: "#F3F4F6",
      padding: 5,
      borderRadius: 1000,
      top: -15,
    },
    tabSwitcher: {
      backgroundColor: colors.inputBackground,
      marginVertical: 10,
    },
    activeTab: {
      backgroundColor: COLORS.primary,
      color: colors.text,
    },
    activeTabText: {
      color: "white",
    },
    tab: { flex: 1, padding: 9, alignItems: "center" },
    inactiveTabText: {
      color: "#000",
      fontFamily: getFontFamily("800"),
      fontSize: normalize(16),
    },
    label: {
      marginBottom: 6,
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      gap: 5,
    },
    dollarSign: {
      fontSize: normalize(21),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      paddingLeft: 15,
    },
    input: {
      flex: 1,
      paddingVertical: normalize(12),
      fontSize: normalize(23),
      fontFamily: getFontFamily("800"),
      color: colors.text,
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
      backgroundColor: colors.infoCardBackgroundColor,
      padding: 12,
      borderRadius: 8,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.text,
    },
    infoValue: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    rateBreakdownRow: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
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
      backgroundColor: colors.background,
      paddingVertical: normalize(12),
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
    },
    rateText: {
      fontSize: normalize(24),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      paddingLeft: 2,
    },
    tradeButton: {
      backgroundColor: COLORS.secondary,
      padding: 14,
      borderRadius: 120,
      alignItems: "center",
      marginVertical: 16,
    },
    tradeButtonText: {
      color: "#fff",
      fontFamily: getFontFamily("800"),
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
