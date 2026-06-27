import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
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

const schema = Yup.object().shape({
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
});

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

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { offerId: "", usdAmount: 0, quantity: 1 },
    mode: "onChange",
  });

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
  // Re-fetches the rate at submission time and aborts if it has drifted more
  // than 2% since the breakdown was shown, forcing the user to review the new price.
  const onSubmit = async (values: any) => {
    if (!selectedOffer || !breakdown) return;

    try {
      const res = await apiGet("/gift-cards/latest-rate");
      const freshRate = parseFloat(res?.data?.data?.buy_rate ?? "0");

      if (exchangeRate !== freshRate) {
        setExchangeRate(freshRate);
        showError(
          "The exchange rate just updated. Please review the new total before continuing.",
        );
        return;
      }

      navigation.navigate("ConfirmTransaction", {
        payload: {
          offer_id: values.offerId,
          usd_amount: values.usdAmount,
          quantity: values.quantity,
          rate_seen: exchangeRate,
          offer: selectedOffer,
          url: "/gift-cards/purchase-card",
        },
      });
    } catch {
      showError("Could not verify rate. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <ScrollView
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
              error={errors.offerId?.message}
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
                  error={errors.usdAmount?.message}
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
                error={errors.quantity?.message}
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
            onPress={handleSubmit(onSubmit)}
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
    lineHeight: normalize(20),
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

  // Empty state
  emptyHint: {
    fontSize: normalize(15),
    fontFamily: getFontFamily("700"),
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
  },

  // CTA
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
