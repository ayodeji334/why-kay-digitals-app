// import React, { useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   RefreshControl,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useNavigation } from "@react-navigation/native";
// import CustomLoading from "../components/CustomLoading";
// import { SelectInput } from "../components/SelectInputField";
// import { formatAmount, formatNumber } from "../libs/formatNumber";
// import { formatWithCommas } from "./SwapCryptoScreen";
// import { showError } from "../utlis/toast";
// import { COLORS } from "../constants/colors";
// import { getFontFamily, normalize } from "../constants/settings";
// import { useAssets } from "../hooks/useAssets";

// export type TradeIntent = {
//   assetId?: string;
//   symbol?: string;
//   action?: "buy" | "sell";
//   source?: "rates";
//   amount?: string;
//   rate?: number;
// };

// export default function CryptoRatesScreen() {
//   const navigation: any = useNavigation();
//   const [activeTab, setActiveTab] = useState<"buy" | "sell">("sell");
//   const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
//   const [amount, setAmount] = useState("");
//   const { assets, isRefetching, refetch, isLoading } = useAssets();

//   const cryptoOptions = useMemo(() => {
//     if (!Array.isArray(assets)) return [];

//     return assets.map((asset: any) => ({
//       id: asset.id,
//       value: asset.id,
//       label: `${asset.name}`,
//       symbol: asset.symbol,
//       logo_url: asset.logo_url,
//       market_value: Number(asset.market_current_value),

//       rates: [
//         {
//           type: "buy",
//           default_value: Number(asset.buy_rate),
//         },
//         {
//           type: "sell",
//           default_value: Number(asset.sell_rate),
//         },
//       ],

//       is_buy_enabled: asset.buy_rate > 0,
//       is_sell_enabled: asset.sell_rate > 0,
//     }));
//   }, [assets]);

//   /* -------------------- SELECTED CRYPTO -------------------- */
//   const crypto = useMemo(() => {
//     if (!selectedCrypto) return null;
//     return cryptoOptions.find(option => option.value === selectedCrypto);
//   }, [cryptoOptions, selectedCrypto]);

//   /* -------------------- EXCHANGE RATE -------------------- */
//   const exchangeRate = useMemo(() => {
//     if (!crypto || !amount) return 0;

//     const rateType = activeTab === "sell" ? "buy" : "sell";
//     const rate: any = crypto.rates?.find((r: any) => r.type === rateType);
//     if (!rate) return 0;

//     const amountNum = parseFloat(amount);
//     if (isNaN(amountNum)) return 0;

//     if (Array.isArray(rate.categories)) {
//       const category = rate.categories.find((cat: any) => {
//         const min = Number(cat.min_amount);
//         const max = Number(cat.max_amount);
//         return amountNum >= min && amountNum < max;
//       });

//       if (category) return Number(category.value);
//     }

//     return Number(rate.default_value);
//   }, [crypto, amount, activeTab]);

//   /* -------------------- EXPECTED NGN -------------------- */
//   const currentRate = useMemo(() => {
//     if (!amount || !exchangeRate) return 0;

//     const amountNum = parseFloat(amount);
//     if (isNaN(amountNum)) return 0;

//     return amountNum * exchangeRate;
//   }, [amount, exchangeRate]);

//   /* -------------------- COIN ESTIMATE -------------------- */
//   const coinAmount = useMemo(() => {
//     if (!crypto || !amount) return 0;

//     const amountNum = parseFloat(amount);
//     const marketValue = Number(crypto.market_value);

//     if (isNaN(amountNum) || isNaN(marketValue) || marketValue === 0) {
//       return 0;
//     }

//     return amountNum / marketValue;
//   }, [crypto, amount]);

//   const appliedRate = useMemo(() => {
//     if (!crypto || !amount) return null;

//     const amountNum = Number(amount);
//     if (isNaN(amountNum) || amountNum <= 0) return null;

