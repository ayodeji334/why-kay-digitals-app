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
  Text,
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
import { useNavigation } from "@react-navigation/native";
import SaveAsBeneficiarySwitch from "../components/SaveAsBeneficiarySwitch";
import NumberInputField from "../components/NumberInputField";
import useAxios from "../hooks/useAxios";
import { formatWithCommas } from "./SwapCryptoScreen";
import { useQuery } from "@tanstack/react-query";

// Validation schema
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

// Types
interface ElectricityProvider {
  biller_code: string;
  name: string;
  logo: string;
  code: string;
  status: boolean;
  short_name: string;
}

// interface ElectricityFormData {
//   provider: string;
//   meter_number: string;
//   amount: string;
// }

// export default function PayElectricityBillsScreen() {
//   const [loading, setLoading] = useState(false);
//   const { post, apiGet } = useAxios();
//   const [isPrepaid, setIsPrepaid] = useState(true);
//   const [saveBeneficiary, setSaveBeneficiary] = useState(true);
//   const navigation: any = useNavigation();
//   const [amount, setAmount] = useState("");
//   const [meterValid, setMeterValid] = useState(false);
//   const [validatingMeter, setValidatingMeter] = useState(false);
//   const [userDetail, setUserDetail] = useState<any>(null);

//   const {
//     control,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//   } = useForm({
//     resolver: yupResolver(schema),
//     mode: "onChange",
//     defaultValues: {
//       amount: 0,
//     },
//   });

//   const { data: providers = [], isLoading } = useQuery({
//     queryKey: ["electricityProviders"],
//     queryFn: async () => {
//       const res = await apiGet(`/bills/electricity-bills-providers`);
//       return res.data?.data || [];
//     },
//     refetchOnWindowFocus: false,
//   });

//   const [selectedProviderItems, setSelectedProviderItems] = useState<any[]>([]);

//   const handleProviderChange = (providerValue: string) => {
//     const provider = providers.find(
//       (p: any) => p.biller_code === providerValue || p.code === providerValue,
//     );
//     if (provider) {
//       setSelectedProviderItems(provider.items || []);
//     } else {
//       setSelectedProviderItems([]);
//     }
//   };

//   const hasPrepaid = selectedProviderItems.some((item: any) =>
//     item.biller_name?.toLowerCase().includes("prepaid"),
//   );

//   const hasPostpaid = selectedProviderItems.some((item: any) =>
//     item.biller_name?.toLowerCase().includes("postpaid"),
//   );

//   const handleFormSubmit = async (data: any) => {
//     try {
//       setLoading(true);

//       // Find the selected provider option
//       const selectedOption = providerOptions.find(
//         (p: any) => p.value === data.provider || p.label === data.provider,
//       );

//       // Pick the first item_code based on prepaid/postpaid selection
//       let selectedItemCode = "";
//       if (isPrepaid) {
//         const prepaidItem = selectedProviderItems.find((item: any) =>
//           item.biller_name?.toLowerCase().includes("prepaid"),
//         );
//         selectedItemCode = prepaidItem?.item_code || "";
//       } else {
//         const postpaidItem = selectedProviderItems.find((item: any) =>
//           item.biller_name?.toLowerCase().includes("postpaid"),
//         );
//         selectedItemCode = postpaidItem?.item_code || "";
//       }

//       const payload = {
//         customer: data.meter_number,
//         amount: parseFloat(data.amount),
//         biller_name: selectedOption?.value,
//         item_code: selectedItemCode,
//         provider_short_name: selectedOption?.name,
//         save_as_beneficiary: saveBeneficiary,
//         type: isPrepaid ? "Prepaid" : "Postpaid",
//         url: "/bills/buy-electricity",
//       };

//       navigation.navigate("ConfirmTransaction" as never, { payload });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const validateMeterNumber = async (
//     meterNumber: string,
//     itemCode: string,
//     providerCode: string,
//   ) => {
//     try {
//       setValidatingMeter(true);
//       const res = await post(`/bills/validate`, {
//         item_code: itemCode,
//         code: providerCode,
//         customer: meterNumber,
//       });

