import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { ArrowDown } from "iconsax-react-nativejs";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import useAxios from "../hooks/useAxios";
import { useIdempotencyKey } from "../hooks/useIdempotencyKey";
import CustomLoading from "../components/CustomLoading";
import { useMutation } from "@tanstack/react-query";
import { formatNumber } from "../libs/formatNumber";
import { showError } from "../utlis/toast";
import { useQuoteStore } from "../stores/quoteStore";
import { AppText } from "../components/AppText";
import { useColors, useResolvedTheme } from "../hooks/useTheme";

export default function ConversionQuote() {
  const route = useRoute();
  const { post } = useAxios();
  const { paymentRequestConfig, settleIdempotencyKey, handleUnknownOutcome } =
    useIdempotencyKey();
  const navigation: any = useNavigation();
  const { quote: initialQuote }: any = route.params;
  const [quote, setQuote] = useState(initialQuote);
  const [timeRemaining, setTimeRemaining] = useState(8);
  const [isExpired, setIsExpired] = useState(false);
  const [isExpiredVisible, setIsExpiredVisible] = useState(false);
  const isCancellingRef = useRef(false);
  const isConfirmedRef = useRef(false);
  const [isCountdownStopped, setIsCountdownStopped] = useState(false);
  const colors = useColors();
  const resolvedTheme = useResolvedTheme();
  const styles = makeStyles(colors);

  const cancelQuote = useCallback(
    async (quoteUuid: string) => {
      if (isCancellingRef.current || isConfirmedRef.current) return;
      isCancellingRef.current = true;

      try {
        await post("crypto/cancel-quote", { quote_uuid: quoteUuid });
      } catch (error) {
        console.warn("cancelQuote failed:", error);
      } finally {
        isCancellingRef.current = false;
      }
    },
    [post],
  );

  const setLastCancelledAt = useQuoteStore(s => s.setLastCancelledAt);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (
        isConfirmedRef.current ||
        e.data.action.type === "NAVIGATE" ||
        isExpired
      ) {
        return;
      }

      cancelQuote(quote?.uuid);
      setLastCancelledAt(Date.now());
    });

    return unsubscribe;
  }, [navigation, quote?.uuid, cancelQuote, isExpired]);

  useEffect(() => {
    if (!isExpired || !quote?.uuid) return;

    cancelQuote(quote.uuid).finally(() => {
      const timeout = setTimeout(() => {
        setIsExpiredVisible(true);
      }, 2000);

      return () => clearTimeout(timeout);
    });
  }, [isExpired, quote?.uuid, cancelQuote]);

  const swapMutation = useMutation({
    mutationFn: async (values: any) => {
      return await post("crypto/request-quote", {
        ...values,
        amount: Number(values.amount),
      });
    },
    onSuccess: response => {
      isCancellingRef.current = false;
      setQuote(response?.data?.data ?? {});
      setTimeRemaining(8);
      setIsExpired(false);
      setIsExpiredVisible(false);
    },
    onError: (error: any) => {
      showError(
        error?.response?.data?.message ??
          "Failed to get a new quote. Try again.",
      );
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const response = await post(
        "crypto/confirm-quote",
        { quote_uuid: quote?.uuid },
        paymentRequestConfig(),
      );
      return response;
    },
    onSuccess: response => {
      settleIdempotencyKey();
      isConfirmedRef.current = true;
      const transaction = response?.data?.data ?? {};
      setTimeRemaining(0);
      setIsExpired(false);
      setIsExpiredVisible(false);
      setIsCountdownStopped(false);

      if (
        transaction?.category === "CRYPTO_SWAP" &&
        transaction?.status === "pending"
      ) {
        navigation.replace("PendingSwap", { transaction });
      } else {
        navigation.replace("TransactionDetail", { transaction });
      }
    },
    onError: (error: any) => {
      settleIdempotencyKey(error);
      if (handleUnknownOutcome(error)) return;
      showError(
        error?.response?.data?.message ??
          "Confirmation failed. Please try again.",
      );
    },
  });

  useEffect(() => {
    if (timeRemaining <= 0) {
      setIsExpired(true);
      return;
    }

    if (isCountdownStopped) return;

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
  }, [timeRemaining, isCountdownStopped]);

  const handleRequestNewQuote = () => {
    swapMutation.mutate({
      from_asset: quote?.from_asset_id,
      to_asset: quote?.to_asset_id,
      amount: quote?.amount_in_usd || 0,
    });
  };

  const handleConfirm = () => {
    if (!isExpired) {
      setIsCountdownStopped(true);
      confirmMutation.mutate();
    }
  };

  return (
    <SafeAreaView edges={["bottom", "right"]} style={styles.container}>
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          backgroundColor: colors.background,
          paddingBottom: normalizeSpacing(20),
          paddingHorizontal: normalizeSpacing(20),
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <View>
          <View style={styles.assetBox}>
            <View style={styles.assetHeader}>
              <AppText style={styles.assetLabel}>From</AppText>
            </View>
            <View style={styles.assetRow}>
              <Image
                source={{ uri: quote?.from_asset_logo }}
                style={styles.assetLogo}
              />
              <View style={styles.assetInfo}>
                <AppText style={styles.assetSymbol}>
                  {quote?.from_asset_symbol}
                </AppText>
              </View>
              <View style={styles.assetAmount}>
                <AppText style={styles.assetValue}>
                  {quote?.from_amount}
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.swapIconBox}>
            <View
              style={{
                backgroundColor: colors.warningLight,
                borderRadius: 2000,
                padding: normalizeSpacing(3),
                shadowColor: colors.shadow,
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 3,
                marginVertical: normalizeSpacing(-20),
                zIndex: 1000,
              }}
            >
              <View style={styles.swapIcon}>
                <ArrowDown size={15} color="#fff" />
              </View>
            </View>
          </View>

          <View style={styles.assetBox}>
            <View style={styles.assetHeader}>
              <AppText style={styles.assetLabel}>To (Expected)</AppText>
            </View>
            <View style={styles.assetRow}>
              <Image
                source={{ uri: quote?.to_asset_logo }}
                style={styles.assetLogo}
              />
              <View style={styles.assetInfo}>
                <AppText style={styles.assetSymbol}>
                  {quote?.to_asset_symbol}
                </AppText>
              </View>
              <View style={styles.assetAmount}>
                <AppText style={styles.assetValue}>{quote?.to_amount}</AppText>
              </View>
            </View>
          </View>

          <View style={{ paddingVertical: normalizeSpacing(4) }}>
            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <AppText style={styles.detailLabel}>Conversion Rate</AppText>
                <AppText style={styles.detailValue}>
                  1 {quote?.from_asset_symbol} ={" "}
                  {formatNumber(quote?.exchange_rate || 0)}{" "}
                  {quote?.to_asset_symbol}
                </AppText>
              </View>
              <View style={styles.securityNote}>
                <AppText style={styles.securityText}>
                  This quote is guaranteed for the duration of the timer. Rates
                  are locked and protected from market fluctuations.
                </AppText>
              </View>
            </View>

            {isExpiredVisible && (
              <View style={styles.expiredBox}>
                <AppText style={styles.expiredText}>
                  This quote has expired. Market rates may have changed. Please
                  request a new quote to continue.
                </AppText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.buttonBox}>
          {!isExpiredVisible && (
            <TouchableOpacity
              hitSlop={10}
              activeOpacity={0.9}
              onPress={handleConfirm}
              disabled={isExpired || confirmMutation.isPending}
              style={[
                styles.confirmButton,
                (isExpired || confirmMutation.isPending) &&
                  styles.disabledButton,
              ]}
            >
              <AppText style={styles.confirmText}>
                {confirmMutation.isPending
                  ? "Confirming..."
                  : isExpired
                  ? "Quote Expired"
                  : `Confirm Quote (${timeRemaining}s)`}
              </AppText>
            </TouchableOpacity>
          )}

          {isExpiredVisible && (
            <TouchableOpacity
              hitSlop={10}
              activeOpacity={0.9}
              onPress={handleRequestNewQuote}
              disabled={swapMutation.isPending}
              style={[
                styles.cancelButton,
                swapMutation.isPending && styles.disabledButton,
              ]}
            >
              <AppText style={styles.cancelText}>Request New Quote</AppText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <CustomLoading
        loading={swapMutation.isPending || confirmMutation.isPending}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    assetLogo: {
      width: 35,
      height: 35,
      borderRadius: 120,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    header: { alignItems: "center", marginBottom: normalizeSpacing(12) },
    expiredBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.background,
      borderColor: colors.error,
      borderWidth: 0.5,
      borderRadius: 8,
      padding: normalizeSpacing(10),
      marginTop: normalizeSpacing(19),
      gap: 2,
    },
    expiredText: {
      fontFamily: getFontFamily("700"),
      fontSize: normalize(17),
      color: colors.error,
      flex: 1,
    },
    assetBox: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: normalizeSpacing(12),
      marginBottom: normalizeSpacing(6),
    },
    assetHeader: { flexDirection: "row", justifyContent: "space-between" },
    assetLabel: {
      fontFamily: getFontFamily("700"),
      fontSize: 14,
      color: colors.textMuted,
    },
    assetBalance: {
      fontFamily: getFontFamily("700"),
      fontSize: 11,
      color: colors.textMuted,
    },
    assetRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: normalizeSpacing(8),
    },
    assetIcon: {
      width: 30,
      height: 30,
      borderRadius: 200,
      backgroundColor: colors.primary,
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
      color: colors.text,
      marginLeft: normalizeSpacing(5),
    },
    assetAmount: { alignItems: "flex-end" },
    assetValue: {
      fontFamily: getFontFamily("900"),
      fontSize: 19,
      color: colors.text,
    },
    swapIconBox: { alignItems: "center" },
    swapIcon: {
      backgroundColor: colors.primary,
      borderRadius: 24,
      padding: normalizeSpacing(10),
    },
    detailsBox: { marginTop: normalizeSpacing(12) },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: normalizeSpacing(4),
    },
    detailLabel: {
      fontFamily: getFontFamily("700"),
      fontSize: normalize(17),
      color: colors.text,
    },
    detailValue: {
      fontFamily: getFontFamily("700"),
      fontSize: normalize(17),
      fontWeight: "500",
      color: colors.text,
    },
    securityNote: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: normalizeSpacing(8),
    },
    securityText: {
      fontFamily: getFontFamily("700"),
      fontSize: normalize(17),
      color: colors.textMuted,
      marginTop: normalizeSpacing(12),
    },
    buttonBox: { marginTop: normalizeSpacing(16) },
    confirmButton: {
      backgroundColor: colors.primary,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 120,
      alignItems: "center",
      marginBottom: normalizeSpacing(10),
    },
    confirmText: {
      color: "#fff",
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
    },
    disabledButton: { backgroundColor: colors.border },
    cancelButton: {
      borderColor: colors.primary,
      borderWidth: 1,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 120,
      alignItems: "center",
    },
    cancelText: {
      color: colors.primary,
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
    },
    footerNote: {
      textAlign: "center",
      fontFamily: getFontFamily("700"),
      fontSize: 11,
      color: colors.textMuted,
      marginTop: normalizeSpacing(12),
    },
  });