//     const rateType = activeTab === "sell" ? "buy" : "sell";
//     const rate: any = crypto.rates?.find((r: any) => r.type === rateType);
//     if (!rate) return null;

//     if (Array.isArray(rate.categories)) {
//       const category = rate.categories.find((cat: any) => {
//         const min = Number(cat.min_amount);
//         const max = Number(cat.max_amount);
//         return amountNum >= min && amountNum < max;
//       });

//       if (category) {
//         return {
//           source: "category",
//           label: category.label,
//           value: Number(category.value),
//         };
//       }
//     }

//     return {
//       source: "base",
//       value: Number(rate.default_value),
//     };
//   }, [crypto, amount, activeTab]);

//   /* -------------------- ACTION -------------------- */
//   const onPress = () => {
//     if (!crypto) {
//       showError("Please select an asset");
//       return;
//     }

//     const intent: TradeIntent = {
//       assetId: crypto.value,
//       symbol: crypto.symbol,
//       action: activeTab,
//       source: "rates",
//       amount,
//       rate: currentRate,
//     };

//     navigation.navigate(activeTab === "buy" ? "BuyCrypto" : "SellCrypto", {
//       intent,
//     });
//   };

//   return (
//     <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
//       <ScrollView
//         contentContainerStyle={{ padding: 16 }}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefetching}
//             onRefresh={refetch}
//             colors={[COLORS.primary]}
//           />
//         }
//       >
//         <View style={styles.tabs}>
//           {["sell", "buy"].map(tab => (
//             <TouchableOpacity
//               key={tab}
//               style={[styles.tab, activeTab === tab && styles.activeTab]}
//               onPress={() => setActiveTab(tab as "buy" | "sell")}
//             >
//               <Text
//                 style={
//                   activeTab === tab
//                     ? styles.activeTabText
//                     : styles.inactiveTabText
//                 }
//               >
//                 {tab === "sell" ? "Sell Rates" : "Buy Rates"}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <SelectInput
//           label="Cryptocurrency"
//           options={cryptoOptions}
//           value={selectedCrypto}
//           onChange={setSelectedCrypto}
//           title="Select an asset Wallet"
//           placeholder="Select an asset wallet"
//         />

//         <View style={{ marginTop: 12 }}>
//           <Text style={styles.label}>Amount in USD ($)</Text>
//           <View style={styles.inputContainer}>
//             <Text style={styles.dollarSign}>$</Text>
//             <TextInput
//               style={styles.input}
//               keyboardType="numeric"
//               placeholder="0.00"
//               value={amount}
//               onChangeText={text => setAmount(formatWithCommas(text))}
//             />
//           </View>
//         </View>

//         {/* Expected */}
//         <View style={{ marginVertical: 12 }}>
//           <Text style={styles.label}>Expected Amount (₦)</Text>
//           <View style={styles.rateBox}>
//             <Text style={styles.rateText}>
//               {formatAmount(currentRate, false, "NGN")}
//             </Text>
//           </View>
//         </View>

//         {crypto && amount && parseFloat(amount) > 0 && (
//           <View style={styles.infoContainer}>
//             <InfoRow
//               label="Exchange Rate"
//               value={`$1 = ${formatAmount(exchangeRate)}`}
//             />

//             {appliedRate && (
//               <InfoRow
//                 label="Rate Used"
//                 value={`${formatAmount(appliedRate.value)}`}
//               />
//             )}

//             <InfoRow
//               label={`Estimated ${crypto.symbol}`}
//               value={`${formatNumber(coinAmount, false, 8)} ${crypto.symbol}`}
//             />
//           </View>
//         )}

//         <TouchableOpacity
//           onPress={onPress}
//           style={styles.tradeButton}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.tradeButtonText}>Trade Crypto</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       <CustomLoading loading={isLoading} />
//     </SafeAreaView>
//   );
// }

// /* -------------------- SMALL PURE COMPONENT -------------------- */
// const InfoRow = ({ label, value }: { label: string; value: string }) => (
//   <View style={styles.infoRow}>
//     <Text style={styles.infoLabel}>{label}</Text>
//     <Text style={styles.infoValue}>{value}</Text>
//   </View>
// );

