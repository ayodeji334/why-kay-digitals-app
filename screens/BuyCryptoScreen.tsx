// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Image,
//   RefreshControl,
//   useColorScheme,
// } from "react-native";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as Yup from "yup";
// import {
//   RouteProp,
//   useFocusEffect,
//   useNavigation,
//   useRoute,
// } from "@react-navigation/native";
// import { getFontFamily, normalize } from "../constants/settings";
// import { COLORS } from "../constants/colors";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { formatAmount } from "../libs/formatNumber";
// import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
// import { useFiatBalance } from "../hooks/useFiatBalance";
// import { TradeIntent } from "../libs/types";
// import { showError } from "../utlis/toast";
// import useAxios from "../hooks/useAxios";
// import { useQuery } from "@tanstack/react-query";
// import { resolveRateFromCategories } from "./SellCrytpoScreen";
// import CustomLoading from "../components/CustomLoading";
// import { AppText } from "../components/AppText";
// import { useColors } from "../hooks/useTheme";
// import { useCryptoLimits } from "../hooks/useCryptoLimits";
// import { useServiceCharges } from "../hooks/useServiceCharges";

// type CryptoBuyScreenParams = {
//   CryptoBuy: {
//     intent: TradeIntent;
//   };
// };

// function relativeChangeExceeded(
//   current: number,
//   used: number,
//   tolerancePercent = 1.23,
// ): boolean {
//   if (!isFinite(current) || !isFinite(used) || used <= 0) return false;
//   const diff = Math.abs(current - used);
//   const relativePercent = (diff / used) * 100;
//   return relativePercent > tolerancePercent;
// }

// export function buildCryptoAmountSchema(minAmount: number) {
//   return Yup.object().shape({
//     amount: Yup.number()
//       .typeError("Enter a valid amount")
//       .required("Amount is required")
//       .min(minAmount, `Minimum amount is $${minAmount}`),
//     asset_id: Yup.string().required(),
//   });
// }

// const schema = Yup.object().shape({
//   asset_id: Yup.string().required("Select the crypto you want to convert from"),
//   amount: Yup.number()
//     .typeError("Enter a valid amount")
//     .min(20, "The amount is too small. The minimum amount you can buy is $20")
//     .required("Amount is required"),
// });

// const STABLECOINS = ["USDT"];

// export function calculateBuyFeeBreakdown(
//   amount: number,
//   marketPrice: number,
//   buyRate: number,
//   symbol?: string,
//   buyFeeRate = 0.001,
// ) {
//   const isStablecoin = STABLECOINS.includes((symbol ?? "").toUpperCase());
//   const coinAmount = marketPrice > 0 ? amount / marketPrice : 0;
//   const platformFeeUsd = isStablecoin ? 0 : amount * buyFeeRate;
//   const platformFeeCoin = isStablecoin ? 0 : coinAmount * buyFeeRate;
//   const totalCostUsd = amount + platformFeeUsd;
//   const totalCostNgn = buyRate > 0 ? totalCostUsd * buyRate : 0;

//   return {
//     assetValueEquivalent: coinAmount.toFixed(8),
//     ngnAmount:
//       buyRate > 0 ? formatAmount(totalCostNgn, { decimalPlace: 2 }) : "0.00",
//     feeBreakdown: {
//       grossUsd: amount,
//       coinAmount: coinAmount.toFixed(8),
//       platformFeeUsd: platformFeeUsd.toFixed(3),
//       platformFeeCoin: platformFeeCoin.toFixed(8),
//       totalCostUsd: totalCostUsd.toFixed(3),
//       totalCostNgn,
//       isStablecoin,
//       currentBuyRate: buyRate,
//       marketCurrentPrice: marketPrice,
//       buyFeeRate,
//     },
//   };
// }

// // export function calculateBuyFeeBreakdown(
// //   amount: number,
// //   marketPrice: number,
// //   buyRate: number,
// //   symbol?: string,
// // ) {
// //   const isStablecoin = STABLECOINS.includes((symbol ?? "").toUpperCase());
// //   const coinAmount = marketPrice > 0 ? amount / marketPrice : 0;
// //   const platformFeeUsd = isStablecoin ? 0 : amount * 0.001;
// //   const platformFeeCoin = isStablecoin ? 0 : coinAmount * 0.001;
// //   const totalCostUsd = amount + platformFeeUsd;
// //   const totalCostNgn = buyRate > 0 ? totalCostUsd * buyRate : 0;

// //   return {
// //     assetValueEquivalent: coinAmount.toFixed(8),
// //     ngnAmount:
// //       buyRate > 0 ? formatAmount(totalCostNgn, { decimalPlace: 2 }) : "0.00",
// //     feeBreakdown: {
// //       grossUsd: amount,
// //       coinAmount: coinAmount.toFixed(8),
// //       platformFeeUsd: platformFeeUsd.toFixed(3),
// //       platformFeeCoin: platformFeeCoin.toFixed(8),
// //       totalCostUsd: totalCostUsd.toFixed(3),
// //       totalCostNgn,
// //       isStablecoin,
// //       currentBuyRate: buyRate,
// //       marketCurrentPrice: marketPrice,
// //     },
// //   };
// // }

// export default function CryptoBuyScreen() {
//   const { apiGet } = useAxios();
//   const route = useRoute<RouteProp<CryptoBuyScreenParams, "CryptoBuy">>();
//   const { intent } = route.params;
//   const navigation: any = useNavigation();
//   const selectedAssetUuid = intent.assetId ?? "";
//   const { fiatBalance } = useFiatBalance();
//   const { minBuyAmount } = useCryptoLimits();
//   const { getCharge } = useServiceCharges();
//   const buyFee = getCharge("crypto_buy_fee");

//   const schema = useMemo(
//     () => buildCryptoAmountSchema(minBuyAmount),
//     [minBuyAmount],
//   );

//   // Local state
//   const [displayAmount, setDisplayAmount] = useState("");
//   const [feeBreakdown, setFeeBreakdown] = useState<any>(null);
//   const [ngnAmount, setNgnAmount] = useState("0.00");
//   const [assetValueEquivalent, setAssetValueEquivalent] = useState<any>(0);
//   const [refreshing, setRefreshing] = useState(false);

//   const acknowledgedBuyRateRef = useRef<number>(0);
//   const acknowledgedMarketPriceRef = useRef<number>(0);
//   const rateOverriddenRef = useRef(false);

//   const colors = useColors();
//   const styles = makeStyles(colors);

//   const {
//     control,
//     handleSubmit,
//     setValue,
//     watch,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: { amount: undefined, asset_id: intent?.assetId ?? "" },
//     mode: "onChange",
//   });

//   const amount = watch("amount");

//   // Asset details query
//   const {
//     data: assetDetails,
//     isLoading,
//     refetch,
//   } = useQuery({
//     queryKey: ["asset-detail-buy", selectedAssetUuid],
//     queryFn: async () => {
//       if (!selectedAssetUuid) return null;
//       const res = await apiGet(`/wallets/${selectedAssetUuid}`);
//       return res?.data?.data ?? null;
//     },
//     enabled: !!selectedAssetUuid,
//   });

//   console.log(assetDetails);

//   // Derived values
//   const TOLERANCE_PERCENT = 1.23;

//   const marketPrice = useMemo(
//     () =>
//       feeBreakdown?.currentMarketPrice ??
//       assetDetails?.market_current_value ??
//       0,
//     [feeBreakdown?.currentMarketPrice, assetDetails?.market_current_value],
//   );

//   const hasInsufficientBalance = useMemo(() => {
//     if (!feeBreakdown?.totalCostNgn) return false;
//     return feeBreakdown?.totalCostNgn > fiatBalance;
//   }, [feeBreakdown?.totalCostNgn, fiatBalance]);

//   const insufficientBalanceMessage = useMemo(() => {
//     if (!hasInsufficientBalance || !amount || !fiatBalance) return null;

//     if (amount > fiatBalance) {
//       return `Insufficient balance. Your total balance is ${formatAmount(
//         fiatBalance,
//         { currency: "NGN", decimalPlace: 2 },
//       )}`;
//     }

//     const maxBuyable =
//       fiatBalance / (1 + (feeBreakdown?.isStablecoin ? 0 : 0.001));
//     return `You can only buy up to ${formatAmount(maxBuyable, {
//       currency: "NGN",
//       decimalPlace: 2,
//     })} with your current balance (including charges).`;
//   }, [hasInsufficientBalance, fiatBalance, feeBreakdown, amount]);

//   // Recalculate helper
//   // const recalculate = useCallback(
//   //   (amt: number, price: number, rate: number) => {
//   //     const result = calculateBuyFeeBreakdown(
//   //       amt,
//   //       price,
//   //       rate,
//   //       assetDetails?.symbol,
//   //     );
//   //     setAssetValueEquivalent(result.assetValueEquivalent);
//   //     setFeeBreakdown({ ...result.feeBreakdown });
//   //     setNgnAmount(result.ngnAmount);
//   //   },
//   //   [assetDetails?.symbol],
//   // );

