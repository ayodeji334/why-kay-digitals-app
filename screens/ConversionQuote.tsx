import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { ArrowDown } from "iconsax-react-nativejs";
import { getFontFamily } from "../constants/settings";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import useAxios from "../hooks/useAxios";
import { COLORS } from "../constants/colors";
import CustomLoading from "../components/CustomLoading";
import { useMutation } from "@tanstack/react-query";
import { formatNumber } from "../libs/formatNumber";

export default function ConversionQuote() {
  const route = useRoute();
  const { post } = useAxios();
  const navigation: any = useNavigation();
  const { quote: initialQuote }: any = route.params;
  const [quote, setQuote] = useState(initialQuote);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [isExpired, setIsExpired] = useState(false);

  const swapMutation = useMutation({
    mutationFn: async (values: any) => {
      return await post("crypto/request-quote", {
        ...values,
        amount: Number(values.amount),
      });
    },
    onSuccess: response => {
      setQuote(response?.data?.data ?? {});
      setTimeRemaining(10);
      setIsExpired(false);
    },
    onError: (error: any) => {
      console.error("Swap failed:", error);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const response = await post("crypto/confirm-quote", {
        quote_uuid: quote?.uuid,
      });

      console.log(response);

      return response;
    },
    onSuccess: response => {
      console.log(response?.data);
      setTimeRemaining(0);
      setIsExpired(false);
      navigation.replace("TransactionDetail", {
        transaction: response?.data?.data,
      });
    },
    onError: (error: any) => {
      console.error("Confirmation failed:", error);
    },
  });

  useEffect(() => {
    if (timeRemaining <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleRequestNewQuote = () => {
    swapMutation.mutate({
      from_asset: quote?.from_asset_id,
      to_asset: quote?.to_asset_id,
      amount: quote?.amount_in_usd || 0,
    });
  };

  const handleConfirm = () => {
    if (!isExpired) {
      confirmMutation.mutate();
    }
  };

  return (
    <SafeAreaView edges={["bottom", "right"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          backgroundColor: "white",
          paddingBottom: 20,
          paddingHorizontal: 20,
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <View>
          <View style={styles.assetBox}>
            <View style={styles.assetHeader}>
              <Text style={styles.assetLabel}>From</Text>
            </View>
            <View style={styles.assetRow}>
              <Image
                source={{ uri: quote?.from_asset_logo }}
                style={styles.assetLogo}
              />
              <View style={styles.assetInfo}>
                <Text style={styles.assetSymbol}>
                  {quote?.from_asset_symbol}
                </Text>
              </View>
              <View style={styles.assetAmount}>
                <Text style={styles.assetValue}>{quote?.from_amount}</Text>
              </View>
            </View>
          </View>
          <View style={styles.swapIconBox}>
            <View
              style={{
                backgroundColor: "#ffe6d3ff",
                borderRadius: 2000,
                padding: 3,
                shadowColor: COLORS.whiteBackground,
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 3,
                marginVertical: -20,
                zIndex: 1000,
              }}
            >
              <View style={styles.swapIcon}>
                <ArrowDown size={15} color="white" />
              </View>
            </View>
          </View>
          <View style={styles.assetBox}>
            <View style={styles.assetHeader}>
              <Text style={styles.assetLabel}>To (Expected)</Text>
            </View>
            <View style={styles.assetRow}>
              <Image
                source={{ uri: quote?.to_asset_logo }}
                style={styles.assetLogo}
              />
              <View style={styles.assetInfo}>
                <Text style={styles.assetSymbol}>{quote?.to_asset_symbol}</Text>
              </View>
              <View style={styles.assetAmount}>
                <Text style={styles.assetValue}>{quote?.to_amount}</Text>
              </View>
            </View>
          </View>
          <View style={{ paddingVertical: 4 }}>
            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Conversion Rate</Text>
                <Text style={styles.detailValue}>
                  1 {quote?.from_asset_symbol} ={" "}
                  {formatNumber(quote?.exchange_rate || 0)}{" "}
                  {quote?.to_asset_symbol}
                </Text>
              </View>
              <View style={styles.securityNote}>
                <Text style={styles.securityText}>
                  This quote is guaranteed for the duration of the timer. Rates
                  are locked and protected from market fluctuations.
                </Text>
              </View>
            </View>
            {isExpired && (
              <View style={styles.expiredBox}>
                <Text style={styles.expiredText}>
                  This quote has expired. Market rates may have changed. Please
                  request a new quote to continue.
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.buttonBox}>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={isExpired}
            style={[styles.confirmButton, isExpired && styles.disabledButton]}
          >
            <Text style={styles.confirmText}>
              {isExpired
                ? "Quote Expired"
                : `Confirm Quote (${timeRemaining}s)`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRequestNewQuote}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>
              {isExpired ? "Request New Quote" : "Cancel Quote"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomLoading
        loading={swapMutation.isPending || confirmMutation.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    flex: 1,
  },
  assetLogo: {
    width: 35,
    height: 35,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "#cdcdcdff",
    backgroundColor: "#fff",
  },
  header: { alignItems: "center", marginBottom: 12 },
  expiredBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff9f9ff",
    borderColor: "#fca5a5",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 19,
    gap: 2,
  },
  expiredText: {
    fontFamily: getFontFamily("700"),
    fontSize: 13,
    color: "#b91c1c",
    flex: 1,
  },
  assetBox: {
    backgroundColor: "#f8fff7ff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
  },
  assetHeader: { flexDirection: "row", justifyContent: "space-between" },
  assetLabel: { fontFamily: getFontFamily("700"), fontSize: 14, color: "#666" },
  assetBalance: {
    fontFamily: getFontFamily("700"),
    fontSize: 11,
    color: "#999",
  },
  assetRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  assetIcon: {
    width: 30,
    height: 30,
    borderRadius: 200,
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
  },
  assetIconText: {
    color: "#fff",
    fontFamily: getFontFamily("700"),
    fontSize: 18,
    fontWeight: "700",
  },
  assetInfo: { flex: 1 },
  assetSymbol: {
    fontFamily: getFontFamily("900"),
    fontSize: 20,
    color: "#000",
    marginLeft: 5,
  },
  assetAmount: { alignItems: "flex-end" },
  assetValue: {
    fontFamily: getFontFamily("700"),
    fontSize: 19,
    fontWeight: "900",
    color: "#111",
  },
  swapIconBox: { alignItems: "center" },
  swapIcon: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 10,
  },
  detailsBox: { marginTop: 12 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  detailLabel: {
    fontFamily: getFontFamily("700"),
    fontSize: 13,
    color: "#000",
  },
  detailValue: {
    fontFamily: getFontFamily("700"),
    fontSize: 13,
    fontWeight: "500",
    color: "#111",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },
  securityText: {
    fontFamily: getFontFamily("700"),
    fontSize: 13,
    color: "#474747ff",
  },
  buttonBox: { marginTop: 16 },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 120,
    alignItems: "center",
    marginBottom: 10,
  },
  confirmText: {
    color: "#fff",
    fontFamily: getFontFamily("800"),
    fontSize: 14,
  },
  disabledButton: { backgroundColor: "#d1dbd4ff" },
  cancelButton: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingVertical: 13,
    borderRadius: 120,
    alignItems: "center",
  },
  cancelText: {
    color: COLORS.primary,
    fontFamily: getFontFamily("800"),
    fontSize: 14,
  },
  footerNote: {
    textAlign: "center",
    fontFamily: getFontFamily("700"),
    fontSize: 11,
    color: "#666",
    marginTop: 12,
  },
});