// /* -------------------- STYLES (UNCHANGED) -------------------- */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   tabs: {
//     flexDirection: "row",
//     marginBottom: 16,
//     backgroundColor: "#F3F4F6",
//     padding: 5,
//     borderRadius: 1000,
//     top: -15,
//   },
//   tab: { flex: 1, padding: 10, alignItems: "center" },
//   activeTab: { backgroundColor: COLORS.primary, borderRadius: 800 },
//   activeTabText: {
//     color: "#fff",
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("700"),
//   },
//   inactiveTabText: {
//     color: "#374151",
//     fontFamily: getFontFamily("800"),
//     fontSize: normalize(18),
//   },
//   label: {
//     marginBottom: 6,
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("700"),
//     color: "#000",
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//     borderRadius: 8,
//   },
//   dollarSign: {
//     fontSize: normalize(26),
//     fontFamily: getFontFamily("800"),
//     paddingLeft: 12,
//   },
//   input: {
//     flex: 1,
//     paddingVertical: normalize(16),
//     fontSize: normalize(26),
//     fontFamily: getFontFamily("900"),
//   },
//   rateBox: {
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//     borderRadius: 8,
//     padding: 12,
//   },
//   rateText: {
//     fontSize: normalize(28),
//     fontFamily: getFontFamily("800"),
//   },
//   infoContainer: {
//     backgroundColor: "#5AB2431A",
//     padding: 12,
//     borderRadius: 8,
//     marginVertical: 12,
//     borderWidth: 1,
//     borderColor: "#E9ECEF",
//   },
//   infoRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },
//   infoLabel: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("700"),
//   },
//   infoValue: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("800"),
//     color: COLORS.primary,
//   },
//   tradeButton: {
//     backgroundColor: COLORS.secondary,
//     padding: 16,
//     borderRadius: 120,
//     alignItems: "center",
//     marginVertical: 16,
//   },
//   tradeButtonText: {
//     color: "#fff",
//     fontFamily: getFontFamily("900"),
//     fontSize: normalize(18),
//   },
// });
// Rewrite the screeen logic without using useEffect
// import React, { useState, useEffect, useMemo } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   RefreshControl,
// } from "react-native";
// import CustomLoading from "../components/CustomLoading";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { getFontFamily, normalize } from "../constants/settings";
// import { COLORS } from "../constants/colors";
// import { SelectInput } from "../components/SelectInputField";
// import { formatAmount, formatNumber } from "../libs/formatNumber";
// import { useNavigation } from "@react-navigation/native";
// import { formatWithCommas } from "./SwapCryptoScreen";
// import { showError } from "../utlis/toast";
// import { useAssets } from "../hooks/useAssets";

// export type TradeIntent = {
//   assetId?: string;
//   symbol?: string;
//   action?: "buy" | "sell" | "deposit" | "withdraw";
//   source?: "home" | "rates" | "wallet";
//   amount?: string;
//   rate?: number;
//   asset?: any;
// };

// export default function CryptoRatesScreen() {
//   const [activeTab, setActiveTab] = useState("sell");
//   const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
//   const [amount, setAmount] = useState("");
//   const [cryptoOptions, setCryptoOptions] = useState<Array<any>>([]);
//   const navigation: any = useNavigation();
//   const { assets: wallets, isRefetching, refetch, isLoading } = useAssets();

//   const crypto: any = cryptoOptions.find(
//     (c: any) => c.value === selectedCrypto,
//   );

//   // Calculate exchange rate (USD to NGN)
//   const exchangeRate: number = useMemo(() => {
//     if (!selectedCrypto || !crypto?.rates) return 0;

//     const rate = crypto.rates.find((r: any) =>
//       activeTab === "sell" ? r.type === "buy" : r.type === "sell",
//     );

//     if (!rate) return 0;

