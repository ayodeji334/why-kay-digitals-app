import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useLayoutEffect,
} from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { AppText } from "../components/AppText";
import useAxios from "../hooks/useAxios";
import { formatAmount } from "../libs/formatNumber";
import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
import { useFiatBalance } from "../hooks/useFiatBalance";
import { showError } from "../utlis/toast";
import { SelectInput } from "../components/SelectInputField";
import { useColors } from "../hooks/useTheme";

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

const FIELD_META: Record<any, any> = {
  email: {
    label: "Email Address",
    placeholder: "Enter email address",
    keyboardType: "email-address",
    isEmail: true,
  },
  phone: {
    label: "Phone Number",
    placeholder: "Enter phone number with country code e.g +234 7031234567",
    keyboardType: "phone-pad",
    isPhone: true,
  },
  phoneNumber: {
    label: "Phone Number",
    placeholder: "Enter phone number with country code e.g +234 7031234567",
    keyboardType: "phone-pad",
    isPhone: true,
  },
  name: { label: "Full Name", placeholder: "Enter full name" },
  firstName: { label: "First Name", placeholder: "Enter first name" },
  lastName: { label: "Last Name", placeholder: "Enter last name" },
};

const RECIPIENT_FIELDS = ["firstName", "lastName", "email", "phone"] as const;

// The maximum relative change in exchange rate we'll accept silently on
// submit. Strict equality blocks on any live-feed jitter since two floats
// almost never match exactly; a small tolerance only interrupts the user
// when the rate has meaningfully moved.
const RATE_DRIFT_TOLERANCE = 0.005; // 0.5%

const fromDivisor = (value: number, divisor: number) =>
  divisor ? value / divisor : 0;

function offerPriceLabel(offer: any): string {
  const { priceType, send } = offer;
  const divisor = send.currencyDivisor;
  if (priceType === "FIXED" && send.fixed != null) {
    return `${offer?.brandName?.toUpperCase()} ${
      offer?.country
    } - ${formatAmount(fromDivisor(send.fixed ?? 0, divisor ?? 0), {
      currency: send?.currency ?? "USD",
    })}`;
  }
  if (priceType === "RANGE") {
    const min =
      send.min != null ? fromDivisor(send.min, divisor).toFixed(2) : "?";
    const max =
      send.max != null ? fromDivisor(send.max, divisor).toFixed(2) : "?";
    return `${min} – $${max}`;
  }
  return "—";
}

function calcBreakdown(
  offer: GiftCardOffer,
  usdAmount: number,
  quantity: number,
  exchangeRate: number,
) {
  const divisor = offer.price.currencyDivisor;
  let unitCostUsd = 0;
  if (offer.priceType === "FIXED" && offer.price.fixed != null) {
    unitCostUsd = fromDivisor(offer.price.fixed, divisor);
  } else if (offer.priceType === "RANGE" && offer.price.fx != null) {
    unitCostUsd = usdAmount * offer.price.fx;
  }
  const feePerUnitUsd = fromDivisor(offer.price.fee, divisor);
  const totalCostUsd = (unitCostUsd + feePerUnitUsd) * quantity;
  const customerUsdTotal = totalCostUsd;
  const customerNgnTotal = customerUsdTotal * exchangeRate;
  const faceValueUsd =
    offer.priceType === "FIXED" && offer.send.fixed != null
      ? fromDivisor(offer.send.fixed, offer.send.currencyDivisor) * quantity
      : usdAmount * quantity;

  return {
    unitCostUsd,
    feePerUnitUsd,
    totalCostUsd,
    customerUsdTotal,
    customerNgnTotal,
    faceValueUsd,
    exchangeRate,
  };
}

const FieldBlock = ({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) => {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <View style={styles.fieldBlock}>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      {hint && <AppText style={styles.fieldHint}>{hint}</AppText>}
      {children}
      {!!error && <AppText style={styles.errorText}>{error}</AppText>}
    </View>
  );
};

const BreakdownRow = ({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <View style={styles.breakdownRow}>
      <AppText style={[styles.breakdownLabel, bold && styles.breakdownBold]}>
        {label}
      </AppText>
      <AppText style={[styles.breakdownValue, bold && styles.breakdownBold]}>
        {value}
      </AppText>
    </View>
  );
};

