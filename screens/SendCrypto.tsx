// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Linking,
//   Alert,
//   ActivityIndicator,
//   RefreshControl,
// } from "react-native";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as Yup from "yup";
// import { useNavigation, RouteProp, useRoute } from "@react-navigation/native";
// import { getFontFamily, normalize } from "../constants/settings";
// import { COLORS } from "../constants/colors";
// import { SafeAreaView } from "react-native-safe-area-context";
// import CustomLoading from "../components/CustomLoading";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import useAxios from "../hooks/useAxios";
// import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
// import TextInputField from "../components/TextInputField";
// import NoWallet from "../components/NoWallet";
// import InfoCard from "../components/InfoCard";
// import { InfoCircle, ScanBarcode } from "iconsax-react-nativejs";
// import {
//   Camera,
//   useCameraDevice,
//   useCodeScanner,
// } from "react-native-vision-camera";
// import { formatAmount } from "../libs/formatNumber";
// import { SelectInput } from "../components/SelectInputField";
// import { TradeIntent } from "../libs/types";
// import { useMarketPrice } from "../components/useMarketPrice";
// import { showError } from "../utlis/toast";
// import { useResetFormOnMount } from "../hooks/useResetFormOnMount";
// import NumberInputField from "../components/NumberInputField";
// import { AppText } from "../components/AppText";
// import { useColors } from "../hooks/useTheme";

// type CryptoSellScreenParams = {
//   CryptoSell: {
//     intent: TradeIntent;
//   };
// };

// export function calculateWithdrawFee(
//   amount: number,
//   withdrawFee: number,
//   withdrawPercentageFee: number,
//   feeType: number = 1,
// ): { handling_fee: number; amount_after_fee: number } {
//   let handlingFee = 0.0;

//   if (feeType === 0) {
//     handlingFee =
//       withdrawPercentageFee !== 0
//         ? (amount / (1 - withdrawPercentageFee)) * withdrawPercentageFee +
//           withdrawFee
//         : withdrawFee;
//   } else {
//     handlingFee =
//       withdrawPercentageFee !== 0
//         ? withdrawFee + (amount - withdrawFee) * withdrawPercentageFee
//         : withdrawFee;
//   }

//   return {
//     handling_fee: parseFloat(handlingFee.toFixed(8)),
//     amount_after_fee: parseFloat((amount - handlingFee).toFixed(8)),
//   };
// }

// const schema = Yup.object().shape({
//   amount: Yup.number()
//     .min(6, "Minimum amount is 6 USD")
//     .positive("Amount must be greater than 0")
//     .typeError("Enter a valid amount")
//     .required("Amount is required"),
//   wallet_address: Yup.string().required("Wallet address is required"),
//   asset_id: Yup.string().required(),
//   chain: Yup.string().required("Please select a network"),
//   tag: Yup.string().optional(),
// });

// type FormValues = {
//   amount: number;
//   wallet_address: string;
//   asset_id: string;
//   chain: string;
//   tag: string;
// };

// export default function SendScreen() {
//   const navigation = useNavigation<any>();
//   const route = useRoute<RouteProp<CryptoSellScreenParams, "CryptoSell">>();
//   const { apiGet, post } = useAxios();
//   const { intent } = route.params;
//   const selectedAssetUuid = intent?.assetId ?? "";
//   const scannedValueRef = useRef<string | null>(null);
//   const isProcessingRef = useRef(false);
//   const [displayAmount, setDisplayAmount] = useState("");
//   const [showScanner, setShowScanner] = useState(false);
//   const device = useCameraDevice("back");
//   const colors = useColors();
//   const styles = makeStyles(colors);

//   const { data: livePrice } = useMarketPrice(selectedAssetUuid);

//   const {
//     control,
//     handleSubmit,
//     watch,
//     setValue,
//     reset,
//     formState: { errors },
//   } = useForm<any>({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       amount: parseFloat(intent?.amount ?? "0"),
//       asset_id: selectedAssetUuid,
//       wallet_address: "",
//       chain: "",
//       tag: "",
//     },
//     mode: "onChange",
//   });
//   // console.log(errors, intent, selectedAssetUuid);
//   const requestCameraPermission = async () => {
//     const status = await Camera.requestCameraPermission();

//     if (status === "denied") {
//       Alert.alert(
//         "Camera Permission Required",
//         "Please allow camera access to scan QR codes.",
//         [
//           { text: "Cancel", style: "cancel" },
//           { text: "Open Settings", onPress: () => Linking.openSettings() },
//         ],
//       );
//       return;
//     }

//     setShowScanner(true);
//   };

//   const {
//     data: assetDetails,
//     isFetching,
//     refetch,
//   } = useQuery({
//     queryKey: ["crypto-detail", selectedAssetUuid],
//     queryFn: async () => {
//       if (!selectedAssetUuid) return null;
//       const res = await apiGet(`/wallets/${selectedAssetUuid}`);
//       return res?.data?.data ?? null;
//     },
//     enabled: !!selectedAssetUuid,
//   });

//   // console.log(assetDetails);

//   const amount = watch("amount");
//   const balance = Number(assetDetails?.balance ?? 0);
//   const marketPrice = useMemo(
//     () =>
//       parseFloat(
//         livePrice?.market_current_value ??
//           assetDetails?.market_current_value ??
//           "0",
//       ),
//     [livePrice?.market_current_value, assetDetails?.market_current_value],
//   );
//   const symbol = assetDetails?.symbol ?? "";
//   const balanceInUsd = balance * marketPrice;

//   const codeScanner = useCodeScanner({
//     codeTypes: ["qr"],
//     onCodeScanned: codes => {
//       const value = codes[0]?.value;
//       if (value) {
//         setValue("wallet_address", value, {
//           shouldValidate: true,
//           shouldDirty: true,
//         });
//         setShowScanner(false);
//       }
//     },
//   });

//   useEffect(() => {
//     if (!showScanner) return;

//     const interval = setInterval(() => {
//       if (scannedValueRef.current) {
//         setValue("wallet_address", scannedValueRef.current, {
//           shouldValidate: true,
//           shouldDirty: true,
//         });
//         scannedValueRef.current = null;
//         isProcessingRef.current = false;
//         setShowScanner(false);
//       }
//     }, 300);