//       if (res.data?.success) {
//         setMeterValid(true);
//         setUserDetail(res?.data?.data);
//       } else {
//         setMeterValid(false);
//         setUserDetail(null);
//       }
//     } catch (error) {
//       console.error("Meter validation failed", error);
//       setMeterValid(false);
//       setUserDetail(null);
//     } finally {
//       setValidatingMeter(false);
//     }
//   };

//   const meterNumber = useWatch({ control, name: "meter_number" });
//   const providerCode = useWatch({ control, name: "provider" });

//   useEffect(() => {
//     if (!meterNumber || !providerCode) return;

//     let selectedItem: any;
//     if (isPrepaid) {
//       selectedItem = selectedProviderItems.find((item: any) =>
//         item.biller_name?.toLowerCase().includes("prepaid"),
//       );
//     } else {
//       selectedItem = selectedProviderItems.find((item: any) =>
//         item.biller_name?.toLowerCase().includes("postpaid"),
//       );
//     }

//     if (selectedItem?.item_code) {
//       validateMeterNumber(meterNumber, selectedItem.item_code, providerCode);
//     }
//   }, [meterNumber, providerCode, isPrepaid, selectedProviderItems]);

//   const providerOptions = providers
//     .filter((p: any) => p.name.toLowerCase().includes("bills"))
//     .map((provider: ElectricityProvider) => ({
//       label: provider.name,
//       value: provider.code || provider.biller_code,
//       icon: provider.logo,
//       name: provider?.short_name,
//     }));

//   return (
//     <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.content}
//         showsVerticalScrollIndicator={false}
//       >
//         <SelectInput
//           control={control}
//           name="provider"
//           label="Select Provider"
//           placeholder={
//             isLoading ? "Loading providers..." : "Select electricity provider"
//           }
//           options={providerOptions}
//           onChange={(value: string) => handleProviderChange(value)}
//         />

//         <View style={{ marginTop: 10 }}>
//           <NumberInputField
//             placeholder="Enter Meter Number"
//             label="Meter Number"
//             name="meter_number"
//             control={control}
//           />
//         </View>

