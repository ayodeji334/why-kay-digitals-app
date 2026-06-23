import React, { useState, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { SelectInput } from "../components/SelectInputField";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import SaveAsBeneficiarySwitch from "../components/SaveAsBeneficiarySwitch";
import useAxios from "../hooks/useAxios";
import { formatWithCommas } from "./SwapCryptoScreen";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useResetFormOnMount } from "../hooks/useResetFormOnMount";
import SavedBeneficiaries from "../components/banks/SavedBeneficiaries";
import { AppText } from "../components/AppText";

interface BettingProvider {
  biller_id: string;
  name: string;
  logo: string;
  id: string;
  lookup_id: string;
}

interface FormValues {
  provider: string;
  customer_id: string;
  amount: number;
}

// Schema
const schema = yup.object({
  provider: yup.string().required("Please select a betting provider"),
  customer_id: yup
    .string()
    .required("Customer ID is required")
    .min(5, "Customer ID is too short"),
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount must be greater than zero")
    .required("Amount is required"),
});

// Customer validation status
interface CustomerValidationStatusProps {
  validating: boolean;
  userDetail: any;
  hasInput: boolean;
}

const CustomerValidationStatus = memo(
  ({ validating, userDetail, hasInput }: CustomerValidationStatusProps) => {
    if (!hasInput) return null;

    if (validating) {
      return (
        <View style={styles.detailsContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <AppText style={[styles.detailsLabel, { textAlign: "center" }]}>
            Validating customer ID…
          </AppText>
        </View>
      );
    }

    if (!userDetail) {
      return (
        <View style={styles.warningContainer}>
          <AppText style={styles.warningText}>
            Customer not found. Please check the provider and customer ID and
            try again.
          </AppText>
        </View>
      );
    }

    return (
      <View style={styles.detailsContainer}>
        <View style={{ paddingVertical: 5 }}>
          <AppText style={styles.detailsLabel}>Name</AppText>
          <AppText style={styles.detailsValue}>{userDetail}</AppText>
        </View>
      </View>
    );
  },
);

// Main screen
export default function FundBettingAccountScreen() {
  const { post, apiGet, apiDelete } = useAxios();
  const navigation: any = useNavigation();
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string | null>(
    null,
  );
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);
  const [displayAmount, setDisplayAmount] = useState("");
  const [validatingCustomer, setValidatingCustomer] = useState(false);
  const [customerValid, setCustomerValid] = useState(false);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [hasFiredValidation, setHasFiredValidation] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: { provider: "", customer_id: "", amount: 0 },
  });

  const providerCode = watch("provider");
  const customerId = watch("customer_id");

  // Queries
  const {
    data: providers = [],
    isLoading: isLoadingProviders,
    refetch: refetchProviders,
  } = useQuery({
    queryKey: ["betting-providers"],
    queryFn: async () => {
      const res = await apiGet("/bills/betting-providers");
      return res.data?.data || [];
    },
    refetchOnWindowFocus: true,
  });

  const {
    data: beneficiaries,
    isLoading: isLoadingSavedData,
    isError,
    refetch: refetchBeneficiaries,
    isRefetching,
  } = useQuery({
    queryKey: ["betting-beneficiaries-data"],
    queryFn: async () => {
      const res = await apiGet("/beneficiaries/type", {
        params: { type: "betting" },
      });
      return res?.data?.data || [];
    },
  });

  // Refetch both on screen focus
  useFocusEffect(
    useCallback(() => {
      refetchProviders();
      refetchBeneficiaries();
    }, [refetchProviders, refetchBeneficiaries]),
  );

  // Delete all beneficiaries
  const { mutate: deleteAll, isPending: deleting } = useMutation({
    mutationFn: async () => {
      return apiDelete("/beneficiaries/type", {
        params: { type: "betting" },
      });
    },
    onSuccess: () => {
      refetchBeneficiaries();
      setSelectedBeneficiary(null);
    },
  });

  // Provider options
  const providerOptions = useMemo(
    () =>
      providers.map((p: BettingProvider) => ({
        label: p.name,
        value: p.biller_id || p.id,
        icon: p.logo,
        id: p.lookup_id,
      })),
    [providers],
  );

  // Validation
  const validateCustomer = useCallback(
    async (customer: string, provider: string) => {
      if (!customer || !provider) return;

      setValidatingCustomer(true);
      setCustomerValid(false);
      setUserDetail(null);
      setHasFiredValidation(true);

      const selectProvider = providerOptions.find(
        (option: any) => option.value === provider,
      );

      try {
        const res = await post("/bills/validate-betting-account", {
          provider_id: selectProvider?.id,
          customer_id: customer,
        });

        console.log(res);

        if (res.data?.success) {
          setCustomerValid(true);
          setUserDetail(res.data.data);
        } else {
          setCustomerValid(false);
          setUserDetail(null);
        }
      } catch {
        setCustomerValid(false);
        setUserDetail(null);
      } finally {
        setValidatingCustomer(false);
      }
    },
    [post, providerOptions],
  );

  const handleProviderChange = useCallback(
    (value: string) => {
      setCustomerValid(false);
      setUserDetail(null);
      setHasFiredValidation(false);
      if (customerId && customerId.length >= 3) {
        setHasFiredValidation(true);
        setValidatingCustomer(true);
        validateCustomer(customerId, value);
      }
    },
    [customerId, validateCustomer],
  );

  const handleCustomerIdChange = useCallback(
    (text: string) => {
      setValue("customer_id", text, { shouldValidate: true });
      setCustomerValid(false);
      setUserDetail(null);
      setHasFiredValidation(false);
    },
    [setValue],
  );

  const handleCustomerIdBlur = useCallback(() => {
    if (customerId && customerId.length >= 3 && providerCode) {
      setHasFiredValidation(true);
      setValidatingCustomer(true);
      validateCustomer(customerId, providerCode);
    }
  }, [customerId, providerCode, validateCustomer]);

  // Select from saved beneficiary

  const handleSelectBeneficiary = useCallback(
    async (item: any) => {
      const customerId = item?.identifier ?? "";
      const provider = item?.meta?.provider ?? "";

      setValue("customer_id", customerId, { shouldValidate: true });
      setValue("provider", provider, { shouldValidate: true });
      setSelectedBeneficiary(item?.id ?? null);

      // Trigger validation so form errors clear immediately
      await trigger(["customer_id", "provider"]);

      // Auto-validate the customer with the selected beneficiary data
      if (customerId && provider) {
        setHasFiredValidation(true);
        setValidatingCustomer(true);
        validateCustomer(customerId, provider);
      }
    },
    [setValue, trigger, validateCustomer],
  );

  // Amount

  const handleAmountChange = useCallback(
    (text: string) => {
      const numeric = text.replace(/,/g, "");
      const parsed = parseFloat(numeric);
      setValue("amount", isNaN(parsed) ? 0 : parsed, { shouldValidate: true });
      setDisplayAmount(formatWithCommas(numeric));
    },
    [setValue],
  );

  // Submit

  const onSubmit = useCallback(
    async (data: FormValues) => {
      const selectedOption = providerOptions.find(
        (p: any) => p.value === data.provider,
      );

      navigation.navigate("ConfirmTransaction", {
        payload: {
          customer: data.customer_id,
          type: "betting",
          amount: data.amount,
          biller_name: selectedOption?.value,
          provider_short_name: selectedOption?.name,
          save_as_beneficiary: saveBeneficiary,
          phone_number: data.customer_id,
          url: "/bills/fund-betting-account",
        },
      });
    },
    [providerOptions, saveBeneficiary, navigation],
  );

  // Reset on mount

  useResetFormOnMount(
    reset,
    { provider: "", customer_id: "", amount: 0 },
    () => {
      setDisplayAmount("");
      setHasFiredValidation(false);
      setCustomerValid(false);
      setUserDetail(null);
    },
  );

  const isDisabled =
    !isValid || !customerValid || validatingCustomer || isSubmitting;

  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Provider */}
        <SelectInput
          control={control}
          name="provider"
          label="Select Provider"
          placeholder={
            isLoadingProviders
              ? "Loading providers..."
              : "Select betting provider"
          }
          options={providerOptions}
          onChange={handleProviderChange}
        />

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

        <View style={{ marginTop: -10 }}>
          <AppText style={styles.label}>Customer ID</AppText>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { paddingHorizontal: 15 }]}
              placeholder="Enter customer ID"
              placeholderTextColor="#aeaeaeff"
              value={customerId}
              onChangeText={handleCustomerIdChange}
              onBlur={handleCustomerIdBlur}
              autoCapitalize="none"
              keyboardType="numeric"
              maxFontSizeMultiplier={1}
              allowFontScaling={false}
            />
          </View>
          {errors.customer_id && (
            <AppText style={styles.errorText}>
              {errors.customer_id.message as string}
            </AppText>
          )}
        </View>

        <CustomerValidationStatus
          validating={validatingCustomer}
          userDetail={userDetail}
          hasInput={hasFiredValidation && !!customerId && !!providerCode}
        />

        <View style={{ marginBottom: 2, marginTop: 10 }}>
          <AppText style={styles.label}>Amount</AppText>
          <View style={styles.inputContainer}>
            <AppText style={styles.currencySign}>₦</AppText>
            <TextInput
              style={[
                styles.input,
                { fontSize: normalize(22), fontFamily: getFontFamily("800") },
              ]}
              keyboardType="numeric"
              placeholderTextColor="#aeaeaeff"
              placeholder="0.00"
              value={displayAmount}
              onChangeText={handleAmountChange}
              maxFontSizeMultiplier={1}
              allowFontScaling={false}
            />
          </View>
          {errors.amount && (
            <AppText style={styles.errorText}>
              {errors.amount.message as string}
            </AppText>
          )}
        </View>

        <SaveAsBeneficiarySwitch
          value={saveBeneficiary}
          onValueChange={setSaveBeneficiary}
          disabled={isSubmitting}
        />

        <TouchableOpacity
          style={[styles.button, isDisabled && { opacity: 0.5 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isDisabled}
        >
          <AppText style={styles.buttonText}>
            {isSubmitting
              ? "Processing..."
              : validatingCustomer
              ? "Validating..."
              : "Continue"}
          </AppText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 16, paddingVertical: 20 },
  label: {
    marginBottom: 6,
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000000ff",
  },
  errorText: {
    color: "red",
    fontSize: normalize(14),
    marginTop: 4,
    fontFamily: getFontFamily("600"),
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
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: normalize(20),
    fontFamily: getFontFamily("700"),
    color: "#000",
  },
  currencySign: {
    fontSize: normalize(22),
    fontFamily: getFontFamily("800"),
    color: "#000",
    paddingLeft: 10,
  },
  detailsContainer: {
    marginVertical: 10,
    paddingHorizontal: 17,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "column",
    gap: 5,
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
    color: "#db0b0b",
    fontSize: normalize(16),
    fontFamily: getFontFamily("800"),
    textAlign: "center",
  },
  detailsLabel: {
    fontSize: 12,
    fontFamily: getFontFamily("900"),
    color: "#000",
  },
  detailsValue: {
    fontSize: 13,
    fontFamily: getFontFamily("700"),
    color: "#000",
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 100,
    marginTop: 10,
    justifyContent: "center",
    alignContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    textAlign: "center",
  },
});