//     return () => clearInterval(interval);
//   }, [showScanner, setValue]);

//   const networkOptions = useMemo(() => {
//     if (
//       !assetDetails?.available_chains ||
//       !Array.isArray(assetDetails?.available_chains)
//     ) {
//       return [];
//     }

//     const chains = assetDetails?.available_chains ?? [];

//     return chains
//       .filter((chain: any) => chain.withdraw_enabled)
//       .map((chain: any) => ({
//         ...chain,
//         label: `${chain?.chain} (${chain.chain_type?.toUpperCase()})`,
//         value: chain?.chain,
//         network_charges: chain?.withdraw_fee,
//         symbol: assetDetails?.symbol,
//         network_charges_in_usd: chain?.withdraw_fee * marketPrice,
//       }));
//   }, [assetDetails?.available_chains, marketPrice]);

//   const selectedChain = watch("chain");

//   const selectedNetwork = useMemo(() => {
//     return networkOptions.find((n: any) => n.value === selectedChain) ?? null;
//   }, [networkOptions, selectedChain]);

//   const feeBreakdown = useMemo(() => {
//     if (!selectedNetwork || !amount || amount <= 0 || marketPrice <= 0) {
//       return null;
//     }

//     const precision = Number(selectedNetwork.min_accuracy ?? 6);
//     const coinAmount = amount / marketPrice;
//     const withdrawFee = parseFloat(selectedNetwork.withdraw_fee ?? "0");
//     const withdrawPercentageFee = parseFloat(
//       selectedNetwork.withdraw_percentage_fee ?? "0",
//     );
//     const feeType = Number(selectedNetwork.fee_type ?? 1);

//     let bybitFeeCoin = 0;
//     if (feeType === 0) {
//       if (withdrawPercentageFee !== 0) {
//         bybitFeeCoin =
//           (coinAmount / (1 - withdrawPercentageFee)) * withdrawPercentageFee +
//           withdrawFee;
//       } else {
//         bybitFeeCoin = withdrawFee;
//       }
//     } else {
//       if (withdrawPercentageFee !== 0) {
//         bybitFeeCoin =
//           withdrawFee + (coinAmount - withdrawFee) * withdrawPercentageFee;
//       } else {
//         bybitFeeCoin = withdrawFee;
//       }
//     }

//     const platformFeeCoin = 1 / marketPrice; // $1 platform fee in coin
//     const totalFeeCoin = bybitFeeCoin + platformFeeCoin;
//     const totalFeesUsd = totalFeeCoin * marketPrice;

//     // total deducted from wallet = amount + fees
//     const totalCoinDeducted = coinAmount + totalFeeCoin;
//     const totalUsdDeducted = amount + totalFeesUsd;
//     const bybitFeeUsd = bybitFeeCoin * marketPrice;
//     const platformFeeUsd = 1;
//     const minWithdrawCoin = parseFloat(selectedNetwork.withdraw_min ?? "0");
//     const isBelowMinimum = coinAmount < minWithdrawCoin;
//     const isTooSmall = coinAmount <= 0;

//     return {
//       coinAmount: coinAmount.toFixed(precision), // recipient gets (coin)
//       bybitFeeCoin: bybitFeeCoin.toFixed(precision),
//       platformFeeCoin: platformFeeCoin.toFixed(precision),
//       totalFeeCoin: totalFeeCoin.toFixed(precision),
//       totalCoinDeducted: totalCoinDeducted.toFixed(precision),
//       totalUsdDeducted: totalUsdDeducted.toFixed(2),
//       bybitFeeUsd: bybitFeeUsd.toFixed(6),
//       platformFeeUsd: platformFeeUsd.toFixed(6),
//       totalFeeUsd: totalFeesUsd.toFixed(6),
//       usdAmountAfterFee: amount.toFixed(6),
//       withdrawMin: selectedNetwork.withdraw_min,
//       isBelowMinimum,
//       isTooSmall,
//     };
//   }, [selectedNetwork, amount, marketPrice]);

//   const withdrawalStatus = useMemo(() => {
//     if (!feeBreakdown || !assetDetails) {
//       return { hasIssue: false, message: "" };
//     }

//     const totalUsdDeducted = Number(feeBreakdown.totalUsdDeducted);
//     const balanceUsd = Number(balanceInUsd);
//     const minWithdrawCoin = Number(selectedNetwork?.withdraw_min ?? 0);
//     const minWithdrawUsd = minWithdrawCoin * marketPrice;

//     if (amount < minWithdrawUsd) {
//       return {
//         hasIssue: true,
//         message: `Minimum withdrawal is ${formatAmount(minWithdrawUsd, {
//           currency: "USD",
//         })}. You entered ${formatAmount(amount, {
//           currency: "USD",
//           decimalPlace: 2,
//         })}.`,
//       };
//     }

//     if (feeBreakdown.isTooSmall) {
//       return {
//         hasIssue: true,
//         message: "Amount is too small to process after fees.",
//       };
//     }

//     if (totalUsdDeducted > balanceUsd) {
//       return {
//         hasIssue: true,
//         message: `Insufficient balance. You need ${formatAmount(
//           totalUsdDeducted,
//           {
//             currency: "USD",
//           },
//         )} (amount + fees) but your balance is ${formatAmount(balanceUsd, {
//           currency: "USD",
//           decimalPlace: 2,
//         })}.`,
//       };
//     }

//     return { hasIssue: false, message: "" };
//   }, [
//     feeBreakdown,
//     assetDetails,
//     amount,
//     balanceInUsd,
//     selectedNetwork,
//     marketPrice,
//   ]);

//   useEffect(() => {
//     if (networkOptions.length === 1) {
//       setValue("chain", networkOptions[0].value, { shouldValidate: true });
//     }
//   }, [networkOptions, setValue]);

//   // const withdrawalStatus = useMemo(() => {
//   //   if (!feeBreakdown || !assetDetails) {
//   //     return { hasIssue: false, message: "" };
//   //   }

//   //   const totalUsdDeducted = Number(feeBreakdown.totalUsdDeducted);
//   //   const balanceUsd = Number(balanceInUsd);
//   //   const minWithdrawCoin = Number(selectedNetwork?.withdraw_min ?? 0);
//   //   const minWithdrawUsd = minWithdrawCoin * marketPrice;