//     // Check for category-specific rates based on amount
//     if (amount) {
//       const amountNum = parseFloat(amount);
//       if (!isNaN(amountNum) && rate.categories && rate.categories.length > 0) {
//         const category = rate.categories.find(
//           (cat: any) =>
//             amountNum >= parseFloat(cat.min_amount) &&
//             amountNum < parseFloat(cat.max_amount),
//         );

//         if (category) {
//           return parseFloat(category.value);
//         }
//       }
//     }

//     // Return default rate
//     return parseFloat(rate.default_value);
//   }, [amount, crypto, activeTab, selectedCrypto]);

//   // Calculate current rate (total NGN value)
//   const currentRate: number = useMemo(() => {
//     if (!amount || !selectedCrypto) return 0;

//     if (!crypto || !crypto.rates) return 0;

//     const amountNum = parseFloat(amount);
//     if (isNaN(amountNum)) return 0;

//     const rate = crypto.rates.find((r: any) =>
//       activeTab === "sell" ? r.type === "buy" : r.type === "sell",
//     );

//     if (!rate) return 0;

//     const category = rate.categories.find(
//       (cat: any) =>
//         amountNum >= parseFloat(cat.min_amount) &&
//         amountNum < parseFloat(cat.max_amount),
//     );

//     const rateValue = category
//       ? parseFloat(category.value)
//       : parseFloat(rate.default_value);

//     return amountNum * rateValue;
//   }, [amount, crypto, activeTab]);

//   const coinAmount = useMemo(() => {
//     if (!amount) return 0;

//     if (!crypto || !crypto.market_value) return 0;

//     const amountNum = parseFloat(amount);
//     const marketValueNum = parseFloat(crypto.market_value);

//     if (isNaN(amountNum) || isNaN(marketValueNum) || marketValueNum === 0)
//       return 0;

//     return amountNum / marketValueNum;
//   }, [amount, crypto]);

//   // const {
//   //   data: { wallets },
//   //   isLoading,
//   //   refetch,
//   //   isRefetching,
//   // } = useWallets();

//   const getRateForCrypto = useMemo(() => {
//     if (!selectedCrypto || !wallets) return 0;

//     const crypto = wallets.find((asset: any) => asset.name === selectedCrypto);
//     if (!crypto) return 0;

//     const rateType = activeTab === "sell" ? "sell" : "buy";
//     const rates = crypto.rates.filter((rate: any) => rate.type === rateType);

//     if (rates.length === 0) return 0;

//     // Use the latest rate (assuming higher ID means more recent)
//     const latestRate = rates.reduce((latest: any, current: any) =>
//       current.id > latest.id ? current : latest,
//     );

//     // If amount is provided, check for category-specific rates
//     if (amount) {
//       const amountNum = parseFloat(amount);
//       if (
//         !isNaN(amountNum) &&
//         latestRate.categories &&
//         latestRate.categories.length > 0
//       ) {
//         const matchingCategory = latestRate.categories.find((category: any) => {
//           const min = parseFloat(category.min_amount);
//           const max = parseFloat(category.max_amount);
//           return amountNum >= min && amountNum <= max;
//         });

//         if (matchingCategory) {
//           return parseFloat(matchingCategory.value);
//         }
//       }
//     }

//     // Return default value if no category matches or no amount provided
//     return parseFloat(latestRate.default_value);
//   }, [selectedCrypto, activeTab, amount, wallets]);

//   const appliedRate = useMemo(() => {
//     if (!crypto || !amount) return null;

//     const amountNum = Number(amount);
//     if (isNaN(amountNum) || amountNum <= 0) return null;

//     const rate = crypto.rates?.find(
//       (r: any) => r.type === (activeTab === "sell" ? "buy" : "sell"),
//     );

//     if (!rate) return null;

//     if (Array.isArray(rate.categories) && rate.categories.length > 0) {
//       const matchedCategory = rate.categories.find((cat: any) => {
//         const min = Number(cat.min_amount);
//         const max = Number(cat.max_amount);

