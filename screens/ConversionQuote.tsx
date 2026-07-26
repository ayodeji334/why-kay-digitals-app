// import React, { useState, useEffect, useRef, useCallback } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Image,
//   StatusBar,
// } from "react-native";
// import { ArrowDown } from "iconsax-react-nativejs";
// import { getFontFamily, normalize } from "../constants/settings";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import useAxios from "../hooks/useAxios";
// import { COLORS } from "../constants/colors";
// import CustomLoading from "../components/CustomLoading";
// import { useMutation } from "@tanstack/react-query";
// import { formatNumber } from "../libs/formatNumber";
// import { showError } from "../utlis/toast";
// import { useQuoteStore } from "../stores/quoteStore";
// import { AppText } from "../components/AppText";

// export default function ConversionQuote() {
//   const route = useRoute();
//   const { post } = useAxios();
//   const navigation: any = useNavigation();
//   const { quote: initialQuote }: any = route.params;
//   const [quote, setQuote] = useState(initialQuote);
//   const [timeRemaining, setTimeRemaining] = useState(8);
//   const [isExpired, setIsExpired] = useState(false);
//   const [isExpiredVisible, setIsExpiredVisible] = useState(false); // ← new
//   const isCancellingRef = useRef(false);
//   const isConfirmedRef = useRef(false);
//   const [isCountdownStopped, setIsCountdownStopped] = useState(false);

//   const cancelQuote = useCallback(
//     async (quoteUuid: string) => {
//       if (isCancellingRef.current || isConfirmedRef.current) return;
//       isCancellingRef.current = true;

//       try {
//         await post("crypto/cancel-quote", { quote_uuid: quoteUuid });
//       } catch (error) {
//         console.warn("cancelQuote failed:", error);
//       } finally {
//         isCancellingRef.current = false;
//       }
//     },
//     [post],
//   );

//   // Cancel quote when user navigates back
//   // useEffect(() => {
//   //   const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
//   //     if (
//   //       isConfirmedRef.current ||
//   //       e.data.action.type === "NAVIGATE" ||
//   //       isExpired
//   //     ) {
//   //       return;
//   //     }
//   //     cancelQuote(quote?.uuid);
//   //   });

//   //   return unsubscribe;
//   // }, [navigation, quote?.uuid, cancelQuote, isExpired]);

//   const setLastCancelledAt = useQuoteStore(s => s.setLastCancelledAt);

//   useEffect(() => {
//     const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
//       if (
//         isConfirmedRef.current ||
//         e.data.action.type === "NAVIGATE" ||
//         isExpired
//       ) {
//         return;
//       }

//       cancelQuote(quote?.uuid);
//       setLastCancelledAt(Date.now());
//     });

//     return unsubscribe;
//   }, [navigation, quote?.uuid, cancelQuote, isExpired]);
//   // Cancel when quote expires naturally + delay revealing expired UI by 2s
//   useEffect(() => {
//     if (!isExpired || !quote?.uuid) return;

//     cancelQuote(quote.uuid).finally(() => {
//       const timeout = setTimeout(() => {
//         setIsExpiredVisible(true);
//       }, 2000);

//       return () => clearTimeout(timeout); // cleanup if effect re-runs
//     });
//   }, [isExpired, quote?.uuid, cancelQuote]);

//   const swapMutation = useMutation({
//     mutationFn: async (values: any) => {
//       return await post("crypto/request-quote", {
//         ...values,
//         amount: Number(values.amount),
//       });
//     },
//     onSuccess: response => {
//       isCancellingRef.current = false;
//       setQuote(response?.data?.data ?? {});
//       setTimeRemaining(8);
//       setIsExpired(false);
//       setIsExpiredVisible(false); // ← reset
//     },
//     onError: (error: any) => {
//       showError(
//         error?.response?.data?.message ??
//           "Failed to get a new quote. Try again.",
//       );
//     },
//   });