//   //   // Case 1: send amount is below the network minimum
//   //   if (amount < minWithdrawUsd) {
//   //     return {
//   //       hasIssue: true,
//   //       message: `Minimum withdrawal is ${formatAmount(minWithdrawUsd, {
//   //         currency: "USD",
//   //       })}. You entered ${formatAmount(amount, { currency: "USD" })}.`,
//   //     };
//   //   }

//   //   // Case 2: coin amount is zero or negative
//   //   if (feeBreakdown.isTooSmall) {
//   //     return {
//   //       hasIssue: true,
//   //       message: "Amount is too small to process after fees.",
//   //     };
//   //   }

//   //   // Case 3: total (amount + fees) exceeds balance
//   //   if (totalUsdDeducted > balanceUsd) {
//   //     return {
//   //       hasIssue: true,
//   //       message: `Insufficient balance. You need ${formatAmount(
//   //         totalUsdDeducted,
//   //         { currency: "USD" },
//   //       )} (amount + fees) but your balance is ${formatAmount(balanceUsd, {
//   //         currency: "USD",
//   //       })}.`,
//   //     };
//   //   }

//   //   return { hasIssue: false, message: "" };
//   // }, [
//   //   feeBreakdown,
//   //   assetDetails,
//   //   amount,
//   //   balanceInUsd,
//   //   selectedNetwork,
//   //   marketPrice,
//   // ]);

//   useEffect(() => {
//     if (networkOptions.length === 1) {
//       setValue("chain", networkOptions[0].value, { shouldValidate: true });
//     }
//   }, [networkOptions, setValue]);

//   useResetFormOnMount(
//     reset,
//     {
//       amount: parseFloat(intent?.amount ?? "0"),
//       asset_id: selectedAssetUuid,
//       wallet_address: "",
//       chain: "",
//       tag: "",
//     },
//     () => {
//       setDisplayAmount(intent?.amount ? formatWithCommas(intent.amount) : "");
//     },
//   );

//   // const hasInsufficientBalance = useMemo(() => {
//   //   if (!feeBreakdown?.usdAmountAfterFee || !assetDetails) return false;

//   //   const amountAfterFee = Number(feeBreakdown.usdAmountAfterFee);

//   //   // If after-fee amount is <= 0, treat as insufficient
//   //   if (amountAfterFee <= 0) return true;

//   //   return amountAfterFee > balanceInUsd;
//   // }, [feeBreakdown?.usdAmountAfterFee, balanceInUsd, assetDetails]);

//   // const canSubmit = isValid && !hasInsufficientBalance && amount > 0;

//   const { mutate: initiateWithdrawal, isPending } = useMutation({
//     mutationFn: async (values: FormValues) => {
//       const res = await post("/crypto/user/initiate-withdraw", {
//         asset_id: values.asset_id,
//         wallet_address: values.wallet_address,
//         amount: values.amount,
//         chain: values.chain,
//         tag: values.tag,
//       });

//       console.log("Withdrawal initiated successfully:", res);
//       return res?.data;
//     },
//     onSuccess: (_, values) => {
//       console.log("Withdrawal initiated successfully:", _);
//       navigation.navigate("ConfirmCryptoWithdrawTransaction", {
//         payload: {
//           ...values,
//           url: "/crypto/withdraw/confirm",
//         },
//       });
//     },
//     onError: (error: any) => {
//       console.log("Withdrawal Error:", error);
//       const message =
//         error?.response?.data?.message ??
//         "Something went wrong. Please try again.";
//       showError(message);
//     },
//   });

//   const onSubmit = (values: any) => {
//     initiateWithdrawal(values);
//   };

//   if (showScanner) {
//     if (!device) {
//       Alert.alert("Error", "No back camera found on this device.");
//       setShowScanner(false);
//       return null;
//     }

//     return (
//       <View style={{ flex: 1 }}>
//         <Camera
//           device={device}
//           isActive={showScanner}
//           photo={false}
//           audio={false}
//           video={false}
//           codeScanner={codeScanner}
//           style={StyleSheet.absoluteFill}
//         />
//         <TouchableOpacity
//           style={styles.closeScannerButton}
//           onPress={() => setShowScanner(false)}
//         >
//           <AppText style={styles.closeScannerText}>Close</AppText>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView
//       style={{ flex: 1, backgroundColor: colors.background }}
//       edges={["right", "left"]}
//     >
//       <ScrollView
//         style={styles.scrollContainer}
//         showsVerticalScrollIndicator={false}
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
//         refreshControl={
//           <RefreshControl refreshing={isFetching} onRefresh={() => refetch()} />
//         }
//       >
//         {!assetDetails?.wallet_id ? (
//           <NoWallet selectedAssetUuid={selectedAssetUuid} onSuccess={refetch} />
//         ) : (
//           <View style={styles.container}>
//             <View style={styles.linkContainer}>
//               <AppText style={styles.text}>
//                 This screen is for
//                 <AppText style={styles.bold}> on-chain withdrawals</AppText> to
//                 external wallets.{" "}
//                 <AppText
//                   onPress={() => navigation.navigate("Transfer")}
//                   style={styles.link}
//                 >
//                   Click here for internal transfers
//                 </AppText>{" "}
//                 to other users on the app.
//               </AppText>
//             </View>

//             <View style={{ gap: 10, flex: 1 }}>
//               <View>
//                 <AppText style={styles.label}>
//                   Enter the amount you want to send
//                 </AppText>

//                 <Controller
//                   control={control}
//                   name="amount"
//                   render={({ field: { onBlur, onChange } }) => (
//                     <View style={styles.inputContainer}>
//                       <AppText style={styles.dollarSign}>$</AppText>
//                       <TextInput
//                         maxFontSizeMultiplier={1}
//                         allowFontScaling={false}
//                         style={styles.input}
//                         value={displayAmount}
//                         placeholder="0.00"
//                         placeholderTextColor="#999"
//                         keyboardType="decimal-pad"
//                         onBlur={onBlur}
//                         onChangeText={text => {
//                           const formatted = formatWithCommas(text);
//                           const numeric = parseToNumber(formatted);
//                           onChange(numeric);
//                           setDisplayAmount(formatted);
//                         }}
//                       />
//                     </View>
//                   )}
//                 />

