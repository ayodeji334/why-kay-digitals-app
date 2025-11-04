import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Switch,
} from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import TextInputField from "../components/TextInputField";
import { SelectInput } from "../components/SelectInputField";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import CustomLoading from "../components/CustomLoading";
import useAxios from "../api/axios";
import SaveAsBeneficiarySwitch from "../components/SaveAsBeneficiarySwitch";
import NumberInputField from "../components/NumberInputField";

// Validation schema
const schema = yup.object({
  provider: yup.string().required("Please select an electricity provider"),
  meter_number: yup
    .string()
    .required("Meter number is required")
    .matches(/^[0-9]{6,12}$/, "Invalid meter number"),
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount must be greater than zero")
    .required("Amount is required"),
});

// Types
interface ElectricityProvider {
  id: string;
  name: string;
  logo: string;
  code: string;
  status: boolean;
}

interface ElectricityFormData {
  provider: string;
  meter_number: string;
  amount: string;
}

export default function PayElectricityBillsScreen() {
  const [loading, setLoading] = useState(false);
  const { apiGet } = useAxios();
  const [isPrepaid, setIsPrepaid] = useState(true);
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);
  const [providers, setProviders] = useState<ElectricityProvider[]>([]);
  const navigation: any = useNavigation();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    setLoading(true);

    apiGet(`/bills/electricity-bills-providers`)
      .then(res => {
        setProviders(res.data?.data || []);
      })
      .catch(() => setProviders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleFormSubmit = async (data: any) => {
    try {
      setLoading(true);

      const payload = {
        customer: data.meter_number,
        amount: parseFloat(data.amount),
        item_code: data.provider,
        biller_name: data.provider,
        save_as_beneficiary: saveBeneficiary,
        type: isPrepaid ? "Prepaid" : "Postpaid",
        url: "/bills/buy-electricity",
      };

      navigation.navigate("ConfirmTransaction" as never, { payload });
    } finally {
      setLoading(false);
    }
  };

  // Format providers for SelectInput component
  const providerOptions = providers.map(provider => ({
    label: provider.name,
    value: provider.code || provider.id,
    icon: provider.logo,
  }));

  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SelectInput
          control={control}
          name="provider"
          label="Select Provider"
          placeholder={
            loading ? "Loading providers..." : "Select electricity provider"
          }
          options={providerOptions}
        />

        <NumberInputField
          placeholder="Enter Meter Number"
          label="Meter Number"
          name="meter_number"
          control={control}
        />

        {/* Payment Type Selection */}
        <View style={styles.paymentTypeContainer}>
          <TouchableOpacity
            style={[
              styles.paymentTypeButton,
              isPrepaid && styles.paymentTypeButtonActive,
            ]}
            onPress={() => setIsPrepaid(true)}
            disabled={loading}
          >
            <Text
              style={[
                styles.paymentTypeText,
                isPrepaid && styles.paymentTypeTextActive,
              ]}
            >
              Pre Paid
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentTypeButton,
              !isPrepaid && styles.paymentTypeButtonActive,
            ]}
            onPress={() => setIsPrepaid(false)}
            disabled={loading}
          >
            <Text
              style={[
                styles.paymentTypeText,
                !isPrepaid && styles.paymentTypeTextActive,
              ]}
            >
              Post Paid
            </Text>
          </TouchableOpacity>
        </View>

        <NumberInputField
          placeholder="Enter the amount you want to buy"
          label="Enter Amount"
          name="amount"
          control={control}
        />

        <SaveAsBeneficiarySwitch
          value={saveBeneficiary}
          onValueChange={setSaveBeneficiary}
          disabled={loading}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, { opacity: !isValid || loading ? 0.7 : 1 }]}
          onPress={handleSubmit(handleFormSubmit)}
          disabled={loading || !isValid || isSubmitting}
        >
          <Text style={styles.buttonText}>
            {loading ? "Processing..." : "Continue"}
          </Text>
        </TouchableOpacity>

        {/* Loading Indicators */}
        <CustomLoading loading={loading} />
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
  header: {
    fontSize: normalize(23),
    fontFamily: getFontFamily("700"),
    color: "#000",
    marginBottom: 24,
    textAlign: "center",
  },
  paymentTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 20,
    gap: 12,
  },
  paymentTypeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  paymentTypeButtonActive: {
    borderColor: COLORS.secondary,
    backgroundColor: "#FFF8E1",
  },
  paymentTypeText: {
    fontSize: normalize(18),
    color: "#6B7280",
    fontFamily: getFontFamily("700"),
  },
  paymentTypeTextActive: {
    color: COLORS.secondary,
    fontFamily: getFontFamily("700"),
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 100,
    marginTop: 10,
    justifyContent: "center",
    alignContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