//   const confirmMutation = useMutation({
//     mutationFn: async () => {
//       const response = await post("crypto/confirm-quote", {
//         quote_uuid: quote?.uuid,
//       });
//       return response;
//     },
//     onSuccess: response => {
//       isConfirmedRef.current = true;
//       const transaction = response?.data?.data ?? {};
//       setTimeRemaining(0);
//       setIsExpired(false);
//       setIsExpiredVisible(false); // ← reset
//       setIsCountdownStopped(false);

//       if (
//         transaction?.category === "CRYPTO_SWAP" &&
//         transaction?.status === "pending"
//       ) {
//         navigation.replace("PendingSwap", { transaction });
//       } else {
//         navigation.replace("TransactionDetail", { transaction });
//       }
//     },
//     onError: (error: any) => {
//       showError(
//         error?.response?.data?.message ??
//           "Confirmation failed. Please try again.",
//       );
//     },
//   });

//   useEffect(() => {
//     if (timeRemaining <= 0) {
//       setIsExpired(true);
//       return;
//     }

//     if (isCountdownStopped) return;

//     const timer = setInterval(() => {
//       setTimeRemaining(prev => {
//         if (prev <= 1) {
//           setIsExpired(true);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [timeRemaining, isCountdownStopped]);

//   const handleRequestNewQuote = () => {
//     swapMutation.mutate({
//       from_asset: quote?.from_asset_id,
//       to_asset: quote?.to_asset_id,
//       amount: quote?.amount_in_usd || 0,
//     });
//   };

//   const handleConfirm = () => {
//     if (!isExpired) {
//       setIsCountdownStopped(true);
//       confirmMutation.mutate();
//     }
//   };

//   return (
//     <SafeAreaView edges={["bottom", "right"]} style={styles.container}>
//       <StatusBar barStyle="dark-content" />
//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={{
//           backgroundColor: "white",
//           paddingBottom: 20,
//           paddingHorizontal: 20,
//           justifyContent: "space-between",
//           flex: 1,
//         }}
//       >
//         <View>
//           <View style={styles.assetBox}>
//             <View style={styles.assetHeader}>
//               <AppText style={styles.assetLabel}>From</AppText>
//             </View>
//             <View style={styles.assetRow}>
//               <Image
//                 source={{ uri: quote?.from_asset_logo }}
//                 style={styles.assetLogo}
//               />
//               <View style={styles.assetInfo}>
//                 <AppText style={styles.assetSymbol}>
//                   {quote?.from_asset_symbol}
//                 </AppText>
//               </View>
//               <View style={styles.assetAmount}>
//                 <AppText style={styles.assetValue}>
//                   {quote?.from_amount}
//                 </AppText>
//               </View>
//             </View>
//           </View>

//           <View style={styles.swapIconBox}>
//             <View
//               style={{
//                 backgroundColor: "#ffe6d3ff",
//                 borderRadius: 2000,
//                 padding: 3,
//                 shadowColor: COLORS.whiteBackground,
//                 shadowOpacity: 0.3,
//                 shadowRadius: 6,
//                 elevation: 3,
//                 marginVertical: -20,
//                 zIndex: 1000,
//               }}
//             >
//               <View style={styles.swapIcon}>
//                 <ArrowDown size={15} color="white" />
//               </View>
//             </View>
//           </View>

//           <View style={styles.assetBox}>
//             <View style={styles.assetHeader}>
//               <AppText style={styles.assetLabel}>To (Expected)</AppText>
//             </View>
//             <View style={styles.assetRow}>
//               <Image
//                 source={{ uri: quote?.to_asset_logo }}
//                 style={styles.assetLogo}
//               />
//               <View style={styles.assetInfo}>
//                 <AppText style={styles.assetSymbol}>
//                   {quote?.to_asset_symbol}
//                 </AppText>
//               </View>
//               <View style={styles.assetAmount}>
//                 <AppText style={styles.assetValue}>{quote?.to_amount}</AppText>
//               </View>
//             </View>
//           </View>