//   const recalculate = useCallback(
//     (amt: number, price: number, rate: number) => {
//       const result = calculateBuyFeeBreakdown(
//         amt,
//         price,
//         rate,
//         assetDetails?.symbol,
//         buyFee?.value ? parseFloat(buyFee.value) : 0.001,
//       );
//       setAssetValueEquivalent(result.assetValueEquivalent);
//       setFeeBreakdown({ ...result.feeBreakdown });
//       setNgnAmount(result.ngnAmount);
//     },
//     [assetDetails?.symbol, buyFee],
//   );

//   useEffect(() => {
//     if (!assetDetails?.rates?.buy || Number(marketPrice) <= 0) return;
//     if (rateOverriddenRef.current) return;

//     const effectiveRate = resolveRateFromCategories(
//       amount,
//       assetDetails.rates.buy,
//     );
//     if (!effectiveRate || effectiveRate <= 0) return;

//     recalculate(amount, Number(marketPrice), effectiveRate);
//   }, [assetDetails?.rates?.buy, amount, marketPrice, recalculate]);

//   // Effect: seed acknowledged refs
//   useEffect(() => {
//     if (assetDetails?.rates?.buy && amount >= 0) {
//       acknowledgedBuyRateRef.current = resolveRateFromCategories(
//         amount,
//         assetDetails.rates.buy,
//       );
//     } else if (assetDetails?.buy_rate) {
//       acknowledgedBuyRateRef.current = parseFloat(assetDetails.buy_rate);
//     }
//   }, [assetDetails?.rates?.buy, assetDetails?.buy_rate, amount]);

//   useEffect(() => {
//     if (Number(marketPrice) > 0) {
//       acknowledgedMarketPriceRef.current = Number(marketPrice);
//     }
//   }, [marketPrice]);

//   // Effect: pre-fill amount from intent
//   // useEffect(() => {
//   //   if (!intent?.amount) return;
//   //   const numericAmount = Number(intent.amount);
//   //   if (isNaN(numericAmount)) return;
//   //   setDisplayAmount(formatWithCommas(numericAmount.toString()));
//   //   setValue("amount", numericAmount);
//   // }, [intent?.amount]);

//   // // Focus refetch
//   // useFocusEffect(
//   //   useCallback(() => {
//   //     refetch();
//   //   }, [refetch]),
//   // );

//   // // Reset on mount
//   // useResetFormOnMount(
//   //   reset,
//   //   { amount: 0, asset_id: intent.assetId ?? "" },
//   //   () => {
//   //     setDisplayAmount("");
//   //     setFeeBreakdown(null);
//   //     setAssetValueEquivalent(0);
//   //     setNgnAmount("0.00");
//   //     rateOverriddenRef.current = false;
//   //   },
//   // );

//   useFocusEffect(
//     useCallback(() => {
//       // Reset first
//       setDisplayAmount("");
//       setFeeBreakdown(null);
//       setAssetValueEquivalent(0);
//       setNgnAmount("0.00");
//       rateOverriddenRef.current = false;
//       reset({ amount: 0, asset_id: intent.assetId ?? "" });

//       // Then pre-fill from intent if available
//       if (intent?.amount) {
//         const numericAmount = Number(intent.amount);
//         if (!isNaN(numericAmount) && numericAmount > 0) {
//           setDisplayAmount(formatWithCommas(numericAmount.toString()));
//           setValue("amount", numericAmount);
//         }
//       }

//       // Refetch asset data
//       refetch();
//     }, [intent?.amount, intent?.assetId, refetch, reset, setValue]),
//   );

//   // Submit
//   const onSubmit = async (values: any) => {
//     try {
//       const res = await apiGet(`/crypto-assets/${selectedAssetUuid}/rates`);
//       const latestRates = res?.data?.asset ?? null;

//       if (!latestRates) {
//         showError("Unable to fetch latest rates.");
//         return;
//       }

//       const currentMarketPrice = parseFloat(
//         latestRates.market_current_value ?? "0",
//       );

//       const buyRateData = latestRates.rates?.buy ?? null;
//       const currentBuyRate = buyRateData
//         ? resolveRateFromCategories(values.amount, buyRateData)
//         : parseFloat(latestRates.buy_rate ?? "0");

//       const usedBuyRate = acknowledgedBuyRateRef.current;
//       const usedMarketPrice = acknowledgedMarketPriceRef.current;

//       const previousCategory =
//         buyRateData?.categories?.find(
//           (cat: any) =>
//             values.amount >= parseFloat(cat.min_amount) &&
//             values.amount <= parseFloat(cat.max_amount),
//         ) ?? null;

//       const buyRateChanged =
//         currentBuyRate > 0 && currentBuyRate !== usedBuyRate;
//       const marketPriceExceeded = relativeChangeExceeded(
//         currentMarketPrice,
//         usedMarketPrice,
//         TOLERANCE_PERCENT,
//       );

//       if (buyRateChanged || marketPriceExceeded) {
//         // rateOverriddenRef.current = true;
//         // acknowledgedBuyRateRef.current = currentBuyRate;
//         // acknowledgedMarketPriceRef.current = currentMarketPrice;

//         // recalculate(values.amount, currentMarketPrice, currentBuyRate);
//         rateOverriddenRef.current = true;
//         acknowledgedBuyRateRef.current = currentBuyRate;
//         acknowledgedMarketPriceRef.current = currentMarketPrice;

//         recalculate(values.amount, currentMarketPrice, currentBuyRate);

//         const reasons: string[] = [];

//         if (buyRateChanged) {
//           const categoryLabel = previousCategory?.label ?? "default rate";
//           reasons.push(
//             `Buy rate changed from ${formatAmount(
//               usedBuyRate,
//             )}/$ to ${formatAmount(currentBuyRate)}/$ (${categoryLabel})`,
//           );
//         }

//         if (marketPriceExceeded) {
//           reasons.push(
//             `Market price moved from ${formatAmount(usedMarketPrice, {
//               currency: "USD",
//             })} to ${formatAmount(currentMarketPrice, {
//               currency: "USD",
//             })}`,
//           );
//         }

//         showError(
//           `Prices updated — please review before continuing.${reasons.join(
//             "",
//           )}`,
//         );
//         return;
//       }

//       navigation.navigate("ConfirmTransaction" as never, {
//         payload: { ...values, url: "/wallets/user/buy-crypto" },
//       });
//     } catch (error: any) {
//       console.log(error);
//       showError("Error checking rates. Try again.");
//     }
//   };

//   // Pull to refresh
//   const onRefresh = async () => {
//     setRefreshing(true);
//     rateOverriddenRef.current = false;
//     await refetch();
//     setRefreshing(false);
//   };

//   if (isLoading) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: "center",
//           backgroundColor: colors.background,
//         }}
//       >
//         <CustomLoading loading={isLoading} />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView
//       style={{ flex: 1, paddingBottom: 20, backgroundColor: colors.background }}
//       edges={["right", "left"]}
//     >
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ flexGrow: 1 }}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         <View style={styles.container}>
//           <View>
//             <View style={{ marginBottom: 15 }}>
//               <AppText style={styles.label}>Coin</AppText>
//               <View style={styles.cryptoRow}>
//                 {assetDetails?.asset_logo_url && (
//                   <Image
//                     source={{ uri: assetDetails?.asset_logo_url ?? "" }}
//                     style={styles.optionLogo}
//                   />
//                 )}
//                 <View style={styles.cryptoInfo}>
//                   <AppText style={styles.optionName}>
//                     {assetDetails?.symbol} {`(${assetDetails?.asset_name})`}
//                   </AppText>
//                 </View>
//               </View>
//             </View>
//             <View>
//               <AppText style={styles.label}>
//                 Enter the amount you want to buy
//               </AppText>
//               <Controller
//                 control={control}
//                 name="amount"
//                 render={({ field: { onChange, onBlur } }) => (
//                   <View
//                     style={[
//                       styles.inputContainer,
//                       errors.amount && styles.errorBorder,
//                     ]}
//                   >
//                     <AppText style={styles.dollarSign}>$</AppText>
//                     <TextInput
//                       style={[styles.input]}
//                       value={displayAmount}
//                       placeholder="0.00"
//                       placeholderTextColor="#999"
//                       keyboardType="decimal-pad"
//                       onBlur={onBlur}
//                       maxFontSizeMultiplier={1}
//                       allowFontScaling={false}
//                       onChangeText={text => {
//                         const formatted = formatWithCommas(text);
//                         const numeric = parseToNumber(formatted);
//                         onChange(numeric);
//                         setDisplayAmount(formatted);
//                       }}
//                     />
//                   </View>
//                 )}
//               />
//               {errors.amount && (
//                 <AppText style={styles.error}>{errors.amount.message}</AppText>
//               )}

//               {hasInsufficientBalance && insufficientBalanceMessage && (
//                 <AppText style={styles.error}>
//                   {insufficientBalanceMessage}
//                 </AppText>
//               )}

//               {!errors.amount && (
//                 <AppText style={styles.approx}>
//                   Approximately {assetValueEquivalent} {assetDetails?.symbol}
//                 </AppText>
//               )}

