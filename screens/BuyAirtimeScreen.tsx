import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import CustomLoading from "../components/CustomLoading";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import TextInputField from "../components/TextInputField";
import { formatAmount } from "../libs/formatNumber";
import SaveAsBeneficiarySwitch from "../components/SaveAsBeneficiarySwitch";
import NumberInputField from "../components/NumberInputField";
import SavedBeneficiaries from "../components/banks/SavedBeneficiaries";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import { useResetFormOnMount } from "../hooks/useResetFormOnMount";
import { AppText } from "../components/AppText";

const schema = yup.object({
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^(?:\+234|0)\d{10}$/, "Please provide a valid phone number"),
  network: yup.string().required("Please select a network provider"),
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .required("Amount is required")
    .min(50, "Minimum amount is ₦50")
    .max(100000, "Maximum amount is ₦100,000"),
});

const formatPhoneNumber = (phone: string) => {
  if (!phone) return phone;
  if (phone.startsWith("+234")) {
    return phone;
  }

  if (phone.startsWith("0")) {
    return `+234${phone.slice(1)}`;
  }
};

export default function BuyAirtimeScreen() {
  const [loading, setLoading] = useState(false);
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const navigation: any = useNavigation();
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string | null>(
    null,
  );
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { apiGet, apiDelete } = useAxios();

  const selectedNetwork = watch("network");
  const amount = watch("amount");

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000, 10000];

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);

      const payload = {
        customer: formatPhoneNumber(values.phone),
        amount: parseFloat(values.amount),
        type: "AIRTIME",
        biller_name: values.network,
        network: selectedNetwork,
        save_as_beneficiary: saveBeneficiary,
        url: "/bills/buy-airtime",
      };

      navigation.navigate("ConfirmTransaction" as never, {
        payload,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSelect = (selectedAmount: number) => {
    setValue("amount", selectedAmount, { shouldValidate: true });
  };

  const networks = [
    { id: "mtn", label: "MTN", logo: require("../assets/mtn-new.svg") },
    { id: "glo", label: "GLO", logo: require("../assets/glo-logo.png") },
    {
      id: "airtel",
      label: "Airtel",
      logo: require("../assets/airtel-logo.png"),
    },
    {
      id: "9mobile",
      label: "9mobile",
      logo: require("../assets/nine-mobile.png"),
    },
  ];

  const {
    data,
    isLoading: isLoadingSavedData,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["saved-beneficiaries-airtime"],
    queryFn: async () => {
      const res = await apiGet("/beneficiaries/type", {
        params: { type: "airtime" },
      });
      return res?.data?.data || [];
    },
  });

  const { mutate: deleteAll, isPending: deleting } = useMutation({
    mutationFn: async () => {
      return apiDelete("/beneficiaries/type", {
        params: { type: "airtime" },
      });
    },
    onSuccess: () => {
      refetch();
      setSelectedBeneficiary(null);
    },
  });

  useResetFormOnMount(reset, { network: "", phone: "" });

  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <NumberInputField
          control={control}
          name="phone"
          placeholder="Phone Number"
          label="Phone Number"
        />

        <View style={{ marginBottom: 10 }}>
          <SavedBeneficiaries
            onRefetch={refetch}
            data={data ?? []}
            isLoading={isLoadingSavedData}
            isRefetching={isRefetching}
            isError={isError}
            refetch={refetch}
            onSelect={data => {
              setValue("phone", data?.identifier);
              setValue("network", data?.meta?.network);
            }}
            selectedBeneficiary={selectedBeneficiary}
            onDeleteAll={deleteAll}
            deleting={deleting}
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <AppText style={styles.subHeader}>Select Network Provider</AppText>
          <View style={styles.networkRow}>
            {networks.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.networkButton,
                  selectedNetwork === item.id && styles.networkButtonActive,
                  item.id === "mtn" && {
                    backgroundColor: "#FFCC08",
                  },
                  item.id === "airtel" && {
                    backgroundColor: "#FFC4C433",
                  },
                  item.id === "9mobile" && {
                    backgroundColor: "#EFF7EC",
                  },
                ]}
                onPress={() => {
                  setValue("network", item.id);
                }}
              >
                {selectedNetwork === item.id && (
                  <View style={styles.checkIconContainer}>
                    <AppText style={styles.checkIcon}>✓</AppText>
                  </View>
                )}
                <Image source={item.logo} style={styles.networkLogo} />
              </TouchableOpacity>
            ))}
          </View>
          {errors.network && (
            <AppText style={styles.errorText}>{errors.network.message}</AppText>
          )}
        </View>

        <View style={styles.amountSection}>
          <TextInputField
            label="Enter the amount you want to buy"
            control={control}
            name="amount"
            placeholder="0.00"
            keyboardType="numeric"
          />

          <View style={styles.quickAmountsContainer}>
            {quickAmounts.map((amountValue, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quickAmountButton,
                  amount === amountValue && styles.quickAmountButtonActive,
                ]}
                onPress={() => handleAmountSelect(amountValue)}
              >
                <AppText
                  style={[
                    styles.quickAmountText,
                    amount === amountValue && styles.quickAmountTextActive,
                  ]}
                >
                  {formatAmount(amountValue)}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <SaveAsBeneficiarySwitch
          value={saveBeneficiary}
          onValueChange={setSaveBeneficiary}
          disabled={loading}
        />

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[
              styles.button,
              (loading || (isDirty && !isValid)) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading || (isDirty && !isValid)}
          >
            <AppText style={styles.buttonText}>
              {loading ? "Processing..." : "Proceed"}
            </AppText>
          </TouchableOpacity>
        </View>

        <CustomLoading loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  header: {
    fontSize: normalize(24),
    fontFamily: getFontFamily("700"),
    color: "#000",
    marginBottom: 24,
    textAlign: "center",
  },
  subHeader: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    marginBottom: 12,
    color: "#1A1A1A",
  },
  networkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  networkButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
  },
  checkIconContainer: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  checkIcon: {
    color: "#fff",
    fontSize: normalize(18),
    fontFamily: getFontFamily("900"),
  },
  networkButtonActive: {
    borderColor: "#1d1d1dff",
  },
  networkLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  amountSection: {
    marginBottom: 24,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    height: 56,
  },
  currencySymbol: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
    marginRight: 8,
  },
  amountInputWrapper: {
    flex: 1,
  },
  quickAmountsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  quickAmountButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#f4f4f4ff",
    borderRadius: 8,
    minWidth: 80,
  },
  quickAmountButtonActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary + "20",
  },
  quickAmountText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#374151",
    textAlign: "center",
  },
  quickAmountTextActive: {
    color: "black",
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
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
  buttonWrapper: {
    marginTop: 8,
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 40,
    justifyContent: "center",
    alignContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: {
    color: "#fff",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    textAlign: "center",
  },
  errorText: {
    color: "#FF3B30",
    marginTop: 6,
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    marginLeft: 4,
  },
});