//           <View style={{ paddingVertical: 4 }}>
//             <View style={styles.detailsBox}>
//               <View style={styles.detailRow}>
//                 <AppText style={styles.detailLabel}>Conversion Rate</AppText>
//                 <AppText style={styles.detailValue}>
//                   1 {quote?.from_asset_symbol} ={" "}
//                   {formatNumber(quote?.exchange_rate || 0)}{" "}
//                   {quote?.to_asset_symbol}
//                 </AppText>
//               </View>
//               <View style={styles.securityNote}>
//                 <AppText style={styles.securityText}>
//                   This quote is guaranteed for the duration of the timer. Rates
//                   are locked and protected from market fluctuations.
//                 </AppText>
//               </View>
//             </View>

//             {/* Use isExpiredVisible so the message only appears after the 2s delay */}
//             {isExpiredVisible && (
//               <View style={styles.expiredBox}>
//                 <AppText style={styles.expiredText}>
//                   This quote has expired. Market rates may have changed. Please
//                   request a new quote to continue.
//                 </AppText>
//               </View>
//             )}
//           </View>
//         </View>

//         <View style={styles.buttonBox}>
//           {!isExpiredVisible && (
//             <TouchableOpacity
//               hitSlop={10}
//               activeOpacity={0.9}
//               onPress={handleConfirm}
//               disabled={isExpired || confirmMutation.isPending}
//               style={[
//                 styles.confirmButton,
//                 (isExpired || confirmMutation.isPending) &&
//                   styles.disabledButton,
//               ]}
//             >
//               <AppText style={styles.confirmText}>
//                 {confirmMutation.isPending
//                   ? "Confirming..."
//                   : isExpired
//                   ? "Quote Expired" // shows briefly during the 2s window
//                   : `Confirm Quote (${timeRemaining}s)`}
//               </AppText>
//             </TouchableOpacity>
//           )}

//           {isExpiredVisible && (
//             <TouchableOpacity
//               hitSlop={10}
//               activeOpacity={0.9}
//               onPress={handleRequestNewQuote}
//               disabled={swapMutation.isPending}
//               style={[
//                 styles.cancelButton,
//                 swapMutation.isPending && styles.disabledButton,
//               ]}
//             >
//               <AppText style={styles.cancelText}>Request New Quote</AppText>
//             </TouchableOpacity>
//           )}
//         </View>
//       </ScrollView>

//       <CustomLoading
//         loading={swapMutation.isPending || confirmMutation.isPending}
//       />
//     </SafeAreaView>
//   );
// }

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
import { getFontFamily, normalize } from "../constants/settings";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import useAxios from "../hooks/useAxios";
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
      const response = await post("crypto/confirm-quote", {
        quote_uuid: quote?.uuid,
      });
      return response;
    },
    onSuccess: response => {
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
        style={{ flex: 1 }}
        contentContainerStyle={{
          backgroundColor: colors.background,
          paddingBottom: 20,
          paddingHorizontal: 20,
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
                padding: 3,
                shadowColor: colors.shadow,
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 3,
                marginVertical: -20,
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

          <View style={{ paddingVertical: 4 }}>
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
    header: { alignItems: "center", marginBottom: 12 },
    expiredBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.background,
      borderColor: colors.error,
      borderWidth: 0.5,
      borderRadius: 8,
      padding: 10,
      marginTop: 19,
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
      padding: 12,
      marginBottom: 6,
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
    assetRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
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
      marginLeft: 5,
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
      color: colors.text,
    },
    detailValue: {
      fontFamily: getFontFamily("700"),
      fontSize: 13,
      fontWeight: "500",
      color: colors.text,
    },
    securityNote: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 8,
    },
    securityText: {
      fontFamily: getFontFamily("700"),
      fontSize: normalize(17),
      color: colors.textMuted,
      marginTop: 12,
    },
    buttonBox: { marginTop: 16 },
    confirmButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 120,
      alignItems: "center",
      marginBottom: 10,
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
      paddingVertical: 13,
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
      marginTop: 12,
    },
  });