//         <View style={styles.paymentTypeContainer}>
//           <TouchableOpacity
//             style={[
//               styles.paymentTypeButton,
//               isPrepaid && styles.paymentTypeButtonActive,
//               (!hasPrepaid || loading) && { opacity: 0.5 },
//             ]}
//             onPress={() => setIsPrepaid(true)}
//             disabled={!hasPrepaid || loading}
//           >
//             <Text
//               style={[
//                 styles.paymentTypeText,
//                 isPrepaid && styles.paymentTypeTextActive,
//               ]}
//             >
//               Pre Paid
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.paymentTypeButton,
//               !isPrepaid && styles.paymentTypeButtonActive,
//               (!hasPostpaid || loading) && { opacity: 0.5 },
//             ]}
//             onPress={() => setIsPrepaid(false)}
//             disabled={!hasPostpaid || loading}
//           >
//             <Text
//               style={[
//                 styles.paymentTypeText,
//                 !isPrepaid && styles.paymentTypeTextActive,
//               ]}
//             >
//               Post Paid
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {!validatingMeter && userDetail && (
//           <View style={styles.detailsContainer}>
//             <View style={{ paddingVertical: 5 }}>
//               <Text style={styles.detailsLabel}>Name</Text>
//               <Text style={styles.detailsValue}>{userDetail?.name}</Text>
//             </View>
//             <View style={{ paddingVertical: 5 }}>
//               <Text style={styles.detailsLabel}>Address</Text>
//               <Text style={styles.detailsValue}>{userDetail?.address}</Text>
//             </View>
//           </View>
//         )}

//         <View style={{ marginBottom: 2, marginTop: 10 }}>
//           <Text style={styles.label}>Amount</Text>
//           <View style={styles.inputContainer}>
//             <Text style={styles.dollarSign}>₦</Text>
//             <TextInput
//               style={styles.input}
//               keyboardType="numeric"
//               placeholderTextColor={"#aeaeaeff"}
//               placeholder="0.00"
//               value={amount}
//               onChangeText={text => {
//                 const numericText = text.replace(/,/g, "");
//                 const parsed = parseFloat(numericText);

//                 const formatted = formatWithCommas(numericText);
//                 setValue("amount", parsed, { shouldValidate: true });
//                 setAmount(formatted);
//               }}
//             />
//           </View>

//           {/* Show validation error */}
//           {errors.amount && (
//             <Text style={styles.errorText}>{errors.amount.message}</Text>
//           )}
//         </View>

//         <SaveAsBeneficiarySwitch
//           value={saveBeneficiary}
//           onValueChange={setSaveBeneficiary}
//           disabled={loading}
//         />

//         <TouchableOpacity
//           style={[
//             styles.button,
//             (!meterValid || validatingMeter) && { opacity: 0.5 },
//           ]}
//           onPress={handleSubmit(handleFormSubmit)}
//           disabled={loading || !meterValid || validatingMeter}
//         >
//           <Text style={styles.buttonText}>
//             {loading
//               ? "Processing..."
//               : validatingMeter
//               ? "Validating..."
//               : "Continue"}
//           </Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const schema = yup.object({
//   provider: yup.string().required("Please select an electricity provider"),
//   meter_number: yup
//     .string()
//     .required("Meter number is required")
//     .matches(/^[0-9]{6,13}$/, "Invalid meter number"),
//   amount: yup
//     .number()
//     .typeError("Amount must be a number")
//     .positive("Amount is required")
//     .required("Amount is required"),
// });

interface ElectricityProvider {
  biller_code: string;
  name: string;
  logo: string;
  code: string;
  status: boolean;
  short_name: string;
  items?: any[];
}

// ─── MeterValidationStatus — extracted to prevent parent re-renders ────────
interface MeterValidationStatusProps {
  validating: boolean;
  userDetail: any;
}

interface MeterValidationStatusProps {
  validating: boolean;
  userDetail: any;
  hasInput: boolean; // ← add this
}

const MeterValidationStatus = memo(
  ({ validating, userDetail, hasInput }: MeterValidationStatusProps) => {
    // idle — user hasn't typed a valid meter number yet
    if (!hasInput) return null;

    // in-flight
    if (validating) {
      return (
        <View style={styles.detailsContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.detailsLabel}>Validating meter number…</Text>
        </View>
      );
    }

    // validated but not found
    if (!userDetail) {
      return (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            User detail not found. Please check the provider and meter number
            and try again.
          </Text>
        </View>
      );
    }

    // found
    return (
      <View style={styles.detailsContainer}>
        <View style={{ paddingVertical: 5 }}>
          <Text style={styles.detailsLabel}>Name</Text>
          <Text style={styles.detailsValue}>{userDetail.name}</Text>
        </View>
        <View style={{ paddingVertical: 5 }}>
          <Text style={styles.detailsLabel}>Address</Text>
          <Text style={styles.detailsValue}>{userDetail.address}</Text>
        </View>
      </View>
    );
  },
);

// ─── PaymentTypeSelector — extracted to prevent parent re-renders ──────────
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
  }: PaymentTypeSelectorProps) => (
    <View style={styles.paymentTypeContainer}>
      <TouchableOpacity
        style={[
          styles.paymentTypeButton,
          isPrepaid && styles.paymentTypeButtonActive,
          (!hasPrepaid || disabled) && { opacity: 0.5 },
        ]}
        onPress={() => onSelect(true)}
        disabled={!hasPrepaid || disabled}
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
          (!hasPostpaid || disabled) && { opacity: 0.5 },
        ]}
        onPress={() => onSelect(false)}
        disabled={!hasPostpaid || disabled}
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
  ),
);

