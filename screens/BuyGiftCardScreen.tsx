// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   RefreshControl,
//   ActivityIndicator,
// } from "react-native";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as Yup from "yup";
// import { useNavigation } from "@react-navigation/native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { getAllCountries, FlagType } from "react-native-country-picker-modal";

// import { getFontFamily, normalize } from "../constants/settings";
// import { COLORS } from "../constants/colors";
// import { formatAmount } from "../libs/formatNumber";
// import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
// import { useFiatBalance } from "../hooks/useFiatBalance";
// import { showError } from "../utlis/toast";
// import useAxios from "../hooks/useAxios";
// import { AppText } from "../components/AppText";
// import CountryPicker from "../components/CountryPicker";
// import { Country } from "../libs/types";
// import { SelectInput } from "../components/SelectInputField";
// import { useResetFormOnMount } from "../hooks/useResetFormOnMount";

// interface GiftCardOffer {
//   offerId: string;
//   brand: string;
//   brandName: string;
//   priceType: "FIXED" | "RANGE";
//   send: {
//     currency: string;
//     currencyDivisor: number;
//     fixed?: number;
//     min?: number;
//     max?: number;
//   };
//   cost: {
//     currency: string;
//     currencyDivisor: number;
//     fixed?: number;
//     fx?: number;
//     fee: number;
//     feePct: number;
//     discount: number;
//   };
//   price: {
//     currency: string;
//     currencyDivisor: number;
//     fixed?: number;
//     fx?: number;
//     fee: number;
//     feePct: number;
//     discount: number;
//   };
//   logoUrl?: string;
//   requiredFields: string[];
// }

// // SelectInput option shape extended with gift card display fields.
// // market_value drives the built-in USD price subtitle in SelectInput.
// // _raw carries the full offer so we can recover it inside onSelect.
// interface GiftCardSelectOption {
//   value: string;
//   label: string;
//   logo_url?: string;
//   market_value?: number;
//   _raw: GiftCardOffer;
// }

// const schema = Yup.object().shape({
//   offerId: Yup.string().required("Please select a gift card"),
//   usdAmount: Yup.number()
//     .typeError("Enter a valid amount")
//     .min(1, "Minimum amount is $1")
//     .required("Amount is required"),
//   quantity: Yup.number()
//     .typeError("Enter a valid quantity")
//     .min(1, "Minimum quantity is 1")
//     .integer("Quantity must be a whole number")
//     .required("Quantity is required"),
// });

// const fromDivisor = (value: number, divisor: number) => value / divisor;

// // Compute the full cost breakdown the customer sees before confirming.
// function calcBreakdown(
//   offer: GiftCardOffer,
//   usdAmount: number,
//   quantity: number,
//   exchangeRate: number,
// ) {
//   const divisor = offer.price.currencyDivisor;

//   // Unit cost in USD we pay Zendit
//   let unitCostUsd = 0;
//   if (offer.priceType === "FIXED" && offer.price.fixed != null) {
//     unitCostUsd = fromDivisor(offer.price.fixed, divisor);
//   } else if (offer.priceType === "RANGE" && offer.price.fx != null) {
//     unitCostUsd = usdAmount * offer.price.fx;
//   }

//   const feePerUnitUsd = fromDivisor(offer.price.fee, divisor);
//   const totalCostUsd = (unitCostUsd + feePerUnitUsd) * quantity;
//   const platformMargin = 0; // 1.5% platform margin
//   const platformFeeUsd = totalCostUsd * platformMargin;
//   const customerUsdTotal = totalCostUsd + platformFeeUsd;
//   const customerNgnTotal = customerUsdTotal * exchangeRate;

//   // Face value the recipient actually receives
//   const faceValueUsd =
//     offer.priceType === "FIXED" && offer.send.fixed != null
//       ? fromDivisor(offer.send.fixed, offer.send.currencyDivisor) * quantity
//       : usdAmount * quantity;

//   return {
//     unitCostUsd,
//     feePerUnitUsd,
//     totalCostUsd,
//     platformFeeUsd,
//     platformMargin,
//     customerUsdTotal,
//     customerNgnTotal,
//     faceValueUsd,
//     exchangeRate,
//   };
// }

// // Map a GiftCardOffer into the shape SelectInput expects.
// // market_value → face value in USD, rendered as the price subtitle per row.
// function offerToOption(offer: GiftCardOffer): GiftCardSelectOption {
//   const faceValueUsd =
//     offer.priceType === "FIXED" && offer.send.fixed != null
//       ? fromDivisor(offer.send.fixed, offer.send.currencyDivisor)
//       : offer.priceType === "RANGE" && offer.send.min != null
//       ? fromDivisor(offer.send.min, offer.send.currencyDivisor)
//       : undefined;

//   return {
//     value: offer.offerId,
//     label: offer.brandName?.toUpperCase(),
//     logo_url: offer.logoUrl,
//     market_value: faceValueUsd,
//     _raw: offer,
//   };
// }

// const REGION_OPTIONS = [
//   { label: "Global", value: "Global" },
//   { label: "Africa", value: "Africa" },
//   { label: "Asia", value: "Asia" },
//   { label: "Caribbean", value: "Caribbean" },
//   { label: "Central America", value: "Central America" },
//   { label: "Eastern Europe", value: "Eastern Europe" },
//   {
//     label: "Middle East and North Africa",
//     value: "Middle East and North Africa",
//   },
//   { label: "North America", value: "North America" },
//   { label: "Oceania", value: "Oceania" },
//   { label: "South America", value: "South America" },
//   { label: "South Asia", value: "South Asia" },
//   { label: "Southeast Asia", value: "Southeast Asia" },
//   { label: "Western Europe", value: "Western Europe" },
// ];

// const FieldBlock = ({
//   label,
//   hint,
//   showHint = true,
//   error,
//   children,
// }: {
//   label: string;
//   hint?: string;
//   showHint?: boolean;
//   error?: string;
//   children: React.ReactNode;
// }) => (
//   <View style={styles.fieldBlock}>
//     <AppText style={styles.fieldLabel}>{label}</AppText>
//     {showHint && hint && <AppText style={styles.fieldHint}>{hint}</AppText>}
//     {children}
//     {error && <AppText style={styles.errorText}>{error}</AppText>}
//   </View>
// );

// // A single row inside the cost breakdown card.
// const BreakdownRow = ({
//   label,
//   value,
//   bold,
// }: {
//   label: string;
//   value: string;
//   bold?: boolean;
// }) => (
//   <View style={styles.breakdownRow}>
//     <AppText style={[styles.breakdownLabel, bold && styles.breakdownBold]}>
//       {label}
//     </AppText>
//     <AppText style={[styles.breakdownValue, bold && styles.breakdownBold]}>
//       {value}
//     </AppText>
//   </View>
// );