//         return amountNum >= min && amountNum < max;
//       });

//       if (matchedCategory) {
//         return {
//           source: "category",
//           label: matchedCategory.label,
//           min: matchedCategory.min_amount,
//           max: matchedCategory.max_amount,
//           value: Number(matchedCategory.value),
//         };
//       }
//     }

//     // fallback to base rate
//     return {
//       source: "base",
//       value: Number(rate.value),
//     };
//   }, [crypto, amount, activeTab]);

//   const onPress = () => {
//     if (!selectedCrypto || !crypto) {
//       showError("Please select an asset");
//       return;
//     }

//     const intent: TradeIntent = {
//       assetId: crypto?.value,
//       symbol: crypto?.symbol,
//       action: activeTab === "buy" ? "buy" : "sell",
//       source: "rates",
//       amount: amount,
//       rate: currentRate,
//     };

//     if (activeTab === "buy") {
//       navigation.navigate("BuyCrypto", { intent });
//     } else {
//       navigation.navigate("SellCrypto", { intent });
//     }
//   };

//   useEffect(() => {
//     if (Array.isArray(wallets)) {
//       const options = wallets.map((asset: any) => ({
//         id: asset.asset_id,
//         value: asset.asset_id,
//         label: asset.asset_name,
//         symbol: asset.symbol,
//         logo_url: asset.logo_url,
//         balance: asset.market_price ?? 0,
//         rate: parseFloat(asset?.sell_rate ?? 0),
//         change: Math.random() > 0.5 ? "up" : "down",
//         changePercentage: (Math.random() * 20 - 10).toFixed(2),
//         rates: asset.rates,
//         market_value: asset?.market_price,
//         is_buy_enabled: asset.is_buy_enabled,
//         is_sell_enabled: asset.is_sell_enabled,
//       }));

//       setCryptoOptions(options);

//       if (!selectedCrypto && options.length > 0) {
//         setSelectedCrypto(options[0].label);
//       }
//     }
//   }, [JSON.stringify(wallets)]);

//   useEffect(() => {
//     if (cryptoOptions.length > 0) {
//       const updatedOptions = cryptoOptions.map((option: any) => ({
//         ...option,
//         rate: getRateForCrypto,
//       }));

//       setCryptoOptions(updatedOptions);
//     }
//   }, [getRateForCrypto, JSON.stringify(cryptoOptions)]);

//   return (
//     <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
//       <ScrollView
//         contentContainerStyle={{ padding: 16 }}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefetching}
//             onRefresh={() => refetch()}
//             colors={["#E89E00"]}
//           />
//         }
//       >
//         <View style={styles.tabs}>
//           {["sell", "buy"].map(tab => (
//             <TouchableOpacity
//               key={tab}
//               style={[styles.tab, activeTab === tab ? styles.activeTab : {}]}
//               onPress={() => setActiveTab(tab)}
//             >
//               <Text
//                 style={
//                   activeTab === tab
//                     ? styles.activeTabText
//                     : styles.inactiveTabText
//                 }
//               >
//                 {tab === "sell" ? "Sell Rates" : "Buy Rates"}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <SelectInput
//           label="Cryptocurrency"
//           options={cryptoOptions}
//           onChange={setSelectedCrypto}
//           title="Select an asset Wallet"
//           placeholder="Select an asset wallet"
//         />

//         <View style={{ marginBottom: 2, marginTop: 10 }}>
//           <Text style={styles.label}>Amount in USD ($)</Text>
//           <View style={styles.inputContainer}>
//             <Text style={styles.dollarSign}>$</Text>
//             <TextInput
//               style={styles.input}
//               keyboardType="numeric"
//               placeholderTextColor={"#aeaeaeff"}
//               placeholder="0.00"
//               value={amount}
//               onChangeText={text => {
//                 const formatted = formatWithCommas(text);

//                 setAmount(formatted);
//               }}
//             />
//           </View>
//         </View>