function PurchaseSection({
  offer,
  exchangeRate,
  setExchangeRate,
  loadingRate,
}: {
  offer: GiftCardOffer;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  loadingRate: boolean;
}) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const axios = useAxios();
  const navigation = useNavigation<any>();
  const { fiatBalance } = useFiatBalance();
  const [isForFriend, setIsForFriend] = useState(false);
  const [displayAmount, setDisplayAmount] = useState(
    offer.priceType === "FIXED" && offer.send.fixed != null
      ? fromDivisor(offer.send.fixed, offer.send.currencyDivisor).toFixed(2)
      : "",
  );

  const schema = useMemo(() => {
    const shape: Record<string, any> = {
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

    if (isForFriend) {
      RECIPIENT_FIELDS.forEach(field => {
        const meta = FIELD_META[field];
        let rule = Yup.string().required(`${meta?.label ?? field} is required`);
        if (meta?.isEmail) rule = rule.email("Enter a valid email") as any;
        shape[field] = rule;
      });
    }

    return Yup.object().shape(shape);
  }, [isForFriend]);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, any>>({
    resolver: yupResolver(schema),
    defaultValues: {
      usdAmount:
        offer.priceType === "FIXED" && offer.send.fixed != null
          ? fromDivisor(offer.send.fixed, offer.send.currencyDivisor)
          : 0,
      quantity: 1,
      ...Object.fromEntries(RECIPIENT_FIELDS.map(f => [f, ""])),
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  // Revalidate when the schema shape changes (toggling "for a friend").
  // Without this, a newly-added required field is only checked once the user
  // types into it, so Continue could silently fail validation.
  useEffect(() => {
    trigger();
  }, [schema, trigger]);

  const usdAmount: number = watch("usdAmount");
  const quantity: number = watch("quantity") ?? 1;

  const breakdown = useMemo(() => {
    if (usdAmount <= 0 || quantity < 1 || exchangeRate <= 0) return null;
    return calcBreakdown(offer, usdAmount, quantity, exchangeRate);
  }, [offer, usdAmount, quantity, exchangeRate]);

  const insufficientBalance = useMemo(
    () => !!breakdown && breakdown.customerNgnTotal > fiatBalance,
    [breakdown, fiatBalance],
  );

  const onSubmit = async (values: Record<string, any>) => {
    if (!breakdown) return;

    try {
      const res = await axios.apiGet("/gift-cards/latest-rate");
      const freshRate = parseFloat(res?.data?.data?.buy_rate ?? "0");

      if (!freshRate) {
        showError("Could not verify the current rate. Please try again.");
        return;
      }

      // Only interrupt when the rate meaningfully moved; tiny jitter passes.
      const drift = Math.abs(freshRate - exchangeRate) / exchangeRate;
      if (drift > RATE_DRIFT_TOLERANCE) {
        setExchangeRate(freshRate);
        showError(
          "The exchange rate just updated. Please review the new total before continuing.",
        );
        return;
      }

      const receipient = isForFriend
        ? Object.fromEntries(RECIPIENT_FIELDS.map(f => [f, values[f]]))
        : null;

      navigation.navigate("ConfirmTransaction", {
        payload: {
          offer_id: offer.offerId,
          usd_amount: values.usdAmount,
          quantity: values.quantity,
          rate_seen: freshRate,
          is_for_friend: isForFriend,
          receipient,
          url: "/gift-cards/purchase-card",
        },
      });
    } catch {
      showError("Could not verify rate. Please try again.");
    }
  };

  // Surfaces the first validation error as a toast — without this, a failed
  // submit did nothing visible and the Continue button looked broken.
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
    <View>
      {offer.priceType === "RANGE" ? (
        <FieldBlock
          label="Amount"
          hint={`Between ${formatAmount(
            fromDivisor(offer.send.min ?? 0, offer.send.currencyDivisor ?? 0),
            { currency: offer?.send?.currency },
          )} and ${formatAmount(
            fromDivisor(offer.send.max ?? 0, offer.send.currencyDivisor ?? 0),
            { currency: offer?.send?.currency },
          )}`}
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
        <FieldBlock hint="Below is the value of the card" label="Amount">
          <View style={styles.lockedValueBox}>
            <AppText style={styles.lockedValue}>
              {formatAmount(
                fromDivisor(
                  offer.send.fixed ?? 0,
                  offer.send.currencyDivisor ?? 0,
                ),
                { currency: offer?.send?.currency },
              )}
            </AppText>
            <AppText style={styles.lockedBadge}>Fixed</AppText>
          </View>
        </FieldBlock>
      )}

      {/* ── Quantity ── */}
      <FieldBlock
        label="Quantity"
        hint="Each unit is delivered as a separate voucher code."
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
      <View style={styles.friendToggleRow}>
        <View style={styles.friendToggleText}>
          <AppText style={styles.friendToggleLabel}>
            Buying for a friend?
          </AppText>
          <AppText style={styles.friendToggleHint}>
            You'll need to provide their details so the card is delivered
            correctly.
          </AppText>
        </View>
        <View>
          <Switch
            style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
            value={isForFriend}
            onValueChange={setIsForFriend}
            trackColor={{ false: "#8a8a8a", true: COLORS.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* ── Recipient details ── */}
      {isForFriend && (
        <View style={styles.recipientSection}>
          <AppText style={styles.recipientSectionTitle}>
            Recipient Details
          </AppText>
          {RECIPIENT_FIELDS.map(field => {
            const meta = FIELD_META[field] ?? {
              label: field,
              placeholder: `Enter ${field}`,
            };

            return (
              <FieldBlock
                key={field}
                label={meta.label}
                error={(errors as any)[field]?.message}
              >
                <Controller
                  control={control}
                  name={field as any}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.textField,
                        (errors as any)[field] && styles.textFieldError,
                      ]}
                      placeholder={meta.placeholder}
                      placeholderTextColor="#808285"
                      keyboardType={meta.keyboardType ?? "default"}
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

      {/* ── Cost breakdown ── */}
      {breakdown && (
        <>
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
                label="Rate (USD → NGN)"
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
                Your wallet balance is too low. Top up your naira wallet and try
                again.
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
        activeOpacity={0.8}
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
  );
}

export default function BrandDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { brand, country } = route.params as { brand: any; country: string };
  const { apiGet } = useAxios();
  const colors = useColors();
  const styles = makeStyles(colors);

  const [selectedOffer, setSelectedOffer] = useState<GiftCardOffer | null>(
    null,
  );
  const [exchangeRate, setExchangeRate] = useState(0);
  const [loadingRate, setLoadingRate] = useState(false);

  const { data: offers = [], isLoading } = useQuery<GiftCardOffer[]>({
    queryKey: ["brand-offers", brand.brand_code, country],
    queryFn: async () => {
      const res = await apiGet(
        `/gift-cards/offers?brand=${
          brand.brand_code
        }&page=1&per_page=100&country=${country.toUpperCase()}`,
      );
      return res?.data?.data ?? [];
    },
  });

  const options = offers.map(offer => ({
    ...offer,
    label: offerPriceLabel(offer),
    value: offer.offerId,
  }));

  const handleSelectOffer = useCallback(
    async (offerOrId: GiftCardOffer | string) => {
      const offer =
        typeof offerOrId === "string"
          ? offers.find(o => o.offerId === offerOrId)
          : offerOrId;

      if (!offer) return;

      setSelectedOffer(offer);
      try {
        setLoadingRate(true);
        const res = await apiGet("/gift-cards/latest-rate");
        setExchangeRate(parseFloat(res?.data?.data?.buy_rate ?? "0"));
      } catch {
        showError("Could not fetch exchange rate. Please try again.");
      } finally {
        setLoadingRate(false);
      }
    },
    [apiGet, offers],
  );

  useLayoutEffect(() => {
    if (brand) {
      navigation.setOptions({
        title: brand.brand_name,
      });
    }
  }, [navigation, brand]);

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={COLORS.primary} size={40} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Brand header ── */}
            <View style={{ paddingBottom: 30 }}>
              <Image
                source={{ uri: brand.brand_logo }}
                style={styles.brandLogo}
                resizeMode="contain"
              />
            </View>

            {/* ── Offer select ── */}
            <FieldBlock
              hint="Select from the list of available offers for the brand"
              label={
                brand?.brand_name +
                " " +
                country.toUpperCase() +
                " Available Offers"
              }
            >
              <SelectInput
                placeholder="Select offer from this brand"
                value={selectedOffer?.offerId}
                options={options}
                onChange={(value: any) => {
                  handleSelectOffer(value?.offerId ?? value);
                }}
              />
            </FieldBlock>

            {selectedOffer && (
              <PurchaseSection
                key={selectedOffer.offerId}
                offer={selectedOffer}
                exchangeRate={exchangeRate}
                setExchangeRate={setExchangeRate}
                loadingRate={loadingRate}
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
    scrollContent: {
      paddingHorizontal: normalize(24),
      paddingTop: normalize(16),
      paddingBottom: normalize(40),
      flexGrow: 1,
    },
    brandLogo: {
      width: "100%",
      height: normalize(120),
      maxHeight: normalize(120),
    },

    friendToggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: normalize(12),
      padding: normalize(14),
      marginVertical: normalize(20),
      gap: 12,
      rowGap: 12,
      paddingRight: 10,
    },
    friendToggleText: { flex: 1 },
    friendToggleLabel: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: 2,
    },
    friendToggleHint: {
      fontSize: normalize(16),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
      lineHeight: 18,
    },
    recipientSection: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: normalize(16),
      padding: normalize(14),
      marginBottom: normalize(14),
      backgroundColor: colors.infoCardBackgroundColor,
    },
    recipientSectionTitle: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("800"),
      color: COLORS.primary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: normalize(12),
    },
    textField: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: normalize(10),
      paddingHorizontal: normalize(14),
      paddingVertical: normalize(16),
      fontSize: normalize(20),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      backgroundColor: colors.background,
    },
    textFieldError: { borderColor: colors.error },
    fieldBlock: { marginBottom: normalize(18) },
    fieldLabel: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: 2,
      textTransform: "capitalize",
    },
    fieldHint: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
      marginBottom: 6,
    },
    errorText: {
      color: colors.error,
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      marginTop: 3,
    },
    amountBox: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: normalize(12),
      paddingHorizontal: normalize(14),
    },
    currencySymbol: {
      fontSize: normalize(24),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    amountInput: {
      flex: 1,
      paddingVertical: normalize(18),
      fontSize: normalize(24),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },

    lockedValueBox: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: normalize(12),
      paddingHorizontal: normalize(14),
      paddingVertical: normalize(14),
      backgroundColor: colors.background,
    },
    lockedValue: {
      fontSize: normalize(22),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    lockedBadge: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: "white",
      backgroundColor: colors.infoCardBackgroundColor,
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
      width: 37,
      height: 37,
      borderRadius: 6,
      backgroundColor: COLORS.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    qtyButtonText: {
      fontSize: normalize(28),
      fontFamily: getFontFamily("700"),
      color: "#fff",
    },
    qtyInput: {
      flex: 1,
      textAlign: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingVertical: normalize(12),
      fontSize: normalize(20),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },

    breakdownCard: {
      backgroundColor: colors.infoCardBackgroundColor,
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
      color: colors.text,
      flex: 1,
      flexWrap: "wrap",
    },
    breakdownValue: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      textAlign: "right",
    },
    breakdownBold: {
      fontFamily: getFontFamily("900"),
      fontSize: normalize(18),
    },

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
      lineHeight: 20,
    },

    summaryPill: {
      backgroundColor: COLORS.primary,
      borderRadius: 10,
      padding: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    summaryLabel: {
      color: "#fff",
      fontSize: normalize(20),
      fontFamily: getFontFamily("900"),
    },
    summaryAmount: {
      color: "#fff",
      fontSize: normalize(20),
      fontFamily: getFontFamily("900"),
    },
    ctaButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: 16,
      borderRadius: normalize(208),
      alignItems: "center",
    },
    ctaDisabled: { backgroundColor: "#9CA3AF", opacity: 0.6 },
    ctaText: {
      color: "#fff",
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
    },
  });