// export default function BuyGiftCardScreen() {
//   const { apiGet } = useAxios();
//   const navigation: any = useNavigation();
//   const { fiatBalance } = useFiatBalance();

//   const [countries, setCountries] = useState<Country[]>([]);
//   const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();
//   const [selectedRegion, setSelectedRegion] = useState<string | undefined>();
//   const [offers, setOffers] = useState<GiftCardOffer[]>([]);
//   const [selectedOffer, setSelectedOffer] = useState<
//     GiftCardOffer | undefined
//   >();
//   const [exchangeRate, setExchangeRate] = useState<number>(0);
//   const [displayAmount, setDisplayAmount] = useState("");
//   const [refreshing, setRefreshing] = useState(false);
//   const [loadingOffers, setLoadingOffers] = useState(false);
//   const [loadingRate, setLoadingRate] = useState(false);

//   const {
//     control,
//     handleSubmit,
//     setValue,
//     watch,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: { offerId: "", usdAmount: 0, quantity: 1 },
//     mode: "onChange",
//   });

//   const usdAmount: number = watch("usdAmount");
//   const quantity: number = watch("quantity") ?? 1;

//   useEffect(() => {
//     (async () => {
//       const all = await getAllCountries(FlagType.FLAT);
//       setCountries(all);

//       const defaultCountry = all.find(c => c.cca2 === "US");
//       if (defaultCountry) {
//         setSelectedCountry(defaultCountry);
//       }
//     })();
//   }, []);

//   // Load offers
//   // Wrapped in useCallback so the effect below only re-fires when country or
//   // region actually changes, not on every render.
//   const loadOffers = useCallback(async () => {
//     if (!selectedCountry) return;

//     setLoadingOffers(true);
//     // Clear stale offer state immediately so the UI shows a loader,
//     // not outdated cards from the previous country/region selection.
//     setOffers([]);
//     setSelectedOffer(undefined);
//     setValue("offerId", "");
//     setValue("usdAmount", 0);
//     setDisplayAmount("");

//     try {
//       const regionQuery = selectedRegion
//         ? `&region=${encodeURIComponent(selectedRegion)}`
//         : "";

//       const res = await apiGet(
//         `/gift-cards/offers?country=${selectedCountry.cca2}${regionQuery}&page=1`,
//       );
//       setOffers(res?.data?.data ?? []);
//     } catch {
//       showError("Could not load gift cards for this country.");
//     } finally {
//       setLoadingOffers(false);
//     }
//   }, [selectedCountry, selectedRegion]);

//   useResetFormOnMount(reset, { offerId: "", quantity: 1, usdAmount: 0 }, () => {
//     setLoadingOffers(true);
//     // Clear stale offer state immediately so the UI shows a loader,
//     // not outdated cards from the previous country/region selection.
//     setOffers([]);
//     setSelectedOffer(undefined);
//     setValue("offerId", "");
//     setValue("usdAmount", 0);
//     setDisplayAmount("");
//   });

//   useEffect(() => {
//     loadOffers();
//   }, [loadOffers]);

//   // Fetch exchange rate when offer is selected
//   // Rate is fetched here (not on mount) because it's only needed once the user
//   // picks a card and we need to show the NGN breakdown.
//   useEffect(() => {
//     if (!selectedOffer) return;

//     (async () => {
//       try {
//         setLoadingRate(true);
//         const res = await apiGet("/gift-cards/latest-rate");
//         setExchangeRate(parseFloat(res?.data?.data?.buy_rate ?? "0"));
//       } catch {
//         showError("Could not fetch exchange rate. Please try again.");
//       } finally {
//         setLoadingRate(false);
//       }
//     })();
//   }, [selectedOffer]);

//   // ── Derived values

//   // Recomputes live as the user changes amount or quantity.
//   const breakdown = useMemo(() => {
//     if (!selectedOffer || usdAmount <= 0 || quantity < 1 || exchangeRate <= 0) {
//       return null;
//     }
//     return calcBreakdown(selectedOffer, usdAmount, quantity, exchangeRate);
//   }, [selectedOffer, usdAmount, quantity, exchangeRate]);

//   const insufficientBalance = useMemo(
//     () => !!breakdown && breakdown.customerNgnTotal > fiatBalance,
//     [breakdown, fiatBalance],
//   );

//   // Stable options array — only recomputed when the offers list changes.
//   const giftCardOptions = useMemo(() => offers.map(offerToOption), [offers]);

//   // Pull to refresh
//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     try {
//       await loadOffers();
//       if (selectedOffer) {
//         const res = await apiGet("/gift-cards/latest-rate");
//         setExchangeRate(parseFloat(res?.data?.data?.buy_rate ?? "0"));
//       }
//     } catch {
//       showError("Refresh failed. Try again.");
//     } finally {
//       setRefreshing(false);
//     }
//   }, [loadOffers, selectedOffer]);

//   // Submit
//   // Re-fetches the rate at submission time and aborts if it has drifted more
//   // than 2% since the breakdown was shown, forcing the user to review the new price.
//   const onSubmit = async (values: any) => {
//     if (!selectedOffer || !breakdown) return;

//     try {
//       const res = await apiGet("/gift-cards/latest-rate");
//       const freshRate = parseFloat(res?.data?.data?.buy_rate ?? "0");

//       if (exchangeRate !== freshRate) {
//         setExchangeRate(freshRate);
//         showError(
//           "The exchange rate just updated. Please review the new total before continuing.",
//         );
//         return;
//       }

//       navigation.navigate("ConfirmTransaction", {
//         payload: {
//           offer_id: values.offerId,
//           usd_amount: values.usdAmount,
//           quantity: values.quantity,
//           rate_seen: exchangeRate,
//           offer: selectedOffer,
//           url: "/gift-cards/purchase-card",
//         },
//       });
//     } catch {
//       showError("Could not verify rate. Please try again.");
//     }
//   };

//   return (
//     <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
//       <ScrollView
//         contentContainerStyle={{ flexGrow: 1 }}
//         keyboardShouldPersistTaps="handled"
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={[COLORS.primary]}
//           />
//         }
//       >
//         <View style={styles.container}>
//           {/* ── Country ── */}
//           <FieldBlock
//             label="Country"
//             hint="Pick the country where the gift card will be used."
//             showHint
//           >
//             <CountryPicker
//               countries={countries}
//               value={selectedCountry}
//               onChange={country => {
//                 setSelectedCountry(country);
//               }}
//               placeholder="Select country"
//               showCode
//             />
//           </FieldBlock>

//           {/* ── Region ── */}
//           {/* No control/name — region is a filter parameter, not a form field */}
//           <FieldBlock label="Region (optional)">
//             <SelectInput
//               placeholder="Filter by region…"
//               title="Select Region"
//               showSearchBox={false}
//               options={REGION_OPTIONS}
//               onSelect={option => setSelectedRegion(option?.value)}
//             />
//           </FieldBlock>

