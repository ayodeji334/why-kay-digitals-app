// // import React, { useMemo, useState } from "react";
// // import { ArrowRight2, CloseCircle } from "iconsax-react-nativejs";
// // import {
// //   View,
// //   StyleSheet,
// //   ScrollView,
// //   StatusBar,
// //   TouchableOpacity,
// //   Image,
// //   Share,
// // } from "react-native";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import { getFontFamily, normalize } from "../constants/settings";
// // import {
// //   CommonActions,
// //   useNavigation,
// //   useRoute,
// // } from "@react-navigation/native";
// // import { formatDate } from "../libs/formatDate";
// // import { formatAmount } from "../libs/formatNumber";
// // import { COLORS } from "../constants/colors";
// // import CustomIcon from "../components/CustomIcon";
// // import { CheckCircleIcon, CopyIcon, ShareIcon } from "../assets";
// // import Clipboard from "@react-native-clipboard/clipboard";
// // import useAxios from "../hooks/useAxios";
// // import { showError } from "../utlis/toast";
// // import { AppText } from "../components/AppText";

// // export const DetailRow: React.FC<{
// //   label: string;
// //   value?: string | number;
// //   color?: string;
// //   copyable?: boolean;
// // }> = ({ label, value, color = "#000", copyable = false }) => {
// //   const [copied, setCopied] = useState(false);

// //   const handleCopy = () => {
// //     if (value) {
// //       Clipboard.setString(String(value));
// //       setCopied(true);
// //       setTimeout(() => setCopied(false), 1500);
// //     }
// //   };

// //   return (
// //     <View style={styles.row}>
// //       <AppText style={styles.label}>{label}</AppText>

// //       <View style={styles.valueContainer}>
// //         <AppText
// //           style={[styles.value, { color }]}
// //           numberOfLines={1}
// //           ellipsizeMode="tail"
// //         >
// //           {value ?? "-"}
// //         </AppText>

// //         {copyable && value ? (
// //           <TouchableOpacity
// //             hitSlop={10}
// //             activeOpacity={0.8}
// //             onPress={handleCopy}
// //             style={styles.copyButton}
// //           >
// //             {copied ? (
// //               <CustomIcon source={CheckCircleIcon} size={15} color="green" />
// //             ) : (
// //               <CustomIcon source={CopyIcon} size={15} color="#0a580dff" />
// //             )}
// //           </TouchableOpacity>
// //         ) : null}
// //       </View>
// //     </View>
// //   );
// // };

// // interface Voucher {
// //   unit: number;
// //   zendit_tx_id: string;
// //   epin?: string;
// //   voucher_id?: string;
// //   expires_at?: string;
// //   redemption_url?: string;
// //   instructions?: string;
// //   terms?: string;
// //   send?: number;
// //   send_currency?: string;
// //   status?: string;
// //   confirmation?: {
// //     confirmationNumber: string;
// //     externalReferenceId: string;
// //     transactionTime: string;
// //   };
// // }

// // /** Returns true if this transaction is a gift card with at least one voucher. */
// // function isGiftCardWithVouchers(transaction: any): boolean {
// //   return (
// //     transaction?.category === "GIFT_CARD" &&
// //     Array.isArray(transaction?.meta?.vouchers) &&
// //     transaction.meta.vouchers.length > 0
// //   );
// // }

// // const TransactionDetailScreen = () => {
// //   const navigation: any = useNavigation();
// //   const route = useRoute();
// //   const { apiGet } = useAxios();
// //   const { transaction }: any = route.params;
// //   const [isDownloading, setIsDownloading] = useState(false);

// //   console.log(transaction);

// //   const isSuccess = useMemo(
// //     () => transaction?.status?.toLowerCase() === "successful",
// //     [transaction?.status],
// //   );

// //   const isProcessing = useMemo(
// //     () =>
// //       transaction?.status?.toLowerCase() === "processing" ||
// //       transaction?.status?.toLowerCase() === "pending",
// //     [transaction?.status],
// //   );

// //   const hasVouchers = isGiftCardWithVouchers(transaction);
// //   const vouchers: Voucher[] = transaction?.meta?.vouchers ?? [];

// //   const StatusIcon = () =>
// //     isSuccess ? (
// //       <Image
// //         source={require("../assets/success.png")}
// //         style={styles.networkLogo}
// //       />
// //     ) : (
// //       <CloseCircle
// //         size={60}
// //         color={isProcessing ? "#CA8A04" : "#DC2626"}
// //         variant="Bold"
// //       />
// //     );

// //   // const handleGoBack = () => {
// //   //   try {
// //   //     const state = navigation.getState();
// //   //     const routes = state.routes;
// //   //     const previousRoute = routes[routes.length - 2];

// //   //     if (previousRoute) {
// //   //       navigation.replace(
// //   //         previousRoute.name as never,
// //   //         {
// //   //           // Spread existing params so nothing is lost, then add resetForm
// //   //           ...((previousRoute.params as object) ?? {}),
// //   //           resetForm: true,
// //   //         } as never,
// //   //       );
// //   //     } else {
// //   //       // Fallback — no previous route found, just go back
// //   //       navigation.goBack();
// //   //     }
// //   //   } catch (error) {
// //   //     navigation.goBack();
// //   //   }
// //   // };

// //   const handleGoBack = () => {
// //     try {
// //       const state = navigation.getState();
// //       const routes = state.routes;
// //       const previousRoute = routes[routes.length - 2];

// //       if (previousRoute) {
// //         navigation.dispatch({
// //           ...CommonActions.setParams({ resetForm: true }),
// //           source: previousRoute.key,
// //         });

// //         navigation.goBack();
// //       } else {
// //         navigation.goBack();
// //       }
// //     } catch (error) {
// //       navigation.goBack();
// //     }
// //   };

// //   const getDirectionColor = () => {
// //     if (!transaction?.direction) return "#000";
// //     return transaction?.direction.toLowerCase() === "debit" ? "#000" : "#000";
// //   };

// //   const handleShareReceipt = async () => {
// //     if (isDownloading) return;
// //     setIsDownloading(true);

// //     try {
// //       // 1. Fetch the PDF as base64 directly
// //       const response = await apiGet(
// //         `/transactions/${transaction.uuid}/download-receipt`,
// //         { responseType: "blob" },
// //       );

// //       // 2. Convert Blob → base64 via FileReader
// //       const base64: string = await new Promise((resolve, reject) => {
// //         const reader = new FileReader();
// //         reader.onload = () => resolve((reader.result as string).split(",")[1]);
// //         reader.onerror = () => reject(new Error("FileReader failed"));
// //         reader.readAsDataURL(response.data);
// //       });

// //       // 3. Share directly as a base64 data URI — no file system dependency needed
// //       await Share.share({
// //         url: `data:application/pdf;base64,${base64}`, // iOS renders PDFs from data URIs
// //         title: "Transaction Receipt",
// //         message: "Transaction Receipt", // shown on Android
// //       });
// //     } catch (error) {
// //       console.error("Failed to share receipt:", error);
// //       showError("Could not generate the receipt. Please try again.");
// //     } finally {
// //       setIsDownloading(false);
// //     }
// //   };

// //   // const handleShareReceipt = async () => {
// //   //   if (isDownloading) return;
// //   //   setIsDownloading(true);

// //   //   try {
// //   //     const response = await apiGet(
// //   //       `/transactions/${transaction.uuid}/download-receipt`,
// //   //       { responseType: "arraybuffer" },
// //   //     );

// //   //     const bytes = new Uint8Array(response.data as ArrayBuffer);
// //   //     let binary = "";
// //   //     bytes.forEach(b => (binary += String.fromCharCode(b)));
// //   //     const base64 = btoa(binary);

// //   //     const filename = `receipt-${transaction.uuid.replace(/-/g, "")}.pdf`;
// //   //     const filePath = `${Dirs.CacheDir}/${filename}`;

// //   //     await FileSystem.writeFile(filePath, base64, "base64");

// //   //     await Share.share({
// //   //       url: `file://${filePath}`,
// //   //       title: "Transaction Receipt",
// //   //       message: "Transaction Receipt",
// //   //     });
// //   //   } catch (error) {
// //   //     console.error("Failed to share receipt:", error);
// //   //     showError("Could not generate the receipt. Please try again.");
// //   //   } finally {
// //   //     setIsDownloading(false);
// //   //   }
// //   // };

// //   // const handleShareReceipt = async () => {
// //   //   if (isDownloading) return;
// //   //   setIsDownloading(true);

// //   //   try {
// //   //     // 1. Fetch the PDF as an arraybuffer from the backend
// //   //     const response = await apiGet(
// //   //       `/transactions/${transaction.uuid}/receipt`,
// //   //       { responseType: "arraybuffer" },
// //   //     );

// //   //     // 2. Convert ArrayBuffer → base64 string
// //   //     const bytes = new Uint8Array(response.data as ArrayBuffer);
// //   //     let binary = "";
// //   //     bytes.forEach(b => (binary += String.fromCharCode(b)));
// //   //     const base64 = btoa(binary);

// //   //     // 3. Write the base64 PDF to the device's cache directory
// //   //     const filename = `receipt-${transaction.uuid.replace(/-/g, "")}.pdf`;
// //   //     const filePath = `${Dirs.CacheDir}/${filename}`;

// //   //     await FileSystem.writeFile(filePath, base64, "base64");

// //   //     // 4. Open the native share sheet with the local file URI
// //   //     await Share.open({
// //   //       url: `file://${filePath}`,
// //   //       type: "application/pdf",
// //   //       title: "Transaction Receipt",
// //   //       filename,
// //   //       failOnCancel: false, // prevents throwing when user dismisses share sheet
// //   //     });
// //   //   } catch (error) {
// //   //     console.error("Failed to share receipt:", error);
// //   //     Alert.alert("Error", "Could not generate the receipt. Please try again.");
// //   //   } finally {
// //   //     setIsDownloading(false);
// //   //   }
// //   // };

// //   return (
// //     <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
// //       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
// //       <ScrollView
// //         showsVerticalScrollIndicator={false}
// //         contentContainerStyle={styles.content}
// //       >
// //         <View style={styles.iconContainer}>
// //           <StatusIcon />
// //         </View>

// //         <View style={{ marginBottom: 20, gap: 0 }}>
// //           <AppText style={styles.amount}>
// //             {transaction?.medium?.toUpperCase() === "CRYPTO"
// //               ? ["failed", "pending"].includes(
// //                   transaction.status?.toLowerCase(),
// //                 )
// //                 ? formatAmount(transaction?.meta?.amount_in_usd ?? 0, {
// //                     currency: transaction?.currency || "USD",
// //                     decimalPlace: 2,
// //                   })
// //                 : `${transaction?.meta?.amount || 0} ${
// //                     transaction?.meta?.asset_symbol ?? ""
// //                   }`
// //               : formatAmount(transaction?.amount ?? 0, {
// //                   currency: transaction?.currency || "NGN",
// //                   decimalPlace: 2,
// //                 })}
// //           </AppText>
// //           <AppText
// //             style={{
// //               fontSize: normalize(18),
// //               fontFamily: getFontFamily("400"),
// //               textAlign: "center",
// //             }}
// //           >
// //             {isSuccess
// //               ? transaction?.category === "GIFT_CARD"
// //                 ? `Your ${
// //                     transaction?.meta?.offer_snapshot?.brand_name ?? "gift card"
// //                   } purchase was successful`
// //                 : transaction?.category === "CRYPTO_DEPOSIT"
// //                 ? `Your ${transaction?.meta?.asset_symbol} deposit was successful`
// //                 : transaction?.category === "CRYPTO_WITHDRAW"
// //                 ? `Your ${transaction?.meta?.asset_symbol} withdrawal was successful`
// //                 : transaction?.category === "CABLETV"
// //                 ? "Your TV bill payment was successful"
// //                 : transaction?.category === "MOBILEDATA"
// //                 ? "Your data purchase was successful"
// //                 : transaction?.category === "AIRTIME"
// //                 ? "Your airtime purchase was successful"
// //                 : transaction?.category === "REFERRAL_BONUS"
// //                 ? "You've received a referral bonus"
// //                 : transaction?.category === "BANK_TRANSFER"
// //                 ? "Your deposit was successful"
// //                 : transaction?.category === "WITHDRAWAL"
// //                 ? "Your withdrawal was successful"
// //                 : "Transaction completed successfully"
// //               : isProcessing
// //               ? "Your transaction is being processed"
// //               : "Transaction failed"}
// //           </AppText>
// //           {/* <AppText
// //             style={{
// //               fontSize: normalize(18),
// //               fontFamily: getFontFamily("400"),
// //               textAlign: "center",
// //             }}
// //           >
// //             {isSuccess
// //               ? transaction?.category === "CRYPTO_DEPOSIT"
// //                 ? `Your ${transaction?.meta?.asset_symbol} deposit was successful`
// //                 : transaction?.category === "CRYPTO_WITHDRAW"
// //                 ? `Your ${transaction?.meta?.asset_symbol} withdrawal was successful`
// //                 : transaction?.category === "CABLETV"
// //                 ? "Your TV bill payment was successful"
// //                 : transaction?.category === "MOBILEDATA"
// //                 ? "Your data purchase was successful"
// //                 : transaction?.category === "AIRTIME"
// //                 ? "Your airtime purchase was successful"
// //                 : transaction?.category === "REFERRAL_BONUS"
// //                 ? "You’ve received a referral bonus"
// //                 : transaction?.category === "BANK_TRANSFER"
// //                 ? "Your deposit was successful"
// //                 : transaction?.category === "WITHDRAWAL"
// //                 ? "Your withdrawal was successful"
// //                 : "Transaction completed successfully"
// //               : isProcessing
// //               ? "Transaction is pending the confirmation"
// //               : "Transaction failed"}
// //           </AppText> */}
// //         </View>