// ─── main screen ──────────────────────────────────────────────────────────
export default function PayElectricityBillsScreen() {
  const { post, apiGet } = useAxios();
  const navigation: any = useNavigation();
  const [isPrepaid, setIsPrepaid] = useState(true);
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);
  const [displayAmount, setDisplayAmount] = useState("");
  const [validatingMeter, setValidatingMeter] = useState(false);
  const [meterValid, setMeterValid] = useState(false);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [selectedProviderItems, setSelectedProviderItems] = useState<any[]>([]);
  const [hasFiredValidation, setHasFiredValidation] = useState(false);

  // debounce timer ref — survives re-renders without causing them
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── form ──────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: { provider: "", meter_number: "", amount: 0 },
  });

  const meterNumber = useWatch({ control, name: "meter_number" });
  const providerCode = useWatch({ control, name: "provider" });

  // ─── providers query ───────────────────────────────────────────────────
  const { data: providers = [], isLoading: isLoadingProviders } = useQuery({
    queryKey: ["electricityProviders"],
    queryFn: async () => {
      const res = await apiGet("/bills/electricity-bills-providers");
      return res.data?.data || [];
    },
    staleTime: 864000000,
    refetchOnWindowFocus: false,
  });

  // ─── stable derived data — only recompute when providers change ────────
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

  // ─── derived prepaid/postpaid flags ────────────────────────────────────
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

  // ─── stable callback — provider change ────────────────────────────────
  const handleProviderChange = useCallback(
    (value: string) => {
      const provider = providers.find(
        (p: any) => p.biller_code === value || p.code === value,
      );
      setSelectedProviderItems(provider?.items || []);
      // reset meter state when provider changes
      setMeterValid(false);
      setUserDetail(null);
    },
    [providers],
  );

  // ─── meter validation with debounce ────────────────────────────────────
  const validateMeter = useCallback(
    async (meter: string, itemCode: string, provider: string) => {
      // schema guard — only call API if format is valid
      if (!/^[0-9]{6,13}$/.test(meter)) return;

      setValidatingMeter(true);
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

  // ─── debounced effect — only fires when inputs settle ─────────────────
  useEffect(() => {
    // clear pending debounce on every change
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // reset state immediately if inputs are incomplete
    if (!meterNumber || !providerCode || selectedProviderItems.length === 0) {
      setMeterValid(false);
      setUserDetail(null);
      return;
    }

    const selectedItem = selectedProviderItems.find((item: any) =>
      item.biller_name
        ?.toLowerCase()
        .includes(isPrepaid ? "prepaid" : "postpaid"),
    );

    if (!selectedItem?.item_code) return;

    // debounce — wait 700ms after the user stops typing
    debounceRef.current = setTimeout(() => {
      setHasFiredValidation(true); // ← add this
      validateMeter(meterNumber, selectedItem.item_code, providerCode);
    }, 700);

    // reset it when inputs are cleared
    if (!meterNumber || !providerCode || selectedProviderItems.length === 0) {
      setMeterValid(false);
      setUserDetail(null);
      setHasFiredValidation(false); // ← reset too
      return;
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [meterNumber, providerCode, isPrepaid, selectedProviderItems]);

  // ─── stable callback — amount change ──────────────────────────────────
  const handleAmountChange = useCallback(
    (text: string) => {
      const numeric = text.replace(/,/g, "");
      const parsed = parseFloat(numeric);
      const formatted = formatWithCommas(numeric);
      setValue("amount", isNaN(parsed) ? 0 : parsed, { shouldValidate: true });
      setDisplayAmount(formatted);
    },
    [setValue],
  );

  // ─── submit ────────────────────────────────────────────────────────────
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
          provider_short_name: selectedOption?.name,
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

  const isDisabled = !isValid || !meterValid || validatingMeter || isSubmitting;

  // ─── render ────────────────────────────────────────────────────────────
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
            isLoadingProviders
              ? "Loading providers..."
              : "Select electricity provider"
          }
          options={providerOptions}
          onChange={handleProviderChange}
        />

        <View style={{ marginTop: 10 }}>
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

        <PaymentTypeSelector
          isPrepaid={isPrepaid}
          hasPrepaid={hasPrepaid}
          hasPostpaid={hasPostpaid}
          disabled={isSubmitting}
          onSelect={setIsPrepaid}
        />

        <View style={{ marginBottom: 2, marginTop: 10 }}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.dollarSign}>₦</Text>
            <TextInput
              style={styles.input}
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
              : validatingMeter
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
    paddingVertical: normalize(16),
    fontSize: normalize(26),
    fontFamily: getFontFamily("800"),
    color: "#000",
  },
  dollarSign: {
    fontSize: normalize(26),
    fontFamily: getFontFamily("800"),
    color: "#000",
    paddingLeft: 15,
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
    borderColor: "#c1c1c1ff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  paymentTypeButtonActive: {
    borderColor: COLORS.secondary,
    backgroundColor: "#fff",
  },
  paymentTypeText: {
    fontSize: normalize(18),
    color: "#000",
    fontFamily: getFontFamily("800"),
  },
  paymentTypeTextActive: {
    color: COLORS.secondary,
    fontFamily: getFontFamily("700"),
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
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
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