//           {/* ── Gift card ── */}
//           {selectedCountry && (
//             <FieldBlock
//               label="Gift card"
//               hint="Select a gift card available for the chosen country."
//               error={errors.offerId?.message}
//               showHint={false}
//             >
//               {loadingOffers ? (
//                 <ActivityIndicator
//                   color={COLORS.primary}
//                   style={{ marginVertical: 30 }}
//                   size={30}
//                 />
//               ) : offers.length === 0 ? (
//                 <AppText style={styles.emptyHint}>
//                   No gift cards found for {selectedCountry.cca2}. Try a
//                   different country or region.
//                 </AppText>
//               ) : (
//                 <SelectInput
//                   control={control}
//                   name="offerId"
//                   placeholder="Search and select a gift card…"
//                   title="Select Gift Card"
//                   showSearchBox
//                   options={giftCardOptions}
//                   onSelect={option => {
//                     const raw = (option as GiftCardSelectOption)._raw;
//                     setTimeout(() => {
//                       setSelectedOffer(raw);
//                       if (
//                         raw.priceType === "FIXED" &&
//                         raw.price.fixed != null
//                       ) {
//                         const face = fromDivisor(
//                           raw.price.fixed,
//                           raw.price.currencyDivisor,
//                         );
//                         setValue("usdAmount", face);
//                         setDisplayAmount(face.toString());
//                       } else {
//                         setValue("usdAmount", 0);
//                         setDisplayAmount("");
//                       }
//                       setValue("quantity", 1);
//                     }, 300);
//                   }}
//                 />
//               )}
//             </FieldBlock>
//           )}

//           {selectedOffer && (
//             <>
//               {selectedOffer.priceType === "RANGE" ? (
//                 // RANGE — customer types any amount within the allowed band
//                 <FieldBlock
//                   label="Amount (USD)"
//                   hint={`Enter an amount between $${fromDivisor(
//                     selectedOffer.send.min ?? 0,
//                     selectedOffer.send.currencyDivisor,
//                   )} and $${fromDivisor(
//                     selectedOffer.send.max ?? 0,
//                     selectedOffer.send.currencyDivisor,
//                   )}. This is the face value the recipient receives.`}
//                   showHint
//                   error={errors.usdAmount?.message}
//                 >
//                   <Controller
//                     control={control}
//                     name="usdAmount"
//                     render={({ field: { onChange, onBlur } }) => (
//                       <View style={styles.amountBox}>
//                         <AppText style={styles.currencySymbol}>$</AppText>
//                         <TextInput
//                           style={styles.amountInput}
//                           value={displayAmount}
//                           placeholder="0.00"
//                           placeholderTextColor="#999"
//                           keyboardType="decimal-pad"
//                           onBlur={onBlur}
//                           maxFontSizeMultiplier={1}
//                           allowFontScaling={false}
//                           onChangeText={text => {
//                             const formatted = formatWithCommas(text);
//                             onChange(parseToNumber(formatted));
//                             setDisplayAmount(formatted);
//                           }}
//                         />
//                       </View>
//                     )}
//                   />
//                 </FieldBlock>
//               ) : (
//                 // FIXED — face value is locked by the issuer, shown read-only
//                 <View style={styles.fieldBlock}>
//                   <AppText style={styles.fieldLabel}>Amount</AppText>
//                   <AppText style={styles.fieldHint}>
//                     This is a fixed-value card. The amount is set by the issuer
//                     and cannot be changed.
//                   </AppText>
//                   <View style={styles.lockedValueBox}>
//                     <AppText style={styles.lockedValue}>
//                       $
//                       {fromDivisor(
//                         selectedOffer.send.fixed ?? 0,
//                         selectedOffer.send.currencyDivisor,
//                       ).toFixed(2)}
//                     </AppText>
//                     <AppText style={styles.lockedBadge}>Fixed Price</AppText>
//                   </View>
//                 </View>
//               )}

//               {/* ── Quantity ── */}
//               <FieldBlock
//                 label="Quantity"
//                 hint="Each unit is delivered as a separate voucher code."
//                 showHint
//                 error={errors.quantity?.message}
//               >
//                 <Controller
//                   control={control}
//                   name="quantity"
//                   render={({ field: { onChange, value, onBlur } }) => (
//                     <View style={styles.quantityRow}>
//                       <TouchableOpacity
//                         hitSlop={20}
//                         activeOpacity={0.7}
//                         style={styles.qtyButton}
//                         onPress={() => onChange(Math.max(1, (value ?? 1) - 1))}
//                       >
//                         <AppText style={styles.qtyButtonText}>−</AppText>
//                       </TouchableOpacity>

//                       <TextInput
//                         style={styles.qtyInput}
//                         value={String(value ?? 1)}
//                         keyboardType="number-pad"
//                         onBlur={onBlur}
//                         maxFontSizeMultiplier={1}
//                         allowFontScaling={false}
//                         onChangeText={text => {
//                           const n = parseInt(text.replace(/[^0-9]/g, ""), 10);
//                           onChange(isNaN(n) ? 1 : n);
//                         }}
//                       />

//                       <TouchableOpacity
//                         hitSlop={20}
//                         activeOpacity={0.7}
//                         style={styles.qtyButton}
//                         onPress={() => onChange((value ?? 1) + 1)}
//                       >
//                         <AppText style={styles.qtyButtonText}>+</AppText>
//                       </TouchableOpacity>
//                     </View>
//                   )}
//                 />
//               </FieldBlock>
//             </>
//           )}

//           {breakdown && (
//             <>
//               <AppText style={[styles.fieldHint, { marginTop: 4 }]}>
//                 Here's exactly what you're paying and where each figure comes
//                 from.
//               </AppText>

//               {loadingRate ? (
//                 <ActivityIndicator
//                   color={COLORS.primary}
//                   style={{ marginVertical: 12 }}
//                 />
//               ) : (
//                 <View style={styles.breakdownCard}>
//                   <BreakdownRow
//                     label="Wallet balance"
//                     value={formatAmount(fiatBalance, { currency: "NGN" })}
//                   />
//                   <BreakdownRow
//                     label="Platform rate (USD → NGN)"
//                     value={`$1 → ${formatAmount(exchangeRate)}`}
//                   />
//                   <BreakdownRow label="Quantity" value={`× ${quantity}`} />

//                   <BreakdownRow
//                     label="Total (USD)"
//                     value={formatAmount(breakdown.customerUsdTotal, {
//                       currency: "USD",
//                     })}
//                     bold
//                   />
//                   <BreakdownRow
//                     label="You'll pay (NGN)"
//                     value={formatAmount(breakdown.customerNgnTotal, {
//                       currency: "NGN",
//                     })}
//                     bold
//                   />
//                 </View>
//               )}

