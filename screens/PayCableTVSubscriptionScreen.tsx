import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { showError } from "../utlis/toast";
import { SelectInput } from "../components/SelectInputField";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import SaveAsBeneficiarySwitch from "../components/SaveAsBeneficiarySwitch";
import NumberInputField from "../components/NumberInputField";
import useAxios from "../hooks/useAxios";
import { formatAmount } from "../libs/formatNumber";
import { useMutation, useQuery } from "@tanstack/react-query";
import SavedBeneficiaries from "../components/banks/SavedBeneficiaries";
import { useResetFormOnMount } from "../hooks/useResetFormOnMount";

// Validation Schema
const schema = yup.object({
  smartcard_number: yup
    .string()
    .required("Smartcard/IUC number is required")
    .matches(/^[0-9]{6,15}$/, "Invalid Smartcard/IUC Number"),
  network: yup.string().required("Please select a Cable TV provider"),
  plan: yup.string().required("Select a plan"),
});

interface cardValidationStatusProps {
  validating: boolean;
  cardDetail: any;
}

interface cardValidationStatusProps {
  validating: boolean;
  cardDetail: any;
  hasInput: boolean;
}

const SmartCardValidationStatus = memo(
  ({ validating, cardDetail, hasInput }: cardValidationStatusProps) => {
    if (!hasInput) return null;

    // in-flight
    if (validating) {
      return (
        <View style={styles.validationRow}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={[styles.detailsLabel, { textAlign: "center" }]}>
            Validating user detail…
          </Text>
        </View>
      );
    }

    // validated but not found
    if (!cardDetail) {
      return (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            User detail not found. Please check the provider and smartcard
            number and try again.
          </Text>
        </View>
      );
    }

    // found
    return (
      <View style={styles.validationRow}>
        <View style={{ paddingVertical: 5 }}>
          <Text style={styles.detailsLabel}>Name</Text>
          <Text style={styles.validatingText}>{cardDetail.name}</Text>
        </View>
      </View>
    );
  },
);