//               <View
//                 style={{
//                   marginVertical: 10,
//                   backgroundColor: colors.inputBackground,
//                   padding: 10,
//                   borderRadius: 10,
//                   gap: 8,
//                 }}
//               >
//                 <AppText style={[styles.note]}>
//                   Wallet Balance, Exchange Rate & Fee Breakdown
//                 </AppText>

//                 <View
//                   style={{
//                     flexDirection: "row",
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <AppText style={[styles.balance]}>Fiat Balance:</AppText>
//                   <AppText style={styles.balance}>
//                     {formatAmount(fiatBalance, {
//                       currency: "NGN",
//                       decimalPlace: 2,
//                     })}
//                   </AppText>
//                 </View>

//                 <View style={{ height: 1, backgroundColor: colors.border }} />

//                 <View
//                   style={{
//                     flexDirection: "row",
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <AppText style={[styles.balance]}>Buy Rate:</AppText>
//                   <AppText style={styles.balance}>
//                     {formatAmount(
//                       feeBreakdown?.currentBuyRate ??
//                         assetDetails?.buy_rate ??
//                         0,
//                     )}
//                     /$
//                   </AppText>
//                 </View>

//                 <View
//                   style={{
//                     flexDirection: "row",
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <AppText style={[styles.balance]}>Market Price:</AppText>
//                   <AppText style={styles.balance}>
//                     {formatAmount(
//                       Number(feeBreakdown?.marketCurrentPrice) || 0,
//                       { currency: "USD" },
//                     )}
//                     /{assetDetails?.symbol}
//                   </AppText>
//                 </View>

//                 {feeBreakdown && amount > 0 && (
//                   <>
//                     <View
//                       style={{ height: 1, backgroundColor: colors.border }}
//                     />

//                     <View
//                       style={{
//                         flexDirection: "row",
//                         justifyContent: "space-between",
//                       }}
//                     >
//                       <AppText style={[styles.balance]}>You Buy:</AppText>
//                       <AppText style={styles.balance}>
//                         {feeBreakdown.coinAmount} {assetDetails?.symbol} (≈{" "}
//                         {formatAmount(feeBreakdown.grossUsd, {
//                           currency: "USD",
//                           decimalPlace: 2,
//                         })}
//                         )
//                       </AppText>
//                     </View>

//                     {/* {!feeBreakdown.isStablecoin && (
//                       <View
//                         style={{
//                           flexDirection: "row",
//                           justifyContent: "space-between",
//                         }}
//                       >
//                         <AppText style={[styles.balance]}>
//                           Operational Fee (0.1%):
//                         </AppText>
//                         <AppText style={[styles.balance]}>
//                           +{feeBreakdown.platformFeeCoin} {assetDetails?.symbol}{" "}
//                           (≈ ${feeBreakdown.platformFeeUsd})
//                         </AppText>
//                       </View>
//                     )} */}
//                     {!feeBreakdown.isStablecoin && (
//                       <View
//                         style={{
//                           flexDirection: "row",
//                           justifyContent: "space-between",
//                         }}
//                       >
//                         <AppText style={[styles.balance]}>
//                           Operational Fee (
//                           {feeBreakdown.buyFeeRate ?? buyFee ?? 0}
//                           %):
//                         </AppText>
//                         <AppText style={[styles.balance]}>
//                           +{feeBreakdown.platformFeeCoin} {assetDetails?.symbol}{" "}
//                           (≈ ${feeBreakdown.platformFeeUsd})
//                         </AppText>
//                       </View>
//                     )}

//                     {feeBreakdown.isStablecoin && (
//                       <View
//                         style={{
//                           flexDirection: "row",
//                           justifyContent: "space-between",
//                         }}
//                       >
//                         <AppText style={[styles.balance]}>
//                           Operational Fee:
//                         </AppText>
//                         <AppText style={[styles.balance, { color: "#2e7d32" }]}>
//                           No fee for {assetDetails?.symbol}
//                         </AppText>
//                       </View>
//                     )}

//                     <View
//                       style={{ height: 1, backgroundColor: colors.border }}
//                     />

//                     <View
//                       style={{
//                         flexDirection: "row",
//                         justifyContent: "space-between",
//                       }}
//                     >
//                       <AppText style={[styles.balance]}>
//                         Total Cost (USD):
//                       </AppText>
//                       <AppText style={[styles.balance]}>
//                         {formatAmount(
//                           Number(feeBreakdown.totalCostUsd ?? 100),
//                           { currency: "USD", decimalPlace: 2 },
//                         )}
//                       </AppText>
//                     </View>

//                     <View
//                       style={{
//                         flexDirection: "row",
//                         justifyContent: "space-between",
//                       }}
//                     >
//                       <AppText style={[styles.balance]}>
//                         You'll Pay (₦):
//                       </AppText>
//                       <AppText style={[styles.balance]}>{ngnAmount}</AppText>
//                     </View>
//                   </>
//                 )}
//               </View>

//               <View style={styles.paymentContainer}>
//                 <View
//                   style={{
//                     flexDirection: "row",
//                     justifyContent: "space-between",
//                     padding: 9,
//                   }}
//                 >
//                   <AppText style={styles.ngn}>You're Paying:</AppText>
//                   <AppText style={styles.ngn}>{ngnAmount}</AppText>
//                 </View>
//               </View>
//             </View>
//           </View>

//           <TouchableOpacity
//             activeOpacity={0.89}
//             style={[
//               styles.button,
//               hasInsufficientBalance && styles.buttonDisabled,
//             ]}
//             disabled={hasInsufficientBalance || isSubmitting}
//             onPress={handleSubmit(onSubmit)}
//           >
//             <AppText style={styles.buttonText}>
//               {isSubmitting ? "Please wait..." : "Continue"}
//             </AppText>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// // export default function CryptoBuyScreen() {
// //   const { apiGet } = useAxios();
// //   const route = useRoute<RouteProp<CryptoBuyScreenParams, "CryptoBuy">>();
// //   const { intent } = route.params;
// //   const navigation: any = useNavigation();
// //   const selectedAssetUuid = intent.assetId ?? "";
// //   const [displayAmount, setDisplayAmount] = useState("");
// //   const { fiatBalance } = useFiatBalance();
// //   const [feeBreakdown, setFeeBreakdown] = useState<any>(null);
// //   const [ngnAmount, setNgnAmount] = useState("0.00");
// //   const [assetValueEquivalent, setAssetValueEquivalent] = useState<any>(0);
// //   const acknowledgedBuyRateRef = useRef<number>(0);
// //   const acknowledgedMarketPriceRef = useRef<number>(0);
// //   const rateOverriddenRef = useRef(false);
// //   const [refreshing, setRefreshing] = useState(false);

// //   const {
// //     control,
// //     handleSubmit,
// //     setValue,
// //     watch,
// //     reset,
// //     formState: { errors, isSubmitting },
// //   } = useForm({
// //     resolver: yupResolver(schema),
// //     defaultValues: {
// //       amount: 0,
// //       asset_id: intent?.assetId ?? "",
// //     },
// //     mode: "onChange",
// //   });

// //   // const { assets } = useAssets();

// //   const {
// //     data: assetDetails,
// //     isLoading,
// //     refetch,
// //   } = useQuery({
// //     queryKey: ["asset-detail-buy", selectedAssetUuid],
// //     queryFn: async () => {
// //       if (!selectedAssetUuid) return null;
// //       const res = await apiGet(`/wallets/${selectedAssetUuid}`);
// //       return res?.data?.data ?? null;
// //     },
// //     enabled: !!selectedAssetUuid,
// //   });

// //   // const assetDetails = useMemo(
// //   //   () =>
// //   //     Array.isArray(assets)
// //   //       ? assets.find(a => a.uuid === selectedAssetUuid)
// //   //       : null,
// //   //   [assets],
// //   // );

// //   const symbol = assetDetails?.symbol ?? "";

// //   const marketPrice = useMemo(
// //     () =>
// //       feeBreakdown?.currentMarketPrice ??
// //       assetDetails?.market_current_value ??
// //       0,
// //     [feeBreakdown?.currentMarketPrice, assetDetails?.market_current_value],
// //   );

// //   // const marketPrice =
// //   //   feeBreakdown?.currentMarketPrice ?? assetDetails?.market_current_value ?? 0;
// //   // const amount = watch("amount");

// //   const TOLERANCE_PERCENT = 1.23;

// //   const amount = watch("amount");

// //   const onSubmit = async (values: any) => {
// //     try {
// //       const res = await apiGet(`/crypto-assets/${selectedAssetUuid}/rates`);
// //       const latestRates = res?.data?.asset ?? null;

// //       if (!latestRates) {
// //         showError("Unable to fetch latest rates.");
// //         return;
// //       }

// //       const currentMarketPrice = parseFloat(
// //         latestRates.market_current_value ?? "0",
// //       );

// //       // Resolve effective buy rate from categories
// //       const buyRateData = latestRates.rates?.buy ?? null;
// //       const currentBuyRate = buyRateData
// //         ? resolveRateFromCategories(values.amount, buyRateData)
// //         : parseFloat(latestRates.buy_rate ?? "0");