// //         {hasVouchers && (
// //           <TouchableOpacity
// //             style={styles.viewVouchersButton}
// //             activeOpacity={0.8}
// //             onPress={() =>
// //               navigation.navigate(
// //                 "GiftCardVouchers" as never,
// //                 {
// //                   vouchers,
// //                   brandName:
// //                     transaction?.meta?.offer_snapshot?.brand_name ??
// //                     "Gift Card",
// //                   totalAmountNgn: transaction?.amount,
// //                   txReference: transaction?.tx_reference,
// //                   quantity: transaction?.meta?.quantity ?? vouchers.length,
// //                 } as never,
// //               )
// //             }
// //           >
// //             <View style={styles.viewVouchersLeft}>
// //               <AppText style={styles.viewVouchersTitle}>
// //                 {vouchers.length > 1 && !isSuccess
// //                   ? `Some gift cards are ready`
// //                   : vouchers.length > 1 && isSuccess
// //                   ? `Your gift cards are ready`
// //                   : "Your gift card is ready"}
// //               </AppText>
// //               <AppText style={styles.viewVouchersHint}>
// //                 Tap to see the detail about your gift cards
// //               </AppText>
// //             </View>
// //             <ArrowRight2 size={17} color={styles.viewVouchersChevron.color} />
// //           </TouchableOpacity>
// //         )}

// //         {transaction?.meta?.data?.recharge_token && (
// //           <View
// //             style={{
// //               backgroundColor: "#F9FAFB",
// //               paddingHorizontal: 10,
// //               marginBottom: 20,
// //             }}
// //           >
// //             <DetailRow
// //               label="Token"
// //               value={
// //                 transaction?.meta?.data?.recharge_token
// //                   .match(/.{1,4}/g)
// //                   ?.join("-") || ""
// //               }
// //               copyable
// //             />
// //           </View>
// //         )}

// //         <View style={styles.detailsContainer}>
// //           <DetailRow
// //             label="Transaction ID"
// //             value={transaction?.uuid?.split("-")?.join("")}
// //             copyable
// //           />
// //           {transaction?.category === "CRYPTO_DEPOSIT" && (
// //             <DetailRow
// //               label="Blockchain Trx ID"
// //               value={transaction?.meta?.tx_reference}
// //               copyable
// //             />
// //           )}
// //           <DetailRow
// //             label="Amount"
// //             value={
// //               transaction?.medium?.toUpperCase() === "CRYPTO"
// //                 ? formatAmount(transaction?.meta?.amount_in_usd || 0, {
// //                     currency: "USD",
// //                     decimalPlace: 2,
// //                   })
// //                 : formatAmount(transaction?.amount || 0, {
// //                     currency: "NGN",
// //                     decimalPlace: 2,
// //                   })
// //             }
// //             color={getDirectionColor()}
// //           />
// //           {transaction?.category === "CRYPTO_SELL" ? null : (
// //             <DetailRow
// //               label="Fee"
// //               value={formatAmount(transaction?.fee, {
// //                 currency:
// //                   transaction?.medium?.toUpperCase() === "CRYPTO"
// //                     ? "USD"
// //                     : "NGN",
// //                 decimalPlace:
// //                   transaction?.medium?.toUpperCase() === "CRYPTO" ? 4 : 2,
// //               })}
// //             />
// //           )}
// //           <DetailRow
// //             label="Net Amount"
// //             value={formatAmount(transaction?.net_amount, {
// //               currency:
// //                 transaction?.medium?.toUpperCase() === "CRYPTO" ? "USD" : "NGN",
// //               decimalPlace: 2,
// //             })}
// //           />
// //           {transaction?.meta?.exchange_rate && (
// //             <DetailRow
// //               label="Exchange Rate"
// //               value={
// //                 formatAmount(transaction?.meta?.exchange_rate, {
// //                   currency: "NGN",
// //                   decimalPlace: 2,
// //                 }) + "/$"
// //               }
// //             />
// //           )}
// //           <DetailRow
// //             label="Category"
// //             value={transaction?.direction?.toUpperCase()}
// //             color={getDirectionColor()}
// //           />
// //           <DetailRow
// //             label="Wallet"
// //             value={transaction?.medium?.toUpperCase()}
// //           />
// //           <DetailRow
// //             label="Status"
// //             value={isSuccess ? "Successful" : transaction?.status}
// //             color={isSuccess ? "#059669" : isProcessing ? "#CA8A04" : "#DC2626"}
// //           />
// //           {transaction?.category === "WITHDRAWAL" && (
// //             <>
// //               <DetailRow
// //                 label="Recipient Account Number"
// //                 value={transaction?.meta?.destinationAccountNumber}
// //               />
// //               <DetailRow
// //                 label="Recipient Bank Name"
// //                 value={transaction?.meta?.destinationBankName}
// //               />
// //               <DetailRow
// //                 label="Recipient Account Holder"
// //                 value={
// //                   transaction?.meta?.nomba_response?.data?.meta?.recipientName
// //                 }
// //               />
// //             </>
// //           )}

// //           {transaction?.status.toUpperCase() !== "FAILED" && (
// //             <DetailRow label="Description" value={transaction?.description} />
// //           )}
// //           {/* <DetailRow
// //             label="Reference"
// //             value={transaction?.reference.split("-").join("")}
// //             copyable
// //           /> */}
// //           <DetailRow
// //             label="Occurred At"
// //             value={
// //               transaction?.occurred_at && formatDate(transaction?.occurred_at)
// //             }
// //           />
// //         </View>

// //         <View style={styles.header}>
// //           <TouchableOpacity
// //             hitSlop={10}
// //             activeOpacity={0.8}
// //             onPress={handleShareReceipt}
// //             style={styles.headerButton}
// //           >
// //             <CustomIcon source={ShareIcon} size={18} color={COLORS.primary} />
// //             <AppText style={styles.headerTitle}>Share Receipt</AppText>
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             hitSlop={10}
// //             activeOpacity={0.8}
// //             onPress={handleGoBack}
// //             style={styles.goBackButton}
// //           >
// //             <AppText style={[styles.headerTitle, { color: "white" }]}>
// //               Done
// //             </AppText>
// //           </TouchableOpacity>
// //         </View>
// //       </ScrollView>
// //     </SafeAreaView>
// //     // <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
// //     //   <StatusBar style="dark" backgroundColor="#fff" />
// //     //   <ScrollView contentContainerStyle={styles.content}>
// //     //     {/* Status icon */}
// //     //     <View style={styles.iconContainer}>{/* <StatusIcon /> */}</View>

// //     //     {/* Amount + status message */}
// //     //     <View style={{ marginBottom: 20, gap: 0 }}>
// //     //       <AppText style={styles.amount}>
// //     //         {transaction?.medium?.toUpperCase() === "CRYPTO"
// //     //           ? ["failed", "pending"].includes(
// //     //               transaction.status?.toLowerCase(),
// //     //             )
// //     //             ? formatAmount(transaction?.meta?.amount_in_usd ?? 0, {
// //     //                 currency: transaction?.currency || "USD",
// //     //                 decimalPlace: 2,
// //     //               })
// //     //             : `${transaction?.meta?.amount || 0} ${
// //     //                 transaction?.meta?.asset_symbol ?? ""
// //     //               }`
// //     //           : formatAmount(transaction?.amount ?? 0, {
// //     //               currency: transaction?.currency || "NGN",
// //     //               decimalPlace: 2,
// //     //             })}
// //     //       </AppText>
// //     //       <AppText
// //     //         style={{
// //     //           fontSize: normalize(18),
// //     //           fontFamily: getFontFamily("400"),
// //     //           textAlign: "center",
// //     //         }}
// //     //       >
// //     //         {isSuccess
// //     //           ? transaction?.category === "GIFT_CARD"
// //     //             ? `Your ${
// //     //                 transaction?.meta?.offer_snapshot?.brand_name ?? "gift card"
// //     //               } purchase was successful`
// //     //             : transaction?.category === "CRYPTO_DEPOSIT"
// //     //             ? `Your ${transaction?.meta?.asset_symbol} deposit was successful`
// //     //             : transaction?.category === "CRYPTO_WITHDRAW"
// //     //             ? `Your ${transaction?.meta?.asset_symbol} withdrawal was successful`
// //     //             : transaction?.category === "CABLETV"
// //     //             ? "Your TV bill payment was successful"
// //     //             : transaction?.category === "MOBILEDATA"
// //     //             ? "Your data purchase was successful"
// //     //             : transaction?.category === "AIRTIME"
// //     //             ? "Your airtime purchase was successful"
// //     //             : transaction?.category === "REFERRAL_BONUS"
// //     //             ? "You've received a referral bonus"
// //     //             : transaction?.category === "BANK_TRANSFER"
// //     //             ? "Your deposit was successful"
// //     //             : transaction?.category === "WITHDRAWAL"
// //     //             ? "Your withdrawal was successful"
// //     //             : "Transaction completed successfully"
// //     //           : isProcessing
// //     //           ? "Your order is being processed"
// //     //           : "Transaction failed"}
// //     //       </AppText>
// //     //     </View>

// //     //     {/* ── Electricity token (existing) ── */}
// //     //     {transaction?.meta?.data?.recharge_token && (
// //     //       <View
// //     //         style={{
// //     //           backgroundColor: "#F9FAFB",
// //     //           paddingHorizontal: 10,
// //     //           marginBottom: 20,
// //     //         }}
// //     //       >
// //     //         <DetailRow
// //     //           label="Token"
// //     //           value={
// //     //             transaction.meta.data.recharge_token
// //     //               .match(/.{1,4}/g)
// //     //               ?.join("-") || ""
// //     //           }
// //     //           copyable
// //     //         />
// //     //       </View>
// //     //     )}

// //     //     {/* ── Gift card vouchers ── */}
// //     //     {hasVouchers && (
// //     //       <View style={styles.vouchersSection}>
// //     //         <AppText style={styles.vouchersSectionTitle}>
// //     //           {vouchers.length > 1
// //     //             ? `${vouchers.length} Gift Cards`
// //     //             : "Gift Card"}
// //     //         </AppText>
// //     //         <AppText style={styles.vouchersSectionHint}>
// //     //           {vouchers.length > 1
// //     //             ? "Each card below has a unique code or redemption link."
// //     //             : "Use the code or link below to redeem your gift card."}
// //     //         </AppText>
// //     //         {vouchers.map((voucher, index) => (
// //     //           <VoucherCard
// //     //             key={voucher.zendit_tx_id ?? index}
// //     //             voucher={voucher}
// //     //             index={index}
// //     //             total={vouchers.length}
// //     //           />
// //     //         ))}
// //     //       </View>
// //     //     )}

// //     //     {/* ── Transaction details ── */}
// //     //     <View style={styles.detailsContainer}>
// //     //       <DetailRow
// //     //         label="Transaction ID"
// //     //         value={transaction?.uuid?.split("-")?.join("")}
// //     //         copyable
// //     //       />
// //     //       {transaction?.category === "CRYPTO_DEPOSIT" && (
// //     //         <DetailRow
// //     //           label="Blockchain Trx ID"
// //     //           value={transaction?.meta?.tx_reference}
// //     //           copyable
// //     //         />
// //     //       )}