//         {/* Expected Amount Section */}
//         <View style={{ marginVertical: 12 }}>
//           <Text style={styles.label}>Expected Amount (₦)</Text>
//           <View style={styles.rateBox}>
//             <Text style={styles.rateText}>
//               {formatAmount(currentRate, false, "NGN")}
//             </Text>
//           </View>
//         </View>

//         {/* Exchange Rate Information */}
//         {selectedCrypto && amount && parseFloat(amount) > 0 && (
//           <View style={styles.infoContainer}>
//             {/* Exchange Rate */}
//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Exchange Rate:</Text>
//               <Text style={styles.infoValue}>
//                 $1 = {formatAmount(exchangeRate)}
//               </Text>
//             </View>

//             {/* Rate Category */}
//             {appliedRate && (
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Rate Category:</Text>
//                 <Text style={styles.infoValue}>
//                   {appliedRate.source === "category"
//                     ? appliedRate.label
//                     : "Default rate"}
//                 </Text>
//               </View>
//             )}

//             {/* Rate Used */}
//             {appliedRate && (
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Rate Used:</Text>
//                 <Text style={styles.infoValue}>
//                   ₦{formatAmount(appliedRate.value)}
//                 </Text>
//               </View>
//             )}

//             {/* Estimated Crypto */}
//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Estimated {crypto?.symbol}:</Text>
//               <Text style={styles.infoValue}>
//                 {formatNumber(coinAmount, false, 8)} {crypto?.symbol}
//               </Text>
//             </View>
//           </View>
//         )}

//         <TouchableOpacity
//           onPress={onPress}
//           activeOpacity={0.8}
//           style={styles.tradeButton}
//         >
//           <Text style={styles.tradeButtonText}>Trade Crypto</Text>
//         </TouchableOpacity>
//         <Text
//           style={[
//             styles.label,
//             { textAlign: "center", fontFamily: getFontFamily("400") },
//           ]}
//         >
//           Note: This is an estimated rate. Actual rate may differ.
//         </Text>
//       </ScrollView>