// //       const usedBuyRate = acknowledgedBuyRateRef.current;
// //       const usedMarketPrice = acknowledgedMarketPriceRef.current;

// //       // Resolve category label for transparent messaging
// //       const previousCategory =
// //         buyRateData?.categories?.find(
// //           (cat: any) =>
// //             values.amount >= parseFloat(cat.min_amount) &&
// //             values.amount <= parseFloat(cat.max_amount),
// //         ) ?? null;

// //       const buyRateChanged =
// //         currentBuyRate > 0 && currentBuyRate !== usedBuyRate;
// //       const marketPriceExceeded = relativeChangeExceeded(
// //         currentMarketPrice,
// //         usedMarketPrice,
// //         TOLERANCE_PERCENT,
// //       );

// //       if (buyRateChanged || marketPriceExceeded) {
// //         rateOverriddenRef.current = true;
// //         acknowledgedBuyRateRef.current = currentBuyRate;
// //         acknowledgedMarketPriceRef.current = currentMarketPrice;

// //         recalculate(values.amount, currentMarketPrice, currentBuyRate);

// //         const reasons: string[] = [];

// //         if (buyRateChanged) {
// //           const categoryLabel = previousCategory?.label ?? "default rate";
// //           reasons.push(
// //             `Buy rate changed from ${formatAmount(
// //               usedBuyRate,
// //             )}/$ to ${formatAmount(currentBuyRate)}/$ (${categoryLabel})`,
// //           );
// //         }

// //         if (marketPriceExceeded) {
// //           reasons.push(
// //             `Market price moved from ${formatAmount(usedMarketPrice, {
// //               currency: "USD",
// //             })} to ${formatAmount(currentMarketPrice, {
// //               currency: "USD",
// //             })} (>${TOLERANCE_PERCENT}% change)`,
// //           );
// //         }

// //         showError(
// //           `Prices updated — please review before continuing.\n\n${reasons.join(
// //             "\n",
// //           )}`,
// //         );
// //         return;
// //       }

// //       navigation.navigate("ConfirmTransaction" as never, {
// //         payload: { ...values, url: "/wallets/user/buy-crypto" },
// //       });
// //     } catch {
// //       showError("Error checking rates. Try again.");
// //     }
// //   };

// //   // const onSubmit = async (values: any) => {
// //   //   try {
// //   //     const res = await apiGet(`/crypto-assets/${selectedAssetUuid}/rates`);
// //   //     const latestRates = res?.data?.asset ?? null;

// //   //     if (!latestRates) {
// //   //       showError("Unable to fetch latest rates.");
// //   //       return;
// //   //     }

// //   //     // parse latest values
// //   //     const currentBuyRate = parseFloat(latestRates.buy_rate ?? "0");
// //   //     const currentMarketPrice = parseFloat(
// //   //       latestRates.market_current_value ?? "0",
// //   //     );

// //   //     // parse previously used values (fallback to 0)
// //   //     const usedSellRate = parseFloat(feeBreakdown?.currentBuyRate ?? "0");
// //   //     const usedMarketPrice = parseFloat(marketPrice ?? "0");

// //   //     const sellRateChanged =
// //   //       currentBuyRate > 0 && currentBuyRate !== usedSellRate;
// //   //     const marketPriceExceeded = relativeChangeExceeded(
// //   //       currentMarketPrice,
// //   //       usedMarketPrice,
// //   //       TOLERANCE_PERCENT,
// //   //     );

// //   //     // If either exceeded tolerance, recalc, update UI and block navigation
// //   //     if (sellRateChanged || marketPriceExceeded) {
// //   //       const recalculated = calculateBuyFeeBreakdown(
// //   //         values.amount,
// //   //         currentMarketPrice,
// //   //         currentBuyRate,
// //   //       );

// //   //       setFeeBreakdown({
// //   //         ...recalculated.feeBreakdown,
// //   //         currentBuyRate: recalculated.feeBreakdown?.currentBuyRate,
// //   //       });

// //   //       setNgnAmount(recalculated.ngnAmount);

// //   //       const reasons: string[] = [];
// //   //       if (sellRateChanged) reasons.push("Buy rate");
// //   //       if (marketPriceExceeded) reasons.push("Market price");

// //   //       showError(
// //   //         `${reasons.join(
// //   //           " and ",
// //   //         )} changed. Prices have been recalculated — please review before continuing.`,
// //   //       );

// //   //       return; // block navigation
// //   //     }

// //   //     // If changes are within tolerance, optionally update fee state silently
// //   //     // (uncomment if you want the UI to reflect tiny changes without blocking)
// //   //     // const recalculated = calculateSellFeeBreakdown(values.amount, currentMarketPrice, currentBuyRate);
// //   //     // setLatestFeeBreakdown(recalculated.feeBreakdown);
// //   //     // setLatestNgnAmount(recalculated.ngnAmount);

// //   //     const payload = {
// //   //       ...values,
// //   //       url: "/wallets/user/buy-crypto",
// //   //     };

// //   //     navigation.navigate("ConfirmTransaction" as never, { payload });
// //   //   } catch (error) {
// //   //     console.error("onSubmit rate check error:", error);
// //   //     showError("Error checking rates. Try again.");
// //   //   }
// //   // };

// //   // const onSubmit = async (values: any) => {
// //   //   try {
// //   //     const res = await apiGet(`/crypto-assets/${selectedAssetUuid}/rates`);
// //   //     const latestRates = res?.data?.asset ?? null;

// //   //     if (!latestRates) {
// //   //       showError("Unable to fetch latest rates.");
// //   //       return;
// //   //     }

// //   //     const currentBuyRate = parseFloat(latestRates.buy_rate ?? "0");
// //   //     const usedBuyRate = parseFloat(
// //   //       feeBreakdown?.currentBuyRate ?? assetDetails?.buy_rate ?? "0",
// //   //     );

// //   //     if (currentBuyRate > 0 && currentBuyRate !== usedBuyRate) {
// //   //       const recalculated = calculateFeeBreakdown(
// //   //         values.amount,
// //   //         marketPrice,
// //   //         currentBuyRate,
// //   //         assetDetails?.symbol ?? "",
// //   //       );

// //   //       setFeeBreakdown(recalculated.feeBreakdown);
// //   //       setNgnAmount(recalculated.ngnAmount);

// //   //       showError(
// //   //         "Buy rate has changed. Prices recalculated — please review before continuing.",
// //   //       );
// //   //       return;
// //   //     }

// //   //     navigation.navigate("ConfirmTransaction" as never, {
// //   //       payload: { ...values, url: "/wallets/user/buy-crypto" },
// //   //     });
// //   //   } catch (error) {
// //   //     showError("Error checking rates. Try again.");
// //   //   }
// //   // };

// //   // const hasInsufficientBalance = useMemo(() => {
// //   //   if (!feeBreakdown?.totalCostNgn) return false;
// //   //   return feeBreakdown?.totalCostNgn > fiatBalance;
// //   // }, [feeBreakdown?.totalCostNgn, fiatBalance]);

// //   // // message to show
// //   // const insufficientBalanceMessage = useMemo(() => {
// //   //   if (!hasInsufficientBalance || !amount || !fiatBalance) return null;

// //   //   if (amount > fiatBalance) {
// //   //     return `Insufficient balance. Your total balance is ${formatAmount(
// //   //       fiatBalance,
// //   //       {
// //   //         currency: "NGN",
// //   //       },
// //   //     )}`;
// //   //   }

// //   //   // maximum fiat the user can spend including charges
// //   //   const maxBuyable =
// //   //     fiatBalance / (1 + (feeBreakdown?.isStablecoin ? 0 : 0.001));

// //   //   return `You can only buy up to ${formatAmount(maxBuyable, {
// //   //     currency: "NGN",
// //   //   })} with your current balance (including charges).`;
// //   // }, [hasInsufficientBalance, fiatBalance, feeBreakdown]);

// //   const hasInsufficientBalance = useMemo(() => {
// //     if (!feeBreakdown?.totalCostNgn) return false;
// //     return feeBreakdown?.totalCostNgn > fiatBalance;
// //   }, [feeBreakdown?.totalCostNgn, fiatBalance]);

// //   const insufficientBalanceMessage = useMemo(() => {
// //     if (!hasInsufficientBalance || !amount || !fiatBalance) return null;

// //     if (amount > fiatBalance) {
// //       return `Insufficient balance. Your total balance is ${formatAmount(
// //         fiatBalance,
// //         { currency: "NGN" },
// //       )}`;
// //     }

// //     const maxBuyable =
// //       fiatBalance / (1 + (feeBreakdown?.isStablecoin ? 0 : 0.001));
// //     return `You can only buy up to ${formatAmount(maxBuyable, {
// //       currency: "NGN",
// //     })} with your current balance (including charges).`;
// //   }, [hasInsufficientBalance, fiatBalance, feeBreakdown, amount]);

