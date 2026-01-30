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
import { SelectInput } from "../components/SelectInputField";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import CustomLoading from "../components/CustomLoading";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import SaveAsBeneficiarySwitch from "../components/SaveAsBeneficiarySwitch";
import NumberInputField from "../components/NumberInputField";
import useAxios from "../hooks/useAxios";
import { formatAmount } from "../libs/formatNumber";

// Validation Schema
const schema = yup.object({
  smartcard_number: yup
    .string()
    .required("Smartcard/IUC number is required")
    .matches(/^[0-9]{6,15}$/, "Invalid Smartcard/IUC Number"),
  network: yup.string().required("Please select a Cable TV provider"),
  plan: yup.string().required("Select a plan"),
});

export default function PayCableTVSubscriptionScreen() {
  const [loading, setLoading] = useState(false);
  const [tvPlans, setTvPlans] = useState<any[]>([]);
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const { apiGet } = useAxios();
  const navigation: any = useNavigation();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
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

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);

      const selectedPlan = tvPlans.find(plan => plan.item_code === values.plan);

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
      };

      navigation.navigate("ConfirmTransaction" as never, {
        payload,
      });
    } catch (error: any) {
      showError(error.response?.data?.message || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  // Fetch plans for selected cable provider
  useEffect(() => {
    if (!selectedNetwork) return;
    setLoading(true);
    apiGet(`/bills/cable-tv-plans/${selectedNetwork}`)
      .then(res => {
        setTvPlans(res.data?.data || []);
      })
      .catch(() => setTvPlans([]))
      .finally(() => setLoading(false));
  }, [selectedNetwork]);

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
                onPress={() => setValue("network", item.id)}
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
              ? tvPlans.map(plan => ({
                  label: `${plan.biller_name || plan.name} - ${formatAmount(
                    plan.amount,
                  )}`,
                  value: plan.item_code,
                }))
              : []
          }
          placeholder="Select Subscription Plan"
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
              (loading || (isDirty && !isValid)) && { opacity: 0.7 },
            ]}
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
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  subHeader: {
    marginTop: 20,
    fontSize: normalize(18),
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
});