//                 {errors.amount && (
//                   <AppText style={styles.error}>
//                     {errors?.amount?.message as string}
//                   </AppText>
//                 )}

//                 <AppText style={styles.walletBalance}>
//                   Wallet Balance: {balance} {symbol}
//                   {" ≈ "}
//                   {formatAmount(balanceInUsd, {
//                     currency: "USD",
//                     decimalPlace: 2,
//                   })}
//                 </AppText>
//               </View>
//               <View style={styles.walletAddressRow}>
//                 <View style={{ flex: 1 }}>
//                   <TextInputField
//                     label="Wallet Address"
//                     control={control}
//                     name="wallet_address"
//                     placeholder="Enter destination wallet address"
//                   />
//                 </View>

//                 <TouchableOpacity
//                   hitSlop={10}
//                   activeOpacity={0.8}
//                   style={styles.scanButton}
//                   onPress={requestCameraPermission}
//                 >
//                   <ScanBarcode size={19} color="#fff" />
//                 </TouchableOpacity>
//               </View>

//               <SelectInput
//                 control={control}
//                 name="chain"
//                 label="Select Network"
//                 title="Select withdrawal network"
//                 placeholder={
//                   networkOptions.length === 0
//                     ? "No networks available"
//                     : "Select a network"
//                 }
//                 options={networkOptions}
//               />

//               <View style={{ flex: 1 }}>
//                 <NumberInputField
//                   label="Tag/Memo (if required by the network)"
//                   control={control}
//                   name="tag"
//                   placeholder="Enter tag or memo (optional)"
//                 />
//               </View>

//               {withdrawalStatus.hasIssue && (
//                 <View style={styles.warningContainer}>
//                   <AppText style={styles.warningText}>
//                     {withdrawalStatus.message}
//                   </AppText>
//                 </View>
//               )}

//               {feeBreakdown && (
//                 <View style={styles.feeBreakdownContainer}>
//                   <AppText style={styles.feeBreakdownTitle}>
//                     Fee Breakdown
//                   </AppText>

//                   <View style={styles.feeRow}>
//                     <AppText style={styles.feeLabel}>You Send</AppText>
//                     <AppText style={styles.feeValue}>
//                       {feeBreakdown.coinAmount} {symbol} (≈ $
//                       {amount?.toFixed(2)})
//                     </AppText>
//                   </View>
//                   <View style={styles.feeRow}>
//                     <AppText style={[styles.feeLabel]}>Market Price:</AppText>
//                     <AppText style={styles.feeValue}>
//                       {formatAmount(marketPrice || 0, {
//                         currency: "USD",
//                         decimalPlace: 4,
//                       })}
//                       /{assetDetails?.symbol}
//                     </AppText>
//                   </View>
//                   <View style={styles.feeDivider} />

//                   <View style={styles.feeRow}>
//                     <AppText style={styles.feeLabel}>
//                       Network and On-chain Fee ({selectedNetwork?.chain})
//                     </AppText>
//                     <AppText style={styles.feeValue}>
//                       {feeBreakdown.bybitFeeCoin} {symbol} (≈ $
//                       {feeBreakdown.bybitFeeUsd})
//                     </AppText>
//                   </View>

//                   <View style={styles.feeRow}>
//                     <AppText style={styles.feeLabel}>Operation Fee</AppText>
//                     <AppText style={styles.feeValue}>
//                       {feeBreakdown.platformFeeCoin} {symbol} (≈ $1.00)
//                     </AppText>
//                   </View>

//                   <View style={styles.feeDivider} />

//                   <View style={styles.feeRow}>
//                     <AppText style={[styles.feeLabel]}>Recipient Gets</AppText>
//                     <AppText style={[styles.feeValue]}>
//                       {feeBreakdown.coinAmount} {symbol} (≈ $
//                       {feeBreakdown.usdAmountAfterFee})
//                     </AppText>
//                   </View>

//                   <View style={styles.feeDivider} />

//                   <View style={styles.feeRow}>
//                     <AppText style={styles.feeLabel}>Total Deducted</AppText>
//                     <AppText style={[styles.feeValue]}>
//                       {feeBreakdown.totalCoinDeducted} {symbol} (≈ $
//                       {feeBreakdown.totalUsdDeducted})
//                     </AppText>
//                   </View>
//                 </View>
//               )}

//               <InfoCard
//                 IconComponent={<InfoCircle size={15} color={COLORS.primary} />}
//                 title="Important Notice!"
//                 description={[
//                   "Double-check the wallet address before confirming.",
//                   "Cryptocurrency transactions are irreversible.",
//                   "Sending to the wrong address will result in permanent loss of funds.",
//                 ]}
//               />
//             </View>

//             <TouchableOpacity
//               hitSlop={9}
//               activeOpacity={0.89}
//               disabled={withdrawalStatus.hasIssue || isPending}
//               style={[
//                 styles.button,
//                 {
//                   backgroundColor:
//                     withdrawalStatus.hasIssue || isPending
//                       ? COLORS.fadePrimary
//                       : COLORS.secondary,
//                 },
//               ]}
//               onPress={handleSubmit(onSubmit)}
//             >
//               {isPending ? (
//                 <ActivityIndicator color="#fff" size={10} />
//               ) : (
//                 <AppText style={styles.buttonText}>Continue</AppText>
//               )}
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>

//       <CustomLoading loading={isFetching} />
//     </SafeAreaView>
//   );
// }

