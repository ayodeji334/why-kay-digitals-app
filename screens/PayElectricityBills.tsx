import React, {
  useState,
  useEffect,
  memo,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { SelectInput } from "../components/SelectInputField";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import SaveAsBeneficiarySwitch from "../components/SaveAsBeneficiarySwitch";
import NumberInputField from "../components/NumberInputField";
import useAxios from "../hooks/useAxios";
import { formatWithCommas } from "./SwapCryptoScreen";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useResetFormOnMount } from "../hooks/useResetFormOnMount";
import SavedBeneficiaries from "../components/banks/SavedBeneficiaries";
import { AppText } from "../components/AppText";
import { useFiatBalance } from "../hooks/useFiatBalance";
import { formatAmount } from "../libs/formatNumber";
import { useColors } from "../hooks/useTheme";

interface ElectricityProvider {
  biller_code: string;
  name: string;
  logo: string;
  code: string;
  status: boolean;
  short_name: string;
  items?: any[];
}

const schema = yup.object({
  provider: yup.string().required("Please select an electricity provider"),
  meter_number: yup
    .string()
    .required("Meter number is required")
    .matches(/^[0-9]{6,13}$/, "Invalid meter number"),
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount is required")
    .required("Amount is required"),
});

interface MeterValidationStatusProps {
  validating: boolean;
  userDetail: any;
  hasInput: boolean;
}