//               {insufficientBalance && (
//                 <View style={styles.warningBox}>
//                   <AppText style={styles.warningText}>
//                     Your wallet balance is too low for this purchase. Top up
//                     your naira wallet and try again.
//                   </AppText>
//                 </View>
//               )}

//               <View style={styles.summaryPill}>
//                 <AppText style={styles.summaryLabel}>You're paying</AppText>
//                 <AppText style={styles.summaryAmount}>
//                   {formatAmount(breakdown.customerNgnTotal, {
//                     currency: "NGN",
//                   })}
//                 </AppText>
//               </View>
//             </>
//           )}

//           <TouchableOpacity
//             activeOpacity={0.7}
//             hitSlop={30}
//             style={[
//               styles.ctaButton,
//               (insufficientBalance || !breakdown) && styles.ctaDisabled,
//             ]}
//             disabled={insufficientBalance || !breakdown || isSubmitting}
//             onPress={handleSubmit(onSubmit)}
//           >
//             <AppText style={styles.ctaText}>
//               {isSubmitting ? "Please wait…" : "Continue"}
//             </AppText>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: normalize(20),
//     paddingTop: normalize(16),
//     paddingBottom: normalize(40),
//     backgroundColor: "#fff",
//   },

//   // Field block
//   fieldBlock: { marginBottom: 14 },
//   fieldLabel: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("800"),
//     color: "#000",
//     marginBottom: 2,
//   },
//   fieldHint: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("400"),
//     color: "#424750",
//     marginBottom: 8,
//   },
//   errorText: {
//     color: "#FF3B30",
//     fontSize: normalize(13),
//     fontFamily: getFontFamily("700"),
//     marginTop: 4,
//   },

//   // Amount input
//   amountBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//     borderRadius: normalize(12),
//     paddingHorizontal: normalize(14),
//     gap: 4,
//   },
//   currencySymbol: {
//     fontSize: normalize(24),
//     fontFamily: getFontFamily("800"),
//     color: "#000",
//   },
//   amountInput: {
//     flex: 1,
//     paddingVertical: normalize(14),
//     fontSize: normalize(24),
//     fontFamily: getFontFamily("800"),
//     color: "#000",
//   },

//   // Locked value display (FIXED offers)
//   lockedValueBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//     borderRadius: normalize(12),
//     paddingHorizontal: normalize(14),
//     paddingVertical: normalize(14),
//     backgroundColor: "#F9FAFB",
//   },
//   lockedValue: {
//     fontSize: normalize(22),
//     fontFamily: getFontFamily("800"),
//     color: "#1A1A1A",
//   },
//   lockedBadge: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("800"),
//     color: COLORS.primary,
//     backgroundColor: `${COLORS.primary}18`,
//     paddingHorizontal: 10,
//     paddingVertical: 3,
//     borderRadius: 20,
//   },
//   quantityRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     marginTop: 10,
//   },
//   qtyButton: {
//     width: 42,
//     height: 42,
//     borderRadius: 8,
//     borderWidth: 1,
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   qtyButtonText: {
//     fontSize: normalize(34),
//     fontFamily: getFontFamily("700"),
//     color: COLORS.whiteBackground,
//   },
//   qtyInput: {
//     flex: 1,
//     textAlign: "center",
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//     borderRadius: 10,
//     paddingVertical: normalize(14),
//     fontSize: normalize(23),
//     fontFamily: getFontFamily("800"),
//     color: "#1A1A1A",
//   },
//   breakdownCard: {
//     backgroundColor: "#EFF7EC",
//     borderRadius: 12,
//     padding: 14,
//     gap: 4,
//     marginBottom: 14,
//     marginTop: 8,
//   },
//   breakdownRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 4,
//   },
//   breakdownLabel: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("800"),
//     color: "#000",
//     flex: 1,
//     flexWrap: "wrap",
//   },
//   breakdownValue: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("800"),
//     color: "#000",
//     textAlign: "right",
//   },
//   breakdownBold: {
//     fontFamily: getFontFamily("900"),
//     fontSize: normalize(18),
//     color: "#000",
//   },
//   breakdownDivider: {
//     height: 1,
//     backgroundColor: "#d4edda",
//     marginVertical: 6,
//   },

//   // Warning box
//   warningBox: {
//     backgroundColor: "#FEF2F2",
//     borderWidth: 1,
//     borderColor: "#FECACA",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 12,
//   },
//   warningText: {
//     color: "#DC2626",
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("700"),
//     lineHeight: normalize(20),
//   },

//   summaryPill: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 10,
//     padding: 14,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   summaryLabel: {
//     color: "#fff",
//     fontSize: normalize(21),
//     fontFamily: getFontFamily("900"),
//   },
//   summaryAmount: {
//     color: "#fff",
//     fontSize: normalize(21),
//     fontFamily: getFontFamily("900"),
//   },

//   // Empty state
//   emptyHint: {
//     fontSize: normalize(15),
//     fontFamily: getFontFamily("700"),
//     color: "#9CA3AF",
//     marginTop: 8,
//     textAlign: "center",
//   },

//   // CTA
//   ctaButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 16,
//     borderRadius: normalize(208),
//     alignItems: "center",
//     marginTop: 4,
//   },
//   ctaDisabled: {
//     backgroundColor: "#9CA3AF",
//     opacity: 0.6,
//   },
//   ctaText: {
//     color: "#fff",
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("800"),
//   },
// });
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllCountries, FlagType } from "react-native-country-picker-modal";

import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { formatAmount } from "../libs/formatNumber";
import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
import { useFiatBalance } from "../hooks/useFiatBalance";
import { showError } from "../utlis/toast";
import useAxios from "../hooks/useAxios";
import { AppText } from "../components/AppText";
import CountryPicker from "../components/CountryPicker";
import { Country } from "../libs/types";
import { SelectInput } from "../components/SelectInputField";
import { useResetFormOnMount } from "../hooks/useResetFormOnMount";

interface GiftCardOffer {
  offerId: string;
  brand: string;
  brandName: string;
  priceType: "FIXED" | "RANGE";
  send: {
    currency: string;
    currencyDivisor: number;
    fixed?: number;
    min?: number;
    max?: number;
  };
  cost: {
    currency: string;
    currencyDivisor: number;
    fixed?: number;
    fx?: number;
    fee: number;
    feePct: number;
    discount: number;
  };
  price: {
    currency: string;
    currencyDivisor: number;
    fixed?: number;
    fx?: number;
    fee: number;
    feePct: number;
    discount: number;
  };
  logoUrl?: string;
  requiredFields: string[];
}

// SelectInput option shape extended with gift card display fields.
// market_value drives the built-in USD price subtitle in SelectInput.
// _raw carries the full offer so we can recover it inside onSelect.
interface GiftCardSelectOption {
  value: string;
  label: string;
  logo_url?: string;
  market_value?: number;
  _raw: GiftCardOffer;
}