// export default function ConversionQuote() {
//   const route = useRoute();
//   const { post } = useAxios();
//   const navigation: any = useNavigation();
//   const { quote: initialQuote }: any = route.params;
//   const [quote, setQuote] = useState(initialQuote);
//   const [timeRemaining, setTimeRemaining] = useState(8);
//   const [isExpired, setIsExpired] = useState(false);
//   const [isExpiredVisible, setIsExpiredVisible] = useState(false);
//   const isCancellingRef = useRef(false);
//   const isConfirmedRef = useRef(false);
//   const [isCountdownStopped, setIsCountdownStopped] = useState(false);

//   const cancelQuote = useCallback(
//     async (quoteUuid: string) => {
//       if (isCancellingRef.current || isConfirmedRef.current) return;
//       isCancellingRef.current = true;

//       console.log("cancelling quote....");

//       try {
//         await post("crypto/cancel-quote", { quote_uuid: quoteUuid });
//       } catch (error) {
//         console.warn("cancelQuote failed:", error);
//       } finally {
//         isCancellingRef.current = false;
//       }
//     },
//     [post],
//   );

//   // Cancel quote when user navigates back
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
//       // Don't cancel if user confirmed, is navigating forward, or quote already expired
//       if (
//         isConfirmedRef.current ||
//         e.data.action.type === "NAVIGATE" ||
//         isExpired
//       ) {
//         return;
//       }
//       cancelQuote(quote?.uuid);
//     });

//     return unsubscribe;
//   }, [navigation, quote?.uuid, cancelQuote, isExpired]);

//   useEffect(() => {
//     if (isExpired && quote?.uuid) {
//       cancelQuote(quote.uuid).finally(() => {
//         // Wait 2s after cancel attempt before showing the "Request New Quote" button
//         setTimeout(() => {
//           setIsExpiredVisible(true);
//         }, 6000);
//       });
//     }
//   }, [isExpired, quote?.uuid, cancelQuote]);

//   // console.log("loop");
//   // // Cancel when quote expires naturally
//   // useEffect(() => {
//   //   if (isExpired && quote?.uuid) {
//   //     cancelQuote(quote.uuid);
//   //   }
//   // }, [isExpired, quote?.uuid, cancelQuote]);

//   const swapMutation = useMutation({
//     mutationFn: async (values: any) => {
//       return await post("crypto/request-quote", {
//         ...values,
//         amount: Number(values.amount),
//       });
//     },
//     onSuccess: response => {
//       // Reset cancelling ref for the new quote
//       isCancellingRef.current = false;
//       setQuote(response?.data?.data ?? {});
//       setTimeRemaining(8);
//       setIsExpired(false);
//     },
//     onError: (error: any) => {
//       showError(
//         error?.response?.data?.message ??
//           "Failed to get a new quote. Try again.",
//       );
//     },
//   });

//   const confirmMutation = useMutation({
//     mutationFn: async () => {
//       const response = await post("crypto/confirm-quote", {
//         quote_uuid: quote?.uuid,
//       });
//       return response;
//     },
//     onSuccess: response => {
//       isConfirmedRef.current = true; // prevent cancel firing on navigate
//       const transaction = response?.data?.data ?? {};
//       setTimeRemaining(0);
//       setIsExpired(false);
//       setIsCountdownStopped(false);

//       if (
//         transaction?.category === "CRYPTO_SWAP" &&
//         transaction?.status === "pending"
//       ) {
//         navigation.replace("PendingSwap", { transaction });
//       } else {
//         navigation.replace("TransactionDetail", { transaction });
//       }
//     },
//     onError: (error: any) => {
//       showError(
//         error?.response?.data?.message ??
//           "Confirmation failed. Please try again.",
//       );
//     },
//   });

//   // useEffect(() => {
//   //   if (timeRemaining <= 0) {
//   //     setIsExpired(true);
//   //     return;
//   //   }