// //   const recalculate = useCallback(
// //     (amt: number, price: number, rate: number) => {
// //       const result = calculateBuyFeeBreakdown(amt, price, rate);
// //       setAssetValueEquivalent(result.assetValueEquivalent);
// //       setFeeBreakdown({ ...result.feeBreakdown });
// //       setNgnAmount(result.ngnAmount);
// //     },
// //     [],
// //   );

// //   useEffect(() => {
// //     if (!assetDetails?.rates?.buy || Number(marketPrice) <= 0) return;
// //     if (rateOverriddenRef.current) return; // onSubmit owns the rate — don't overwrite

// //     const effectiveRate = resolveRateFromCategories(
// //       amount,
// //       assetDetails.rates.buy,
// //     );
// //     if (!effectiveRate || effectiveRate <= 0) return;

// //     recalculate(amount, Number(marketPrice), effectiveRate);
// //   }, [assetDetails?.rates?.buy, amount, marketPrice, recalculate]);
// //   // useEffect(() => {
// //   //   if (intent?.amount) {
// //   //     const numericAmount = Number(intent.amount);
// //   //     if (!isNaN(numericAmount)) {
// //   //       setDisplayAmount(formatWithCommas(numericAmount.toString()));
// //   //     }

// //   //     setValue("amount", numericAmount);
// //   //   }
// //   // }, [intent?.amount]);

// //   // useEffect(() => {
// //   //   if (assetDetails?.buy_rate && marketPrice > 0 && assetDetails) {
// //   //     const recalculated = calculateFeeBreakdown(
// //   //       amount,
// //   //       marketPrice,
// //   //       feeBreakdown?.currentBuyRate ?? parseFloat(assetDetails.buy_rate),
// //   //       assetDetails.symbol ?? "",
// //   //     );
// //   //     setAssetValueEquivalent(recalculated.assetValueEquivalent);
// //   //     setFeeBreakdown(recalculated.feeBreakdown);
// //   //     setNgnAmount(recalculated.ngnAmount);
// //   //   }
// //   // }, [
// //   //   assetDetails?.buy_rate,
// //   //   amount,
// //   //   feeBreakdown?.currentBuyRate,
// //   //   marketPrice,
// //   //   assetDetails,
// //   // ]);

// //   useEffect(() => {
// //     if (assetDetails?.rates?.buy && amount >= 0) {
// //       acknowledgedBuyRateRef.current = resolveRateFromCategories(
// //         amount,
// //         assetDetails.rates.buy,
// //       );
// //     } else if (assetDetails?.buy_rate) {
// //       acknowledgedBuyRateRef.current = parseFloat(assetDetails.buy_rate);
// //     }
// //   }, [assetDetails?.rates?.buy, assetDetails?.buy_rate, amount]);

// //   useEffect(() => {
// //     if (Number(marketPrice) > 0) {
// //       acknowledgedMarketPriceRef.current = Number(marketPrice);
// //     }
// //   }, [marketPrice]);

// //   useEffect(() => {
// //     if (!intent?.amount) return;
// //     const numericAmount = Number(intent.amount);
// //     if (isNaN(numericAmount)) return;
// //     setDisplayAmount(formatWithCommas(numericAmount.toString()));
// //     setValue("amount", numericAmount);
// //   }, [intent?.amount]);

// //   useFocusEffect(
// //     useCallback(() => {
// //       refetch();
// //     }, [refetch]),
// //   );

// //   useResetFormOnMount(
// //     reset,
// //     { amount: 0, asset_id: intent.assetId ?? "" },
// //     () => {
// //       setDisplayAmount("");
// //       setFeeBreakdown(null);
// //       setAssetValueEquivalent(0);
// //       setNgnAmount("0.00");
// //     },
// //   );

// //   const onRefresh = async () => {
// //     setRefreshing(true);
// //     rateOverriddenRef.current = false;
// //     await refetch();
// //     setRefreshing(false);
// //   };

// //   console.log(assetDetails);

// //   if (isLoading) return <CustomLoading loading={true} />;

// //   return (
// //     <SafeAreaView style={{ flex: 1 }} edges={["bottom", "right", "left"]}>
// //       <ScrollView
// //         contentContainerStyle={{
// //           flexGrow: 1,
// //         }}
// //         refreshControl={
// //           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
// //         }
// //       >
// //         <View style={styles.container}>
// //           <View>
// //             <View style={{ marginBottom: 15 }}>
// //               <AppText style={styles.label}>Coin</AppText>
// //               <View style={styles.cryptoRow}>
// //                 {assetDetails?.asset_logo_url && (
// //                   <Image
// //                     source={{ uri: assetDetails?.asset_logo_url ?? "" }}
// //                     style={styles.optionLogo}
// //                   />
// //                 )}
// //                 <View style={styles.cryptoInfo}>
// //                   <AppText style={styles.optionName}>
// //                     {assetDetails?.symbol} {`(${assetDetails?.asset_name})`}
// //                   </AppText>
// //                 </View>
// //               </View>
// //             </View>
// //             <View>
// //               <AppText style={styles.label}>Enter the amount you want to buy</AppText>
// //               <Controller
// //                 control={control}
// //                 name="amount"
// //                 render={({ field: { onChange, onBlur } }) => (
// //                   <View style={styles.inputContainer}>
// //                     <AppText style={styles.dollarSign}>$</AppText>
// //                     <TextInput
// //                       style={styles.input}
// //                       value={displayAmount}
// //                       placeholder="0.00"
// //                       placeholderTextColor="#999"
// //                       keyboardType="decimal-pad"
// //                       onBlur={onBlur}
// //                       onChangeText={text => {
// //                         const formatted = formatWithCommas(text);
// //                         const numeric = parseToNumber(formatted);
// //                         onChange(numeric);
// //                         setDisplayAmount(formatted);
// //                       }}
// //                     />
// //                   </View>
// //                 )}
// //               />
// //               {errors.amount && (
// //                 <AppText style={styles.error}>{errors.amount.message}</AppText>
// //               )}

// //               {/* {hasInsufficientBalance && (
// //                 <View style={styles.warningContainer}>
// //                   <AppText style={styles.warningText}>
// //                     {insufficientBalanceMessage}
// //                   </AppText>
// //                 </View>
// //               )} */}

// //               {hasInsufficientBalance && insufficientBalanceMessage && (
// //                 <AppText style={styles.error}>{insufficientBalanceMessage}</AppText>
// //               )}

// //               <AppText style={styles.approx}>
// //                 Approximately {assetValueEquivalent} {assetDetails?.symbol}
// //               </AppText>

// //               <View
// //                 style={{
// //                   marginVertical: 10,
// //                   backgroundColor: "#EFF7EC",
// //                   padding: 10,
// //                   borderRadius: 10,
// //                   gap: 8,
// //                 }}
// //               >
// //                 <AppText style={[styles.note]}>
// //                   Wallet Balance, Exchange Rate & Fee Breakdown
// //                 </AppText>

// //                 <View
// //                   style={{
// //                     flexDirection: "row",
// //                     justifyContent: "space-between",
// //                   }}
// //                 >
// //                   <AppText style={[styles.balance]}>Fiat Balance:</AppText>
// //                   <AppText style={styles.balance}>
// //                     {formatAmount(fiatBalance, { currency: "NGN" })}
// //                   </AppText>
// //                 </View>

// //                 <View style={{ height: 1, backgroundColor: colors.border }} />

// //                 <View
// //                   style={{
// //                     flexDirection: "row",
// //                     justifyContent: "space-between",
// //                   }}
// //                 >
// //                   <AppText style={[styles.balance]}>Buy Rate:</AppText>
// //                   <AppText style={styles.balance}>
// //                     {formatAmount(
// //                       feeBreakdown?.currentBuyRate ??
// //                         assetDetails?.buy_rate ??
// //                         0,
// //                     )}
// //                     /$
// //                   </AppText>
// //                 </View>

// //                 <View
// //                   style={{
// //                     flexDirection: "row",
// //                     justifyContent: "space-between",
// //                   }}
// //                 >
// //                   <AppText style={[styles.balance]}>Market Price:</AppText>
// //                   <AppText style={styles.balance}>
// //                     {formatAmount(
// //                       Number(feeBreakdown?.marketCurrentPrice) || 0,
// //                       {
// //                         currency: "USD",
// //                       },
// //                     )}
// //                     /{assetDetails?.symbol}
// //                   </AppText>
// //                 </View>

// //                 {feeBreakdown && amount > 0 && (
// //                   <>
// //                     <View style={{ height: 1, backgroundColor: colors.border }} />

// //                     <View
// //                       style={{
// //                         flexDirection: "row",
// //                         justifyContent: "space-between",
// //                       }}
// //                     >
// //                       <AppText style={[styles.balance]}>You Buy:</AppText>
// //                       <AppText style={styles.balance}>
// //                         {feeBreakdown.coinAmount} {assetDetails?.symbol} (≈{" "}
// //                         {formatAmount(feeBreakdown.grossUsd, {
// //                           currency: "USD",
// //                         })}
// //                         )
// //                       </AppText>
// //                     </View>