const MeterValidationStatus = memo(
  ({ validating, userDetail, hasInput }: MeterValidationStatusProps) => {
    const colors = useColors();
    const styles = makeStyles(colors);

    if (!hasInput) return null;

    if (validating) {
      return (
        <View style={styles.detailsContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <AppText style={[styles.detailsLabel, { textAlign: "center" }]}>
            Validating meter number…
          </AppText>
        </View>
      );
    }

    if (!userDetail) {
      return (
        <View style={styles.warningContainer}>
          <AppText style={styles.warningText}>
            User detail not found. Please check the provider and meter number
            and try again.
          </AppText>
        </View>
      );
    }

    return (
      <View style={styles.detailsContainer}>
        <View style={{ paddingVertical: 5 }}>
          <AppText style={styles.detailsLabel}>Name</AppText>
          <AppText style={styles.detailsValue}>{userDetail.name}</AppText>
        </View>
        <View style={{ paddingVertical: 5 }}>
          <AppText style={styles.detailsLabel}>Address</AppText>
          <AppText style={styles.detailsValue}>{userDetail.address}</AppText>
        </View>
      </View>
    );
  },
);

interface PaymentTypeSelectorProps {
  isPrepaid: boolean;
  hasPrepaid: boolean;
  hasPostpaid: boolean;
  disabled: boolean;
  onSelect: (value: boolean) => void;
}

const PaymentTypeSelector = memo(
  ({
    isPrepaid,
    hasPrepaid,
    hasPostpaid,
    disabled,
    onSelect,
  }: PaymentTypeSelectorProps) => {
    const colors = useColors();
    const styles = makeStyles(colors);

    return (
      // <View style={styles.paymentTypeContainer}>
      //   <TouchableOpacity
      //     activeOpacity={0.89}
      //     style={[
      //       styles.paymentTypeButton,
      //       isPrepaid && styles.paymentTypeButtonActive,
      //       (!hasPrepaid || disabled) && { opacity: 0.5 },
      //     ]}
      //     onPress={() => onSelect(true)}
      //     disabled={!hasPrepaid || disabled}
      //   >
      //     <AppText
      //       style={[
      //         styles.paymentTypeText,
      //         isPrepaid && styles.paymentTypeTextActive,
      //       ]}
      //     >
      //       Pre Paid
      //     </AppText>
      //   </TouchableOpacity>

      //   <TouchableOpacity
      //     style={[
      //       styles.paymentTypeButton,
      //       !isPrepaid && styles.paymentTypeButtonActive,
      //       (!hasPostpaid || disabled) && { opacity: 0.5 },
      //     ]}
      //     onPress={() => onSelect(false)}
      //     disabled={!hasPostpaid || disabled}
      //   >
      //     <AppText
      //       style={[
      //         styles.paymentTypeText,
      //         !isPrepaid && styles.paymentTypeTextActive,
      //       ]}
      //     >
      //       Post Paid
      //     </AppText>
      //   </TouchableOpacity>
      // </View>
      <View style={styles.paymentTypeContainer}>
        <TouchableOpacity
          activeOpacity={0.89}
          style={[
            styles.paymentTypeButton,
            (!hasPrepaid || disabled) && { opacity: 0.5 },
          ]}
          onPress={() => onSelect(true)}
          disabled={!hasPrepaid || disabled}
        >
          <AppText
            style={[
              styles.paymentTypeText,
              isPrepaid && styles.paymentTypeTextActive,
            ]}
          >
            Pre Paid
          </AppText>

          <View
            style={[styles.radioOuter, isPrepaid && styles.radioOuterActive]}
          >
            {isPrepaid && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.89}
          style={[
            styles.paymentTypeButton,
            (!hasPostpaid || disabled) && { opacity: 0.5 },
          ]}
          onPress={() => onSelect(false)}
          disabled={!hasPostpaid || disabled}
        >
          <AppText
            style={[
              styles.paymentTypeText,
              !isPrepaid && styles.paymentTypeTextActive,
            ]}
          >
            Post Paid
          </AppText>

          <View
            style={[styles.radioOuter, !isPrepaid && styles.radioOuterActive]}
          >
            {!isPrepaid && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      </View>
    );
  },
);

export default function PayElectricityBillsScreen() {
  const { post, apiGet, apiDelete } = useAxios();
  const navigation: any = useNavigation();
  const [isPrepaid, setIsPrepaid] = useState(true);
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);
  const [displayAmount, setDisplayAmount] = useState("");
  const [validatingMeter, setValidatingMeter] = useState(false);
  const [meterValid, setMeterValid] = useState(false);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [selectedProviderItems, setSelectedProviderItems] = useState<any[]>([]);
  const [hasFiredValidation, setHasFiredValidation] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string | null>(
    null,
  );

  const colors = useColors();
  const styles = makeStyles(colors);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    trigger,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: { provider: "", meter_number: "", amount: 0 },
  });

  const meterNumber = useWatch({ control, name: "meter_number" });
  const providerCode = useWatch({ control, name: "provider" });
  const amount = useWatch({ control, name: "amount" });
  const { fiatBalance } = useFiatBalance();

  const {
    data: providers = [],
    isLoading: isLoadingProviders,
    refetch: refetchProviders,
  } = useQuery({
    queryKey: ["electricityProviders"],
    queryFn: async () => {
      const res = await apiGet("/bills/electricity-bills-providers");
      return res.data?.data || [];
    },
    refetchOnWindowFocus: false,
  });

  const {
    data: beneficiaries,
    isLoading: isLoadingSavedData,
    isError,
    refetch: refetchBeneficiaries,
    isRefetching,
  } = useQuery({
    queryKey: ["electricity-beneficiaries-data"],
    queryFn: async () => {
      const res = await apiGet("/beneficiaries/type", {
        params: { type: "electricity" },
      });
      return res?.data?.data || [];
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetchProviders();
      refetchBeneficiaries();
    }, [refetchProviders, refetchBeneficiaries]),
  );

  const { mutate: deleteAll, isPending: deleting } = useMutation({
    mutationFn: async () => {
      return apiDelete("/beneficiaries/type", {
        params: { type: "electricity" },
      });
    },
    onSuccess: () => {
      refetchBeneficiaries();
      setSelectedBeneficiary(null);
    },
  });

  const providerOptions = useMemo(
    () =>
      providers
        .filter((p: any) => p.name.toLowerCase().includes("bills"))
        .map((p: ElectricityProvider) => ({
          label: p.name,
          value: p.code || p.biller_code,
          icon: p.logo,
          name: p.short_name,
        })),
    [providers],
  );

  const { hasPrepaid, hasPostpaid } = useMemo(
    () => ({
      hasPrepaid: selectedProviderItems.some(i =>
        i.biller_name?.toLowerCase().includes("prepaid"),
      ),
      hasPostpaid: selectedProviderItems.some(i =>
        i.biller_name?.toLowerCase().includes("postpaid"),
      ),
    }),
    [selectedProviderItems],
  );

  const handleProviderChange = useCallback(
    (value: string) => {
      const provider = providers.find(
        (p: any) => p.biller_code === value || p.code === value,
      );

      setSelectedProviderItems(provider?.items || []);
      setMeterValid(false);
      setUserDetail(null);
      setHasFiredValidation(false);
    },
    [providers],
  );

  const validateMeter = useCallback(
    async (meter: string, itemCode: string, provider: string) => {
      if (!/^[0-9]{6,13}$/.test(meter)) return;

      setMeterValid(false);
      setUserDetail(null);

      try {
        const res = await post("/bills/validate", {
          item_code: itemCode,
          code: provider,
          customer: meter,
        });

        if (res.data?.success) {
          setMeterValid(true);
          setUserDetail(res.data.data);
        } else {
          setMeterValid(false);
          setUserDetail(null);
        }
      } catch {
        setMeterValid(false);
        setUserDetail(null);
      } finally {
        setValidatingMeter(false);
      }
    },
    [post],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (
      !meterNumber ||
      !providerCode ||
      selectedProviderItems.length === 0 ||
      meterNumber.length <= 8
    ) {
      setMeterValid(false);
      setUserDetail(null);
      setHasFiredValidation(false);
      setValidatingMeter(false);
      return;
    }

    const selectedItem = selectedProviderItems.find((item: any) => {
      const searchIn = [
        item.biller_name?.toLowerCase(),
        item.name?.toLowerCase(),
        item.short_name?.toLowerCase(),
      ]
        .filter(Boolean)
        .join(" ");
      return searchIn.includes(isPrepaid ? "prepaid" : "postpaid");
    });

    if (!selectedItem?.item_code) return;

    setHasFiredValidation(true);
    setValidatingMeter(true);

    debounceRef.current = setTimeout(() => {
      validateMeter(meterNumber, selectedItem.item_code, providerCode);
    }, 2000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [meterNumber, providerCode, isPrepaid, selectedProviderItems]);

  const handleSelectBeneficiary = useCallback(
    async (item: any) => {
      const meter = item?.identifier ?? "";
      const provider = item?.meta?.service ?? "";

      setValue("meter_number", meter, { shouldValidate: true });
      setValue("provider", provider, { shouldValidate: true });
      setSelectedBeneficiary(item?.id ?? null);

      // Update selected provider items so prepaid/postpaid selector works
      const matchedProvider = providers.find(
        (p: any) => p.biller_code === provider || p.code === provider,
      );
      setSelectedProviderItems(matchedProvider?.items || []);

      // Clear validation state — meter debounce useEffect will re-trigger
      setMeterValid(false);
      setUserDetail(null);
      setHasFiredValidation(false);

      // Trigger form validation to clear errors immediately
      await trigger(["meter_number", "provider"]);
    },
    [setValue, trigger, providers],
  );

  const handleAmountChange = useCallback(
    (text: string) => {
      const numeric = text.replace(/,/g, "");
      const parsed = parseFloat(numeric);
      setValue("amount", isNaN(parsed) ? 0 : parsed, { shouldValidate: true });
      setDisplayAmount(formatWithCommas(numeric));
    },
    [setValue],
  );

  const onSubmit = useCallback(
    async (data: any) => {
      const selectedOption = providerOptions.find(
        (p: any) => p.value === data.provider,
      );

      const selectedItem = selectedProviderItems.find((item: any) =>
        item.biller_name
          ?.toLowerCase()
          .includes(isPrepaid ? "prepaid" : "postpaid"),
      );

      navigation.navigate("ConfirmTransaction", {
        payload: {
          customer: data.meter_number,
          amount: parseFloat(data.amount),
          biller_name: selectedOption?.value,
          item_code: selectedItem?.item_code || "",
          provider_short_name: selectedOption?.label,
          save_as_beneficiary: saveBeneficiary,
          type: isPrepaid ? "Prepaid" : "Postpaid",
          url: "/bills/buy-electricity",
        },
      });
    },
    [
      providerOptions,
      selectedProviderItems,
      isPrepaid,
      saveBeneficiary,
      navigation,
    ],
  );

  const hasInsufficientBalance = useMemo(() => {
    const numericBalance = parseFloat(fiatBalance);
    return !!amount && !isNaN(numericBalance) && amount > numericBalance;
  }, [amount, fiatBalance]);

  const isDisabled =
    !isValid ||
    !meterValid ||
    validatingMeter ||
    isSubmitting ||
    hasInsufficientBalance;

  useResetFormOnMount(
    reset,
    { provider: "", meter_number: "", amount: 0 },
    () => {
      setDisplayAmount("");
      setHasFiredValidation(false);
      setMeterValid(false);
      setUserDetail(null);
      setSelectedProviderItems([]);
    },
  );

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SelectInput
          control={control}
          name="provider"
          label="Select Provider"
          placeholder={
            isLoadingProviders
              ? "Loading providers..."
              : "Select electricity provider"
          }
          loading={isLoadingProviders}
          options={providerOptions}
          onChange={handleProviderChange}
        />

        {/* Saved beneficiaries */}
        <View style={{ marginBottom: 10 }}>
          <SavedBeneficiaries
            onRefetch={refetchBeneficiaries}
            data={beneficiaries ?? []}
            isRefetching={isRefetching}
            isLoading={isLoadingSavedData || isRefetching}
            isError={isError}
            refetch={refetchBeneficiaries}
            onSelect={handleSelectBeneficiary}
            selectedBeneficiary={selectedBeneficiary}
            onDeleteAll={deleteAll}
            deleting={deleting}
          />
        </View>

        {/* Meter number */}
        <View style={{ marginTop: -10 }}>
          <NumberInputField
            placeholder="Enter Meter Number"
            label="Meter Number"
            name="meter_number"
            control={control}
          />
        </View>

        <MeterValidationStatus
          validating={validatingMeter}
          userDetail={userDetail}
          hasInput={hasFiredValidation}
        />

        {/* Prepaid / Postpaid */}
        <PaymentTypeSelector
          isPrepaid={isPrepaid}
          hasPrepaid={hasPrepaid}
          hasPostpaid={hasPostpaid}
          disabled={isSubmitting}
          onSelect={setIsPrepaid}
        />

        {/* Amount */}
        <View style={{ marginBottom: 2, marginTop: 10 }}>
          <AppText style={styles.label}>Amount</AppText>
          <View style={styles.inputContainer}>
            <AppText style={styles.dollarSign}>₦</AppText>
            <TextInput
              maxFontSizeMultiplier={1}
              allowFontScaling={false}
              style={styles.input}
              keyboardType="numeric"
              placeholderTextColor="#aeaeaeff"
              placeholder="0.00"
              value={displayAmount}
              onChangeText={handleAmountChange}
            />
          </View>
          {errors.amount && (
            <AppText style={styles.errorText}>
              {errors.amount.message as string}
            </AppText>
          )}
        </View>
        <View style={styles.balanceCard}>
          <AppText style={styles.balanceLabel}>
            Wallet Balance: {formatAmount(fiatBalance ?? 0)}
          </AppText>
        </View>

        {hasInsufficientBalance && (
          <View style={styles.warningContainer}>
            <AppText style={styles.warningText}>
              Insufficent Balance. You do not have enough money in your fiat
              wallet to complete this transaction.
            </AppText>
          </View>
        )}

        <SaveAsBeneficiarySwitch
          value={saveBeneficiary}
          onValueChange={setSaveBeneficiary}
          disabled={isSubmitting}
        />

        <TouchableOpacity
          style={[styles.button, isDisabled && { opacity: 0.5 }]}
          onPress={handleSubmit(onSubmit)}
          // disabled={isDisabled}
        >
          <AppText style={styles.buttonText}>
            {isSubmitting
              ? "Processing..."
              : validatingMeter
              ? "Validating..."
              : "Continue"}
          </AppText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollView: { flexGrow: 1 },
    content: { paddingHorizontal: 16, paddingVertical: 20 },
    label: {
      marginBottom: 6,
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    errorText: {
      color: colors.error,
      fontSize: normalize(14),
      marginTop: 4,
      fontFamily: getFontFamily("600"),
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      gap: 5,
    },
    input: {
      flex: 1,
      paddingVertical: normalize(14),
      fontSize: normalize(26),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    dollarSign: {
      fontSize: normalize(22),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      paddingLeft: 15,
    },
    paymentTypeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
      marginBottom: 20,
      gap: 12,
    },
    // paymentTypeButton: {
    //   flex: 1,
    //   borderWidth: 1,
    //   borderColor: colors.border,
    //   borderRadius: 10,
    //   paddingVertical: 14,
    //   alignItems: "center",
    //   backgroundColor: colors.background,
    // },
    // paymentTypeContainer: {
    //   gap: 10,
    // },
    paymentTypeButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: normalize(17),
      paddingHorizontal: normalize(17),
      borderWidth: 1,
      borderRadius: 10,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    paymentTypeText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily(700),
      color: colors.text,
    },
    // paymentTypeTextActive: {
    //   color: colors.text,
    // },
    radioOuter: {
      width: 17,
      height: 17,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    radioOuterActive: {
      borderColor: colors.text,
    },
    radioInner: {
      width: 11,
      height: 11,
      borderRadius: 5.5,
      backgroundColor: colors.text,
    },
    paymentTypeTextActive: {
      color: colors.text,
      fontFamily: getFontFamily("700"),
      borderColor: colors.border,
      fontSize: normalize(18),
    },
    detailsContainer: {
      marginVertical: 10,
      paddingHorizontal: 17,
      paddingVertical: 10,
      backgroundColor: colors.infoCardBackgroundColor,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "column",
      justifyContent: "flex-start",
      gap: 5,
    },
    balanceCard: {
      // backgroundColor: COLORS.secondary + "15",
      // borderRadius: 12,
      paddingHorizontal: normalize(10),
      paddingVertical: normalize(9),
    },
    balanceLabel: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: "#000000",
      marginBottom: 4,
    },
    balanceValue: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("900"),
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
      fontSize: normalize(16),
      fontFamily: getFontFamily("800"),
      textAlign: "center",
    },
    detailsLabel: {
      fontSize: normalize(16),
      fontFamily: getFontFamily("900"),
      color: colors.text,
    },
    detailsValue: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      color: colors.text,
    },
    button: {
      backgroundColor: COLORS.secondary,
      paddingVertical: 14,
      borderRadius: 100,
      marginTop: 10,
      justifyContent: "center",
      alignContent: "center",
    },
    buttonText: {
      color: "#fff",
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
      textAlign: "center",
    },
  });
