import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
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
import { useNavigation } from "@react-navigation/native";
import SaveAsBeneficiarySwitch from "../components/SaveAsBeneficiarySwitch";
import useAxios from "../hooks/useAxios";
import { formatWithCommas } from "./SwapCryptoScreen";
import { useQuery } from "@tanstack/react-query";
import { useResetFormOnMount } from "../hooks/useResetFormOnMount";

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

const schema = yup.object({
  provider: yup.string().required("Please select a betting provider"),
  customer_id: yup
    .string()
    .required("Customer ID is required")
    .min(3, "Customer ID is too short"),
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount must be greater than zero")
    .required("Amount is required"),
});

interface CustomerValidationStatusProps {
  validating: boolean;
  userDetail: any;
  hasInput: boolean;
}

const CustomerValidationStatus = memo(
  ({ validating, userDetail, hasInput }: CustomerValidationStatusProps) => {
    if (!hasInput) return null;
    console.log(userDetail);
    if (validating) {
      return (
        <View style={styles.detailsContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={[styles.detailsLabel, { textAlign: "center" }]}>
            Validating customer ID…
          </Text>
        </View>
      );
    }

    if (!userDetail) {
      return (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Customer not found. Please check the provider and customer ID and
            try again.
          </Text>
        </View>
      );
    }

    if (userDetail && !validating && hasInput) {
      return (
        <View style={styles.detailsContainer}>
          <View style={{ paddingVertical: 5 }}>
            <Text style={styles.detailsLabel}>Name</Text>
            <Text style={styles.detailsValue}>{userDetail}</Text>
          </View>
        </View>
      );
    }

    return null;
  },
);

export default function FundBettingAccountScreen() {
  const { post, apiGet } = useAxios();
  const navigation: any = useNavigation();

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
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: { provider: "", customer_id: "", amount: 0 },
  });

  const providerCode = watch("provider");
  const customerId = watch("customer_id");

  const { data: providers = [], isLoading: isLoadingProviders } = useQuery({
    queryKey: ["betting-providers"],
    queryFn: async () => {
      const res = await apiGet("/bills/betting-providers");
      return res.data?.data || [];
    },
    refetchOnWindowFocus: false,
  });

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
      console.log(value);
      setCustomerValid(false);
      setUserDetail(null);
      setHasFiredValidation(false);

      if (customerId && customerId.length >= 3) {
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
      validateCustomer(customerId, providerCode);
    }
  }, [customerId, providerCode, validateCustomer]);

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

  const isDisabled =
    !isValid || !customerValid || validatingCustomer || isSubmitting;

  useResetFormOnMount(
    reset,
    { provider: "", customer_id: "", amount: 0 },
    () => {
      setDisplayAmount("");
    },
  );

  useEffect(() => {
    setHasFiredValidation(false);
  }, []);

  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

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
              : "Select betting provider"
          }
          options={providerOptions}
          onChange={handleProviderChange}
        />

        <View style={{ marginTop: 10 }}>
          <Text style={styles.label}>Customer ID</Text>
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
            />
          </View>
          {errors.customer_id && (
            <Text style={styles.errorText}>
              {errors.customer_id.message as string}
            </Text>
          )}
        </View>

        <CustomerValidationStatus
          validating={validatingCustomer}
          userDetail={userDetail}
          hasInput={hasFiredValidation && !!customerId && !!providerCode}
        />

        <View style={{ marginBottom: 2, marginTop: 10 }}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySign}>₦</Text>
            <TextInput
              style={[
                styles.input,
                {
                  fontSize: normalize(22),
                  fontFamily: getFontFamily("800"),
                },
              ]}
              keyboardType="numeric"
              placeholderTextColor="#aeaeaeff"
              placeholder="0.00"
              value={displayAmount}
              onChangeText={handleAmountChange}
            />
          </View>

          {errors.amount && (
            <Text style={styles.errorText}>
              {errors.amount.message as string}
            </Text>
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
          <Text style={styles.buttonText}>
            {isSubmitting
              ? "Processing..."
              : validatingCustomer
              ? "Validating..."
              : "Continue"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
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
    // paddingHorizontal: 16,
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