// //     //       {/* Gift card specifics */}
// //     //       {transaction?.category === "GIFT_CARD" && (
// //     //         <>
// //     //           <DetailRow
// //     //             label="Gift Card"
// //     //             value={transaction?.meta?.offer_snapshot?.brand_name}
// //     //           />
// //     //           <DetailRow
// //     //             label="Quantity"
// //     //             value={String(transaction?.meta?.quantity ?? 1)}
// //     //           />
// //     //           <DetailRow
// //     //             label="Face Value"
// //     //             value={formatAmount(
// //     //               (transaction?.meta?.offer_snapshot?.send?.fixed ?? 0) /
// //     //                 (transaction?.meta?.offer_snapshot?.send?.currencyDivisor ??
// //     //                   100),
// //     //               {
// //     //                 currency:
// //     //                   transaction?.meta?.offer_snapshot?.send?.currency ??
// //     //                   "USD",
// //     //                 decimalPlace: 2,
// //     //               },
// //     //             )}
// //     //           />
// //     //           <DetailRow
// //     //             label="Exchange Rate"
// //     //             value={
// //     //               formatAmount(transaction?.meta?.exchange_rate ?? 0, {
// //     //                 currency: "NGN",
// //     //                 decimalPlace: 2,
// //     //               }) + "/$"
// //     //             }
// //     //           />
// //     //         </>
// //     //       )}

// //     //       <DetailRow
// //     //         label="Amount"
// //     //         value={
// //     //           transaction?.medium?.toUpperCase() === "CRYPTO"
// //     //             ? formatAmount(transaction?.meta?.amount_in_usd || 0, {
// //     //                 currency: "USD",
// //     //                 decimalPlace: 2,
// //     //               })
// //     //             : formatAmount(transaction?.amount || 0, {
// //     //                 currency: "NGN",
// //     //                 decimalPlace: 2,
// //     //               })
// //     //         }
// //     //         color={getDirectionColor()}
// //     //       />
// //     //       {transaction?.category !== "CRYPTO_SELL" && (
// //     //         <DetailRow
// //     //           label="Fee"
// //     //           value={formatAmount(transaction?.fee, {
// //     //             currency:
// //     //               transaction?.medium?.toUpperCase() === "CRYPTO"
// //     //                 ? "USD"
// //     //                 : "NGN",
// //     //             decimalPlace:
// //     //               transaction?.medium?.toUpperCase() === "CRYPTO" ? 4 : 2,
// //     //           })}
// //     //         />
// //     //       )}
// //     //       <DetailRow
// //     //         label="Net Amount"
// //     //         value={formatAmount(transaction?.net_amount, {
// //     //           currency:
// //     //             transaction?.medium?.toUpperCase() === "CRYPTO" ? "USD" : "NGN",
// //     //           decimalPlace: 2,
// //     //         })}
// //     //       />
// //     //       <DetailRow
// //     //         label="Status"
// //     //         value={isSuccess ? "Successful" : transaction?.status}
// //     //         color={isSuccess ? "#059669" : isProcessing ? "#CA8A04" : "#DC2626"}
// //     //       />
// //     //       {transaction?.status?.toUpperCase() !== "FAILED" && (
// //     //         <DetailRow label="Description" value={transaction?.description} />
// //     //       )}
// //     //       <DetailRow
// //     //         label="Occurred At"
// //     //         value={
// //     //           transaction?.occurred_at && formatDate(transaction?.occurred_at)
// //     //         }
// //     //       />
// //     //     </View>

// //     //     {/* Actions */}
// //     //     <View style={styles.header}>
// //     //       <TouchableOpacity
// //     //         hitSlop={10}
// //     //         activeOpacity={0.7}
// //     //         onPress={handleShareReceipt}
// //     //         style={styles.headerButton}
// //     //       >
// //     //         <CustomIcon source={ShareIcon} size={18} color={COLORS.primary} />
// //     //         <AppText style={styles.headerTitle}>Share Receipt</AppText>
// //     //       </TouchableOpacity>
// //     //       <TouchableOpacity
// //     //         hitSlop={10}
// //     //         activeOpacity={0.7}
// //     //         onPress={handleGoBack}
// //     //         style={styles.goBackButton}
// //     //       >
// //     //         <AppText style={[styles.headerTitle, { color: "white" }]}>
// //     //           Done
// //     //         </AppText>
// //     //       </TouchableOpacity>
// //     //     </View>
// //     //   </ScrollView>
// //     // </SafeAreaView>
// //   );
// // };

// // // function getDeliveryType(voucher: Voucher): "code" | "url" | "unknown" {
// // //   if (voucher.epin && voucher.epin.trim() !== "") return "code";
// // //   if (voucher.redemption_url && voucher.redemption_url.trim() !== "")
// // //     return "url";
// // //   return "unknown";
// // // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: "#fff" },
// //   content: { padding: 20 },
// //   iconContainer: {
// //     alignItems: "center",
// //     justifyContent: "center",
// //     marginBottom: 12,
// //     width: 50,
// //     height: 50,
// //     margin: "auto",
// //   },
// //   // Vouchers section
// //   vouchersSection: {
// //     marginBottom: 24,
// //   },
// //   vouchersSectionTitle: {
// //     fontSize: normalize(18),
// //     fontFamily: getFontFamily("800"),
// //     color: "#000000",
// //     marginBottom: 4,
// //   },
// //   vouchersSectionHint: {
// //     fontSize: normalize(17),
// //     fontFamily: getFontFamily("700"),
// //     color: "#5d6066",
// //     marginBottom: 14,
// //     lineHeight: normalize(20),
// //   },
// //   header: {
// //     justifyContent: "space-between",
// //     paddingHorizontal: 10,
// //     paddingVertical: 15,
// //     gap: 10,
// //   },
// //   networkLogo: {
// //     width: 70,
// //     height: 70,
// //     resizeMode: "contain",
// //   },
// //   headerButton: {
// //     borderColor: COLORS.secondary,
// //     borderWidth: 1,
// //     padding: 14,
// //     flex: 1,
// //     gap: 6,
// //     flexDirection: "row",
// //     justifyContent: "center",
// //     alignItems: "center",
// //     borderRadius: 40,
// //   },
// //   goBackButton: {
// //     backgroundColor: COLORS.secondary,
// //     padding: 14,
// //     flex: 1,
// //     gap: 6,
// //     flexDirection: "row",
// //     justifyContent: "center",
// //     alignItems: "center",
// //     borderRadius: 40,
// //   },
// //   viewVouchersButton: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     backgroundColor: `${COLORS.primary}10`,
// //     borderWidth: 1,
// //     borderColor: `${COLORS.primary}30`,
// //     borderRadius: 12,
// //     padding: 14,
// //     marginBottom: 20,
// //   },
// //   viewVouchersLeft: {
// //     flex: 1,
// //     gap: 3,
// //   },
// //   viewVouchersTitle: {
// //     fontSize: normalize(18),
// //     fontFamily: getFontFamily("800"),
// //     color: COLORS.primary,
// //   },
// //   viewVouchersHint: {
// //     fontSize: normalize(16),
// //     fontFamily: getFontFamily("700"),
// //     color: "#41454d",
// //   },
// //   viewVouchersChevron: {
// //     fontSize: normalize(26),
// //     fontFamily: getFontFamily("400"),
// //     color: COLORS.primary,
// //     lineHeight: normalize(28),
// //   },
// //   headerTitle: {
// //     fontSize: normalize(18),
// //     fontFamily: getFontFamily("700"),
// //     color: COLORS.primary,
// //   },
// //   amount: {
// //     textAlign: "center",
// //     marginTop: 4,
// //     fontSize: normalize(23),
// //     fontFamily: getFontFamily("800"),
// //     color: "#000",
// //   },
// //   detailsContainer: {
// //     backgroundColor: "#F9FAFB",
// //     borderRadius: 12,
// //     padding: 16,
// //   },
// //   row: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     paddingVertical: 10,
// //     columnGap: 9,
// //   },
// //   label: {
// //     flex: 1,
// //     fontSize: normalize(18),
// //     fontFamily: getFontFamily("400"),
// //   },
// //   valueContainer: {
// //     flex: 1,
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "flex-end",
// //   },
// //   value: {
// //     flexShrink: 1,
// //     minWidth: 0,
// //     fontSize: normalize(18),
// //     fontFamily: getFontFamily("800"),
// //     textAlign: "right",
// //   },
// //   copyButton: {
// //     marginLeft: 6,
// //     padding: 8,
// //     flexShrink: 0,
// //     borderRadius: 10,
// //     backgroundColor: "#eeeeee",
// //   },
// //   setupLabel: {
// //     fontSize: normalize(18),
// //     fontFamily: getFontFamily("800"),
// //     color: "#000",
// //     marginBottom: 2,
// //   },
// //   setupValue: {
// //     fontSize: normalize(18),
// //     fontFamily: getFontFamily("700"),
// //     color: "#444",
// //     flex: 1,
// //   },
// // });

// // export default TransactionDetailScreen;
// import React, { useMemo, useRef, useState } from "react";
// import { ArrowRight2, CloseCircle } from "iconsax-react-nativejs";
// import {
//   View,
//   StyleSheet,
//   ScrollView,
//   StatusBar,
//   TouchableOpacity,
//   Image,
//   Modal,
//   LayoutChangeEvent,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { getFontFamily, normalize } from "../constants/settings";
// import {
//   CommonActions,
//   useNavigation,
//   useRoute,
// } from "@react-navigation/native";
// import { formatDate } from "../libs/formatDate";
// import { formatAmount } from "../libs/formatNumber";
// import { COLORS } from "../constants/colors";
// import CustomIcon from "../components/CustomIcon";
// import { CheckCircleIcon, CopyIcon, ShareIcon } from "../assets";
// import Clipboard from "@react-native-clipboard/clipboard";
// import useAxios from "../hooks/useAxios";
// import { showError } from "../utlis/toast";
// import { AppText } from "../components/AppText";
// import { captureRef } from "react-native-view-shot";
// import ShareLib from "react-native-share";
// import { CardPatternBackground } from "./WalletAddress";
// import { useAuthStore } from "../stores/authSlice";
// import { generatePDF } from "react-native-html-to-pdf";

// const APP_NAME = "WHYKAY APP";
// const RECEIPT_CARD_WIDTH = 340;

// export const DetailRow: React.FC<{
//   label: string;
//   value?: string | number;
//   color?: string;
//   copyable?: boolean;
// }> = ({ label, value, color = "#000", copyable = false }) => {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = () => {
//     if (value) {
//       Clipboard.setString(String(value));
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1500);
//     }
//   };

//   return (
//     <View style={styles.row}>
//       <AppText style={styles.label}>{label}</AppText>

//       <View style={styles.valueContainer}>
//         <AppText
//           style={[styles.value, { color }]}
//           numberOfLines={1}
//           ellipsizeMode="tail"
//         >
//           {value ?? "-"}
//         </AppText>

//         {copyable && value ? (
//           <TouchableOpacity
//             hitSlop={10}
//             activeOpacity={0.8}
//             onPress={handleCopy}
//             style={styles.copyButton}
//           >
//             {copied ? (
//               <CustomIcon source={CheckCircleIcon} size={15} color="green" />
//             ) : (
//               <CustomIcon source={CopyIcon} size={15} color="#0a580dff" />
//             )}
//           </TouchableOpacity>
//         ) : null}
//       </View>
//     </View>
//   );
// };

// interface Voucher {
//   unit: number;
//   zendit_tx_id: string;
//   epin?: string;
//   voucher_id?: string;
//   expires_at?: string;
//   redemption_url?: string;
//   instructions?: string;
//   terms?: string;
//   send?: number;
//   send_currency?: string;
//   status?: string;
//   confirmation?: {
//     confirmationNumber: string;
//     externalReferenceId: string;
//     transactionTime: string;
//   };
// }

// interface ReceiptRow {
//   label: string;
//   value?: string | number;
//   color?: string;
// }

// /** Returns true if this transaction is a gift card with at least one voucher. */
// function isGiftCardWithVouchers(transaction: any): boolean {
//   return (
//     transaction?.category === "GIFT_CARD" &&
//     Array.isArray(transaction?.meta?.vouchers) &&
//     transaction.meta.vouchers.length > 0
//   );
// }

// const TransactionDetailScreen = () => {
//   const navigation: any = useNavigation();
//   const route = useRoute();
//   // const { apiGet } = useAxios();
//   const { transaction }: any = route.params;
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [formatModalVisible, setFormatModalVisible] = useState(false);
//   const receiptCardRef = useRef<View>(null);
//   const user = useAuthStore(state => state.user);

//   console.log(transaction);

//   const isSuccess = useMemo(
//     () => transaction?.status?.toLowerCase() === "successful",
//     [transaction?.status],
//   );

//   const isProcessing = useMemo(
//     () =>
//       transaction?.status?.toLowerCase() === "processing" ||
//       transaction?.status?.toLowerCase() === "pending",
//     [transaction?.status],
//   );

//   const [receiptSize, setReceiptSize] = useState<{
//     width: number;
//     height: number;
//   } | null>(null);