// //                     {!feeBreakdown.isStablecoin && (
// //                       <View
// //                         style={{
// //                           flexDirection: "row",
// //                           justifyContent: "space-between",
// //                         }}
// //                       >
// //                         <AppText style={[styles.balance]}>
// //                           Operational Fee (0.1%):
// //                         </AppText>
// //                         <AppText style={[styles.balance]}>
// //                           +{feeBreakdown.platformFeeCoin} {assetDetails?.symbol}{" "}
// //                           (≈ ${feeBreakdown.platformFeeUsd})
// //                         </Text>
// //                       </View>
// //                     )}

// //                     {feeBreakdown.isStablecoin && (
// //                       <View
// //                         style={{
// //                           flexDirection: "row",
// //                           justifyContent: "space-between",
// //                         }}
// //                       >
// //                         <AppText style={[styles.balance]}>Operational Fee:</AppText>
// //                         <AppText style={[styles.balance, { color: "#2e7d32" }]}>
// //                           No fee for {assetDetails?.symbol}
// //                         </AppText>
// //                       </View>
// //                     )}

// //                     <View style={{ height: 1, backgroundColor: colors.border }} />

// //                     <View
// //                       style={{
// //                         flexDirection: "row",
// //                         justifyContent: "space-between",
// //                       }}
// //                     >
// //                       <AppText style={[styles.balance]}>Total Cost (USD):</AppText>
// //                       <AppText style={[styles.balance]}>
// //                         {formatAmount(
// //                           Number(feeBreakdown.totalCostUsd ?? 100),
// //                           {
// //                             currency: "USD",
// //                             decimalPlace: 3,
// //                           },
// //                         )}
// //                       </AppText>
// //                     </View>

// //                     <View
// //                       style={{
// //                         flexDirection: "row",
// //                         justifyContent: "space-between",
// //                       }}
// //                     >
// //                       <AppText style={[styles.balance]}>You'll Pay (₦):</AppText>
// //                       <AppText style={[styles.balance]}>{ngnAmount}</AppText>
// //                     </View>
// //                   </>
// //                 )}
// //               </View>

// //               <View style={styles.paymentContainer}>
// //                 <View
// //                   style={{
// //                     flexDirection: "row",
// //                     justifyContent: "space-between",
// //                     padding: 9,
// //                   }}
// //                 >
// //                   <AppText style={styles.ngn}>You’re Paying:</AppText>
// //                   <AppText style={styles.ngn}>{ngnAmount}</AppText>
// //                 </View>
// //               </View>
// //             </View>
// //           </View>

// //           <TouchableOpacity
// //             style={[
// //               styles.button,
// //               hasInsufficientBalance && styles.buttonDisabled,
// //             ]}
// //             disabled={hasInsufficientBalance || isSubmitting}
// //             onPress={handleSubmit(onSubmit)}
// //           >
// //             <AppText style={styles.buttonText}>
// //               {isSubmitting ? "Please wait..." : "Continue"}
// //             </AppText>
// //           </TouchableOpacity>
// //         </View>
// //       </ScrollView>
// //     </SafeAreaView>
// //   );
// // }

// const makeStyles = (colors: ReturnType<typeof useColors>) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       paddingHorizontal: normalize(20),
//       backgroundColor: colors.background,
//       justifyContent: "space-between",
//     },
//     buttonDisabled: {
//       backgroundColor: colors.border,
//       opacity: 0.6,
//     },
//     label: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("800"),
//       marginBottom: normalize(8),
//       color: colors.text,
//     },
//     inputContainer: {
//       flexDirection: "row",
//       alignItems: "center",
//       borderWidth: 1,
//       borderColor: colors.border,
//       borderRadius: normalize(12),
//       paddingHorizontal: normalize(16),
//       marginBottom: normalize(10),
//       gap: 5,
//     },
//     dollarSign: {
//       fontSize: normalize(26),
//       fontFamily: getFontFamily("800"),
//       color: colors.text,
//       marginRight: normalize(5),
//     },
//     input: {
//       flex: 1,
//       paddingVertical: normalize(15),
//       fontSize: normalize(26),
//       fontFamily: getFontFamily("800"),
//       color: colors.text,
//     },
//     error: {
//       color: colors.error,
//       fontSize: normalize(19),
//       fontFamily: getFontFamily("700"),
//       marginBottom: normalize(10),
//     },
//     errorBorder: {
//       borderColor: colors.error,
//       borderWidth: 1,
//     },
//     approx: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("700"),
//       marginBottom: normalize(9),
//       color: colors.primaryLight,
//     },
//     cryptoRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 8,
//       borderWidth: 1,
//       borderColor: colors.border,
//       borderRadius: 8,
//       padding: 10,
//     },
//     cryptoInfo: { flex: 1 },
//     optionName: {
//       fontSize: normalize(19),
//       fontFamily: getFontFamily("800"),
//       color: colors.text,
//     },
//     optionLogo: {
//       width: 30,
//       height: 30,
//       borderRadius: 120,
//       borderWidth: 1,
//       borderColor: colors.border,
//     },
//     balance: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("700"),
//       paddingVertical: 3,
//       color: colors.text,
//     },
//     fee: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("700"),
//       marginBottom: normalize(4),
//       color: colors.text,
//     },
//     rate: {
//       fontSize: normalize(17),
//       fontFamily: getFontFamily("700"),
//       marginBottom: normalize(4),
//       color: colors.text,
//     },
//     min: {
//       fontSize: normalize(17),
//       fontFamily: getFontFamily("700"),
//       marginBottom: normalize(4),
//       color: colors.text,
//     },
//     note: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("800"),
//       color: colors.text,
//       marginBottom: normalize(10),
//     },
//     ngn: {
//       color: "white",
//       fontSize: normalize(22),
//       fontFamily: getFontFamily("900"),
//     },
//     button: {
//       backgroundColor: COLORS.primary,
//       paddingVertical: 14,
//       borderRadius: normalize(208),
//       alignItems: "center",
//       marginTop: 20,
//       marginBottom: 30,
//     },
//     buttonText: {
//       color: "#fff",
//       fontSize: normalize(19),
//       fontFamily: getFontFamily("700"),
//     },
//     paymentContainer: {
//       backgroundColor: COLORS.primary,
//       borderRadius: 9,
//       marginVertical: 20,
//       padding: 10,
//     },
//     warningContainer: {
//       marginVertical: 12,
//       padding: 10,
//       backgroundColor: "rgba(255, 0, 0, 0.03)",
//       borderRadius: 6,
//       borderWidth: 1,
//       borderColor: "rgba(255, 0, 0, 0.3)",
//     },
//     warningText: {
//       color: "#db0b0bff",
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("700"),
//       textAlign: "center",
//     },
//   });
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatAmount } from "../libs/formatNumber";
import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
import { useFiatBalance } from "../hooks/useFiatBalance";
import { TradeIntent } from "../libs/types";
import { showError } from "../utlis/toast";
import useAxios from "../hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import { resolveRateFromCategories } from "./SellCrytpoScreen";
import CustomLoading from "../components/CustomLoading";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import { useCryptoLimits } from "../hooks/useCryptoLimits";
import { useServiceCharges } from "../hooks/useServiceCharges";

type CryptoBuyScreenParams = {
  CryptoBuy: {
    intent: TradeIntent;
  };
};

const STABLECOINS = ["USDT"];
const TOLERANCE_PERCENT = 1.23;
const DEFAULT_BUY_FEE_RATE = 0.001; // fallback decimal rate (0.1%) if backend charge isn't loaded yet

function relativeChangeExceeded(
  current: number,
  used: number,
  tolerancePercent = TOLERANCE_PERCENT,
): boolean {
  if (!isFinite(current) || !isFinite(used) || used <= 0) return false;
  const diff = Math.abs(current - used);
  const relativePercent = (diff / used) * 100;
  return relativePercent > tolerancePercent;
}

export function buildCryptoAmountSchema(minAmount: number) {
  return Yup.object().shape({
    amount: Yup.number()
      .typeError("Enter a valid amount")
      .required("Amount is required")
      .min(minAmount, `Minimum amount is $${minAmount}`),
    asset_id: Yup.string().required(),
  });
}

/**
 * @param buyFeeRate Decimal fee rate, e.g. 0.018 for 1.8%. NOT a percentage
 * value like 1.8 — convert before calling (see getBuyFeeRate below).
 */
export function calculateBuyFeeBreakdown(
  amount: number,
  marketPrice: number,
  buyRate: number,
  symbol?: string,
  buyFeeRate = DEFAULT_BUY_FEE_RATE,
) {
  const isStablecoin = STABLECOINS.includes((symbol ?? "").toUpperCase());
  const coinAmount = marketPrice > 0 ? amount / marketPrice : 0;
  const platformFeeUsd = isStablecoin ? 0 : amount * buyFeeRate;
  const platformFeeCoin = isStablecoin ? 0 : coinAmount * buyFeeRate;
  const totalCostUsd = amount + platformFeeUsd;
  const totalCostNgn = buyRate > 0 ? totalCostUsd * buyRate : 0;

  return {
    assetValueEquivalent: coinAmount.toFixed(8),
    ngnAmount:
      buyRate > 0 ? formatAmount(totalCostNgn, { decimalPlace: 2 }) : "0.00",
    feeBreakdown: {
      grossUsd: amount,
      coinAmount: coinAmount.toFixed(8),
      platformFeeUsd: platformFeeUsd.toFixed(3),
      platformFeeCoin: platformFeeCoin.toFixed(8),
      totalCostUsd: totalCostUsd.toFixed(3),
      totalCostNgn,
      isStablecoin,
      currentBuyRate: buyRate,
      marketCurrentPrice: marketPrice,
      buyFeeRate, // decimal rate actually used, for display
    },
  };
}

