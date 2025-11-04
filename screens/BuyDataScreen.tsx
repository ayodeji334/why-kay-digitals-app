import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { showError } from "../utlis/toast";
import useAxios from "../api/axios";
import { SelectInput } from "../components/SelectInputField";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import CustomLoading from "../components/CustomLoading";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import SaveAsBeneficiarySwitch from "../components/SaveAsBeneficiarySwitch";
import NumberInputField from "../components/NumberInputField";

const schema = yup.object({
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^(?:\+234|0)[789][01]\d{8}$/, "Invalid Phone Number"),
  network: yup.string().required("Please select a network provider"),
  plan: yup.string().nullable(),
});

const formatPhoneNumber = (phone: string) => {
  if (phone.startsWith("+234")) {
    return phone;
  }

  if (phone.startsWith("0")) {
    return `+234${phone.slice(1)}`;
  }

  return phone;
};

export default function BuyDataScreen() {
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dataPlans, setDataPlans] = useState<any[]>([]);
  const { apiGet } = useAxios();
  const navigation: any = useNavigation();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    // reset,
    formState: { errors, isDirty, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      phone: "",
      network: "",
      plan: "",
    },
    mode: "onChange",
  });

  const selectedNetwork = watch("network");

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);

      const selectedPlan = dataPlans.find(
        plan => plan.item_code === values.plan,
      );

      if (!selectedPlan) {
        showError("Please select a valid data plan");
        return;
      }

      const payload = {
        item_code: values.plan,
        customer: formatPhoneNumber(values.phone),
        amount: selectedPlan.amount,
        type: "DATA",
        biller_name: selectedPlan.biller_code || values.network,
        url: "/bills/buy-data",
        save_as_beneficiary: saveBeneficiary,
      };

      navigation.navigate("ConfirmTransaction" as never, {
        payload,
      });
    } catch (error: any) {
      showError(error.response?.data?.message || "Data purchase failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedNetwork) return;
    setLoading(true);
    apiGet(`/bills/data-plans/${selectedNetwork}`)
      .then(res => {
        setDataPlans(res.data?.data || []);
      })
      .catch(() => setDataPlans([]))
      .finally(() => setLoading(false));
  }, [selectedNetwork]);

  const networks = [
    { id: "mtn", label: "MTN", logo: require("../assets/mtn-logo.jpg") },
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

  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <NumberInputField
          placeholder="Enter the phone number"
          label="Phone Number"
          name="phone"
          control={control}
        />
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.subHeader}>Select Network Provider</Text>
          <View style={styles.networkRow}>
            {networks.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.networkButton,
                  selectedNetwork === item.id && styles.networkButtonActive,
                ]}
                onPress={() => {
                  setValue("network", item.id);
                }}
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
          label="Data Plan"
          options={dataPlans.map(plan => ({
            label: `${plan.biller_name} ${
              plan.validity_period === 1
                ? "Daily"
                : plan.validity_period === 7
                ? "Weekly"
                : "Monthly"
            } Plan (${
              plan.validity_period
            } Days) - ₦${plan.amount.toLocaleString()}`,
            value: plan.item_code,
          }))}
          placeholder="Select Data Plan"
        />

        <SaveAsBeneficiarySwitch
          value={saveBeneficiary}
          onValueChange={setSaveBeneficiary}
          disabled={loading}
        />

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            disabled={loading || (isDirty && !isValid)}
          >
            <Text style={styles.buttonText}>
              {loading ? "Processing..." : "Proceed"}
            </Text>
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
  },
  header: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("700"),
    color: "#000",
    marginBottom: 16,
  },
  subHeader: {
    marginTop: 20,
    fontSize: normalize(20),
    fontFamily: getFontFamily("700"),
    marginBottom: 8,
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
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 75,
    height: 75,
  },
  networkButtonActive: {
    borderColor: "#181817ff",
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
    fontSize: normalize(20),
    fontFamily: getFontFamily(900),
  },
  networkLogo: {
    width: 70,
    height: 70,
    borderRadius: 10,
    resizeMode: "contain",
  },
  errorText: {
    color: "#EF4444",
    marginTop: 4,
    marginBottom: 10,
    fontSize: 13,
  },
  loader: {
    marginTop: 12,
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
    fontSize: normalize(20),
    textAlign: "center",
  },
});