//   // attach to the receipt card's onLayout so we know its rendered pixel size
//   const handleReceiptLayout = (e: LayoutChangeEvent) => {
//     const { width, height } = e.nativeEvent.layout;
//     setReceiptSize({ width, height });
//   };

//   const hasVouchers = isGiftCardWithVouchers(transaction);
//   const vouchers: Voucher[] = transaction?.meta?.vouchers ?? [];

//   const StatusIcon = ({ size = 60 }: { size?: number }) =>
//     isSuccess ? (
//       <Image
//         source={require("../assets/success.webp")}
//         style={{ width: size + 10, height: size + 10, resizeMode: "contain" }}
//       />
//     ) : (
//       <CloseCircle
//         size={size}
//         color={isProcessing ? "#CA8A04" : "#DC2626"}
//         variant="Bold"
//       />
//     );

//   const handleGoBack = () => {
//     try {
//       const state = navigation.getState();
//       const routes = state.routes;
//       const previousRoute = routes[routes.length - 2];

//       if (previousRoute) {
//         navigation.dispatch({
//           ...CommonActions.setParams({ resetForm: true }),
//           source: previousRoute.key,
//         });

//         navigation.goBack();
//       } else {
//         navigation.goBack();
//       }
//     } catch (error) {
//       navigation.goBack();
//     }
//   };

//   const getDirectionColor = () => {
//     if (!transaction?.direction) return "#000";
//     return transaction?.direction.toLowerCase() === "debit" ? "#000" : "#000";
//   };

//   const displayAmount = useMemo(() => {
//     return transaction?.medium?.toUpperCase() === "CRYPTO"
//       ? ["failed", "pending"].includes(transaction.status?.toLowerCase())
//         ? formatAmount(transaction?.meta?.amount_in_usd ?? 0, {
//             currency: transaction?.currency || "USD",
//             decimalPlace: 2,
//           })
//         : `${transaction?.meta?.amount || 0} ${
//             transaction?.meta?.asset_symbol ?? ""
//           }`
//       : formatAmount(transaction?.amount ?? 0, {
//           currency: transaction?.currency || "NGN",
//           decimalPlace: 2,
//         });
//   }, [transaction]);

//   const statusMessage = useMemo(() => {
//     return isSuccess
//       ? transaction?.category === "GIFT_CARD"
//         ? `Your ${
//             transaction?.meta?.offer_snapshot?.brand_name ?? "gift card"
//           } purchase was successful`
//         : transaction?.category === "CRYPTO_DEPOSIT"
//         ? `Your ${transaction?.meta?.asset_symbol} deposit was successful`
//         : transaction?.category === "CRYPTO_WITHDRAW"
//         ? `Your ${transaction?.meta?.asset_symbol} withdrawal was successful`
//         : transaction?.category === "CABLETV"
//         ? "Your TV bill payment was successful"
//         : transaction?.category === "MOBILEDATA"
//         ? "Your data purchase was successful"
//         : transaction?.category === "AIRTIME"
//         ? "Your airtime purchase was successful"
//         : transaction?.category === "REFERRAL_BONUS"
//         ? "You've received a referral bonus"
//         : transaction?.category === "BANK_TRANSFER"
//         ? "Your deposit was successful"
//         : transaction?.category === "WITHDRAWAL"
//         ? "Your withdrawal was successful"
//         : "Transaction completed successfully"
//       : isProcessing
//       ? "Your transaction is being processed"
//       : "Transaction failed";
//   }, [transaction, isSuccess, isProcessing]);

//   /**
//    * Rows rendered inside the shared receipt IMAGE. Mirrors the on-screen
//    * details so the exported PNG reads like a full receipt.
//    */
//   const receiptRows = useMemo<ReceiptRow[]>(() => {
//     const isCrypto = transaction?.medium?.toUpperCase() === "CRYPTO";
//     const rows: (ReceiptRow | null)[] = [
//       {
//         label: "Transaction ID",
//         value: transaction?.uuid?.split("-")?.join(""),
//       },
//       transaction?.category === "CRYPTO_DEPOSIT"
//         ? {
//             label: "Blockchain Trx ID",
//             value: transaction?.meta?.tx_reference,
//           }
//         : null,
//       {
//         label: "Amount",
//         value: isCrypto
//           ? formatAmount(transaction?.meta?.amount_in_usd || 0, {
//               currency: "USD",
//               decimalPlace: 2,
//             })
//           : formatAmount(transaction?.amount || 0, {
//               currency: "NGN",
//               decimalPlace: 2,
//             }),
//       },
//       transaction?.category === "CRYPTO_SELL"
//         ? null
//         : {
//             label: "Fee",
//             value: formatAmount(transaction?.fee, {
//               currency: isCrypto ? "USD" : "NGN",
//               decimalPlace: isCrypto ? 4 : 2,
//             }),
//           },
//       {
//         label: "Net Amount",
//         value: formatAmount(transaction?.net_amount, {
//           currency: isCrypto ? "USD" : "NGN",
//           decimalPlace: 2,
//         }),
//       },
//       transaction?.meta?.exchange_rate
//         ? {
//             label: "Exchange Rate",
//             value:
//               formatAmount(transaction?.meta?.exchange_rate, {
//                 currency: "NGN",
//                 decimalPlace: 2,
//               }) + "/$",
//           }
//         : null,
//       { label: "Category", value: transaction?.direction?.toUpperCase() },
//       { label: "Wallet", value: transaction?.medium?.toUpperCase() },
//       {
//         label: "Status",
//         value: isSuccess ? "Successful" : transaction?.status,
//         color: isSuccess ? "#059669" : isProcessing ? "#CA8A04" : "#DC2626",
//       },
//       ...(transaction?.category === "WITHDRAWAL"
//         ? [
//             {
//               label: "Recipient Account",
//               value: transaction?.meta?.destinationAccountNumber,
//             },
//             {
//               label: "Recipient Bank",
//               value: transaction?.meta?.destinationBankName,
//             },
//             {
//               label: "Account Holder",
//               value:
//                 transaction?.meta?.nomba_response?.data?.meta?.recipientName,
//             },
//           ]
//         : []),
//       transaction?.status?.toUpperCase() !== "FAILED"
//         ? { label: "Description", value: transaction?.description }
//         : null,
//       {
//         label: "Occurred At",
//         value: transaction?.occurred_at && formatDate(transaction?.occurred_at),
//       },
//     ];
//     return rows.filter((row): row is ReceiptRow => row !== null);
//   }, [transaction, isSuccess, isProcessing]);

//   /* ---------------- Sharing ---------------- */

//   const shareAsPdf = async () => {
//     // 1. Snapshot the same off-screen receipt card used for shareAsImage,
//     // as base64 so it can be embedded directly in the HTML (no filesystem
//     // path juggling across platforms).
//     const base64Image = await captureRef(receiptCardRef, {
//       format: "png",
//       quality: 1,
//       result: "base64",
//     });

//     // 2. Wrap it in a single <img>, sized to fill one page with no margins.
//     const html = `
//     <html>
//       <body style="margin:0;padding:0;">
//         <img
//           src="data:image/png;base64,${base64Image}"
//           style="width:100%;height:100%;display:block;"
//         />
//       </body>
//     </html>
//   `;

//     const filename = `Transaction-Receipt-${transaction?.uuid?.replace(
//       /-/g,
//       "",
//     )}`;

//     // 3. Match the PDF page size to the receipt card's own aspect ratio so
//     // the whole thing renders on one page without being cropped or padded.
//     const pdf = await generatePDF({
//       html,
//       fileName: filename,
//       base64: false,
//       width: receiptSize?.width ?? 375,
//       height: receiptSize?.height ?? 700,
//       padding: 0,
//     });

//     console.log(pdf);

//     // 4. Share the generated PDF file
//     await ShareLib.open({
//       url: `file://${pdf.filePath}`,
//       type: "application/pdf",
//       filename: `${filename}.pdf`,
//       title: "Transaction Receipt",
//       failOnCancel: false,
//     });
//   };

//   // const shareAsPdf = async () => {
//   //   // 1. Fetch the PDF from the backend as a blob
//   //   const response = await apiGet(
//   //     `/transactions/${transaction.uuid}/download-receipt`,
//   //     { responseType: "blob" },
//   //   );

//   //   // 2. Blob → base64 via FileReader
//   //   const base64: string = await new Promise((resolve, reject) => {
//   //     const reader = new FileReader();
//   //     reader.onload = () => resolve((reader.result as string).split(",")[1]);
//   //     reader.onerror = () => reject(new Error("FileReader failed"));
//   //     reader.readAsDataURL(response.data);
//   //   });

//   //   // 3. react-native-share handles base64 data URIs on BOTH platforms
//   //   //    (the old built-in Share approach only worked on iOS)
//   //   await ShareLib.open({
//   //     url: `data:application/pdf;base64,${base64}`,
//   //     type: "application/pdf",
//   //     // Must end in .pdf — the extension is what tells "Save to Files"/other
//   //     // targets what kind of file this is. Also avoid ":" — it's an invalid
//   //     // filename character on iOS/Android and can get silently stripped or
//   //     // cause the save to fail/produce an unopenable file.
//   //     filename: `Transaction-Receipt-${transaction?.uuid?.replace(
//   //       /-/g,
//   //       "",
//   //     )}.pdf`,
//   //     title: "Transaction Receipt",
//   //     failOnCancel: false,
//   //   });
//   // };

//   // const shareAsPdf = async () => {
//   //   // 1. Fetch the PDF from the backend as a blob
//   //   const response = await apiGet(
//   //     `/transactions/${transaction.uuid}/download-receipt`,
//   //     { responseType: "blob" },
//   //   );

//   //   // 2. Blob → base64 via FileReader
//   //   const base64: string = await new Promise((resolve, reject) => {
//   //     const reader = new FileReader();
//   //     reader.onload = () => resolve((reader.result as string).split(",")[1]);
//   //     reader.onerror = () => reject(new Error("FileReader failed"));
//   //     reader.readAsDataURL(response.data);
//   //   });

//   //   // 3. react-native-share handles base64 data URIs on BOTH platforms
//   //   //    (the old built-in Share approach only worked on iOS)
//   //   await ShareLib.open({
//   //     url: `data:application/pdf;base64,${base64}`,
//   //     type: "application/pdf",
//   //     filename: `Transaction-Receipt:${transaction?.uuid?.replace(/-/g, "")}`,
//   //     title: "Transaction Receipt",
//   //     failOnCancel: false,
//   //   });
//   // };

//   const shareAsImage = async () => {
//     // Snapshot the off-screen receipt card as a PNG file
//     const uri = await captureRef(receiptCardRef, {
//       format: "png",
//       quality: 1,
//       result: "tmpfile",
//     });

//     await ShareLib.open({
//       url: uri,
//       type: "image/png",
//       title: "Transaction Receipt",
//       failOnCancel: false,
//     });
//   };

//   const handleFormatSelected = (format: "pdf" | "image") => {
//     setFormatModalVisible(false);

//     // Give the modal time to fully dismiss before presenting the share
//     // sheet — opening it immediately clashes with the closing Modal on iOS.
//     setTimeout(async () => {
//       setIsDownloading(true);
//       try {
//         if (format === "pdf") {
//           await shareAsPdf();
//         } else {
//           await shareAsImage();
//         }
//       } catch (error) {
//         console.error(`Failed to share receipt as ${format}:`, error);
//         showError("Could not generate the receipt. Please try again.");
//       } finally {
//         setIsDownloading(false);
//       }
//     }, 400);
//   };

//   const handleShareReceipt = () => {
//     if (isDownloading) return;
//     setFormatModalVisible(true);
//   };

//   return (
//     <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.content}
//       >
//         <View style={styles.iconContainer}>
//           <StatusIcon />
//         </View>

//         <View style={{ marginBottom: 20, gap: 0 }}>
//           <AppText style={styles.amount}>{displayAmount}</AppText>
//           <AppText
//             style={{
//               fontSize: normalize(18),
//               fontFamily: getFontFamily("400"),
//               textAlign: "center",
//             }}
//           >
//             {statusMessage}
//           </AppText>
//         </View>