//       <CustomLoading loading={isLoading} />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   tabs: {
//     flexDirection: "row",
//     marginBottom: 16,
//     backgroundColor: "#F3F4F6",
//     padding: 5,
//     borderRadius: 1000,
//     top: -15,
//   },
//   tab: { flex: 1, padding: 10, alignItems: "center" },
//   activeTab: { backgroundColor: COLORS.primary, borderRadius: 800 },
//   activeTabText: {
//     color: "#fff",
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("800"),
//   },
//   inactiveTabText: {
//     color: "#374151",
//     fontFamily: getFontFamily("800"),
//     fontSize: normalize(18),
//   },
//   label: {
//     marginBottom: 6,
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("700"),
//     color: "#000000ff",
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//     borderRadius: 8,
//     gap: 5,
//   },
//   dollarSign: {
//     fontSize: normalize(26),
//     fontFamily: getFontFamily("800"),
//     color: "#000",
//     paddingLeft: 15,
//   },
//   input: {
//     flex: 1,
//     paddingVertical: normalize(16),
//     fontSize: normalize(26),
//     fontFamily: getFontFamily("900"),
//     color: "#000",
//   },
//   // input: {
//   //   width: "100%",
//   //   paddingVertical: 10,
//   //   color: "#1A1A1A",
//   //   fontFamily: getFontFamily("700"),
//   //   fontSize: normalize(28),
//   //   backgroundColor: "#FFFFFF",
//   // },
//   infoContainer: {
//     backgroundColor: "#5AB2431A",
//     padding: 12,
//     borderRadius: 8,
//     marginVertical: 12,
//     borderWidth: 1,
//     borderColor: "#E9ECEF",
//   },
//   infoRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   infoLabel: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("700"),
//     color: "#000",
//   },
//   infoValue: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("800"),
//     color: COLORS.primary,
//   },
//   rateBreakdownRow: {
//     marginTop: 8,
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: "#DEE2E6",
//   },
//   rateBreakdownText: {
//     fontSize: normalize(14),
//     fontFamily: getFontFamily("500"),
//     color: "#6C757D",
//     fontStyle: "italic",
//     textAlign: "center",
//   },
//   coinEquivalentContainer: {
//     marginTop: 8,
//     padding: 8,
//     backgroundColor: "rgba(232, 158, 0, 0.1)",
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   coinEquivalentText: {
//     fontSize: normalize(16),
//     fontFamily: getFontFamily("700"),
//     color: COLORS.primary,
//   },
//   dropdownButton: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 12,
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//     borderRadius: 8,
//   },
//   dropdownList: {
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//     borderRadius: 8,
//     marginTop: 4,
//   },
//   dropdownItem: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E7EB",
//   },
//   rateBox: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//   },
//   rateText: {
//     fontSize: normalize(28),
//     fontFamily: getFontFamily("800"),
//     color: "#111827",
//   },
//   tradeButton: {
//     backgroundColor: COLORS.secondary,
//     padding: 16,
//     borderRadius: 120,
//     alignItems: "center",
//     marginVertical: 16,
//   },
//   tradeButtonText: {
//     color: "#fff",
//     fontFamily: getFontFamily("900"),
//     fontSize: normalize(18),
//   },
//   bottomNav: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingVertical: 12,
//     borderTopWidth: 1,
//     borderTopColor: "#E5E7EB",
//     backgroundColor: "#fff",
//   },
//   navItem: { alignItems: "center" },
//   navText: { fontSize: normalize(12), color: "#6B7280" },
// });
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
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
import { useNavigation } from "@react-navigation/native";
import useAxios from "../hooks/useAxios";
import { formatWithCommas } from "./SwapCryptoScreen";
import { showError } from "../utlis/toast";

export type TradeIntent = {
  assetId?: string;
  symbol?: string;
  action?: "buy" | "sell" | "deposit" | "withdraw";
  source?: "home" | "rates" | "wallet";
  amount?: string;
  rate?: number;
};

export default function CryptoRatesScreen() {
  const [activeTab, setActiveTab] = useState("sell");
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [cryptoOptions, setCryptoOptions] = useState<Array<any>>([]);
  const { apiGet } = useAxios();
  const navigation: any = useNavigation();

  const crypto: any = cryptoOptions.find(
    (c: any) => c.value === selectedCrypto,
  );

  // Calculate exchange rate (USD to NGN)
  const exchangeRate: number = useMemo(() => {
    if (!selectedCrypto || !crypto?.rates) return 0;

    const rate = crypto.rates.find((r: any) =>
      activeTab === "sell" ? r.type === "buy" : r.type === "sell",
    );

    if (!rate) return 0;

    // Check for category-specific rates based on amount
    if (amount) {
      const amountNum = parseFloat(amount);

      if (!isNaN(amountNum) && rate.categories && rate.categories.length > 0) {
        const category = rate.categories.find(
          (cat: any) =>
            amountNum >= parseFloat(cat.min_amount) &&
            amountNum < parseFloat(cat.max_amount),
        );

        if (category) {
          return parseFloat(category.value);
        }
      }
    }

    // Return default rate
    return parseFloat(rate.default_value);
  }, [amount, crypto, activeTab, selectedCrypto]);

  // Calculate current rate (total NGN value)
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
        const res = await apiGet("/crypto-assets/available/rates");
        return res?.data?.data ?? [];
      } catch (error) {
        throw error;
      }
    },
  });

  const getRateForCrypto = useMemo(() => {
    if (!selectedCrypto || !data?.assets) return 0;

    const crypto = data.find((asset: any) => asset.name === selectedCrypto);
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

  const appliedRate = useMemo(() => {
    if (!crypto || !amount) return null;

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) return null;

    const rate = crypto.rates?.find(
      (r: any) => r.type === (activeTab === "sell" ? "buy" : "sell"),
    );

    if (!rate) return null;

    if (Array.isArray(rate.categories) && rate.categories.length > 0) {
      const matchedCategory = rate.categories.find((cat: any) => {
        const min = Number(cat.min_amount);
        const max = Number(cat.max_amount);

        return amountNum >= min && amountNum < max;
      });

      if (matchedCategory) {
        return {
          source: "category",
          label: matchedCategory.label,
          min: matchedCategory.min_amount,
          max: matchedCategory.max_amount,
          value: Number(matchedCategory.value),
        };
      }
    }

    // fallback to base rate
    return {
      source: "base",
      value: Number(rate.value),
    };
  }, [crypto, amount, activeTab]);

  const onPress = () => {
    if (!selectedCrypto || !crypto) {
      showError("Please select an asset");
      return;
    }

    const intent: TradeIntent = {
      assetId: crypto?.value,
      symbol: crypto?.symbol,
      action: activeTab === "buy" ? "buy" : "sell",
      source: "rates",
      amount: amount,
      rate: currentRate,
    };

    if (activeTab === "buy") {
      navigation.navigate("BuyCrypto", { intent });
    } else {
      navigation.navigate("SellCrypto", { intent });
    }
  };

  useEffect(() => {
    if (Array.isArray(data)) {
      const options = data.map((asset: any) => ({
        id: asset.uuid,
        value: asset.uuid,
        label: asset.name,
        symbol: asset.symbol,
        logo_url: asset.logo_url,
        balance: parseFloat(asset.market_current_value ?? 0),
        rate: parseFloat(
          asset.rates?.find((r: any) => r.type === "sell")?.default_value ?? 0,
        ),
        change: Math.random() > 0.5 ? "up" : "down",
        changePercentage: (Math.random() * 20 - 10).toFixed(2),
        rates: asset.rates,
        market_value: parseFloat(asset.market_current_value ?? 0),
        is_buy_enabled: asset.is_buy_enabled,
        is_sell_enabled: asset.is_sell_enabled,
      }));

      setCryptoOptions(options);

      if (!selectedCrypto && options.length > 0) {
        setSelectedCrypto(options[0].value); // ✅ use uuid consistently
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
          title="Select an asset Wallet"
          placeholder="Select an asset wallet"
        />

        <View style={{ marginBottom: 2, marginTop: 10 }}>
          <Text style={styles.label}>Amount in USD ($)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholderTextColor={"#aeaeaeff"}
              placeholder="0.00"
              value={amount}
              onChangeText={text => {
                const formatted = formatWithCommas(text);

                setAmount(formatted);
              }}
            />
          </View>
        </View>

        <View style={{ marginVertical: 12 }}>
          <Text style={styles.label}>Expected Amount (₦)</Text>
          <View style={styles.rateBox}>
            <Text style={styles.rateText}>
              {formatAmount(currentRate, false, "NGN")}
            </Text>
          </View>
        </View>

        {selectedCrypto && amount && parseFloat(amount) > 0 && (
          <View style={styles.infoContainer}>
            {/* Exchange Rate */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Exchange Rate:</Text>
              <Text style={styles.infoValue}>
                $1 = {formatAmount(exchangeRate)}
              </Text>
            </View>

            {/* Rate Category */}
            {appliedRate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Rate Category:</Text>
                <Text style={styles.infoValue}>
                  {appliedRate.source === "category"
                    ? appliedRate.label
                    : "Default rate"}
                </Text>
              </View>
            )}

            {/* Rate Used */}
            {appliedRate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Rate Used:</Text>
                <Text style={styles.infoValue}>
                  {formatAmount(appliedRate.value)}
                </Text>
              </View>
            )}

            {/* Estimated Crypto */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimated {crypto?.symbol}:</Text>
              <Text style={styles.infoValue}>
                {formatNumber(coinAmount, false, 8)} {crypto?.symbol}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
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
    fontFamily: getFontFamily("900"),
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
    color: COLORS.primary,
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
    borderColor: "#D1D5DB",
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