//   //   const timer = setInterval(() => {
//   //     setTimeRemaining(prev => {
//   //       if (prev <= 1) {
//   //         setIsExpired(true);
//   //         return 0;
//   //       }
//   //       return prev - 1;
//   //     });
//   //   }, 1000);

//   //   return () => clearInterval(timer);
//   // }, [timeRemaining]);

//   useEffect(() => {
//     if (timeRemaining <= 0) {
//       setIsExpired(true);
//       return;
//     }

//     // Stop ticking if user already confirmed
//     if (isCountdownStopped) return;

//     const timer = setInterval(() => {
//       setTimeRemaining(prev => {
//         if (prev <= 1) {
//           setIsExpired(true);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [timeRemaining, isCountdownStopped]);

//   const handleRequestNewQuote = () => {
//     swapMutation.mutate({
//       from_asset: quote?.from_asset_id,
//       to_asset: quote?.to_asset_id,
//       amount: quote?.amount_in_usd || 0,
//     });
//   };

//   const handleConfirm = () => {
//     if (!isExpired) {
//       setIsCountdownStopped(true);
//       confirmMutation.mutate();
//     }
//   };

//   return (
//     <SafeAreaView edges={["bottom", "right"]} style={styles.container}>
//       <StatusBar barStyle="dark-content" />
//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={{
//           backgroundColor: "white",
//           paddingBottom: 20,
//           paddingHorizontal: 20,
//           justifyContent: "space-between",
//           flex: 1,
//         }}
//       >
//         <View>
//           <View style={styles.assetBox}>
//             <View style={styles.assetHeader}>
//               <AppText style={styles.assetLabel}>From</AppText>
//             </View>
//             <View style={styles.assetRow}>
//               <Image
//                 source={{ uri: quote?.from_asset_logo }}
//                 style={styles.assetLogo}
//               />
//               <View style={styles.assetInfo}>
//                 <AppText style={styles.assetSymbol}>
//                   {quote?.from_asset_symbol}
//                 </AppText>
//               </View>
//               <View style={styles.assetAmount}>
//                 <AppText style={styles.assetValue}>{quote?.from_amount}</AppText>
//               </View>
//             </View>
//           </View>

//           <View style={styles.swapIconBox}>
//             <View
//               style={{
//                 backgroundColor: "#ffe6d3ff",
//                 borderRadius: 2000,
//                 padding: 3,
//                 shadowColor: COLORS.whiteBackground,
//                 shadowOpacity: 0.3,
//                 shadowRadius: 6,
//                 elevation: 3,
//                 marginVertical: -20,
//                 zIndex: 1000,
//               }}
//             >
//               <View style={styles.swapIcon}>
//                 <ArrowDown size={15} color="white" />
//               </View>
//             </View>
//           </View>

//           <View style={styles.assetBox}>
//             <View style={styles.assetHeader}>
//               <AppText style={styles.assetLabel}>To (Expected)</AppText>
//             </View>
//             <View style={styles.assetRow}>
//               <Image
//                 source={{ uri: quote?.to_asset_logo }}
//                 style={styles.assetLogo}
//               />
//               <View style={styles.assetInfo}>
//                 <AppText style={styles.assetSymbol}>{quote?.to_asset_symbol}</AppText>
//               </View>
//               <View style={styles.assetAmount}>
//                 <AppText style={styles.assetValue}>{quote?.to_amount}</AppText>
//               </View>
//             </View>
//           </View>

//           <View style={{ paddingVertical: 4 }}>
//             <View style={styles.detailsBox}>
//               <View style={styles.detailRow}>
//                 <AppText style={styles.detailLabel}>Conversion Rate</AppText>
//                 <AppText style={styles.detailValue}>
//                   1 {quote?.from_asset_symbol} ={" "}
//                   {formatNumber(quote?.exchange_rate || 0)}{" "}
//                   {quote?.to_asset_symbol}
//                 </Text>
//               </View>
//               <View style={styles.securityNote}>
//                 <AppText style={styles.securityText}>
//                   This quote is guaranteed for the duration of the timer. Rates
//                   are locked and protected from market fluctuations.
//                 </AppText>
//               </View>
//             </View>