export default function PayCableTVSubscriptionScreen() {
  const [loading, setLoading] = useState(false);
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const [validatingCard, setValidatingCard] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  // const [hasFiredValidation, setHasFiredValidation] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const { apiGet, apiDelete, post } = useAxios();
  const navigation: any = useNavigation();
  const [cardValid, setCardValid] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      smartcard_number: "",
      network: "",
      plan: "",
    },
    mode: "onChange",
  });

  const selectedNetwork = watch("network");
  const smartcardNumber = watch("smartcard_number");
  const plan = watch("plan");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (
      !selectedNetwork ||
      !plan ||
      !smartcardNumber ||
      smartcardNumber.length < 5
    ) {
      setValidatingCard(false);
      setCardValid(false);
      setCardDetails(null);
      return;
    }

    setValidatingCard(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await post("/bills/validate", {
          item_code: plan,
          code: selectedNetwork,
          customer: smartcardNumber,
        });

        const isSuccess = res?.data?.success;
        const customer = res?.data?.data;

        if (isSuccess && customer) {
          setCardDetails(customer);
          setCardError(null);
          setCardValid(true);
        } else {
          setCardDetails(null);
          setCardValid(false);
        }
      } catch (error: any) {
        setCardDetails(null);
        setCardValid(false);
      } finally {
        setValidatingCard(false);
      }
    }, 2000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [smartcardNumber, selectedNetwork, plan]);

  // useEffect(() => {
  //   if (debounceRef.current) clearTimeout(debounceRef.current);

  //   if (
  //     !selectedNetwork ||
  //     !plan ||
  //     !smartcardNumber ||
  //     smartcardNumber.length < 5
  //   ) {
  //     setCardValid(false);
  //     setCardDetails(null);

  //     return;
  //   }

  //   debounceRef.current = setTimeout(async () => {
  //     setValidatingCard(true);

  //     try {
  //       const res = await post("/bills/validate", {
  //         item_code: plan,
  //         code: selectedNetwork,
  //         customer: smartcardNumber,
  //       });

  //       const isSuccess = res?.data?.sucess;
  //       const customer = res?.data?.data;

  //       if (isSuccess && customer) {
  //         setCardDetails(customer);
  //         setCardError(null);
  //       } else {
  //         setCardDetails(null);
  //         setCardValid(false);
  //       }
  //     } catch (error: any) {
  //       setCardDetails(null);
  //       setCardValid(false);
  //     } finally {
  //       setValidatingCard(false);
  //     }
  //   }, 800);

  //   if (!selectedNetwork || !plan || smartcardNumber.length === 0) {
  //     setCardValid(false);
  //     setCardDetails(null);
  //     setHasFiredValidation(false);
  //     return;
  //   }

  //   return () => {
  //     if (debounceRef.current) clearTimeout(debounceRef.current);
  //   };
  // }, [smartcardNumber, selectedNetwork, plan]);

  const { data: tvPlans = [], isLoading } = useQuery({
    queryKey: ["tvPlans", selectedNetwork],
    queryFn: async () => {
      if (!selectedNetwork) return [];
      const res = await apiGet(`/bills/cable-tv-plans/${selectedNetwork}`);
      return res.data?.data || [];
    },
    enabled: !!selectedNetwork,
    refetchOnWindowFocus: false,
    staleTime: 4000,
  });

  const { mutate: deleteAll, isPending: deleting } = useMutation({
    mutationFn: async () => {
      return apiDelete("/beneficiaries/type", {
        params: { type: "cable_tv" },
      });
    },
    onSuccess: () => {
      refetch();
    },
  });

  const onSubmit = async (values: any) => {
    // Block submission if validation is still in progress or failed
    if (validatingCard) {
      showError("Please wait while we validate your smartcard number.");
      return;
    }

    if (cardError || !cardDetails) {
      showError("Please enter a valid smartcard number before proceeding.");
      return;
    }

    try {
      setLoading(true);

      const selectedPlan = tvPlans.find(
        (plan: any) => plan.item_code === values.plan,
      );

      if (!selectedPlan) {
        showError("Please select a valid subscription plan");
        return;
      }

      const payload = {
        item_code: values.plan,
        customer: values.smartcard_number,
        amount: selectedPlan.amount,
        save_as_beneficiary: saveBeneficiary,
        type: "CABLE-TV",
        biller_name: selectedPlan.biller_code || values.network,
        url: "/bills/pay-cable-tv",
        network: values?.network,
      };

      navigation.navigate("ConfirmTransaction" as never, { payload });
    } catch (error: any) {
      showError(error.response?.data?.message || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  const networks = [
    { id: "dstv", label: "DSTV", logo: require("../assets/dstv-icon.png") },
    { id: "gotv", label: "GOTV", logo: require("../assets/gotv-icon.png") },
    {
      id: "showmax",
      label: "SHOWMAX",
      logo: require("../assets/showmax-icon.png"),
    },
    {
      id: "startimes",
      label: "STARTIMES",
      logo: require("../assets/startimes-icon.png"),
    },
  ];

  const {
    data,
    isLoading: isLoadingSavedData,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["saved-beneficiaries-cabletv"],
    queryFn: async () => {
      const res = await apiGet("/beneficiaries/type", {
        params: { type: "cable_tv" },
      });
      return res?.data?.data || [];
    },
  });

  const handleProviderChange = useCallback(
    (id: string) => {
      console.log(id);
      setValue("network", id);

      setCardValid(false);
      setCardDetails(null);
    },
    [networks],
  );

  const isDisabled = !isValid || !cardValid || validatingCard || isSubmitting;

  useResetFormOnMount(reset, { network: "", smartcard_number: "", plan: "" });

  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <NumberInputField
          placeholder="Enter your Smartcard/IUC Number"
          label="Smartcard/IUC Number"
          name="smartcard_number"
          control={control}
        />
        {/* Validation feedback */}
        <SmartCardValidationStatus
          validating={validatingCard}
          cardDetail={cardDetails}
          hasInput={!!selectedNetwork && !!plan && smartcardNumber.length >= 9}
        />

        <View style={{ marginBottom: 10 }}>
          <SavedBeneficiaries
            onRefetch={refetch}
            data={data ?? []}
            isLoading={isLoadingSavedData}
            isRefetching={isRefetching}
            isError={isError}
            refetch={refetch}
            onSelect={item => {
              setValue("smartcard_number", item?.identifier);
              setValue("network", item?.meta?.provider);
            }}
            selectedBeneficiary={null}
            onDeleteAll={deleteAll}
            deleting={deleting}
          />
        </View>
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.subHeader}>Select Cable TV Provider</Text>
          <View style={styles.networkRow}>
            {networks.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.networkButton,
                  selectedNetwork === item.id && styles.networkButtonActive,
                ]}
                onPress={() => handleProviderChange(item?.id)}
              >
                {selectedNetwork === item.id && (
                  <View style={styles.checkIconContainer}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                )}
                <Image source={item.logo} style={styles.networkLogo} />
              </TouchableOpacity>
            ))}
          </View>
          {errors.network && (
            <Text style={styles.errorText}>{errors.network.message}</Text>
          )}
        </View>
        <SelectInput
          control={control}
          name="plan"
          label="Subscription Plan"
          options={
            tvPlans.length
              ? tvPlans.map((plan: any) => ({
                  label: `${plan.biller_name || plan.name} - ${formatAmount(
                    plan.amount,
                  )}`,
                  value: plan.item_code,
                }))
              : []
          }
          placeholder={
            isLoading
              ? "Loading subscription plans..."
              : "Select Subscription Plan"
          }
        />
        <SaveAsBeneficiarySwitch
          value={saveBeneficiary}
          onValueChange={setSaveBeneficiary}
          disabled={loading}
        />
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[
              styles.button,
              (validatingCard || !!cardError || !cardDetails) && {
                opacity: 0.5,
              },
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isDisabled}
          >
            <Text style={styles.buttonText}>
              {loading
                ? "Processing..."
                : validatingCard
                ? "Validating..."
                : "Proceed"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  validationRow: {
    marginVertical: 10,
    paddingHorizontal: 17,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 10,
  },
  validatingText: {
    color: "black",
    fontFamily: getFontFamily("800"),
  },
  cardSuccessRow: {
    marginVertical: 10,
    paddingHorizontal: 17,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    gap: 5,
  },
  cardSuccessText: {
    fontSize: 13,
    fontFamily: getFontFamily("700"),
    color: "#000",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  subHeader: {
    marginTop: 20,
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    marginBottom: 8,
    color: "#1A1A1A",
  },
  networkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  networkButton: {
    borderWidth: 1,
    borderColor: "#fbfbfbff",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 75,
    height: 75,
  },
  networkButtonActive: {
    borderColor: "#FBBF24",
  },
  networkLogo: {
    width: 73,
    height: 73,
    borderRadius: 8,
    resizeMode: "cover",
  },
  checkIconContainer: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  checkIcon: {
    color: "#fff",
    fontSize: 12,
    fontFamily: getFontFamily("900"),
  },
  beneficiaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: normalize(18),
    fontFamily: getFontFamily("900"),
  },
  beneficiaryText: {
    fontSize: normalize(18),
    color: "#374151",
    fontFamily: getFontFamily("700"),
  },
  errorText: {
    color: "#EF4444",
    marginTop: 4,
    marginBottom: 10,
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
  buttonWrapper: {
    marginTop: 32,
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 100,
    marginTop: 30,
    justifyContent: "center",
    alignContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    textAlign: "center",
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
    justifyContent: "flex-start",
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
});