// const makeStyles = (colors: ReturnType<typeof useColors>) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       paddingHorizontal: normalize(20),
//       backgroundColor: colors.background,
//     },
//     scrollContainer: {
//       flex: 1,
//       paddingVertical: 20,
//       backgroundColor: colors.background,
//     },
//     linkContainer: {
//       marginBottom: 20,
//       padding: 12,
//       backgroundColor: colors.inputBackground,
//       borderRadius: 8,
//       borderWidth: 1,
//       borderColor: colors.border,
//       alignItems: "center",
//       justifyContent: "center",
//     },
//     text: {
//       fontSize: normalize(18),
//       color: colors.text,
//       fontFamily: getFontFamily("700"),
//     },
//     bold: {
//       fontFamily: getFontFamily("900"),
//     },
//     link: {
//       color: colors.primaryLight,
//       fontFamily: getFontFamily("700"),
//       alignContent: "center",
//       justifyContent: "center",
//     },
//     label: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("800"),
//       marginBottom: 3,
//       color: colors.text,
//     },
//     error: {
//       color: colors.error,
//       fontSize: normalize(17),
//       fontFamily: getFontFamily("700"),
//       marginBottom: 10,
//     },
//     inputContainer: {
//       flexDirection: "row",
//       alignItems: "center",
//       borderWidth: 1,
//       borderColor: colors.border,
//       borderRadius: 10,
//       paddingHorizontal: normalize(16),
//       marginBottom: 10,
//       gap: 5,
//     },
//     feeBreakdownContainer: {
//       backgroundColor: colors.inputBackground,
//       borderRadius: 12,
//       padding: 16,
//       gap: 10,
//     },
//     feeBreakdownTitle: {
//       color: colors.text,
//       fontFamily: getFontFamily("800"),
//       fontSize: 13,
//       marginBottom: 4,
//     },
//     feeRow: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//     },
//     feeLabel: {
//       color: colors.text,
//       fontFamily: getFontFamily("700"),
//       fontSize: 12,
//       flex: 1,
//     },
//     feeValue: {
//       color: colors.text,
//       fontFamily: getFontFamily("900"),
//       fontSize: 12,
//       textAlign: "right",
//       flex: 1,
//     },
//     feeDivider: {
//       height: 1,
//       backgroundColor: colors.border,
//     },
//     feeWarning: {
//       backgroundColor: "#3a1a1a",
//       borderRadius: 8,
//       padding: 10,
//       marginTop: 4,
//     },
//     feeWarningText: {
//       color: colors.error,
//       fontFamily: getFontFamily("400"),
//       fontSize: 18,
//     },
//     dollarSign: {
//       fontSize: normalize(24),
//       fontFamily: getFontFamily("700"),
//       color: colors.text,
//       marginRight: normalize(5),
//     },
//     input: {
//       flex: 1,
//       paddingVertical: normalize(14),
//       fontSize: normalize(24),
//       fontFamily: getFontFamily("800"),
//       color: colors.text,
//     },
//     approx: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("700"),
//       marginBottom: normalize(6),
//       color: COLORS.primary,
//     },
//     walletBalance: {
//       fontSize: normalize(17),
//       fontFamily: getFontFamily("700"),
//       color: colors.text,
//       marginBottom: 4,
//       paddingBottom: 1,
//     },
//     walletAddressRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 10,
//       // marginTop: 30,
//     },
//     scanButton: {
//       padding: 9,
//       borderRadius: 10,
//       backgroundColor: COLORS.primary,
//       marginTop: 10,
//       justifyContent: "center",
//       alignItems: "center",
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
//       color: colors.error,
//       fontSize: normalize(17),
//       fontFamily: getFontFamily("800"),
//       textAlign: "center",
//     },
//     button: {
//       paddingVertical: normalize(14),
//       borderRadius: 100,
//       alignItems: "center",
//       marginTop: 30,
//     },
//     buttonText: {
//       color: "#fff",
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("700"),
//     },
//     closeScannerButton: {
//       position: "absolute",
//       top: 50,
//       right: 20,
//       backgroundColor: COLORS.primary,
//       paddingHorizontal: 20,
//       paddingVertical: 7,
//       borderRadius: 20,
//     },
//     closeScannerText: {
//       color: "#fff",
//       fontSize: normalize(20),
//       fontFamily: getFontFamily("700"),
//     },
//   });
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigation, RouteProp, useRoute } from "@react-navigation/native";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomLoading from "../components/CustomLoading";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
import TextInputField from "../components/TextInputField";
import NoWallet from "../components/NoWallet";
import InfoCard from "../components/InfoCard";
import { InfoCircle, ScanBarcode } from "iconsax-react-nativejs";
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from "react-native-vision-camera";
import { formatAmount } from "../libs/formatNumber";
import { SelectInput } from "../components/SelectInputField";
import { TradeIntent } from "../libs/types";
import { useMarketPrice } from "../components/useMarketPrice";
import { showError } from "../utlis/toast";
import { useResetFormOnMount } from "../hooks/useResetFormOnMount";
import NumberInputField from "../components/NumberInputField";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import {
  useServiceCharges,
  calculateServiceCharge,
} from "../hooks/useServiceCharges";

type CryptoSellScreenParams = {
  CryptoSell: {
    intent: TradeIntent;
  };
};

export function calculateWithdrawFee(
  amount: number,
  withdrawFee: number,
  withdrawPercentageFee: number,
  feeType: number = 1,
): { handling_fee: number; amount_after_fee: number } {
  let handlingFee = 0.0;

  if (feeType === 0) {
    handlingFee =
      withdrawPercentageFee !== 0
        ? (amount / (1 - withdrawPercentageFee)) * withdrawPercentageFee +
          withdrawFee
        : withdrawFee;
  } else {
    handlingFee =
      withdrawPercentageFee !== 0
        ? withdrawFee + (amount - withdrawFee) * withdrawPercentageFee
        : withdrawFee;
  }

  return {
    handling_fee: parseFloat(handlingFee.toFixed(8)),
    amount_after_fee: parseFloat((amount - handlingFee).toFixed(8)),
  };
}

const schema = Yup.object().shape({
  amount: Yup.number()
    .min(6, "Minimum amount is 6 USD")
    .positive("Amount must be greater than 0")
    .typeError("Enter a valid amount")
    .required("Amount is required"),
  wallet_address: Yup.string().required("Wallet address is required"),
  asset_id: Yup.string().required(),
  chain: Yup.string().required("Please select a network"),
  tag: Yup.string().optional(),
});

type FormValues = {
  amount: number;
  wallet_address: string;
  asset_id: string;
  chain: string;
  tag: string;
};