//             {isExpired && (
//               <View style={styles.expiredBox}>
//                 <AppText style={styles.expiredText}>
//                   This quote has expired. Market rates may have changed. Please
//                   request a new quote to continue.
//                 </AppText>
//               </View>
//             )}
//           </View>
//         </View>

//         <View style={styles.buttonBox}>
//           {!isExpired && (
//             // <TouchableOpacity
//             //   onPress={handleConfirm}
//             //   disabled={isExpired || confirmMutation.isPending}
//             //   style={[
//             //     styles.confirmButton,
//             //     (isExpired || confirmMutation.isPending) &&
//             //       styles.disabledButton,
//             //   ]}
//             // >
//             //   {/* {confirmMutation.isPending ? (
//             //     <ActivityIndicator color="#fff" size="small" />
//             //   ) : ( */}
//             //   <AppText style={styles.confirmText}>
//             //     {`Confirm Quote (${timeRemaining}s)`}
//             //   </AppText>
//             //   {/* )} */}
//             // </TouchableOpacity>
//             <TouchableOpacity
//               onPress={handleConfirm}
//               disabled={isExpired || confirmMutation.isPending}
//               style={[
//                 styles.confirmButton,
//                 (isExpired || confirmMutation.isPending) &&
//                   styles.disabledButton,
//               ]}
//             >
//               <AppText style={styles.confirmText}>
//                 {confirmMutation.isPending
//                   ? "Confirming..."
//                   : `Confirm Quote (${timeRemaining}s)`}
//               </AppText>
//             </TouchableOpacity>
//           )}

//           {isExpired && (
//             <TouchableOpacity
//               onPress={handleRequestNewQuote}
//               disabled={swapMutation.isPending}
//               style={[
//                 styles.cancelButton,
//                 swapMutation.isPending && styles.disabledButton,
//               ]}
//             >
//               <AppText style={styles.cancelText}>Request New Quote</AppText>
//             </TouchableOpacity>
//           )}
//         </View>
//       </ScrollView>

//       <CustomLoading
//         loading={swapMutation.isPending || confirmMutation.isPending}
//       />
//     </SafeAreaView>
//   );
// }

// export default function ConversionQuote() {
//   const route = useRoute();
//   const { post } = useAxios();
//   const navigation: any = useNavigation();
//   const { quote: initialQuote }: any = route.params;
//   const [quote, setQuote] = useState(initialQuote);
//   const [timeRemaining, setTimeRemaining] = useState(8);
//   const [isExpired, setIsExpired] = useState(false);

//   const swapMutation = useMutation({
//     mutationFn: async (values: any) => {
//       return await post("crypto/request-quote", {
//         ...values,
//         amount: Number(values.amount),
//       });
//     },
//     onSuccess: response => {
//       setQuote(response?.data?.data ?? {});
//       setTimeRemaining(8);
//       setIsExpired(false);
//     },
//     onError: (error: any) => {
//       console.error("Swap failed:", error);
//     },
//   });

//   const confirmMutation = useMutation({
//     mutationFn: async () => {
//       const response = await post("crypto/confirm-quote", {
//         quote_uuid: quote?.uuid,
//       });

//       return response;
//     },
//     onSuccess: response => {
//       const transaction = response?.data?.data ?? {};
//       setTimeRemaining(0);
//       setIsExpired(false);

//       if (
//         transaction?.category === "CRYPTO_SWAP" &&
//         transaction?.status === "pending"
//       ) {
//         navigation.replace("PendingSwap", { transaction });
//       } else {
//         navigation.replace("TransactionDetail", { transaction });
//       }
//     },
//     onError: (error: any) => {
//       console.error("Confirmation failed:", error);
//     },
//   });