//         {hasVouchers && (
//           <TouchableOpacity
//             style={styles.viewVouchersButton}
//             activeOpacity={0.8}
//             onPress={() =>
//               navigation.navigate(
//                 "GiftCardVouchers" as never,
//                 {
//                   vouchers,
//                   brandName:
//                     transaction?.meta?.offer_snapshot?.brand_name ??
//                     "Gift Card",
//                   totalAmountNgn: transaction?.amount,
//                   txReference: transaction?.tx_reference,
//                   quantity: transaction?.meta?.quantity ?? vouchers.length,
//                 } as never,
//               )
//             }
//           >
//             <View style={styles.viewVouchersLeft}>
//               <AppText style={styles.viewVouchersTitle}>
//                 {vouchers.length > 1 && !isSuccess
//                   ? `Some gift cards are ready`
//                   : vouchers.length > 1 && isSuccess
//                   ? `Your gift cards are ready`
//                   : "Your gift card is ready"}
//               </AppText>
//               <AppText style={styles.viewVouchersHint}>
//                 Tap to see the detail about your gift cards
//               </AppText>
//             </View>
//             <ArrowRight2 size={17} color={styles.viewVouchersChevron.color} />
//           </TouchableOpacity>
//         )}

//         {transaction?.meta?.data?.recharge_token && (
//           <View
//             style={{
//               backgroundColor: "#F9FAFB",
//               paddingHorizontal: 10,
//               marginBottom: 20,
//             }}
//           >
//             <DetailRow
//               label="Token"
//               value={
//                 transaction?.meta?.data?.recharge_token
//                   .match(/.{1,4}/g)
//                   ?.join("-") || ""
//               }
//               copyable
//             />
//           </View>
//         )}

//         <View style={styles.detailsContainer}>
//           <DetailRow
//             label="Transaction ID"
//             value={transaction?.uuid?.split("-")?.join("")}
//             copyable
//           />
//           {transaction?.category === "CRYPTO_DEPOSIT" && (
//             <DetailRow
//               label="Blockchain Trx ID"
//               value={transaction?.meta?.tx_reference}
//               copyable
//             />
//           )}
//           <DetailRow
//             label="Amount"
//             value={
//               transaction?.medium?.toUpperCase() === "CRYPTO"
//                 ? formatAmount(transaction?.meta?.amount_in_usd || 0, {
//                     currency: "USD",
//                     decimalPlace: 2,
//                   })
//                 : formatAmount(transaction?.amount || 0, {
//                     currency: "NGN",
//                     decimalPlace: 2,
//                   })
//             }
//             color={getDirectionColor()}
//           />
//           {transaction?.category === "CRYPTO_SELL" ? null : (
//             <DetailRow
//               label="Fee"
//               value={formatAmount(transaction?.fee, {
//                 currency:
//                   transaction?.medium?.toUpperCase() === "CRYPTO"
//                     ? "USD"
//                     : "NGN",
//                 decimalPlace:
//                   transaction?.medium?.toUpperCase() === "CRYPTO" ? 4 : 2,
//               })}
//             />
//           )}
//           <DetailRow
//             label="Net Amount"
//             value={formatAmount(transaction?.net_amount, {
//               currency:
//                 transaction?.medium?.toUpperCase() === "CRYPTO" ? "USD" : "NGN",
//               decimalPlace: 2,
//             })}
//           />
//           {transaction?.meta?.exchange_rate && (
//             <DetailRow
//               label="Exchange Rate"
//               value={
//                 formatAmount(transaction?.meta?.exchange_rate, {
//                   currency: "NGN",
//                   decimalPlace: 2,
//                 }) + "/$"
//               }
//             />
//           )}
//           <DetailRow
//             label="Category"
//             value={transaction?.direction?.toUpperCase()}
//             color={getDirectionColor()}
//           />
//           <DetailRow
//             label="Wallet"
//             value={transaction?.medium?.toUpperCase()}
//           />
//           <DetailRow
//             label="Status"
//             value={isSuccess ? "Successful" : transaction?.status}
//             color={isSuccess ? "#059669" : isProcessing ? "#CA8A04" : "#DC2626"}
//           />
//           {transaction?.category === "WITHDRAWAL" && (
//             <>
//               <DetailRow
//                 label="Recipient Account Number"
//                 value={transaction?.meta?.destinationAccountNumber}
//               />
//               <DetailRow
//                 label="Recipient Bank Name"
//                 value={transaction?.meta?.destinationBankName}
//               />
//               <DetailRow
//                 label="Recipient Account Holder"
//                 value={
//                   transaction?.meta?.nomba_response?.data?.meta?.recipientName
//                 }
//               />
//             </>
//           )}

//           {transaction?.category === "GIFT_CARD" &&
//             transaction?.meta?.is_for_friend &&
//             !!transaction?.meta?.recipient && (
//               <>
//                 <DetailRow
//                   label="Recipient Name"
//                   value={
//                     transaction?.meta?.recipient?.firstName &&
//                     `${transaction?.meta?.recipient?.firstName ?? ""} ${
//                       transaction?.meta?.recipient?.lastName
//                     }`
//                   }
//                 />
//                 <DetailRow
//                   label="Recipient Email"
//                   value={transaction?.meta?.recipient?.email}
//                 />
//                 <DetailRow
//                   label="Recipient Phone Number"
//                   value={transaction?.meta?.recipient?.phone}
//                 />
//               </>
//             )}

//           {["FIAT_TRANSFER", "CRYPTO_TRANSFER"].includes(
//             transaction?.category,
//           ) && (
//             <>
//               {transaction?.meta?.sender_id && (
//                 <DetailRow
//                   label={
//                     user?.uuid === transaction?.meta?.sender_id
//                       ? "Recipient Name"
//                       : "Sender Name"
//                   }
//                   value={
//                     user?.uuid === transaction?.meta?.sender_id
//                       ? transaction?.meta?.receiver_username
//                       : transaction?.meta?.sender_username
//                   }
//                 />
//               )}
//             </>
//           )}

//           {transaction?.status.toUpperCase() !== "FAILED" && (
//             <DetailRow label="Description" value={transaction?.description} />
//           )}

//           <DetailRow
//             label="Occurred At"
//             value={
//               transaction?.occurred_at && formatDate(transaction?.occurred_at)
//             }
//           />

//           <DetailRow
//             label="Confirmed At"
//             value={
//               transaction?.confirmed_at && formatDate(transaction?.confirmed_at)
//             }
//           />
//         </View>

//         <View style={styles.header}>
//           <TouchableOpacity
//             hitSlop={10}
//             activeOpacity={0.8}
//             onPress={handleShareReceipt}
//             disabled={isDownloading}
//             style={[styles.headerButton, isDownloading && { opacity: 0.6 }]}
//           >
//             <CustomIcon source={ShareIcon} size={18} color={COLORS.primary} />
//             <AppText style={styles.headerTitle}>
//               {isDownloading ? "Preparing..." : "Share Receipt"}
//             </AppText>
//           </TouchableOpacity>
//           <TouchableOpacity
//             hitSlop={10}
//             activeOpacity={0.8}
//             onPress={handleGoBack}
//             style={styles.goBackButton}
//           >
//             <AppText style={[styles.headerTitle, { color: "white" }]}>
//               Done
//             </AppText>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* ============ Format picker (bottom sheet) ============ */}
//       <Modal
//         visible={formatModalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setFormatModalVisible(false)}
//       >
//         <TouchableOpacity
//           style={styles.modalBackdrop}
//           activeOpacity={1}
//           onPress={() => setFormatModalVisible(false)}
//         >
//           <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
//             <View style={styles.modalHandle} />
//             <AppText style={styles.modalTitle}>Share receipt</AppText>

//             <TouchableOpacity
//               hitSlop={10}
//               style={styles.formatOption}
//               activeOpacity={0.8}
//               onPress={() => handleFormatSelected("pdf")}
//             >
//               {/* <View style={styles.formatBadge}>
//                 <AppText style={styles.formatBadgeText}>PDF</AppText>
//               </View> */}
//               <View style={styles.formatTextWrap}>
//                 <AppText style={styles.formatTitle}>Share as PDF</AppText>
//                 <AppText style={styles.formatHint}>
//                   Best for records, email and printing
//                 </AppText>
//               </View>
//               <ArrowRight2 size={normalize(20)} color={COLORS.primary} />
//             </TouchableOpacity>

//             <TouchableOpacity
//               hitSlop={10}
//               style={styles.formatOption}
//               activeOpacity={0.8}
//               onPress={() => handleFormatSelected("image")}
//             >
//               {/* <View style={[styles.formatBadge, styles.formatBadgeAlt]}>
//                 <AppText style={styles.formatBadgeText}>IMG</AppText>
//               </View> */}
//               <View style={styles.formatTextWrap}>
//                 <AppText style={styles.formatTitle}>Share as image</AppText>
//                 <AppText style={styles.formatHint}>
//                   Quick preview, easy to share on chat apps
//                 </AppText>
//               </View>
//               <ArrowRight2 size={normalize(20)} color={COLORS.primary} />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.modalCancel}
//               activeOpacity={0.8}
//               onPress={() => setFormatModalVisible(false)}
//             >
//               <AppText style={styles.modalCancelText}>Cancel</AppText>
//             </TouchableOpacity>
//           </TouchableOpacity>
//         </TouchableOpacity>
//       </Modal>

//       {/* ============ Receipt image (off-screen, captured on share) ============ */}
//       <View style={styles.receiptOffscreen} pointerEvents="none">
//         <View
//           ref={receiptCardRef}
//           collapsable={false}
//           style={styles.receiptCard}
//         >
//           <CardPatternBackground />
//           {/* Branded header */}
//           <View style={styles.receiptHeader}>
//             <AppText style={styles.receiptAppName}>{APP_NAME}</AppText>
//             <AppText style={styles.receiptHeaderSub}>
//               Transaction Receipt
//             </AppText>
//           </View>

//           {/* Status + amount */}
//           <View style={styles.receiptStatusBlock}>
//             <StatusIcon size={44} />
//             <AppText style={styles.receiptAmount}>{displayAmount}</AppText>
//             {/* <AppText style={styles.receiptMessage}>{statusMessage}</AppText> */}
//           </View>

//           {/* Details */}
//           <View style={styles.receiptRows}>
//             {receiptRows.map(row => (
//               <View key={row.label} style={styles.receiptRow}>
//                 <AppText style={styles.receiptRowLabel}>{row.label}</AppText>
//                 <AppText
//                   style={[
//                     styles.receiptRowValue,
//                     { color: row.color ?? "#0A0A2A" },
//                   ]}
//                 >
//                   {row.value ?? "-"}
//                 </AppText>
//               </View>
//             ))}
//           </View>

//           {/* Footer */}
//           {/* <View style={styles.receiptFooter}>
//             <AppText style={styles.receiptFooterText}>
//               Generated with {APP_NAME}
//             </AppText>
//           </View> */}
//         </View>
//       </View>
//       <View
//         ref={receiptCardRef}
//         collapsable={false}
//         style={styles.receiptCard}
//         onLayout={handleReceiptLayout}
//       ></View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   content: { padding: 20 },
//   iconContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 12,
//     width: 50,
//     height: 50,
//     margin: "auto",
//   },
//   vouchersSection: {
//     marginBottom: 24,
//   },
//   vouchersSectionTitle: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("800"),
//     color: "#000000",
//     marginBottom: 4,
//   },
//   vouchersSectionHint: {
//     fontSize: normalize(17),
//     fontFamily: getFontFamily("700"),
//     color: "#5d6066",
//     marginBottom: 14,
//     lineHeight: normalize(20),
//   },
//   header: {
//     justifyContent: "space-between",
//     paddingHorizontal: 10,
//     paddingVertical: 15,
//     gap: 10,
//   },
//   networkLogo: {
//     width: 70,
//     height: 70,
//     resizeMode: "contain",
//   },
//   headerButton: {
//     borderColor: COLORS.secondary,
//     borderWidth: 1,
//     padding: 14,
//     flex: 1,
//     gap: 6,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 40,
//   },
//   goBackButton: {
//     backgroundColor: COLORS.secondary,
//     padding: 14,
//     flex: 1,
//     gap: 6,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 40,
//   },
//   viewVouchersButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: `${COLORS.primary}10`,
//     borderWidth: 1,
//     borderColor: `${COLORS.primary}30`,
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 20,
//   },
//   viewVouchersLeft: {
//     flex: 1,
//     gap: 3,
//   },
//   viewVouchersTitle: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("800"),
//     color: COLORS.primary,
//   },
//   viewVouchersHint: {
//     fontSize: normalize(16),
//     fontFamily: getFontFamily("700"),
//     color: "#41454d",
//   },
//   viewVouchersChevron: {
//     fontSize: normalize(26),
//     fontFamily: getFontFamily("400"),
//     color: COLORS.primary,
//     lineHeight: normalize(28),
//   },
//   headerTitle: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("700"),
//     color: COLORS.primary,
//   },
//   amount: {
//     textAlign: "center",
//     marginTop: 4,
//     fontSize: normalize(23),
//     fontFamily: getFontFamily("800"),
//     color: "#000",
//   },
//   detailsContainer: {
//     backgroundColor: "#F9FAFB",
//     borderRadius: 12,
//     padding: 16,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 10,
//     columnGap: 9,
//   },
//   label: {
//     flex: 1,
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("400"),
//   },
//   valueContainer: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "flex-end",
//   },
//   value: {
//     flexShrink: 1,
//     minWidth: 0,
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("800"),
//     textAlign: "right",
//   },
//   copyButton: {
//     marginLeft: 6,
//     padding: 8,
//     flexShrink: 0,
//     borderRadius: 10,
//     backgroundColor: "#eeeeee",
//   },
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.45)",
//     justifyContent: "flex-end",
//   },
//   modalSheet: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 22,
//     borderTopRightRadius: 22,
//     paddingHorizontal: 20,
//     paddingTop: 10,
//     paddingBottom: 30,
//   },
//   modalHandle: {
//     width: 40,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: "#fff",
//     alignSelf: "center",
//     marginBottom: 12,
//   },
//   modalTitle: {
//     fontSize: normalize(20),
//     fontFamily: getFontFamily("800"),
//     color: "#000",
//     marginBottom: 14,
//   },
//   formatOption: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     paddingVertical: 14,
//     paddingHorizontal: 14,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: "#659e5f",
//     backgroundColor: "#ffffff",
//     marginBottom: 10,
//   },
//   formatBadge: {
//     width: 46,
//     height: 46,
//     borderRadius: 12,
//     backgroundColor: "white",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   formatBadgeAlt: {
//     backgroundColor: "#ffffff",
//   },
//   formatBadgeText: {
//     fontSize: normalize(16),
//     fontFamily: getFontFamily("900"),
//     color: COLORS.primary,
//   },
//   formatTextWrap: {
//     flex: 1,
//     gap: 2,
//   },
//   formatTitle: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("700"),
//     color: "#000",
//   },
//   formatHint: {
//     fontSize: normalize(17),
//     fontFamily: getFontFamily("400"),
//     color: "#6B7280",
//   },
//   modalCancel: {
//     marginTop: 6,
//     paddingVertical: 13,
//     borderRadius: 40,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#cccccc",
//   },
//   modalCancelText: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("800"),
//     color: "#374151",
//   },