// Metadata for known recipient fields — label text and keyboard behavior.
// Anything not listed here falls back to formatFieldLabel() below.
const FIELD_META: Record<
  string,
  { label: string; placeholder: string; keyboardType?: any; isEmail?: boolean }
> = {
  email: {
    label: "Email Address",
    placeholder: "recipient@example.com",
    keyboardType: "email-address",
    isEmail: true,
  },
  phone: {
    label: "Phone Number",
    placeholder: "+1 234 567 8900",
    keyboardType: "phone-pad",
  },
  phoneNumber: {
    label: "Phone Number",
    placeholder: "+1 234 567 8900",
    keyboardType: "phone-pad",
  },
  accountNumber: {
    label: "Account Number",
    placeholder: "Enter account number",
    keyboardType: "number-pad",
  },
  customerNumber: {
    label: "Customer Number",
    placeholder: "Enter customer number",
    keyboardType: "number-pad",
  },
  name: { label: "Full Name", placeholder: "Enter full name" },
  firstName: { label: "First Name", placeholder: "Enter first name" },
  lastName: { label: "Last Name", placeholder: "Enter last name" },
};

// Some offers return required field keys with a namespace-style prefix
// (e.g. "required.firstName" instead of just "firstName"). Previously that
// raw string was shown verbatim as the field label. This strips any prefix
// and turns camelCase/snake_case into readable Title Case, e.g.
// "required.firstName" -> "First Name", "account_number" -> "Account Number".
function formatFieldLabel(field: string): string {
  const known =
    FIELD_META[field] ?? FIELD_META[field.split(".").pop() ?? field];
  if (known?.label) return known.label;

  const key = field.includes(".") ? field.split(".").pop() ?? field : field;

  return key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

// React Hook Form (and Yup's `.shape()`) treat a "." in a field name as a
// path into a nested object, not a literal character. A required field key
// like "required.firstName" would silently register as
// `values.required.firstName` while the rest of this screen (defaultValues,
// payload construction) expected a flat `values["required.firstName"]` —
// so the field's value and its validation never lined up, and the form
// could never pass validation for that field. Sanitizing dots out of the
// RHF field name avoids the nested-path behavior entirely; we map back to
// the real API field name when building the submit payload.
const toSafeFieldName = (field: string) => field.replace(/\./g, "__");

const staticSchemaShape = {
  offerId: Yup.string().required("Please select a gift card"),
  usdAmount: Yup.number()
    .typeError("Enter a valid amount")
    .min(1, "Minimum amount is $1")
    .required("Amount is required"),
  quantity: Yup.number()
    .typeError("Enter a valid quantity")
    .min(1, "Minimum quantity is 1")
    .integer("Quantity must be a whole number")
    .required("Quantity is required"),
};

const fromDivisor = (value: number, divisor: number) => value / divisor;

// Compute the full cost breakdown the customer sees before confirming.
function calcBreakdown(
  offer: GiftCardOffer,
  usdAmount: number,
  quantity: number,
  exchangeRate: number,
) {
  const divisor = offer.price.currencyDivisor;

  // Unit cost in USD we pay Zendit
  let unitCostUsd = 0;
  if (offer.priceType === "FIXED" && offer.price.fixed != null) {
    unitCostUsd = fromDivisor(offer.price.fixed, divisor);
  } else if (offer.priceType === "RANGE" && offer.price.fx != null) {
    unitCostUsd = usdAmount * offer.price.fx;
  }

  const feePerUnitUsd = fromDivisor(offer.price.fee, divisor);
  const totalCostUsd = (unitCostUsd + feePerUnitUsd) * quantity;
  const platformMargin = 0; // 1.5% platform margin
  const platformFeeUsd = totalCostUsd * platformMargin;
  const customerUsdTotal = totalCostUsd + platformFeeUsd;
  const customerNgnTotal = customerUsdTotal * exchangeRate;

  // Face value the recipient actually receives
  const faceValueUsd =
    offer.priceType === "FIXED" && offer.send.fixed != null
      ? fromDivisor(offer.send.fixed, offer.send.currencyDivisor) * quantity
      : usdAmount * quantity;

  return {
    unitCostUsd,
    feePerUnitUsd,
    totalCostUsd,
    platformFeeUsd,
    platformMargin,
    customerUsdTotal,
    customerNgnTotal,
    faceValueUsd,
    exchangeRate,
  };
}

// Map a GiftCardOffer into the shape SelectInput expects.
// market_value → face value in USD, rendered as the price subtitle per row.
function offerToOption(offer: GiftCardOffer): GiftCardSelectOption {
  const faceValueUsd =
    offer.priceType === "FIXED" && offer.send.fixed != null
      ? fromDivisor(offer.send.fixed, offer.send.currencyDivisor)
      : offer.priceType === "RANGE" && offer.send.min != null
      ? fromDivisor(offer.send.min, offer.send.currencyDivisor)
      : undefined;

  return {
    value: offer.offerId,
    label: offer.brandName?.toUpperCase(),
    logo_url: offer.logoUrl,
    market_value: faceValueUsd,
    _raw: offer,
  };
}

const REGION_OPTIONS = [
  { label: "Global", value: "Global" },
  { label: "Africa", value: "Africa" },
  { label: "Asia", value: "Asia" },
  { label: "Caribbean", value: "Caribbean" },
  { label: "Central America", value: "Central America" },
  { label: "Eastern Europe", value: "Eastern Europe" },
  {
    label: "Middle East and North Africa",
    value: "Middle East and North Africa",
  },
  { label: "North America", value: "North America" },
  { label: "Oceania", value: "Oceania" },
  { label: "South America", value: "South America" },
  { label: "South Asia", value: "South Asia" },
  { label: "Southeast Asia", value: "Southeast Asia" },
  { label: "Western Europe", value: "Western Europe" },
];

// The maximum relative change in exchange rate we'll accept silently on
// submit. Comparing the fresh rate to the previously-shown rate with strict
// equality meant *any* tiny fluctuation (rounding, live-feed jitter) blocked
// submission every single time, since the two floats almost never matched
// exactly. A small tolerance lets the purchase go through when the rate
// hasn't meaningfully moved, and only interrupts the user when it has.
const RATE_DRIFT_TOLERANCE = 0.005; // 0.5%

const FieldBlock = ({
  label,
  hint,
  showHint = true,
  error,
  children,
}: {
  label: string;
  hint?: string;
  showHint?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <View style={styles.fieldBlock}>
    <AppText style={styles.fieldLabel}>{label}</AppText>
    {showHint && hint && <AppText style={styles.fieldHint}>{hint}</AppText>}
    {children}
    {error && <AppText style={styles.errorText}>{error}</AppText>}
  </View>
);

// A single row inside the cost breakdown card.
const BreakdownRow = ({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <View style={styles.breakdownRow}>
    <AppText style={[styles.breakdownLabel, bold && styles.breakdownBold]}>
      {label}
    </AppText>
    <AppText style={[styles.breakdownValue, bold && styles.breakdownBold]}>
      {value}
    </AppText>
  </View>
);

export default function BuyGiftCardScreen() {
  const { apiGet } = useAxios();
  const navigation: any = useNavigation();
  const { fiatBalance } = useFiatBalance();

  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>();
  const [offers, setOffers] = useState<GiftCardOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<
    GiftCardOffer | undefined
  >();
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [displayAmount, setDisplayAmount] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [loadingRate, setLoadingRate] = useState(false);
  const [isForFriend, setIsForFriend] = useState(false);

  const requiredFields = selectedOffer?.requiredFields ?? [];

  // Schema now lives inside the component so it can grow recipient-field
  // rules when "buying for a friend" is on and the selected offer requires
  // them. Field keys are sanitized via toSafeFieldName so a dotted API key
  // (e.g. "required.firstName") is validated as a flat field, matching how
  // it's registered on the form and read back out in onSubmit.
  const schema = useMemo(() => {
    const shape: Record<string, any> = { ...staticSchemaShape };

    if (isForFriend && requiredFields.length) {
      requiredFields.forEach(field => {
        const meta =
          FIELD_META[field] ?? FIELD_META[field.split(".").pop() ?? field];
        const label = formatFieldLabel(field);
        let rule = Yup.string().required(`${label} is required`);
        if (meta?.isEmail) rule = rule.email("Enter a valid email") as any;
        shape[toSafeFieldName(field)] = rule;
      });
    }

    return Yup.object().shape(shape);
  }, [isForFriend, requiredFields]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, any>>({
    resolver: yupResolver(schema),
    defaultValues: { offerId: "", usdAmount: 0, quantity: 1 },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  // Revalidate whenever the schema shape changes (toggling "for a friend",
  // or picking an offer with different required fields). Without this, a
  // newly-added required field is only checked once the user types into it,
  // so pressing Continue could fail validation with no visible cause yet.
  useEffect(() => {
    trigger();
  }, [schema, trigger]);

  const usdAmount: number = watch("usdAmount");
  const quantity: number = watch("quantity") ?? 1;

  useEffect(() => {
    (async () => {
      const all = await getAllCountries(FlagType.FLAT);
      setCountries(all);

      const defaultCountry = all.find(c => c.cca2 === "US");
      if (defaultCountry) {
        setSelectedCountry(defaultCountry);
      }
    })();
  }, []);

  // Load offers
  // Wrapped in useCallback so the effect below only re-fires when country or
  // region actually changes, not on every render.
  const loadOffers = useCallback(async () => {
    if (!selectedCountry) return;

    setLoadingOffers(true);
    // Clear stale offer state immediately so the UI shows a loader,
    // not outdated cards from the previous country/region selection.
    setOffers([]);
    setSelectedOffer(undefined);
    setIsForFriend(false);
    setValue("offerId", "");
    setValue("usdAmount", 0);
    setDisplayAmount("");

    try {
      const regionQuery = selectedRegion
        ? `&region=${encodeURIComponent(selectedRegion)}`
        : "";

      const res = await apiGet(
        `/gift-cards/offers?country=${selectedCountry.cca2}${regionQuery}&page=1`,
      );
      setOffers(res?.data?.data ?? []);
    } catch {
      showError("Could not load gift cards for this country.");
    } finally {
      setLoadingOffers(false);
    }
  }, [selectedCountry, selectedRegion]);

  useResetFormOnMount(reset, { offerId: "", quantity: 1, usdAmount: 0 }, () => {
    setLoadingOffers(true);
    // Clear stale offer state immediately so the UI shows a loader,
    // not outdated cards from the previous country/region selection.
    setOffers([]);
    setSelectedOffer(undefined);
    setIsForFriend(false);
    setValue("offerId", "");
    setValue("usdAmount", 0);
    setDisplayAmount("");
  });

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  // Fetch exchange rate when offer is selected
  // Rate is fetched here (not on mount) because it's only needed once the user
  // picks a card and we need to show the NGN breakdown.
  useEffect(() => {
    if (!selectedOffer) return;

    (async () => {
      try {
        setLoadingRate(true);
        const res = await apiGet("/gift-cards/latest-rate");
        setExchangeRate(parseFloat(res?.data?.data?.buy_rate ?? "0"));
      } catch {
        showError("Could not fetch exchange rate. Please try again.");
      } finally {
        setLoadingRate(false);
      }
    })();
  }, [selectedOffer]);

  // ── Derived values

  // Recomputes live as the user changes amount or quantity.
  const breakdown = useMemo(() => {
    if (!selectedOffer || usdAmount <= 0 || quantity < 1 || exchangeRate <= 0) {
      return null;
    }
    return calcBreakdown(selectedOffer, usdAmount, quantity, exchangeRate);
  }, [selectedOffer, usdAmount, quantity, exchangeRate]);

  const insufficientBalance = useMemo(
    () => !!breakdown && breakdown.customerNgnTotal > fiatBalance,
    [breakdown, fiatBalance],
  );

  // Stable options array — only recomputed when the offers list changes.
  const giftCardOptions = useMemo(() => offers.map(offerToOption), [offers]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadOffers();
      if (selectedOffer) {
        const res = await apiGet("/gift-cards/latest-rate");
        setExchangeRate(parseFloat(res?.data?.data?.buy_rate ?? "0"));
      }
    } catch {
      showError("Refresh failed. Try again.");
    } finally {
      setRefreshing(false);
    }
  }, [loadOffers, selectedOffer]);

  // Submit
  // Re-fetches the rate at submission time and only interrupts the user if
  // it has drifted more than RATE_DRIFT_TOLERANCE since the breakdown was
  // shown — small, expected fluctuations no longer block the purchase.
  const onSubmit = async (values: Record<string, any>) => {
    if (!selectedOffer || !breakdown) return;

    try {
      const res = await apiGet("/gift-cards/latest-rate");
      const freshRate = parseFloat(res?.data?.data?.buy_rate ?? "0");

      if (!freshRate) {
        showError("Could not verify the current rate. Please try again.");
        return;
      }

      const drift = Math.abs(freshRate - exchangeRate) / exchangeRate;
      if (drift > RATE_DRIFT_TOLERANCE) {
        setExchangeRate(freshRate);
        showError(
          "The exchange rate just updated. Please review the new total before continuing.",
        );
        return;
      }

      const recipient = isForFriend
        ? Object.fromEntries(
            requiredFields.map(f => [f, values[toSafeFieldName(f)]]),
          )
        : null;

      navigation.navigate("ConfirmTransaction", {
        payload: {
          offer_id: values.offerId,
          usd_amount: values.usdAmount,
          quantity: values.quantity,
          rate_seen: freshRate,
          offer: selectedOffer,
          for_friend: isForFriend,
          recipient,
          url: "/gift-cards/purchase-card",
        },
      });
    } catch {
      showError("Could not verify rate. Please try again.");
    }
  };

  // Shown if validation fails on submit — previously nothing happened at
  // all when this occurred, which is exactly what made it look like the
  // Continue button was broken.
  const onInvalid = () => {
    const firstError = Object.values(errors)[0] as
      | { message?: string }
      | undefined;
    showError(
      firstError?.message ??
        "Please check the highlighted fields and try again.",
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={styles.container}>
          {/* ── Country ── */}
          <FieldBlock
            label="Country"
            hint="Pick the country where the gift card will be used."
            showHint
          >
            <CountryPicker
              countries={countries}
              value={selectedCountry}
              onChange={country => {
                setSelectedCountry(country);
              }}
              placeholder="Select country"
              showCode
            />
          </FieldBlock>

          {/* ── Region ── */}
          {/* No control/name — region is a filter parameter, not a form field */}
          <FieldBlock label="Region (optional)">
            <SelectInput
              placeholder="Filter by region…"
              title="Select Region"
              showSearchBox={false}
              options={REGION_OPTIONS}
              onSelect={option => setSelectedRegion(option?.value)}
            />
          </FieldBlock>

          {/* ── Gift card ── */}
          {selectedCountry && (
            <FieldBlock
              label="Gift card"
              hint="Select a gift card available for the chosen country."
              error={errors.offerId?.message as string}
              showHint={false}
            >
              {loadingOffers ? (
                <ActivityIndicator
                  color={COLORS.primary}
                  style={{ marginVertical: 30 }}
                  size={30}
                />
              ) : offers.length === 0 ? (
                <AppText style={styles.emptyHint}>
                  No gift cards found for {selectedCountry.cca2}. Try a
                  different country or region.
                </AppText>
              ) : (
                <SelectInput
                  control={control}
                  name="offerId"
                  placeholder="Search and select a gift card…"
                  title="Select Gift Card"
                  showSearchBox
                  options={giftCardOptions}
                  onSelect={option => {
                    const raw = (option as GiftCardSelectOption)._raw;
                    setTimeout(() => {
                      setSelectedOffer(raw);
                      setIsForFriend(false);
                      if (
                        raw.priceType === "FIXED" &&
                        raw.price.fixed != null
                      ) {
                        const face = fromDivisor(
                          raw.price.fixed,
                          raw.price.currencyDivisor,
                        );
                        setValue("usdAmount", face);
                        setDisplayAmount(face.toString());
                      } else {
                        setValue("usdAmount", 0);
                        setDisplayAmount("");
                      }
                      setValue("quantity", 1);
                    }, 300);
                  }}
                />
              )}
            </FieldBlock>
          )}

          {selectedOffer && (
            <>
              {selectedOffer.priceType === "RANGE" ? (
                // RANGE — customer types any amount within the allowed band
                <FieldBlock
                  label="Amount (USD)"
                  hint={`Enter an amount between $${fromDivisor(
                    selectedOffer.send.min ?? 0,
                    selectedOffer.send.currencyDivisor,
                  )} and $${fromDivisor(
                    selectedOffer.send.max ?? 0,
                    selectedOffer.send.currencyDivisor,
                  )}. This is the face value the recipient receives.`}
                  showHint
                  error={errors.usdAmount?.message as string}
                >
                  <Controller
                    control={control}
                    name="usdAmount"
                    render={({ field: { onChange, onBlur } }) => (
                      <View style={styles.amountBox}>
                        <AppText style={styles.currencySymbol}>$</AppText>
                        <TextInput
                          style={styles.amountInput}
                          value={displayAmount}
                          placeholder="0.00"
                          placeholderTextColor="#999"
                          keyboardType="decimal-pad"
                          onBlur={onBlur}
                          maxFontSizeMultiplier={1}
                          allowFontScaling={false}
                          onChangeText={text => {
                            const formatted = formatWithCommas(text);
                            onChange(parseToNumber(formatted));
                            setDisplayAmount(formatted);
                          }}
                        />
                      </View>
                    )}
                  />
                </FieldBlock>
              ) : (
                // FIXED — face value is locked by the issuer, shown read-only
                <View style={styles.fieldBlock}>
                  <AppText style={styles.fieldLabel}>Amount</AppText>
                  <AppText style={styles.fieldHint}>
                    This is a fixed-value card. The amount is set by the issuer
                    and cannot be changed.
                  </AppText>
                  <View style={styles.lockedValueBox}>
                    <AppText style={styles.lockedValue}>
                      $
                      {fromDivisor(
                        selectedOffer.send.fixed ?? 0,
                        selectedOffer.send.currencyDivisor,
                      ).toFixed(2)}
                    </AppText>
                    <AppText style={styles.lockedBadge}>Fixed Price</AppText>
                  </View>
                </View>
              )}

              {/* ── Quantity ── */}
              <FieldBlock
                label="Quantity"
                hint="Each unit is delivered as a separate voucher code."
                showHint
                error={errors.quantity?.message as string}
              >
                <Controller
                  control={control}
                  name="quantity"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <View style={styles.quantityRow}>
                      <TouchableOpacity
                        hitSlop={20}
                        activeOpacity={0.7}
                        style={styles.qtyButton}
                        onPress={() => onChange(Math.max(1, (value ?? 1) - 1))}
                      >
                        <AppText style={styles.qtyButtonText}>−</AppText>
                      </TouchableOpacity>

                      <TextInput
                        style={styles.qtyInput}
                        value={String(value ?? 1)}
                        keyboardType="number-pad"
                        onBlur={onBlur}
                        maxFontSizeMultiplier={1}
                        allowFontScaling={false}
                        onChangeText={text => {
                          const n = parseInt(text.replace(/[^0-9]/g, ""), 10);
                          onChange(isNaN(n) ? 1 : n);
                        }}
                      />

                      <TouchableOpacity
                        hitSlop={20}
                        activeOpacity={0.7}
                        style={styles.qtyButton}
                        onPress={() => onChange((value ?? 1) + 1)}
                      >
                        <AppText style={styles.qtyButtonText}>+</AppText>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </FieldBlock>

              {/* ── Buying for a friend? ── */}
              {requiredFields.length > 0 && (
                <View style={styles.friendToggleRow}>
                  <View style={styles.friendToggleText}>
                    <AppText style={styles.friendToggleLabel}>
                      Buying for a friend?
                    </AppText>
                    <AppText style={styles.friendToggleHint}>
                      You'll need to provide their details so the card is
                      delivered correctly.
                    </AppText>
                  </View>
                  <Switch
                    style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                    value={isForFriend}
                    onValueChange={setIsForFriend}
                    trackColor={{ false: "#E5E7EB", true: COLORS.primary }}
                    thumbColor="#fff"
                  />
                </View>
              )}

              {isForFriend && requiredFields.length > 0 && (
                <View style={styles.recipientSection}>
                  <AppText style={styles.recipientSectionTitle}>
                    Recipient Details
                  </AppText>
                  {requiredFields.map(field => {
                    const meta =
                      FIELD_META[field] ??
                      FIELD_META[field.split(".").pop() ?? field];
                    const safeName = toSafeFieldName(field);
                    const label = formatFieldLabel(field);

                    return (
                      <FieldBlock
                        key={field}
                        label={label}
                        error={(errors as any)[safeName]?.message}
                      >
                        <Controller
                          control={control}
                          name={safeName}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              style={[
                                styles.textField,
                                (errors as any)[safeName] &&
                                  styles.textFieldError,
                              ]}
                              placeholder={
                                meta?.placeholder ??
                                `Enter ${label.toLowerCase()}`
                              }
                              placeholderTextColor="#808285"
                              keyboardType={meta?.keyboardType ?? "default"}
                              autoCapitalize="none"
                              autoCorrect={false}
                              onBlur={onBlur}
                              onChangeText={onChange}
                              value={value as string}
                              maxFontSizeMultiplier={1}
                            />
                          )}
                        />
                      </FieldBlock>
                    );
                  })}
                </View>
              )}
            </>
          )}

          {breakdown && (
            <>
              <AppText style={[styles.fieldHint, { marginTop: 4 }]}>
                Here's exactly what you're paying and where each figure comes
                from.
              </AppText>

              {loadingRate ? (
                <ActivityIndicator
                  color={COLORS.primary}
                  style={{ marginVertical: 12 }}
                />
              ) : (
                <View style={styles.breakdownCard}>
                  <BreakdownRow
                    label="Wallet balance"
                    value={formatAmount(fiatBalance, { currency: "NGN" })}
                  />
                  <BreakdownRow
                    label="Platform rate (USD → NGN)"
                    value={`$1 → ${formatAmount(exchangeRate)}`}
                  />
                  <BreakdownRow label="Quantity" value={`× ${quantity}`} />

                  <BreakdownRow
                    label="Total (USD)"
                    value={formatAmount(breakdown.customerUsdTotal, {
                      currency: "USD",
                    })}
                    bold
                  />
                  <BreakdownRow
                    label="You'll pay (NGN)"
                    value={formatAmount(breakdown.customerNgnTotal, {
                      currency: "NGN",
                    })}
                    bold
                  />
                </View>
              )}

              {insufficientBalance && (
                <View style={styles.warningBox}>
                  <AppText style={styles.warningText}>
                    Your wallet balance is too low for this purchase. Top up
                    your naira wallet and try again.
                  </AppText>
                </View>
              )}

              <View style={styles.summaryPill}>
                <AppText style={styles.summaryLabel}>You're paying</AppText>
                <AppText style={styles.summaryAmount}>
                  {formatAmount(breakdown.customerNgnTotal, {
                    currency: "NGN",
                  })}
                </AppText>
              </View>
            </>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={30}
            style={[
              styles.ctaButton,
              (insufficientBalance || !breakdown) && styles.ctaDisabled,
            ]}
            disabled={insufficientBalance || !breakdown || isSubmitting}
            onPress={handleSubmit(onSubmit, onInvalid)}
          >
            <AppText style={styles.ctaText}>
              {isSubmitting ? "Please wait…" : "Continue"}
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: normalize(20),
    paddingTop: normalize(16),
    paddingBottom: normalize(40),
    backgroundColor: "#fff",
  },

  // Field block
  fieldBlock: { marginBottom: 14 },
  fieldLabel: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 2,
  },
  fieldHint: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: "#424750",
    marginBottom: 8,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: normalize(13),
    fontFamily: getFontFamily("700"),
    marginTop: 4,
  },

  // Amount input
  amountBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: normalize(12),
    paddingHorizontal: normalize(14),
    gap: 4,
  },
  currencySymbol: {
    fontSize: normalize(24),
    fontFamily: getFontFamily("800"),
    color: "#000",
  },
  amountInput: {
    flex: 1,
    paddingVertical: normalize(14),
    fontSize: normalize(24),
    fontFamily: getFontFamily("800"),
    color: "#000",
  },

  // Locked value display (FIXED offers)
  lockedValueBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: normalize(12),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(14),
    backgroundColor: "#F9FAFB",
  },
  lockedValue: {
    fontSize: normalize(22),
    fontFamily: getFontFamily("800"),
    color: "#1A1A1A",
  },
  lockedBadge: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: COLORS.primary,
    backgroundColor: `${COLORS.primary}18`,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  qtyButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: {
    fontSize: normalize(34),
    fontFamily: getFontFamily("700"),
    color: COLORS.whiteBackground,
  },
  qtyInput: {
    flex: 1,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: normalize(14),
    fontSize: normalize(23),
    fontFamily: getFontFamily("800"),
    color: "#1A1A1A",
  },

  // Buying for a friend
  friendToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: normalize(12),
    padding: normalize(14),
    marginTop: normalize(6),
    marginBottom: normalize(14),
    gap: 12,
  },
  friendToggleText: { flex: 1 },
  friendToggleLabel: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#1A1A1A",
    marginBottom: 2,
  },
  friendToggleHint: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
    color: "#33353a",
    // lineHeight: 18,
  },
  recipientSection: {
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
    borderRadius: normalize(16),
    padding: normalize(14),
    marginBottom: normalize(14),
    backgroundColor: `${COLORS.primary}08`,
  },
  recipientSectionTitle: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("800"),
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: normalize(12),
  },
  textField: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: normalize(10),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(14),
    fontSize: normalize(17),
    fontFamily: getFontFamily("700"),
    color: "#1A1A1A",
    backgroundColor: "#fff",
  },
  textFieldError: { borderColor: "#FF3B30" },

  breakdownCard: {
    backgroundColor: "#EFF7EC",
    borderRadius: 12,
    padding: 14,
    gap: 4,
    marginBottom: 14,
    marginTop: 8,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000",
    flex: 1,
    flexWrap: "wrap",
  },
  breakdownValue: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000",
    textAlign: "right",
  },
  breakdownBold: {
    fontFamily: getFontFamily("900"),
    fontSize: normalize(18),
    color: "#000",
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: "#d4edda",
    marginVertical: 6,
  },

  // Warning box
  warningBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  warningText: {
    color: "#DC2626",
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    // lineHeight: normalize(20),
  },

  summaryPill: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  summaryLabel: {
    color: "#fff",
    fontSize: normalize(21),
    fontFamily: getFontFamily("900"),
  },
  summaryAmount: {
    color: "#fff",
    fontSize: normalize(21),
    fontFamily: getFontFamily("900"),
  },

  emptyHint: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("700"),
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
  },

  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: normalize(208),
    alignItems: "center",
    marginTop: 4,
  },
  ctaDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },
  ctaText: {
    color: "#fff",
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
  },
});