//   useEffect(() => {
//     if (timeRemaining <= 0) {
//       setIsExpired(true);
//       return;
//     }

//     const timer = setInterval(() => {
//       setTimeRemaining(prev => {
//         if (prev <= 1) {
//           setIsExpired(true);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [timeRemaining]);

//   const handleRequestNewQuote = () => {
//     swapMutation.mutate({
//       from_asset: quote?.from_asset_id,
//       to_asset: quote?.to_asset_id,
//       amount: quote?.amount_in_usd || 0,
//     });
//   };

//   const handleConfirm = () => {
//     if (!isExpired) {
//       confirmMutation.mutate();
//     }
//   };

//   return (
//     <SafeAreaView edges={["bottom", "right"]} style={styles.container}>
//       <StatusBar barStyle="dark-content" />
//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={{
//           backgroundColor: "white",
//           paddingBottom: 20,
//           paddingHorizontal: 20,
//           justifyContent: "space-between",
//           flex: 1,
//         }}
//       >
//         <View>
//           <View style={styles.assetBox}>
//             <View style={styles.assetHeader}>
//               <AppText style={styles.assetLabel}>From</AppText>
//             </View>
//             <View style={styles.assetRow}>
//               <Image
//                 source={{ uri: quote?.from_asset_logo }}
//                 style={styles.assetLogo}
//               />
//               <View style={styles.assetInfo}>
//                 <AppText style={styles.assetSymbol}>
//                   {quote?.from_asset_symbol}
//                 </AppText>
//               </View>
//               <View style={styles.assetAmount}>
//                 <AppText style={styles.assetValue}>{quote?.from_amount}</AppText>
//               </View>
//             </View>
//           </View>
//           <View style={styles.swapIconBox}>
//             <View
//               style={{
//                 backgroundColor: "#ffe6d3ff",
//                 borderRadius: 2000,
//                 padding: 3,
//                 shadowColor: COLORS.whiteBackground,
//                 shadowOpacity: 0.3,
//                 shadowRadius: 6,
//                 elevation: 3,
//                 marginVertical: -20,
//                 zIndex: 1000,
//               }}
//             >
//               <View style={styles.swapIcon}>
//                 <ArrowDown size={15} color="white" />
//               </View>
//             </View>
//           </View>
//           <View style={styles.assetBox}>
//             <View style={styles.assetHeader}>
//               <AppText style={styles.assetLabel}>To (Expected)</AppText>
//             </View>
//             <View style={styles.assetRow}>
//               <Image
//                 source={{ uri: quote?.to_asset_logo }}
//                 style={styles.assetLogo}
//               />
//               <View style={styles.assetInfo}>
//                 <AppText style={styles.assetSymbol}>{quote?.to_asset_symbol}</AppText>
//               </View>
//               <View style={styles.assetAmount}>
//                 <AppText style={styles.assetValue}>{quote?.to_amount}</AppText>
//               </View>
//             </View>
//           </View>
//           <View style={{ paddingVertical: 4 }}>
//             <View style={styles.detailsBox}>
//               <View style={styles.detailRow}>
//                 <AppText style={styles.detailLabel}>Conversion Rate</AppText>
//                 <AppText style={styles.detailValue}>
//                   1 {quote?.from_asset_symbol} ={" "}
//                   {formatNumber(quote?.exchange_rate || 0)}{" "}
//                   {quote?.to_asset_symbol}
//                 </Text>
//               </View>
//               <View style={styles.securityNote}>
//                 <AppText style={styles.securityText}>
//                   This quote is guaranteed for the duration of the timer. Rates
//                   are locked and protected from market fluctuations.
//                 </AppText>
//               </View>
//             </View>
//             {isExpired && (
//               <View style={styles.expiredBox}>
//                 <AppText style={styles.expiredText}>
//                   This quote has expired. Market rates may have changed. Please
//                   request a new quote to continue.
//                 </AppText>
//               </View>
//             )}
//           </View>
//         </View>
//         <View style={styles.buttonBox}>
//           {!isExpired && (
//             <TouchableOpacity
//               onPress={handleConfirm}
//               disabled={isExpired}
//               style={[styles.confirmButton, isExpired && styles.disabledButton]}
//             >
//               <AppText style={styles.confirmText}>
//                 {`Confirm Quote (${timeRemaining}s)`}
//               </AppText>
//             </TouchableOpacity>
//           )}
//           {isExpired && (
//             <TouchableOpacity
//               onPress={handleRequestNewQuote}
//               style={styles.cancelButton}
//             >
//               <AppText style={styles.cancelText}>Request New Quote</AppText>
//             </TouchableOpacity>
//           )}
//         </View>
//       </ScrollView>