//   receiptOffscreen: {
//     position: "absolute",
//     top: -10000,
//     left: 0,
//   },
//   receiptCard: {
//     width: RECEIPT_CARD_WIDTH,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 0,
//     overflow: "hidden",
//   },
//   receiptHeader: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     alignItems: "center",
//   },
//   receiptAppName: {
//     fontFamily: getFontFamily(900),
//     fontSize: normalize(18),
//     color: "#FFFFFF",
//     letterSpacing: 0.5,
//   },
//   receiptHeaderSub: {
//     fontFamily: getFontFamily(700),
//     fontSize: normalize(17),
//     color: "rgba(255,255,255,0.85)",
//     marginTop: 2,
//   },
//   receiptStatusBlock: {
//     alignItems: "center",
//     paddingTop: 16,
//     paddingBottom: 12,
//     paddingHorizontal: 20,
//     gap: 4,
//   },
//   receiptAmount: {
//     fontFamily: getFontFamily(800),
//     fontSize: normalize(22),
//     color: "#000",
//     marginTop: 6,
//   },
//   receiptMessage: {
//     fontFamily: getFontFamily(400),
//     fontSize: normalize(15),
//     color: "#4B5563",
//     textAlign: "center",
//   },
//   receiptRows: {
//     marginHorizontal: 14,
//     marginBottom: 12,
//     backgroundColor: "#F9FAFB",
//     borderRadius: 12,
//     paddingVertical: 4,
//     paddingHorizontal: 12,
//   },
//   receiptRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     paddingVertical: 7,
//     columnGap: 10,
//   },
//   receiptRowLabel: {
//     fontFamily: getFontFamily(400),
//     fontSize: normalize(16),
//     color: "#4B5563",
//     flexShrink: 0,
//   },
//   receiptRowValue: {
//     fontFamily: getFontFamily(800),
//     fontSize: normalize(16),
//     textAlign: "right",
//     flex: 1,
//   },
//   receiptFooter: {
//     borderTopWidth: 1,
//     borderTopColor: "#EFEFEF",
//     paddingVertical: 9,
//     alignItems: "center",
//     backgroundColor: "#FAFAFA",
//   },
//   receiptFooterText: {
//     fontFamily: getFontFamily(700),
//     fontSize: 10,
//     color: "#9CA3AF",
//   },
// });

// export default TransactionDetailScreen;
import React, { useMemo, useRef, useState } from "react";
import { ArrowRight2, CloseCircle } from "iconsax-react-nativejs";
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  Modal,
  LayoutChangeEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { formatDate } from "../libs/formatDate";
import { formatAmount } from "../libs/formatNumber";
import { COLORS } from "../constants/colors";
import CustomIcon from "../components/CustomIcon";
import { CheckCircleIcon, CopyIcon, ShareIcon } from "../assets";
import Clipboard from "@react-native-clipboard/clipboard";
import { showError } from "../utlis/toast";
import { AppText } from "../components/AppText";
import { captureRef } from "react-native-view-shot";
import ShareLib from "react-native-share";
import { useAuthStore } from "../stores/authSlice";
import { generatePDF } from "react-native-html-to-pdf";

const APP_NAME = "WHYKAY";
const RECEIPT_CARD_WIDTH = 340;
const SUPPORT_EMAIL = "support@whykay.net";
const SUPPORT_PHONE = "+234800 000 0000";