export default function CryptoBuyScreen() {
  const { apiGet } = useAxios();
  const route = useRoute<RouteProp<CryptoBuyScreenParams, "CryptoBuy">>();
  const { intent } = route.params;
  const navigation: any = useNavigation();
  const selectedAssetUuid = intent.assetId ?? "";
  const { fiatBalance } = useFiatBalance();
  const { minBuyAmount } = useCryptoLimits();
  const { getCharge, refetch: refetchServiceCharges } = useServiceCharges();

  const buyFeeCharge = getCharge("crypto_buy_fee");

  console.log(buyFeeCharge);

  // ASSUMPTION: backend returns buy_fee as a percentage number (e.g. "1.8"
  // for 1.8%), so it's divided by 100 to get the decimal rate used in
  // calculations. If the backend instead returns an already-decimal value
  // (e.g. "0.018"), remove the "/ 100" below.
  const buyFeeRate = useMemo(() => {
    const raw =
      buyFeeCharge?.value != null ? parseFloat(buyFeeCharge.value) : null;
    return raw != null && !isNaN(raw) ? raw / 100 : DEFAULT_BUY_FEE_RATE;
  }, [buyFeeCharge]);

  const schema = useMemo(
    () => buildCryptoAmountSchema(minBuyAmount),
    [minBuyAmount],
  );

  // Local state
  const [displayAmount, setDisplayAmount] = useState("");
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null);
  const [ngnAmount, setNgnAmount] = useState("0.00");
  const [assetValueEquivalent, setAssetValueEquivalent] = useState<any>(0);
  const [refreshing, setRefreshing] = useState(false);

  const acknowledgedBuyRateRef = useRef<number>(0);
  const acknowledgedMarketPriceRef = useRef<number>(0);
  const rateOverriddenRef = useRef(false);

  const colors = useColors();
  const styles = makeStyles(colors);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { amount: undefined, asset_id: intent?.assetId ?? "" },
    mode: "onChange",
  });

  const amount = watch("amount");

  // Asset details query
  const {
    data: assetDetails,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["asset-detail-buy", selectedAssetUuid],
    queryFn: async () => {
      if (!selectedAssetUuid) return null;
      const res = await apiGet(`/wallets/${selectedAssetUuid}`);
      return res?.data?.data ?? null;
    },
    enabled: !!selectedAssetUuid,
  });

  const marketPrice = useMemo(
    () =>
      feeBreakdown?.currentMarketPrice ??
      assetDetails?.market_current_value ??
      0,
    [feeBreakdown?.currentMarketPrice, assetDetails?.market_current_value],
  );

  const hasInsufficientBalance = useMemo(() => {
    if (!feeBreakdown?.totalCostNgn) return false;
    return feeBreakdown?.totalCostNgn > fiatBalance;
  }, [feeBreakdown?.totalCostNgn, fiatBalance]);

  const insufficientBalanceMessage = useMemo(() => {
    if (!hasInsufficientBalance || !amount || !fiatBalance) return null;

    if (amount > fiatBalance) {
      return `Insufficient balance. Your total balance is ${formatAmount(
        fiatBalance,
        {
          currency: "NGN",
          decimalPlace: 2,
        },
      )}`;
    }

    const maxBuyable =
      fiatBalance / (1 + (feeBreakdown?.isStablecoin ? 0 : buyFeeRate));
    return `You can only buy up to ${formatAmount(maxBuyable, {
      currency: "NGN",
      decimalPlace: 2,
    })} with your current balance (including charges).`;
  }, [hasInsufficientBalance, fiatBalance, feeBreakdown, amount, buyFeeRate]);

  // Recalculate helper
  const recalculate = useCallback(
    (amt: number, price: number, rate: number) => {
      const result = calculateBuyFeeBreakdown(
        amt,
        price,
        rate,
        assetDetails?.symbol,
        buyFeeRate,
      );
      setAssetValueEquivalent(result.assetValueEquivalent);
      setFeeBreakdown({ ...result.feeBreakdown });
      setNgnAmount(result.ngnAmount);
    },
    [assetDetails?.symbol, buyFeeRate],
  );

  useEffect(() => {
    if (!assetDetails?.rates?.buy || Number(marketPrice) <= 0) return;
    if (rateOverriddenRef.current) return;

    const effectiveRate = resolveRateFromCategories(
      amount,
      assetDetails.rates.buy,
    );
    if (!effectiveRate || effectiveRate <= 0) return;

    recalculate(amount, Number(marketPrice), effectiveRate);
  }, [assetDetails?.rates?.buy, amount, marketPrice, recalculate]);

  // Effect: seed acknowledged refs
  useEffect(() => {
    if (assetDetails?.rates?.buy && amount >= 0) {
      acknowledgedBuyRateRef.current = resolveRateFromCategories(
        amount,
        assetDetails.rates.buy,
      );
    } else if (assetDetails?.buy_rate) {
      acknowledgedBuyRateRef.current = parseFloat(assetDetails.buy_rate);
    }
  }, [assetDetails?.rates?.buy, assetDetails?.buy_rate, amount]);

  useEffect(() => {
    if (Number(marketPrice) > 0) {
      acknowledgedMarketPriceRef.current = Number(marketPrice);
    }
  }, [marketPrice]);

  useFocusEffect(
    useCallback(() => {
      // Reset first
      setDisplayAmount("");
      setFeeBreakdown(null);
      setAssetValueEquivalent(0);
      setNgnAmount("0.00");
      rateOverriddenRef.current = false;
      reset({ amount: 0, asset_id: intent.assetId ?? "" });

      // Then pre-fill from intent if available
      if (intent?.amount) {
        const numericAmount = Number(intent.amount);
        if (!isNaN(numericAmount) && numericAmount > 0) {
          setDisplayAmount(formatWithCommas(numericAmount.toString()));
          setValue("amount", numericAmount);
        }
      }

      // Refetch asset data
      refetch();
    }, [intent?.amount, intent?.assetId, refetch, reset, setValue]),
  );

  // Submit
  const onSubmit = async (values: any) => {
    try {
      const res = await apiGet(`/crypto-assets/${selectedAssetUuid}/rates`);
      const latestRates = res?.data?.asset ?? null;

      if (!latestRates) {
        showError("Unable to fetch latest rates.");
        return;
      }

      const currentMarketPrice = parseFloat(
        latestRates.market_current_value ?? "0",
      );

      const buyRateData = latestRates.rates?.buy ?? null;
      const currentBuyRate = buyRateData
        ? resolveRateFromCategories(values.amount, buyRateData)
        : parseFloat(latestRates.buy_rate ?? "0");

      const usedBuyRate = acknowledgedBuyRateRef.current;
      const usedMarketPrice = acknowledgedMarketPriceRef.current;

      const previousCategory =
        buyRateData?.categories?.find(
          (cat: any) =>
            values.amount >= parseFloat(cat.min_amount) &&
            values.amount <= parseFloat(cat.max_amount),
        ) ?? null;

      const buyRateChanged =
        currentBuyRate > 0 && currentBuyRate !== usedBuyRate;
      const marketPriceExceeded = relativeChangeExceeded(
        currentMarketPrice,
        usedMarketPrice,
        TOLERANCE_PERCENT,
      );

      if (buyRateChanged || marketPriceExceeded) {
        rateOverriddenRef.current = true;
        acknowledgedBuyRateRef.current = currentBuyRate;
        acknowledgedMarketPriceRef.current = currentMarketPrice;

        recalculate(values.amount, currentMarketPrice, currentBuyRate);

        const reasons: string[] = [];

        if (buyRateChanged) {
          const categoryLabel = previousCategory?.label ?? "default rate";
          reasons.push(
            `Buy rate changed from ${formatAmount(
              usedBuyRate,
            )}/$ to ${formatAmount(currentBuyRate)}/$ (${categoryLabel})`,
          );
        }

        if (marketPriceExceeded) {
          reasons.push(
            `Market price moved from ${formatAmount(usedMarketPrice, {
              currency: "USD",
            })} to ${formatAmount(currentMarketPrice, { currency: "USD" })}`,
          );
        }

        showError(
          `Prices updated — please review before continuing.${reasons.join(
            "",
          )}`,
        );
        return;
      }

      navigation.navigate("ConfirmTransaction" as never, {
        payload: { ...values, url: "/wallets/user/buy-crypto" },
      });
    } catch (error: any) {
      console.log(error);
      showError("Error checking rates. Try again.");
    }
  };

  // Pull to refresh
  // const onRefresh = async () => {
  //   setRefreshing(true);
  //   rateOverriddenRef.current = false;
  //   await refetch();
  //   setRefreshing(false);
  // };

  const onRefresh = async () => {
    setRefreshing(true);
    rateOverriddenRef.current = false;
    await Promise.all([refetch(), refetchServiceCharges()]);
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <CustomLoading loading={isLoading} />
      </View>
    );
  }

  if (!assetDetails) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["right", "left"]}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: normalize(20),
          }}
        >
          <AppText
            style={{
              fontSize: normalize(18),
              fontFamily: getFontFamily("700"),
              color: colors.text,
              textAlign: "center",
            }}
          >
            No wallet found
          </AppText>
          <TouchableOpacity
            activeOpacity={0.89}
            style={[styles.button, { paddingHorizontal: 24, marginTop: 16 }]}
            onPress={() => refetch()}
          >
            <AppText style={styles.buttonText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, paddingBottom: 20, backgroundColor: colors.background }}
      edges={["right", "left"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <View>
            <View style={{ marginBottom: 15 }}>
              <AppText style={styles.label}>Coin</AppText>
              <View style={styles.cryptoRow}>
                {assetDetails?.asset_logo_url && (
                  <Image
                    source={{ uri: assetDetails?.asset_logo_url ?? "" }}
                    style={styles.optionLogo}
                  />
                )}
                <View style={styles.cryptoInfo}>
                  <AppText style={styles.optionName}>
                    {assetDetails?.symbol} {`(${assetDetails?.asset_name})`}
                  </AppText>
                </View>
              </View>
            </View>
            <View>
              <AppText style={styles.label}>
                Enter the amount you want to buy
              </AppText>
              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, onBlur } }) => (
                  <View
                    style={[
                      styles.inputContainer,
                      errors.amount && styles.errorBorder,
                    ]}
                  >
                    <AppText style={styles.dollarSign}>$</AppText>
                    <TextInput
                      style={[styles.input]}
                      value={displayAmount}
                      placeholder="0.00"
                      placeholderTextColor="#999"
                      keyboardType="decimal-pad"
                      onBlur={onBlur}
                      maxFontSizeMultiplier={1}
                      allowFontScaling={false}
                      onChangeText={text => {
                        const formatted = formatWithCommas(text);
                        const numeric = parseToNumber(formatted);
                        onChange(numeric);
                        setDisplayAmount(formatted);
                      }}
                    />
                  </View>
                )}
              />
              {errors.amount && (
                <AppText style={styles.error}>{errors.amount.message}</AppText>
              )}

              {hasInsufficientBalance && insufficientBalanceMessage && (
                <AppText style={styles.error}>
                  {insufficientBalanceMessage}
                </AppText>
              )}

              {!errors.amount && (
                <AppText style={styles.approx}>
                  Approximately {assetValueEquivalent} {assetDetails?.symbol}
                </AppText>
              )}

              <View
                style={{
                  marginVertical: 10,
                  backgroundColor: colors.inputBackground,
                  padding: 10,
                  borderRadius: 10,
                  gap: 8,
                }}
              >
                <AppText style={[styles.note]}>
                  Wallet Balance, Exchange Rate & Fee Breakdown
                </AppText>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <AppText style={[styles.balance]}>Fiat Balance:</AppText>
                  <AppText style={styles.balance}>
                    {formatAmount(fiatBalance, {
                      currency: "NGN",
                      decimalPlace: 2,
                    })}
                  </AppText>
                </View>

                <View style={{ height: 1, backgroundColor: colors.border }} />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <AppText style={[styles.balance]}>Buy Rate:</AppText>
                  <AppText style={styles.balance}>
                    {formatAmount(
                      feeBreakdown?.currentBuyRate ??
                        assetDetails?.buy_rate ??
                        0,
                    )}
                    /$
                  </AppText>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <AppText style={[styles.balance]}>Market Price:</AppText>
                  <AppText style={styles.balance}>
                    {formatAmount(
                      Number(feeBreakdown?.marketCurrentPrice) || 0,
                      {
                        currency: "USD",
                      },
                    )}
                    /{assetDetails?.symbol}
                  </AppText>
                </View>

                {feeBreakdown && amount > 0 && (
                  <>
                    <View
                      style={{ height: 1, backgroundColor: colors.border }}
                    />

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <AppText style={[styles.balance]}>You Buy:</AppText>
                      <AppText style={styles.balance}>
                        {feeBreakdown.coinAmount} {assetDetails?.symbol} (≈{" "}
                        {formatAmount(feeBreakdown.grossUsd, {
                          currency: "USD",
                          decimalPlace: 2,
                        })}
                        )
                      </AppText>
                    </View>

                    {!feeBreakdown.isStablecoin && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <AppText style={[styles.balance]}>
                          Operational Fee (
                          {(
                            (buyFeeRate ?? feeBreakdown.buyFeeRate) * 100
                          ).toFixed(2)}
                          %):
                        </AppText>
                        <AppText style={[styles.balance]}>
                          +{feeBreakdown.platformFeeCoin} {assetDetails?.symbol}{" "}
                          (≈ ${feeBreakdown.platformFeeUsd})
                        </AppText>
                      </View>
                    )}

                    {feeBreakdown.isStablecoin && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <AppText style={[styles.balance]}>
                          Operational Fee:
                        </AppText>
                        <AppText style={[styles.balance, { color: "#2e7d32" }]}>
                          No fee for {assetDetails?.symbol}
                        </AppText>
                      </View>
                    )}

                    <View
                      style={{ height: 1, backgroundColor: colors.border }}
                    />

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <AppText style={[styles.balance]}>
                        Total Cost (USD):
                      </AppText>
                      <AppText style={[styles.balance]}>
                        {formatAmount(
                          Number(feeBreakdown.totalCostUsd ?? 100),
                          {
                            currency: "USD",
                            decimalPlace: 2,
                          },
                        )}
                      </AppText>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <AppText style={[styles.balance]}>
                        You'll Pay (₦):
                      </AppText>
                      <AppText style={[styles.balance]}>{ngnAmount}</AppText>
                    </View>
                  </>
                )}
              </View>

              <View style={styles.paymentContainer}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: 9,
                  }}
                >
                  <AppText style={styles.ngn}>You're Paying:</AppText>
                  <AppText style={styles.ngn}>{ngnAmount}</AppText>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.89}
            style={[
              styles.button,
              hasInsufficientBalance && styles.buttonDisabled,
            ]}
            disabled={hasInsufficientBalance || isSubmitting}
            onPress={handleSubmit(onSubmit)}
          >
            <AppText style={styles.buttonText}>
              {isSubmitting ? "Please wait..." : "Continue"}
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: normalize(20),
      backgroundColor: colors.background,
      justifyContent: "space-between",
    },
    buttonDisabled: {
      backgroundColor: colors.border,
      opacity: 0.6,
    },
    label: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      marginBottom: normalize(8),
      color: colors.text,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: normalize(12),
      paddingHorizontal: normalize(16),
      marginBottom: normalize(10),
      gap: 5,
    },
    dollarSign: {
      fontSize: normalize(26),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginRight: normalize(5),
    },
    input: {
      flex: 1,
      paddingVertical: normalize(15),
      fontSize: normalize(26),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    error: {
      color: colors.error,
      fontSize: normalize(19),
      fontFamily: getFontFamily("700"),
      marginBottom: normalize(10),
    },
    errorBorder: {
      borderColor: colors.error,
      borderWidth: 1,
    },
    approx: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      marginBottom: normalize(9),
      color: colors.primaryLight,
    },
    cryptoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
    },
    cryptoInfo: { flex: 1 },
    optionName: {
      fontSize: normalize(19),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    optionLogo: {
      width: 30,
      height: 30,
      borderRadius: 120,
      borderWidth: 1,
      borderColor: colors.border,
    },
    balance: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      paddingVertical: 3,
      color: colors.text,
    },
    fee: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      marginBottom: normalize(4),
      color: colors.text,
    },
    rate: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      marginBottom: normalize(4),
      color: colors.text,
    },
    min: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      marginBottom: normalize(4),
      color: colors.text,
    },
    note: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalize(10),
    },
    ngn: {
      color: "white",
      fontSize: normalize(22),
      fontFamily: getFontFamily("900"),
    },
    button: {
      backgroundColor: COLORS.primary,
      paddingVertical: 14,
      borderRadius: normalize(208),
      alignItems: "center",
      marginTop: 20,
      marginBottom: 30,
    },
    buttonText: {
      color: "#fff",
      fontSize: normalize(19),
      fontFamily: getFontFamily("700"),
    },
    paymentContainer: {
      backgroundColor: colors.primaryLight,
      borderRadius: 9,
      marginVertical: 20,
      padding: 10,
    },
    warningContainer: {
      marginVertical: 12,
      padding: 10,
      backgroundColor: "rgba(255, 0, 0, 0.03)",
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "rgba(255, 0, 0, 0.3)",
    },
    warningText: {
      color: "#db0b0bff",
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      textAlign: "center",
    },
  });