//       <CustomLoading
//         loading={swapMutation.isPending || confirmMutation.isPending}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "#ffffff",
//     flex: 1,
//   },
//   assetLogo: {
//     width: 35,
//     height: 35,
//     borderRadius: 120,
//     borderWidth: 1,
//     borderColor: "#cdcdcdff",
//     backgroundColor: "#fff",
//   },
//   header: { alignItems: "center", marginBottom: 12 },
//   expiredBox: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     backgroundColor: "#fff9f9ff",
//     borderColor: "#fca5a5",
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 10,
//     marginTop: 19,
//     gap: 2,
//   },
//   expiredText: {
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(17),
//     color: "#b91c1c",
//     flex: 1,
//   },
//   assetBox: {
//     backgroundColor: "#f8fff7ff",
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 6,
//   },
//   assetHeader: { flexDirection: "row", justifyContent: "space-between" },
//   assetLabel: { fontFamily: getFontFamily("700"), fontSize: 14, color: "#666" },
//   assetBalance: {
//     fontFamily: getFontFamily("700"),
//     fontSize: 11,
//     color: "#999",
//   },
//   assetRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
//   assetIcon: {
//     width: 30,
//     height: 30,
//     borderRadius: 200,
//     backgroundColor: "#f97316",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   assetIconText: {
//     color: "#fff",
//     fontFamily: getFontFamily("700"),
//     fontSize: 18,
//     fontWeight: "700",
//   },
//   assetInfo: { flex: 1 },
//   assetSymbol: {
//     fontFamily: getFontFamily("900"),
//     fontSize: 20,
//     color: "#000",
//     marginLeft: 5,
//   },
//   assetAmount: { alignItems: "flex-end" },
//   assetValue: {
//     fontFamily: getFontFamily("900"),
//     fontSize: 19,
//     color: "#111",
//   },
//   swapIconBox: { alignItems: "center" },
//   swapIcon: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 24,
//     padding: 10,
//   },
//   detailsBox: { marginTop: 12 },
//   detailRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginVertical: 4,
//   },
//   detailLabel: {
//     fontFamily: getFontFamily("700"),
//     fontSize: 13,
//     color: "#000",
//   },
//   detailValue: {
//     fontFamily: getFontFamily("700"),
//     fontSize: 13,
//     fontWeight: "500",
//     color: "#111",
//   },
//   securityNote: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginTop: 8,
//   },
//   securityText: {
//     fontFamily: getFontFamily("700"),
//     fontSize: 13,
//     color: "#474747ff",
//   },
//   buttonBox: { marginTop: 16 },
//   confirmButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     borderRadius: 120,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   confirmText: {
//     color: "#fff",
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(18),
//   },
//   disabledButton: { backgroundColor: "#d1dbd4ff" },
//   cancelButton: {
//     borderColor: COLORS.primary,
//     borderWidth: 1,
//     paddingVertical: 13,
//     borderRadius: 120,
//     alignItems: "center",
//   },
//   cancelText: {
//     color: COLORS.primary,
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(18),
//   },
//   footerNote: {
//     textAlign: "center",
//     fontFamily: getFontFamily("700"),
//     fontSize: 11,
//     color: "#666",
//     marginTop: 12,
//   },
// });