export const DetailRow: React.FC<{
  label: string;
  value?: string | number;
  color?: string;
  copyable?: boolean;
}> = ({ label, value, color = "#000", copyable = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value) {
      Clipboard.setString(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <View style={styles.row}>
      <AppText style={styles.label}>{label}</AppText>

      <View style={styles.valueContainer}>
        <AppText
          style={[styles.value, { color }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value ?? "-"}
        </AppText>

        {copyable && value ? (
          <TouchableOpacity
            hitSlop={10}
            activeOpacity={0.8}
            onPress={handleCopy}
            style={styles.copyButton}
          >
            {copied ? (
              <CustomIcon source={CheckCircleIcon} size={15} color="green" />
            ) : (
              <CustomIcon source={CopyIcon} size={15} color="#0a580dff" />
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

interface Voucher {
  unit: number;
  zendit_tx_id: string;
  epin?: string;
  voucher_id?: string;
  expires_at?: string;
  redemption_url?: string;
  instructions?: string;
  terms?: string;
  send?: number;
  send_currency?: string;
  status?: string;
  confirmation?: {
    confirmationNumber: string;
    externalReferenceId: string;
    transactionTime: string;
  };
}

interface ReceiptRow {
  label: string;
  value?: string | number;
  color?: string;
}

/** Returns true if this transaction is a gift card with at least one voucher. */
function isGiftCardWithVouchers(transaction: any): boolean {
  return (
    transaction?.category === "GIFT_CARD" &&
    Array.isArray(transaction?.meta?.vouchers) &&
    transaction.meta.vouchers.length > 0
  );
}

const TransactionDetailScreen = () => {
  const navigation: any = useNavigation();
  const route = useRoute();
  const { transaction }: any = route.params;
  const [isDownloading, setIsDownloading] = useState(false);
  const [formatModalVisible, setFormatModalVisible] = useState(false);
  const receiptCardRef = useRef<View>(null);
  const user = useAuthStore(state => state.user);
  const [receiptSize, setReceiptSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleReceiptLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setReceiptSize({ width, height });
  };

  const isSuccess = useMemo(
    () => transaction?.status?.toLowerCase() === "successful",
    [transaction?.status],
  );

  const isProcessing = useMemo(
    () =>
      transaction?.status?.toLowerCase() === "processing" ||
      transaction?.status?.toLowerCase() === "pending",
    [transaction?.status],
  );

  const hasVouchers = isGiftCardWithVouchers(transaction);
  const vouchers: Voucher[] = transaction?.meta?.vouchers ?? [];

  const StatusIcon = ({ size = 60 }: { size?: number }) =>
    isSuccess ? (
      <Image
        source={require("../assets/success.webp")}
        style={{ width: size + 10, height: size + 10, resizeMode: "contain" }}
      />
    ) : (
      <CloseCircle
        size={size}
        color={isProcessing ? "#CA8A04" : "#DC2626"}
        variant="Bold"
      />
    );

  const handleGoBack = () => {
    try {
      const state = navigation.getState();
      const routes = state.routes;
      const previousRoute = routes[routes.length - 2];

      if (previousRoute) {
        navigation.dispatch({
          ...CommonActions.setParams({ resetForm: true }),
          source: previousRoute.key,
        });

        navigation.goBack();
      } else {
        navigation.goBack();
      }
    } catch (error) {
      navigation.goBack();
    }
  };

  const getDirectionColor = () => {
    if (!transaction?.direction) return "#000";
    return transaction?.direction.toLowerCase() === "debit" ? "#000" : "#000";
  };

  const displayAmount = useMemo(() => {
    return transaction?.medium?.toUpperCase() === "CRYPTO"
      ? ["failed", "pending"].includes(transaction.status?.toLowerCase())
        ? formatAmount(transaction?.meta?.amount_in_usd ?? 0, {
            currency: transaction?.currency || "USD",
            decimalPlace: 2,
          })
        : `${transaction?.meta?.amount || 0} ${
            transaction?.meta?.asset_symbol ?? ""
          }`
      : formatAmount(transaction?.amount ?? 0, {
          currency: transaction?.currency || "NGN",
          decimalPlace: 2,
        });
  }, [transaction]);

  const statusMessage = useMemo(() => {
    return isSuccess
      ? transaction?.category === "GIFT_CARD"
        ? `Your ${
            transaction?.meta?.offer_snapshot?.brand_name ?? "gift card"
          } purchase was successful`
        : transaction?.category === "CRYPTO_DEPOSIT"
        ? `Your ${transaction?.meta?.asset_symbol} deposit was successful`
        : transaction?.category === "CRYPTO_WITHDRAW"
        ? `Your ${transaction?.meta?.asset_symbol} withdrawal was successful`
        : transaction?.category === "CABLETV"
        ? "Your TV bill payment was successful"
        : transaction?.category === "MOBILEDATA"
        ? "Your data purchase was successful"
        : transaction?.category === "AIRTIME"
        ? "Your airtime purchase was successful"
        : transaction?.category === "REFERRAL_BONUS"
        ? "You've received a referral bonus"
        : transaction?.category === "BANK_TRANSFER"
        ? "Your deposit was successful"
        : transaction?.category === "WITHDRAWAL"
        ? "Your withdrawal was successful"
        : "Transaction completed successfully"
      : isProcessing
      ? "Your transaction is being processed"
      : "Transaction failed";
  }, [transaction, isSuccess, isProcessing]);

  /**
   * Rows rendered inside the shared receipt IMAGE. Mirrors the on-screen
   * details so the exported PNG reads like a full receipt.
   */
  const receiptRows = useMemo<ReceiptRow[]>(() => {
    const isCrypto = transaction?.medium?.toUpperCase() === "CRYPTO";
    const category = transaction?.category;

    /* ── Category-specific rows ─────────────────────────── */
    const categoryRows: (ReceiptRow | null)[] = [];

    if (category === "AIRTIME" || category === "MOBILEDATA") {
      categoryRows.push(
        {
          label: "Network",
          value: transaction?.meta?.network?.toUpperCase(),
        },
        {
          label: "Phone Number",
          value: transaction?.meta?.phone_number,
        },
      );
    } else if (category === "CABLETV") {
      categoryRows.push(
        {
          label: "Provider",
          value: transaction?.meta?.provider?.toUpperCase(),
        },
        {
          label: "Smart Card Number",
          value: transaction?.meta?.smart_card_number,
        },
      );
    } else if (["CRYPTO_DEPOSIT", "CRYPTO_SELL"].includes(category)) {
      categoryRows.push({
        label: "Asset",
        value: transaction?.meta?.asset_symbol,
      });
    } else if (category === "WITHDRAWAL") {
      categoryRows.push(
        {
          label: "Recipient Account",
          value: transaction?.meta?.destinationAccountNumber,
        },
        {
          label: "Recipient Bank",
          value: transaction?.meta?.destinationBankName,
        },
        transaction?.meta?.nomba_response?.data?.meta?.recipientName
          ? {
              label: "Account Holder",
              value:
                transaction?.meta?.nomba_response?.data?.meta?.recipientName,
            }
          : null,
      );
    } else if (["FIAT_TRANSFER", "CRYPTO_TRANSFER"].includes(category)) {
      // Same direction logic as the on-screen rows: if the current user is
      // the sender, show who received it; otherwise show who sent it.
      if (transaction?.meta?.sender_id) {
        const isSender = user?.uuid === transaction?.meta?.sender_id;
        categoryRows.push({
          label: isSender ? "Recipient Name" : "Sender Name",
          value: isSender
            ? transaction?.meta?.receiver_username
            : transaction?.meta?.sender_username,
        });
      }
    } else if (category === "GIFT_CARD") {
      categoryRows.push(
        {
          label: "Gift Card",
          value: transaction?.meta?.offer_snapshot?.brand_name,
        },
        {
          label: "Quantity",
          value: transaction?.meta?.quantity,
        },
      );

      if (transaction?.meta?.offer_snapshot?.send) {
        categoryRows.push({
          label: "Card Price",
          value: formatAmount(
            transaction.meta.offer_snapshot.send.fixed /
              transaction.meta.offer_snapshot.send.currencyDivisor,
            {
              currency: transaction.meta.offer_snapshot.send.currency,
              decimalPlace: 2,
            },
          ),
        });
      }

      // Gift card sent to a friend → show their details
      if (transaction?.meta?.is_for_friend && transaction?.meta?.recipient) {
        const r = transaction.meta.recipient;
        const recipientName =
          r?.firstName && `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim();

        categoryRows.push(
          recipientName
            ? { label: "Recipient Name", value: recipientName }
            : null,
          r?.email ? { label: "Recipient Email", value: r.email } : null,
          r?.phone ? { label: "Recipient Phone", value: r.phone } : null,
        );
      }
    }

    /* ── Full row list ──────────────────────────────────── */
    const rows: (ReceiptRow | null)[] = [
      {
        label: "Transaction ID",
        value: transaction?.uuid?.split("-")?.join(""),
      },
      category === "CRYPTO_DEPOSIT"
        ? {
            label: "Blockchain Trx ID",
            value: transaction?.meta?.tx_reference,
          }
        : null,

      ...categoryRows,

      {
        label: "Amount",
        value: isCrypto
          ? formatAmount(transaction?.meta?.amount_in_usd || 0, {
              currency: "USD",
              decimalPlace: 2,
            })
          : formatAmount(transaction?.amount || 0, {
              currency: "NGN",
              decimalPlace: 2,
            }),
      },
      category === "CRYPTO_SELL"
        ? null
        : {
            label: "Fee",
            value: formatAmount(transaction?.fee, {
              currency: isCrypto ? "USD" : "NGN",
              decimalPlace: isCrypto ? 4 : 2,
            }),
          },
      {
        label: "Net Amount",
        value: formatAmount(transaction?.net_amount, {
          currency: isCrypto ? "USD" : "NGN",
          decimalPlace: 2,
        }),
      },
      transaction?.meta?.exchange_rate
        ? {
            label: "Exchange Rate",
            value:
              formatAmount(transaction?.meta?.exchange_rate, {
                currency: "NGN",
                decimalPlace: 2,
              }) + "/$",
          }
        : null,
      transaction?.status?.toUpperCase() !== "FAILED"
        ? { label: "Description", value: transaction?.description }
        : null,
    ];

    return rows.filter(
      (row): row is ReceiptRow =>
        row !== null && row.value != null && row.value !== "",
    );
  }, [transaction, isSuccess, isProcessing, user?.uuid]);

  const shareAsPdf = async () => {
    const filename = `Transaction-Receipt-${Date.now()}-${transaction?.uuid?.replace(
      /-/g,
      "",
    )}`;

    // Same capture as shareAsImage — guarantees pixel-identical output
    // const base64Image = await captureRef(receiptCardRef, {
    //   format: "png",
    //   quality: 1,
    //   result: "base64",
    //   fileName: filename,
    // });

    const base64Image = await captureRef(receiptCardRef, {
      format: "png",
      quality: 1,
      result: "base64",
      width: RECEIPT_CARD_WIDTH * 3, // fixed 1020px wide
      height: (receiptSize?.height ?? 700) * 3, // keep aspect from layout
    });

    const html = `
    <html>
      <body style="margin:0;padding:0;">
        <img
          src="data:image/png;base64,${base64Image}"
          style="width:100%;height:100%;display:block;"
        />
      </body>
    </html>
  `;

    // const filename = `Transaction-Receipt-${Date.now()}-${transaction?.uuid?.replace(
    //   /-/g,
    //   "",
    // )}`;

    // Match the page to the card's aspect ratio so it fills one page cleanly.
    // Scale factor keeps the PDF page at print-friendly dimensions.
    const scale = 2;
    const pdf = await generatePDF({
      html,
      fileName: filename,
      base64: false,
      width: (receiptSize?.width ?? RECEIPT_CARD_WIDTH) * scale,
      height: (receiptSize?.height ?? 700) * scale,
      padding: 0,
    });

    await ShareLib.open({
      url: `file://${pdf.filePath}`,
      type: "application/pdf",
      filename: `${filename}.pdf`,
      title: filename,
      failOnCancel: false,
    });
  };

  // const shareAsPdf = async () => {
  //   // 1. Fetch the PDF from the backend as a blob
  //   const response = await apiGet(
  //     `/transactions/${transaction.uuid}/download-receipt`,
  //     { responseType: "blob" },
  //   );

  //   // 2. Blob → base64 via FileReader
  //   const base64: string = await new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = () => resolve((reader.result as string).split(",")[1]);
  //     reader.onerror = () => reject(new Error("FileReader failed"));
  //     reader.readAsDataURL(response.data);
  //   });

  //   // 3. react-native-share handles base64 data URIs on BOTH platforms
  //   //    (the old built-in Share approach only worked on iOS)
  //   await ShareLib.open({
  //     url: `data:application/pdf;base64,${base64}`,
  //     type: "application/pdf",
  //     // Must end in .pdf — the extension is what tells "Save to Files"/other
  //     // targets what kind of file this is. Avoid ":" — it's an invalid
  //     // filename character on iOS/Android and can get silently stripped or
  //     // produce an unopenable file.
  //     filename: `Transaction-Receipt-${Date.now()}-${transaction?.uuid?.replace(
  //       /-/g,
  //       "",
  //     )}.pdf`,
  //     title: "Transaction Receipt",
  //     failOnCancel: false,
  //   });
  // };

  const shareAsImage = async () => {
    const filename = `Transaction-Receipt-${Date.now()}-${transaction?.uuid?.replace(
      /-/g,
      "",
    )}`;

    const uri = await captureRef(receiptCardRef, {
      format: "png",
      quality: 1,
      result: "tmpfile",
      fileName: filename,
    });

    await ShareLib.open({
      url: uri,
      type: "image/png",
      title: filename,
      failOnCancel: false,
    });
  };

  const handleFormatSelected = (format: "pdf" | "image") => {
    setFormatModalVisible(false);

    // Give the modal time to fully dismiss before presenting the share
    // sheet — opening it immediately clashes with the closing Modal on iOS.
    setTimeout(async () => {
      setIsDownloading(true);
      try {
        if (format === "pdf") {
          await shareAsPdf();
        } else {
          await shareAsImage();
        }
      } catch (error) {
        console.error(`Failed to share receipt as ${format}:`, error);
        showError("Could not generate the receipt. Please try again.");
      } finally {
        setIsDownloading(false);
      }
    }, 400);
  };

  const handleShareReceipt = () => {
    if (isDownloading) return;
    setFormatModalVisible(true);
  };

  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.iconContainer}>
          <StatusIcon />
        </View>

        <View style={{ marginBottom: 20, gap: 0 }}>
          <AppText style={styles.amount}>{displayAmount}</AppText>
          <AppText
            style={{
              fontSize: normalize(18),
              fontFamily: getFontFamily("400"),
              textAlign: "center",
            }}
          >
            {statusMessage}
          </AppText>
        </View>

        {hasVouchers && (
          <TouchableOpacity
            style={styles.viewVouchersButton}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(
                "GiftCardVouchers" as never,
                {
                  vouchers,
                  brandName:
                    transaction?.meta?.offer_snapshot?.brand_name ??
                    "Gift Card",
                  totalAmountNgn: transaction?.amount,
                  txReference: transaction?.tx_reference,
                  quantity: transaction?.meta?.quantity ?? vouchers.length,
                } as never,
              )
            }
          >
            <View style={styles.viewVouchersLeft}>
              <AppText style={styles.viewVouchersTitle}>
                {vouchers.length > 1 && !isSuccess
                  ? `Some gift cards are ready`
                  : vouchers.length > 1 && isSuccess
                  ? `Your gift cards are ready`
                  : "Your gift card is ready"}
              </AppText>
              <AppText style={styles.viewVouchersHint}>
                Tap to see the detail about your gift cards
              </AppText>
            </View>
            <ArrowRight2 size={17} color={styles.viewVouchersChevron.color} />
          </TouchableOpacity>
        )}

        {transaction?.meta?.data?.recharge_token && (
          <View
            style={{
              backgroundColor: "#F9FAFB",
              paddingHorizontal: 10,
              marginBottom: 20,
            }}
          >
            <DetailRow
              label="Token"
              value={
                transaction?.meta?.data?.recharge_token
                  .match(/.{1,4}/g)
                  ?.join("-") || ""
              }
              copyable
            />
          </View>
        )}

        <View style={styles.detailsContainer}>
          <DetailRow
            label="Transaction ID"
            value={transaction?.uuid?.split("-")?.join("")}
            copyable
          />
          {transaction?.category === "CRYPTO_DEPOSIT" && (
            <DetailRow
              label="Blockchain Trx ID"
              value={transaction?.meta?.tx_reference}
              copyable
            />
          )}
          <DetailRow
            label="Amount"
            value={
              transaction?.medium?.toUpperCase() === "CRYPTO"
                ? formatAmount(transaction?.meta?.amount_in_usd || 0, {
                    currency: "USD",
                    decimalPlace: 2,
                  })
                : formatAmount(transaction?.amount || 0, {
                    currency: "NGN",
                    decimalPlace: 2,
                  })
            }
            color={getDirectionColor()}
          />
          {transaction?.category === "CRYPTO_SELL" ? null : (
            <DetailRow
              label="Fee"
              value={formatAmount(transaction?.fee, {
                currency:
                  transaction?.medium?.toUpperCase() === "CRYPTO"
                    ? "USD"
                    : "NGN",
                decimalPlace:
                  transaction?.medium?.toUpperCase() === "CRYPTO" ? 4 : 2,
              })}
            />
          )}
          <DetailRow
            label="Net Amount"
            value={formatAmount(transaction?.net_amount, {
              currency:
                transaction?.medium?.toUpperCase() === "CRYPTO" ? "USD" : "NGN",
              decimalPlace: 2,
            })}
          />
          {transaction?.meta?.exchange_rate && (
            <DetailRow
              label="Exchange Rate"
              value={
                formatAmount(transaction?.meta?.exchange_rate, {
                  currency: "NGN",
                  decimalPlace: 2,
                }) + "/$"
              }
            />
          )}
          <DetailRow
            label="Category"
            value={transaction?.direction?.toUpperCase()}
            color={getDirectionColor()}
          />
          <DetailRow
            label="Wallet"
            value={transaction?.medium?.toUpperCase()}
          />
          <DetailRow
            label="Status"
            value={isSuccess ? "Successful" : transaction?.status}
            color={isSuccess ? "#059669" : isProcessing ? "#CA8A04" : "#DC2626"}
          />
          {transaction?.category === "WITHDRAWAL" && (
            <>
              <DetailRow
                label="Recipient Account Number"
                value={transaction?.meta?.destinationAccountNumber}
              />
              <DetailRow
                label="Recipient Bank Name"
                value={transaction?.meta?.destinationBankName}
              />
              <DetailRow
                label="Recipient Account Holder"
                value={
                  transaction?.meta?.nomba_response?.data?.meta?.recipientName
                }
              />
            </>
          )}

          {transaction?.category === "GIFT_CARD" &&
            transaction?.meta?.is_for_friend &&
            !!transaction?.meta?.recipient && (
              <>
                <DetailRow
                  label="Recipient Name"
                  value={
                    transaction?.meta?.recipient?.firstName &&
                    `${transaction?.meta?.recipient?.firstName ?? ""} ${
                      transaction?.meta?.recipient?.lastName
                    }`
                  }
                />
                <DetailRow
                  label="Recipient Email"
                  value={transaction?.meta?.recipient?.email}
                />
                <DetailRow
                  label="Recipient Phone Number"
                  value={transaction?.meta?.recipient?.phone}
                />
              </>
            )}

          {transaction?.category === "GIFT_CARD" && !!transaction?.meta && (
            <>
              <DetailRow
                label="Order Quantity"
                value={transaction?.meta?.quantity}
              />
              {transaction?.meta?.offer_snapshot?.send && (
                <>
                  <DetailRow
                    label="Gift Card Brand"
                    value={transaction?.meta?.offer_snapshot?.brand ?? "-"}
                  />

                  <DetailRow
                    label="Card Price"
                    value={formatAmount(
                      transaction?.meta?.offer_snapshot?.send?.fixed /
                        transaction?.meta?.offer_snapshot?.send
                          ?.currencyDivisor,
                      {
                        currency:
                          transaction?.meta?.offer_snapshot?.send?.currency,
                        decimalPlace: 2,
                      },
                    )}
                  />
                </>
              )}
            </>
          )}

          {["FIAT_TRANSFER", "CRYPTO_TRANSFER"].includes(
            transaction?.category,
          ) && (
            <>
              {transaction?.meta?.sender_id && (
                <DetailRow
                  label={
                    user?.uuid === transaction?.meta?.sender_id
                      ? "Recipient Name"
                      : "Sender Name"
                  }
                  value={
                    user?.uuid === transaction?.meta?.sender_id
                      ? transaction?.meta?.receiver_username
                      : transaction?.meta?.sender_username
                  }
                />
              )}
            </>
          )}

          {transaction?.status.toUpperCase() !== "FAILED" && (
            <DetailRow label="Description" value={transaction?.description} />
          )}

          <DetailRow
            label="Occurred At"
            value={
              transaction?.occurred_at && formatDate(transaction?.occurred_at)
            }
          />

          <DetailRow
            label="Confirmed At"
            value={
              transaction?.confirmed_at && formatDate(transaction?.confirmed_at)
            }
          />
        </View>

        <View style={styles.header}>
          <TouchableOpacity
            hitSlop={10}
            activeOpacity={0.8}
            onPress={handleShareReceipt}
            disabled={isDownloading}
            style={[styles.headerButton, isDownloading && { opacity: 0.6 }]}
          >
            <CustomIcon source={ShareIcon} size={18} color={COLORS.primary} />
            <AppText style={styles.headerTitle}>
              {isDownloading ? "Preparing..." : "Share Receipt"}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={10}
            activeOpacity={0.8}
            onPress={handleGoBack}
            style={styles.goBackButton}
          >
            <AppText style={[styles.headerTitle, { color: "white" }]}>
              Done
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* ============ Format picker (bottom sheet) ============ */}
      <Modal
        visible={formatModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFormatModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setFormatModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <AppText style={styles.modalTitle}>Share receipt</AppText>

            <TouchableOpacity
              hitSlop={10}
              style={styles.formatOption}
              activeOpacity={0.8}
              onPress={() => handleFormatSelected("pdf")}
            >
              <View style={styles.formatTextWrap}>
                <AppText style={styles.formatTitle}>Share as PDF</AppText>
                <AppText style={styles.formatHint}>
                  Best for records, email and printing
                </AppText>
              </View>
              <ArrowRight2 size={normalize(20)} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              hitSlop={10}
              style={styles.formatOption}
              activeOpacity={0.8}
              onPress={() => handleFormatSelected("image")}
            >
              <View style={styles.formatTextWrap}>
                <AppText style={styles.formatTitle}>Share as image</AppText>
                <AppText style={styles.formatHint}>
                  Quick preview, easy to share on chat apps
                </AppText>
              </View>
              <ArrowRight2 size={normalize(20)} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              activeOpacity={0.8}
              onPress={() => setFormatModalVisible(false)}
            >
              <AppText style={styles.modalCancelText}>Cancel</AppText>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      {/* ============ Receipt image (off-screen, captured on share) ============ */}
      {/*  */}

      <View style={styles.receiptOffscreen} pointerEvents="none">
        <View
          ref={receiptCardRef}
          collapsable={false}
          style={styles.receiptCard}
          onLayout={handleReceiptLayout}
        >
          {/* Header */}
          <View style={styles.receiptHeader}>
            <AppText style={styles.receiptAppName}>{APP_NAME}</AppText>
          </View>

          <View style={styles.receiptDivider} />

          {/* Amount block: status → amount → date/time */}
          <View style={styles.receiptAmountBlock}>
            <AppText style={[styles.receiptStatusText]}>
              Transaction{" "}
              {isSuccess ? "Successful" : isProcessing ? "Pending" : "Failed"}
            </AppText>
            <AppText style={styles.receiptAmount}>{displayAmount}</AppText>
            <AppText style={styles.receiptDateText}>
              {transaction?.occurred_at
                ? formatDate(transaction?.occurred_at)
                : "-"}
            </AppText>
          </View>

          {/* Ticket-style dashed break */}
          <View style={styles.receiptDashedDivider} />

          {/* Details */}
          <View style={styles.receiptRows}>
            {receiptRows.map((row, index) => (
              <View
                key={row.label}
                style={[
                  styles.receiptRow,
                  index === receiptRows.length - 1 && styles.receiptRowLast,
                ]}
              >
                <AppText style={styles.receiptRowLabel}>{row.label}</AppText>
                <AppText
                  style={[
                    styles.receiptRowValue,
                    { color: row.color ?? "#1A1A1A" },
                  ]}
                >
                  {row.value ?? "-"}
                </AppText>
              </View>
            ))}
          </View>

          <View style={styles.receiptDivider} />

          {/* Support footer */}
          <View style={styles.receiptFooter}>
            <AppText style={styles.receiptFooterText}>
              Need help with this transaction? Contact our support team
            </AppText>
            <AppText style={styles.receiptFooterContact}>
              {SUPPORT_EMAIL} or {SUPPORT_PHONE}
            </AppText>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20 },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    width: 50,
    height: 50,
    margin: "auto",
  },
  vouchersSection: {
    marginBottom: 24,
  },
  vouchersSectionTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000000",
    marginBottom: 4,
  },
  vouchersSectionHint: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("700"),
    color: "#5d6066",
    marginBottom: 14,
    lineHeight: normalize(20),
  },
  header: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 15,
    gap: 10,
  },
  networkLogo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
  headerButton: {
    borderColor: COLORS.secondary,
    borderWidth: 1,
    padding: 14,
    flex: 1,
    gap: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
  },
  goBackButton: {
    backgroundColor: COLORS.secondary,
    padding: 14,
    flex: 1,
    gap: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
  },
  viewVouchersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: `${COLORS.primary}10`,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  viewVouchersLeft: {
    flex: 1,
    gap: 3,
  },
  viewVouchersTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: COLORS.primary,
  },
  viewVouchersHint: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
    color: "#41454d",
  },
  viewVouchersChevron: {
    fontSize: normalize(26),
    fontFamily: getFontFamily("400"),
    color: COLORS.primary,
    lineHeight: normalize(28),
  },
  headerTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: COLORS.primary,
  },
  amount: {
    textAlign: "center",
    marginTop: 4,
    fontSize: normalize(23),
    fontFamily: getFontFamily("800"),
    color: "#000",
  },
  detailsContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    columnGap: 9,
  },
  label: {
    flex: 1,
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
  },
  valueContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  value: {
    flexShrink: 1,
    minWidth: 0,
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    textAlign: "right",
  },
  copyButton: {
    marginLeft: 6,
    padding: 8,
    flexShrink: 0,
    borderRadius: 10,
    backgroundColor: "#eeeeee",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#fff",
    alignSelf: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 14,
  },
  formatOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#659e5f",
    backgroundColor: "#ffffff",
    marginBottom: 10,
  },
  formatBadge: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  formatBadgeAlt: {
    backgroundColor: "#ffffff",
  },
  formatBadgeText: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("900"),
    color: COLORS.primary,
  },
  formatTextWrap: {
    flex: 1,
    gap: 2,
  },
  formatTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
  },
  formatHint: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
    color: "#6B7280",
  },
  modalCancel: {
    marginTop: 6,
    paddingVertical: 13,
    borderRadius: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cccccc",
  },
  modalCancelText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#374151",
  },

  receiptOffscreen: {
    position: "absolute",
    top: -10000,
    left: 0,
  },
  receiptCard: {
    width: RECEIPT_CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    overflow: "hidden",
  },
  // receiptHeader: {
  //   backgroundColor: COLORS.primary,
  //   paddingVertical: 12,
  //   paddingHorizontal: 20,
  //   alignItems: "center",
  // },
  // receiptAppName: {
  //   fontFamily: getFontFamily(900),
  //   fontSize: normalize(18),
  //   color: "#FFFFFF",
  //   letterSpacing: 0.5,
  // },
  // receiptHeaderSub: {
  //   fontFamily: getFontFamily(700),
  //   fontSize: normalize(17),
  //   color: "rgba(255,255,255,0.85)",
  //   marginTop: 2,
  // },
  // receiptStatusBlock: {
  //   alignItems: "center",
  //   paddingTop: 16,
  //   paddingBottom: 12,
  //   paddingHorizontal: 20,
  //   gap: 4,
  // },
  // receiptAmount: {
  //   fontFamily: getFontFamily(800),
  //   fontSize: normalize(25),
  //   color: "#000",
  //   marginTop: 6,
  // },
  // receiptAmountLabel: {
  //   fontSize: 13,
  //   color: "#8C8C8C",
  //   marginBottom: 6,
  // },
  // receiptAmountBlock: {
  //   alignItems: "center",
  //   paddingVertical: 24,
  // },
  receiptRowLast: {
    borderBottomWidth: 0,
  },
  // receiptMessage: {
  //   fontFamily: getFontFamily(400),
  //   fontSize: normalize(15),
  //   color: "#4B5563",
  //   textAlign: "center",
  // },
  // receiptRows: {
  //   marginHorizontal: 14,
  //   marginBottom: 12,
  //   backgroundColor: "#F9FAFB",
  //   borderRadius: 12,
  //   paddingVertical: 4,
  //   paddingHorizontal: 12,
  // },
  receiptDashedDivider: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginVertical: 10,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  // receiptRow: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "flex-start",
  //   paddingVertical: 7,
  //   columnGap: 10,
  // },
  // receiptRowLabel: {
  //   fontFamily: getFontFamily(700),
  //   fontSize: normalize(18),
  //   color: "#4B5563",
  //   flexShrink: 0,
  // },
  // receiptRowValue: {
  //   fontFamily: getFontFamily(700),
  //   fontSize: normalize(18),
  //   textAlign: "right",
  //   flex: 1,
  // },
  // receiptStatusText: {
  //   fontFamily: getFontFamily(700),
  //   fontSize: normalize(17),
  //   marginBottom: 2,
  //   textTransform: "uppercase",
  // },
  // receiptDateText: {
  //   fontFamily: getFontFamily(400),
  //   fontSize: normalize(17),
  //   color: "#8C8C8C",
  //   marginTop: 4,
  // },
  // receiptFooter: {
  //   borderTopWidth: 1,
  //   borderTopColor: "#EFEFEF",
  //   paddingVertical: 12,
  //   paddingHorizontal: 20,
  //   alignItems: "center",
  //   backgroundColor: "#FAFAFA",
  //   gap: 3,
  // },
  // receiptFooterText: {
  //   fontFamily: getFontFamily(400),
  //   fontSize: normalize(17),
  //   color: "#7b7c80",
  //   textAlign: "center",
  // },
  // receiptFooterContact: {
  //   fontFamily: getFontFamily(700),
  //   fontSize: normalize(17),
  //   color: "#1A1A1A",
  //   textAlign: "center",
  // },
  receiptHeader: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  receiptAppName: {
    fontFamily: getFontFamily(900),
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  receiptAmountBlock: {
    alignItems: "center",
    paddingVertical: 24,
  },
  receiptStatusText: {
    fontFamily: getFontFamily(700),
    fontSize: 12,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#4B5563",
  },
  receiptAmount: {
    fontFamily: getFontFamily(800),
    fontSize: 24,
    color: "#000",
    marginTop: 6,
  },
  receiptDateText: {
    fontFamily: getFontFamily(400),
    fontSize: 12,
    color: "#8C8C8C",
    marginTop: 4,
  },
  receiptRows: {
    marginHorizontal: 14,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 7,
    columnGap: 10,
  },
  receiptRowLabel: {
    fontFamily: getFontFamily(400),
    fontSize: 12,
    color: "#4B5563",
    flexShrink: 0,
  },
  receiptRowValue: {
    fontFamily: getFontFamily(700),
    fontSize: 12,
    textAlign: "right",
    flex: 1,
  },
  receiptFooter: {
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    gap: 3,
  },
  receiptFooterText: {
    fontFamily: getFontFamily(400),
    fontSize: 11,
    color: "#7b7c80",
    textAlign: "center",
  },
  receiptFooterContact: {
    fontFamily: getFontFamily(700),
    fontSize: 12,
    color: "#1A1A1A",
    textAlign: "center",
  },
});

export default TransactionDetailScreen;