export default function SendScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<CryptoSellScreenParams, "CryptoSell">>();
  const { apiGet, post } = useAxios();
  const { intent } = route.params;
  const selectedAssetUuid = intent?.assetId ?? "";
  const scannedValueRef = useRef<string | null>(null);
  const isProcessingRef = useRef(false);
  const [displayAmount, setDisplayAmount] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const device = useCameraDevice("back");
  const colors = useColors();
  const styles = makeStyles(colors);

  const { data: livePrice } = useMarketPrice(selectedAssetUuid);

  // Real operation fee from the backend, falling back to $1 if
  // crypto_withdraw_charge isn't configured — same fallback value the
  // backend itself uses, so the preview matches what confirm will actually
  // charge whether or not the charge exists yet.
  const { getCharge } = useServiceCharges();
  const withdrawCharge = getCharge("crypto_withdrawal_fee");

  console.log("Withdraw charge:", withdrawCharge);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: parseFloat(intent?.amount ?? "0"),
      asset_id: selectedAssetUuid,
      wallet_address: "",
      chain: "",
      tag: "",
    },
    mode: "onChange",
  });

  const requestCameraPermission = async () => {
    const status = await Camera.requestCameraPermission();

    if (status === "denied") {
      Alert.alert(
        "Camera Permission Required",
        "Please allow camera access to scan QR codes.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }

    setShowScanner(true);
  };

  const {
    data: assetDetails,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["crypto-detail", selectedAssetUuid],
    queryFn: async () => {
      if (!selectedAssetUuid) return null;
      const res = await apiGet(`/wallets/${selectedAssetUuid}`);
      return res?.data?.data ?? null;
    },
    enabled: !!selectedAssetUuid,
  });

  const amount = watch("amount");
  const balance = Number(assetDetails?.balance ?? 0);
  const marketPrice = useMemo(
    () =>
      parseFloat(
        livePrice?.market_current_value ??
          assetDetails?.market_current_value ??
          "0",
      ),
    [livePrice?.market_current_value, assetDetails?.market_current_value],
  );
  const symbol = assetDetails?.symbol ?? "";
  const balanceInUsd = balance * marketPrice;

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: codes => {
      const value = codes[0]?.value;
      if (value) {
        setValue("wallet_address", value, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setShowScanner(false);
      }
    },
  });

  useEffect(() => {
    if (!showScanner) return;

    const interval = setInterval(() => {
      if (scannedValueRef.current) {
        setValue("wallet_address", scannedValueRef.current, {
          shouldValidate: true,
          shouldDirty: true,
        });
        scannedValueRef.current = null;
        isProcessingRef.current = false;
        setShowScanner(false);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [showScanner, setValue]);

  const networkOptions = useMemo(() => {
    if (
      !assetDetails?.available_chains ||
      !Array.isArray(assetDetails?.available_chains)
    ) {
      return [];
    }

    const chains = assetDetails?.available_chains ?? [];

    return chains
      .filter((chain: any) => chain.withdraw_enabled)
      .map((chain: any) => ({
        ...chain,
        label: `${chain?.chain} (${chain.chain_type?.toUpperCase()})`,
        value: chain?.chain,
        network_charges: chain?.withdraw_fee,
        symbol: assetDetails?.symbol,
        network_charges_in_usd: chain?.withdraw_fee * marketPrice,
      }));
  }, [assetDetails?.available_chains, marketPrice]);

  const selectedChain = watch("chain");

  const selectedNetwork = useMemo(() => {
    return networkOptions.find((n: any) => n.value === selectedChain) ?? null;
  }, [networkOptions, selectedChain]);

  const feeBreakdown = useMemo(() => {
    if (!selectedNetwork || !amount || amount <= 0 || marketPrice <= 0) {
      return null;
    }

    const precision = Number(selectedNetwork.min_accuracy ?? 6);
    const coinAmount = amount / marketPrice;
    const withdrawFee = parseFloat(selectedNetwork.withdraw_fee ?? "0");
    const withdrawPercentageFee = parseFloat(
      selectedNetwork.withdraw_percentage_fee ?? "0",
    );
    const feeType = Number(selectedNetwork.fee_type ?? 1);

    let bybitFeeCoin = 0;
    if (feeType === 0) {
      if (withdrawPercentageFee !== 0) {
        bybitFeeCoin =
          (coinAmount / (1 - withdrawPercentageFee)) * withdrawPercentageFee +
          withdrawFee;
      } else {
        bybitFeeCoin = withdrawFee;
      }
    } else {
      if (withdrawPercentageFee !== 0) {
        bybitFeeCoin =
          withdrawFee + (coinAmount - withdrawFee) * withdrawPercentageFee;
      } else {
        bybitFeeCoin = withdrawFee;
      }
    }

    // Was: const platformFeeCoin = 1 / marketPrice; — hardcoded $1.
    // Now: real crypto_withdraw_charge value from the backend (percentage
    // or flat), falling back to $1 only if it isn't configured or resolves
    // to zero — same fallback the backend itself uses.
    const platformFeeUsd = calculateServiceCharge(withdrawCharge, amount, 1);
    const platformFeeCoin = platformFeeUsd / marketPrice;

    const totalFeeCoin = bybitFeeCoin + platformFeeCoin;
    const totalFeesUsd = totalFeeCoin * marketPrice;

    // total deducted from wallet = amount + fees
    const totalCoinDeducted = coinAmount + totalFeeCoin;
    const totalUsdDeducted = amount + totalFeesUsd;
    const bybitFeeUsd = bybitFeeCoin * marketPrice;
    const minWithdrawCoin = parseFloat(selectedNetwork.withdraw_min ?? "0");
    const isBelowMinimum = coinAmount < minWithdrawCoin;
    const isTooSmall = coinAmount <= 0;

    return {
      coinAmount: coinAmount.toFixed(precision),
      bybitFeeCoin: bybitFeeCoin.toFixed(precision),
      platformFeeCoin: platformFeeCoin.toFixed(precision),
      totalFeeCoin: totalFeeCoin.toFixed(precision),
      totalCoinDeducted: totalCoinDeducted.toFixed(precision),
      totalUsdDeducted: totalUsdDeducted.toFixed(2),
      bybitFeeUsd: bybitFeeUsd.toFixed(6),
      platformFeeUsd: platformFeeUsd.toFixed(6),
      totalFeeUsd: totalFeesUsd.toFixed(6),
      usdAmountAfterFee: amount.toFixed(6),
      withdrawMin: selectedNetwork.withdraw_min,
      isBelowMinimum,
      isTooSmall,
    };
  }, [selectedNetwork, amount, marketPrice, withdrawCharge]);

  const withdrawalStatus = useMemo(() => {
    if (!feeBreakdown || !assetDetails) {
      return { hasIssue: false, message: "" };
    }

    const totalUsdDeducted = Number(feeBreakdown.totalUsdDeducted);
    const balanceUsd = Number(balanceInUsd);
    const minWithdrawCoin = Number(selectedNetwork?.withdraw_min ?? 0);
    const minWithdrawUsd = minWithdrawCoin * marketPrice;

    if (amount < minWithdrawUsd) {
      return {
        hasIssue: true,
        message: `Minimum withdrawal is ${formatAmount(minWithdrawUsd, {
          currency: "USD",
        })}. You entered ${formatAmount(amount, {
          currency: "USD",
          decimalPlace: 2,
        })}.`,
      };
    }

    if (feeBreakdown.isTooSmall) {
      return {
        hasIssue: true,
        message: "Amount is too small to process after fees.",
      };
    }

    if (totalUsdDeducted > balanceUsd) {
      return {
        hasIssue: true,
        message: `Insufficient balance. You need ${formatAmount(
          totalUsdDeducted,
          {
            currency: "USD",
          },
        )} (amount + fees) but your balance is ${formatAmount(balanceUsd, {
          currency: "USD",
          decimalPlace: 2,
        })}.`,
      };
    }

    return { hasIssue: false, message: "" };
  }, [
    feeBreakdown,
    assetDetails,
    amount,
    balanceInUsd,
    selectedNetwork,
    marketPrice,
  ]);

  useEffect(() => {
    if (networkOptions.length === 1) {
      setValue("chain", networkOptions[0].value, { shouldValidate: true });
    }
  }, [networkOptions, setValue]);

  useResetFormOnMount(
    reset,
    {
      amount: parseFloat(intent?.amount ?? "0"),
      asset_id: selectedAssetUuid,
      wallet_address: "",
      chain: "",
      tag: "",
    },
    () => {
      setDisplayAmount(intent?.amount ? formatWithCommas(intent.amount) : "");
    },
  );

  const { mutate: initiateWithdrawal, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await post("/crypto/user/initiate-withdraw", {
        asset_id: values.asset_id,
        wallet_address: values.wallet_address,
        amount: values.amount,
        chain: values.chain,
        tag: values.tag,
      });

      return res?.data;
    },
    onSuccess: (_, values) => {
      navigation.navigate("ConfirmCryptoWithdrawTransaction", {
        payload: {
          ...values,
          url: "/crypto/withdraw/confirm",
        },
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ??
        "Something went wrong. Please try again.";
      showError(message);
    },
  });

  const onSubmit = (values: any) => {
    initiateWithdrawal(values);
  };

  if (showScanner) {
    if (!device) {
      Alert.alert("Error", "No back camera found on this device.");
      setShowScanner(false);
      return null;
    }

    return (
      <View style={{ flex: 1 }}>
        <Camera
          device={device}
          isActive={showScanner}
          photo={false}
          audio={false}
          video={false}
          codeScanner={codeScanner}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity
          style={styles.closeScannerButton}
          onPress={() => setShowScanner(false)}
        >
          <AppText style={styles.closeScannerText}>Close</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["right", "left"]}
    >
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={() => refetch()} />
        }
      >
        {!assetDetails?.wallet_id ? (
          <NoWallet selectedAssetUuid={selectedAssetUuid} onSuccess={refetch} />
        ) : (
          <View style={styles.container}>
            <View style={styles.linkContainer}>
              <AppText style={styles.text}>
                This screen is for
                <AppText style={styles.bold}> on-chain withdrawals</AppText> to
                external wallets.{" "}
                <AppText
                  onPress={() => navigation.navigate("Transfer")}
                  style={styles.link}
                >
                  Click here for internal transfers
                </AppText>{" "}
                to other users on the app.
              </AppText>
            </View>

            <View style={{ gap: 10, flex: 1 }}>
              <View>
                <AppText style={styles.label}>
                  Enter the amount you want to withdrawal
                </AppText>

                <Controller
                  control={control}
                  name="amount"
                  render={({ field: { onBlur, onChange } }) => (
                    <View style={styles.inputContainer}>
                      <AppText style={styles.dollarSign}>$</AppText>
                      <TextInput
                        maxFontSizeMultiplier={1}
                        allowFontScaling={false}
                        style={styles.input}
                        value={displayAmount}
                        placeholder="0.00"
                        placeholderTextColor="#999"
                        keyboardType="decimal-pad"
                        onBlur={onBlur}
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
                  <AppText style={styles.error}>
                    {errors?.amount?.message as string}
                  </AppText>
                )}

                <AppText style={styles.walletBalance}>
                  Wallet Balance: {balance} {symbol}
                  {" ≈ "}
                  {formatAmount(balanceInUsd, {
                    currency: "USD",
                    decimalPlace: 2,
                  })}
                </AppText>
              </View>
              <View style={styles.walletAddressRow}>
                <View style={{ flex: 1 }}>
                  <TextInputField
                    label="Wallet Address"
                    control={control}
                    name="wallet_address"
                    placeholder="Enter destination wallet address"
                  />
                </View>

                <TouchableOpacity
                  hitSlop={10}
                  activeOpacity={0.8}
                  style={styles.scanButton}
                  onPress={requestCameraPermission}
                >
                  <ScanBarcode size={19} color="#fff" />
                </TouchableOpacity>
              </View>

              <SelectInput
                control={control}
                name="chain"
                label="Select Network"
                title="Select withdrawal network"
                placeholder={
                  networkOptions.length === 0
                    ? "No networks available"
                    : "Select a network"
                }
                options={networkOptions}
              />

              <View style={{ flex: 1 }}>
                <NumberInputField
                  label="Tag/Memo (if required by the network)"
                  control={control}
                  name="tag"
                  placeholder="Enter tag or memo (optional)"
                />
              </View>

              {feeBreakdown && (
                <View style={styles.feeBreakdownContainer}>
                  <AppText style={styles.feeBreakdownTitle}>
                    Fee Breakdown
                  </AppText>

                  <View style={styles.feeRow}>
                    <AppText style={styles.feeLabel}>You Send</AppText>
                    <AppText style={styles.feeValue}>
                      {feeBreakdown.coinAmount} {symbol} (≈ $
                      {amount?.toFixed(2)})
                    </AppText>
                  </View>
                  <View style={styles.feeRow}>
                    <AppText style={[styles.feeLabel]}>Market Price:</AppText>
                    <AppText style={styles.feeValue}>
                      {formatAmount(marketPrice || 0, {
                        currency: "USD",
                        decimalPlace: 4,
                      })}
                      /{assetDetails?.symbol}
                    </AppText>
                  </View>
                  <View style={styles.feeDivider} />

                  <View style={styles.feeRow}>
                    <AppText style={styles.feeLabel}>
                      Network and On-chain Fee ({selectedNetwork?.chain})
                    </AppText>
                    <AppText style={styles.feeValue}>
                      {feeBreakdown.bybitFeeCoin} {symbol} (≈ $
                      {feeBreakdown.bybitFeeUsd})
                    </AppText>
                  </View>

                  <View style={styles.feeRow}>
                    <AppText style={styles.feeLabel}>Operation Fee</AppText>
                    <AppText style={styles.feeValue}>
                      {/* Was: hardcoded "(≈ $1.00)" — now reflects the real
                          fee, whatever crypto_withdraw_charge is configured
                          to, or the $1 fallback if it isn't. */}
                      {feeBreakdown.platformFeeCoin} {symbol} (≈{" "}
                      {formatAmount(Number(feeBreakdown.platformFeeUsd), {
                        currency: "USD",
                        decimalPlace: 2,
                      })}
                      )
                    </AppText>
                  </View>

                  <View style={styles.feeDivider} />

                  <View style={styles.feeRow}>
                    <AppText style={[styles.feeLabel]}>Recipient Gets</AppText>
                    <AppText style={[styles.feeValue]}>
                      {feeBreakdown.coinAmount} {symbol} (≈ $
                      {feeBreakdown.usdAmountAfterFee})
                    </AppText>
                  </View>

                  <View style={styles.feeDivider} />

                  <View style={styles.feeRow}>
                    <AppText style={styles.feeLabel}>Total Deducted</AppText>
                    <AppText style={[styles.feeValue]}>
                      {feeBreakdown.totalCoinDeducted} {symbol} (≈ $
                      {feeBreakdown.totalUsdDeducted})
                    </AppText>
                  </View>
                </View>
              )}

              {withdrawalStatus.hasIssue && (
                <View style={styles.warningContainer}>
                  <AppText style={styles.warningText}>
                    {withdrawalStatus.message}
                  </AppText>
                </View>
              )}

              <InfoCard
                IconComponent={<InfoCircle size={15} color={COLORS.primary} />}
                title="Important Notice!"
                description={[
                  "Double-check the wallet address before confirming.",
                  "Cryptocurrency transactions are irreversible.",
                  "Sending to the wrong address will result in permanent loss of funds.",
                ]}
              />
            </View>

            <TouchableOpacity
              hitSlop={9}
              activeOpacity={0.89}
              disabled={withdrawalStatus.hasIssue || isPending}
              style={[
                styles.button,
                {
                  backgroundColor:
                    withdrawalStatus.hasIssue || isPending
                      ? COLORS.fadePrimary
                      : COLORS.secondary,
                },
              ]}
              onPress={handleSubmit(onSubmit)}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" size={10} />
              ) : (
                <AppText style={styles.buttonText}>Continue</AppText>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CustomLoading loading={isFetching} />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: normalize(20),
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
      paddingVertical: 20,
      backgroundColor: colors.background,
    },
    linkContainer: {
      marginBottom: 20,
      padding: 12,
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      fontSize: normalize(18),
      color: colors.text,
      fontFamily: getFontFamily("700"),
    },
    bold: {
      fontFamily: getFontFamily("900"),
    },
    link: {
      color: colors.primaryLight,
      fontFamily: getFontFamily("700"),
      alignContent: "center",
      justifyContent: "center",
    },
    label: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      marginBottom: 3,
      color: colors.text,
    },
    error: {
      color: colors.error,
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      marginBottom: 10,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: normalize(16),
      marginBottom: 10,
      gap: 5,
    },
    feeBreakdownContainer: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 16,
      gap: 10,
    },
    feeBreakdownTitle: {
      color: colors.text,
      fontFamily: getFontFamily("800"),
      fontSize: 13,
      marginBottom: 4,
    },
    feeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    feeLabel: {
      color: colors.text,
      fontFamily: getFontFamily("700"),
      fontSize: 12,
      flex: 1,
    },
    feeValue: {
      color: colors.text,
      fontFamily: getFontFamily("900"),
      fontSize: 12,
      textAlign: "right",
      flex: 1,
    },
    feeDivider: {
      height: 1,
      backgroundColor: colors.border,
    },
    feeWarning: {
      backgroundColor: "#3a1a1a",
      borderRadius: 8,
      padding: 10,
      marginTop: 4,
    },
    feeWarningText: {
      color: colors.error,
      fontFamily: getFontFamily("400"),
      fontSize: 18,
    },
    dollarSign: {
      fontSize: normalize(24),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      marginRight: normalize(5),
    },
    input: {
      flex: 1,
      paddingVertical: normalize(12),
      fontSize: normalize(22),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    approx: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      marginBottom: normalize(6),
      color: COLORS.primary,
    },
    walletBalance: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      marginBottom: 4,
      paddingBottom: 1,
    },
    walletAddressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    scanButton: {
      padding: 9,
      borderRadius: 10,
      backgroundColor: COLORS.primary,
      marginTop: 10,
      justifyContent: "center",
      alignItems: "center",
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
      color: colors.error,
      fontSize: normalize(17),
      fontFamily: getFontFamily("800"),
      textAlign: "center",
    },
    button: {
      paddingVertical: normalize(14),
      borderRadius: 100,
      alignItems: "center",
      marginTop: 30,
    },
    buttonText: {
      color: "#fff",
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
    },
    closeScannerButton: {
      position: "absolute",
      top: 50,
      right: 20,
      backgroundColor: COLORS.primary,
      paddingHorizontal: 20,
      paddingVertical: 7,
      borderRadius: 20,
    },
    closeScannerText: {
      color: "#fff",
      fontSize: normalize(20),
      fontFamily: getFontFamily("700"),
    },
  });
