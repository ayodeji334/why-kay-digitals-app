// import React, { useCallback, useMemo, useState } from "react";
// import {
//   View,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   StatusBar,
//   TextInput,
// } from "react-native";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { getFontFamily, normalize } from "../constants/settings";
// import { COLORS } from "../constants/colors";
// import CustomLoading from "../components/CustomLoading";
// import { useNavigation } from "@react-navigation/native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { formatAmount } from "../libs/formatNumber";
// import SaveAsBeneficiarySwitch from "../components/SaveAsBeneficiarySwitch";
// import NumberInputField from "../components/NumberInputField";
// import SavedBeneficiaries from "../components/banks/SavedBeneficiaries";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import useAxios from "../hooks/useAxios";
// import { useResetFormOnMount } from "../hooks/useResetFormOnMount";
// import { AppText } from "../components/AppText";
// import { formatWithCommas } from "./SwapCryptoScreen";
// import { useFiatBalance } from "../hooks/useFiatBalance";
// import { useColors } from "../hooks/useTheme";

// const schema = yup.object({
//   phone: yup
//     .string()
//     .required("Phone number is required")
//     .matches(/^(?:\+234|0)\d{10}$/, "Please provide a valid phone number"),
//   network: yup.string().required("Please select a network provider"),
//   amount: yup
//     .number()
//     .typeError("Amount must be a number")
//     .required("Amount is required")
//     .min(50, "Minimum amount is ₦50")
//     .max(100000, "Maximum amount is ₦100,000"),
// });

// const formatPhoneNumber = (phone: string) => {
//   if (!phone) return phone;
//   if (phone.startsWith("+234")) {
//     return phone;
//   }

//   if (phone.startsWith("0")) {
//     return `+234${phone.slice(1)}`;
//   }
// };

// export default function BuyAirtimeScreen() {
//   const [loading, setLoading] = useState(false);
//   const [saveBeneficiary, setSaveBeneficiary] = useState(false);
//   const navigation: any = useNavigation();
//   const [displayAmount, setDisplayAmount] = useState("");
//   const [selectedBeneficiary, setSelectedBeneficiary] = useState<string | null>(
//     null,
//   );
//   const colors = useColors();
//   const styles = makeStyles(colors);

//   const {
//     control,
//     handleSubmit,
//     setValue,
//     watch,
//     reset,
//     formState: { errors, isDirty, isValid },
//   } = useForm({
//     resolver: yupResolver(schema),
//     mode: "onChange",
//   });

//   const { apiGet, apiDelete } = useAxios();
//   const { fiatBalance } = useFiatBalance();

//   const selectedNetwork = watch("network");
//   const amount = watch("amount");

//   const quickAmounts = [100, 200, 500, 1000, 2000, 5000, 10000];

//   // Insufficient balance = the amount entered exceeds what's available.
//   // Only evaluated once the field has no other validation error, so this
//   // never stacks with yup's own messages.
//   // const hasInsufficientBalance =
//   //   !errors.amount &&
//   //   typeof amount === "number" &&
//   //   amount > 0 &&
//   //   typeof fiatBalance === "number" &&
//   //   amount > fiatBalance;

//   const hasInsufficientBalance = useMemo(() => {
//     const numericBalance = parseFloat(fiatBalance);
//     return !!amount && !isNaN(numericBalance) && amount > numericBalance;
//   }, [amount, fiatBalance]);

//   const onSubmit = async (values: any) => {
//     try {
//       setLoading(true);

//       const payload = {
//         customer: formatPhoneNumber(values.phone),
//         amount: parseFloat(values.amount),
//         type: "AIRTIME",
//         biller_name: values.network,
//         network: selectedNetwork,
//         save_as_beneficiary: saveBeneficiary,
//         url: "/bills/buy-airtime",
//       };

//       navigation.navigate("ConfirmTransaction" as never, {
//         payload,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAmountSelect = (selectedAmount: number) => {
//     setValue("amount", selectedAmount, { shouldValidate: true });
//     setDisplayAmount(formatWithCommas(selectedAmount.toString()));
//   };

//   const networks = [
//     { id: "mtn", label: "MTN", logo: require("../assets/mtn-logo.webp") },
//     { id: "glo", label: "GLO", logo: require("../assets/glo-logo.webp") },
//     {
//       id: "airtel",
//       label: "Airtel",
//       logo: require("../assets/airtel-logo.webp"),
//     },
//     {
//       id: "9mobile",
//       label: "9mobile",
//       logo: require("../assets/nine-mobile.webp"),
//     },
//   ];

//   const {
//     data,
//     isLoading: isLoadingSavedData,
//     isError,
//     refetch,
//     isRefetching,
//   } = useQuery({
//     queryKey: ["saved-beneficiaries-airtime"],
//     queryFn: async () => {
//       const res = await apiGet("/beneficiaries/type", {
//         params: { type: "airtime" },
//       });
//       return res?.data?.data || [];
//     },
//   });

//   const { mutate: deleteAll, isPending: deleting } = useMutation({
//     mutationFn: async () => {
//       return apiDelete("/beneficiaries/type", {
//         params: { type: "airtime" },
//       });
//     },
//     onSuccess: () => {
//       refetch();
//       setSelectedBeneficiary(null);
//     },
//   });

//   const handleAmountChange = useCallback(
//     (text: string) => {
//       const numeric = text.replace(/,/g, "");
//       const parsed = parseFloat(numeric);
//       setValue("amount", isNaN(parsed) ? 0 : parsed, { shouldValidate: true });
//       setDisplayAmount(formatWithCommas(numeric));
//     },
//     [setValue],
//   );

//   useResetFormOnMount(
//     () => {
//       setDisplayAmount("");
//       reset();
//     },
//     { network: "", phone: "", amount: 0 },
//   );

//   return (
//     <SafeAreaView edges={["right", "left"]} style={styles.container}>
//       <ScrollView
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.content}
//       >
//         <NumberInputField
//           control={control}
//           name="phone"
//           placeholder="Phone Number"
//           label="Phone Number"
//         />
//         {errors.phone && (
//           <AppText style={styles.errorText}>
//             {errors.phone.message as string}
//           </AppText>
//         )}

//         <View style={{ marginBottom: 10 }}>
//           <SavedBeneficiaries
//             onRefetch={refetch}
//             data={data ?? []}
//             isLoading={isLoadingSavedData}
//             isRefetching={isRefetching}
//             isError={isError}
//             refetch={refetch}
//             onSelect={data => {
//               setValue("phone", data?.identifier);
//               setValue("network", data?.meta?.network);
//             }}
//             selectedBeneficiary={selectedBeneficiary}
//             onDeleteAll={deleteAll}
//             deleting={deleting}
//           />
//         </View>

//         <View style={{ marginBottom: 20 }}>
//           <AppText style={styles.subHeader}>Select Network Provider</AppText>
//           <View style={styles.networkRow}>
//             {networks.map((item, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={[
//                   styles.networkButton,
//                   selectedNetwork === item.id && styles.networkButtonActive,
//                   item.id === "mtn" && {
//                     backgroundColor: "#FFCC08",
//                   },
//                   item.id === "airtel" && {
//                     backgroundColor: "#FFC4C433",
//                   },
//                   item.id === "9mobile" && {
//                     backgroundColor: "#EFF7EC",
//                   },
//                 ]}
//                 onPress={() => {
//                   setValue("network", item.id);
//                 }}
//               >
//                 {selectedNetwork === item.id && (
//                   <View style={styles.checkIconContainer}>
//                     <AppText style={styles.checkIcon}>✓</AppText>
//                   </View>
//                 )}
//                 <Image source={item.logo} style={styles.networkLogo} />
//               </TouchableOpacity>
//             ))}
//           </View>
//           {selectedNetwork && errors.network && (
//             <AppText style={styles.errorText}>
//               {errors.network.message as string}
//             </AppText>
//           )}
//         </View>

//         <View style={styles.amountSection}>
//           <View style={{ marginBottom: 2, marginTop: -6 }}>
//             <AppText style={styles.label}>Amount</AppText>
//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   fontFamily: getFontFamily("800"),
//                   paddingVertical: normalize(14),
//                   fontSize: normalize(26),
//                 },
//               ]}
//               keyboardType="numeric"
//               placeholderTextColor="#aeaeaeff"
//               placeholder="0.00"
//               value={displayAmount}
//               onChangeText={handleAmountChange}
//               maxFontSizeMultiplier={1}
//               allowFontScaling={false}
//             />
//             {errors.amount ? (
//               <AppText style={styles.errorText}>
//                 {errors.amount.message as string}
//               </AppText>
//             ) : null}
//           </View>

//           <View style={styles.balanceCard}>
//             <AppText style={styles.balanceLabel}>
//               Wallet Balance: {formatAmount(fiatBalance ?? 0)}
//             </AppText>
//           </View>

//           {hasInsufficientBalance && (
//             <View style={styles.warningContainer}>
//               <AppText style={styles.warningText}>
//                 Insufficent Balance. You do not have enough money in your fiat
//                 wallet to complete this transaction.
//               </AppText>
//             </View>
//           )}

//           <View style={styles.quickAmountsContainer}>
//             {quickAmounts.map((amountValue, index) => (
//               <TouchableOpacity
//                 activeOpacity={0.9}
//                 hitSlop={9}
//                 key={index}
//                 style={[
//                   styles.quickAmountButton,
//                   amount === amountValue && styles.quickAmountButtonActive,
//                 ]}
//                 onPress={() => handleAmountSelect(amountValue)}
//               >
//                 <AppText
//                   style={[
//                     styles.quickAmountText,
//                     amount === amountValue && styles.quickAmountTextActive,
//                   ]}
//                 >
//                   {formatAmount(amountValue)}
//                 </AppText>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         <SaveAsBeneficiarySwitch
//           value={saveBeneficiary}
//           onValueChange={setSaveBeneficiary}
//           disabled={loading}
//         />

//         <View style={styles.buttonWrapper}>
//           <TouchableOpacity
//             hitSlop={0.9}
//             activeOpacity={0.9}
//             style={[
//               styles.button,
//               (loading || (isDirty && !isValid) || hasInsufficientBalance) &&
//                 styles.buttonDisabled,
//             ]}
//             onPress={handleSubmit(onSubmit)}
//             disabled={
//               loading || (isDirty && !isValid) || hasInsufficientBalance
//             }
//           >
//             <AppText style={styles.buttonText}>
//               {loading ? "Processing..." : "Proceed"}
//             </AppText>
//           </TouchableOpacity>
//         </View>

//         <CustomLoading loading={loading} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const makeStyles = (colors: ReturnType<typeof useColors>) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: colors.background,
//     },
//     scrollView: {
//       flex: 1,
//       backgroundColor: colors.background,
//     },
//     content: {
//       paddingHorizontal: 16,
//       paddingVertical: 10,
//       paddingBottom: 20,
//     },
//     header: {
//       fontSize: normalize(24),
//       fontFamily: getFontFamily("700"),
//       color: colors.text,
//       marginBottom: 24,
//       textAlign: "center",
//     },
//     balanceCard: {
//       // backgroundColor: COLORS.secondary + "15",
//       // borderRadius: 12,
//       paddingHorizontal: normalize(10),
//       paddingVertical: normalize(9),
//     },
//     balanceLabel: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("800"),
//       color: colors.text,
//       marginBottom: 4,
//     },
//     balanceValue: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("900"),
//       color: colors.text,
//     },
//     subHeader: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("800"),
//       marginBottom: 12,
//       color: colors.text,
//     },
//     networkRow: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       marginBottom: 8,
//     },
//     networkButton: {
//       padding: 8,
//       borderWidth: 1,
//       borderColor: colors.border,
//       backgroundColor: "white",
//       borderRadius: 12,
//       alignItems: "center",
//       justifyContent: "center",
//       width: 80,
//       height: 80,
//     },
//     checkIconContainer: {
//       position: "absolute",
//       top: 4,
//       left: 4,
//       width: 20,
//       height: 20,
//       borderRadius: 10,
//       backgroundColor: "black",
//       justifyContent: "center",
//       alignItems: "center",
//       zIndex: 1,
//     },
//     checkIcon: {
//       color: "white",
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("900"),
//     },
//     networkButtonActive: {
//       borderColor: colors.border,
//     },
//     networkLogo: {
//       width: "100%",
//       height: "100%",
//       resizeMode: "cover",
//     },
//     amountSection: {
//       marginBottom: 24,
//     },
//     label: {
//       marginBottom: 6,
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("800"),
//       color: colors.text,
//     },
//     input: {
//       paddingVertical: normalize(18),
//       paddingHorizontal: normalize(18),
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("400"),
//       color: colors.text,
//       borderWidth: 1,
//       borderColor: colors.border,
//       borderRadius: 8,
//     },
//     amountInputContainer: {
//       flexDirection: "row",
//       alignItems: "center",
//       borderWidth: 1,
//       borderColor: colors.border,
//       borderRadius: 12,
//       paddingHorizontal: 16,
//       marginBottom: 8,
//       height: 56,
//     },
//     currencySymbol: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("700"),
//       color: "#000",
//       marginRight: 8,
//     },
//     amountInputWrapper: {
//       flex: 1,
//     },
//     quickAmountsContainer: {
//       flexDirection: "row",
//       flexWrap: "wrap",
//       gap: 12,
//       marginTop: 16,
//     },
//     quickAmountItem: {
//       width: "31%",
//     },
//     quickAmountButton: {
//       paddingHorizontal: normalize(10),
//       paddingVertical: normalize(14),
//       borderWidth: 1,
//       borderColor: colors.border,
//       backgroundColor: colors.inputBackground,
//       borderRadius: 8,
//       width: "30%",
//     },
//     quickAmountButtonActive: {
//       borderColor: COLORS.secondary,
//       backgroundColor: COLORS.secondary + "20",
//       color: colors.text,
//     },
//     quickAmountText: {
//       fontSize: normalize(19),
//       fontFamily: getFontFamily("800"),
//       color: colors.text,
//       textAlign: "center",
//     },
//     quickAmountTextActive: {
//       color: colors.text,
//       fontSize: normalize(19),
//       fontFamily: getFontFamily("800"),
//     },
//     beneficiaryContainer: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginBottom: 24,
//     },
//     checkbox: {
//       width: 20,
//       height: 20,
//       borderWidth: 1,
//       borderColor: "#D1D5DB",
//       borderRadius: 4,
//       marginRight: 12,
//       alignItems: "center",
//       justifyContent: "center",
//     },
//     checkboxChecked: {
//       borderColor: COLORS.secondary,
//       backgroundColor: COLORS.secondary,
//     },
//     checkmark: {
//       color: "#FFFFFF",
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("900"),
//     },
//     beneficiaryText: {
//       fontSize: normalize(18),
//       color: "#374151",
//       fontFamily: getFontFamily("700"),
//     },
//     buttonWrapper: {
//       marginTop: 8,
//     },
//     button: {
//       backgroundColor: COLORS.secondary,
//       paddingVertical: 14,
//       borderRadius: 40,
//       justifyContent: "center",
//       alignContent: "center",
//     },
//     buttonDisabled: {
//       backgroundColor: "#9CA3AF",
//     },
//     buttonText: {
//       color: "#fff",
//       fontFamily: getFontFamily("700"),
//       fontSize: normalize(18),
//       textAlign: "center",
//     },
//     errorText: {
//       color: colors.error,
//       marginTop: 6,
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("700"),
//       marginLeft: 4,
//     },
//     warningContainer: {
//       marginVertical: 12,
//       padding: 10,
//       backgroundColor: "rgba(255, 0, 0, 0.03)",
//       borderRadius: 6,
//       borderWidth: 1,
//       borderColor: "rgba(255, 0, 0, 0.3)",
//     },
//     warningText: {
//       color: colors?.error,
//       fontSize: normalize(16),
//       fontFamily: getFontFamily("800"),
//       textAlign: "center",
//     },
//   });
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  // StatusBar,
  TextInput,
} from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import CustomLoading from "../components/CustomLoading";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatAmount } from "../libs/formatNumber";
import SaveAsBeneficiarySwitch from "../components/SaveAsBeneficiarySwitch";
import NumberInputField from "../components/NumberInputField";
import SavedBeneficiaries from "../components/banks/SavedBeneficiaries";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import { useResetFormOnMount } from "../hooks/useResetFormOnMount";
import { AppText } from "../components/AppText";
import { formatWithCommas } from "./SwapCryptoScreen";
import { useFiatBalance } from "../hooks/useFiatBalance";
import { useColors } from "../hooks/useTheme";
import { FundingSourceSelector } from "../components/FundSourceSelector";
import { usePointsBalance } from "../hooks/usePointBalance";

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
  const [usePoints, setUsePoints] = useState(false);
  const navigation: any = useNavigation();
  const [displayAmount, setDisplayAmount] = useState("");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string | null>(
    null,
  );
  const colors = useColors();
  const styles = makeStyles(colors);

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
  const { fiatBalance, refetch: refetchBalance } = useFiatBalance();
  const {
    pointsBalance,
    pointsWorth,
    refetch: refetchPoints,
  } = usePointsBalance();

  const selectedNetwork = watch("network");
  const amount = watch("amount");

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000, 10000];

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

  // Refresh both balances every time this screen regains focus, same as the
  // data and betting screens.
  useFocusEffect(
    useCallback(() => {
      refetchBalance?.();
      refetchPoints?.();
    }, [refetchBalance, refetchPoints]),
  );

  // Blended funding model: usePoints=true checks points+wallet combined,
  // not either alone — matches the other bill-purchase screens.
  const hasInsufficientBalance = useMemo(() => {
    if (!amount) return false;

    if (usePoints) {
      const numericFiat = parseFloat(fiatBalance) || 0;
      const combined = pointsWorth + numericFiat;
      return amount > combined;
    }

    const numericBalance = parseFloat(fiatBalance);
    return !isNaN(numericBalance) && amount > numericBalance;
  }, [amount, usePoints, pointsWorth, fiatBalance]);

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
        use_points: usePoints,
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
    setDisplayAmount(formatWithCommas(selectedAmount.toString()));
  };

  const networks = [
    { id: "mtn", label: "MTN", logo: require("../assets/mtn-logo.webp") },
    { id: "glo", label: "GLO", logo: require("../assets/glo-logo.webp") },
    {
      id: "airtel",
      label: "Airtel",
      logo: require("../assets/airtel-logo.webp"),
    },
    {
      id: "9mobile",
      label: "9mobile",
      logo: require("../assets/nine-mobile.webp"),
    },
  ];

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

  const handleAmountChange = useCallback(
    (text: string) => {
      const numeric = text.replace(/,/g, "");
      const parsed = parseFloat(numeric);
      setValue("amount", isNaN(parsed) ? 0 : parsed, { shouldValidate: true });
      setDisplayAmount(formatWithCommas(numeric));
    },
    [setValue],
  );

  useResetFormOnMount(
    () => {
      setDisplayAmount("");
      reset();
    },
    { network: "", phone: "", amount: 0 },
  );

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <NumberInputField
          control={control}
          name="phone"
          placeholder="Phone Number"
          label="Phone Number"
        />
        {errors.phone && (
          <AppText style={styles.errorText}>
            {errors.phone.message as string}
          </AppText>
        )}

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
          {selectedNetwork && errors.network && (
            <AppText style={styles.errorText}>
              {errors.network.message as string}
            </AppText>
          )}
        </View>

        <View style={styles.amountSection}>
          <View style={{ marginBottom: 2, marginTop: -6 }}>
            <AppText style={styles.label}>Amount</AppText>
            <TextInput
              style={[
                styles.input,
                {
                  fontFamily: getFontFamily("800"),
                  paddingVertical: normalize(14),
                  fontSize: normalize(26),
                },
              ]}
              keyboardType="numeric"
              placeholderTextColor="#aeaeaeff"
              placeholder="0.00"
              value={displayAmount}
              onChangeText={handleAmountChange}
              maxFontSizeMultiplier={1}
              allowFontScaling={false}
            />
            {errors.amount ? (
              <AppText style={styles.errorText}>
                {errors.amount.message as string}
              </AppText>
            ) : null}
          </View>

          <FundingSourceSelector
            usePoints={usePoints}
            onUsePointsChange={setUsePoints}
            pointsBalance={pointsBalance}
            pointsWorth={pointsWorth}
            fiatBalance={fiatBalance}
            disabled={loading}
          />

          {hasInsufficientBalance && (
            <View style={styles.warningContainer}>
              <AppText style={styles.warningText}>
                {usePoints
                  ? "Insufficient balance. Your points plus wallet balance combined don't cover this amount."
                  : "Insufficent Balance. You do not have enough money in your fiat wallet to complete this transaction."}
              </AppText>
            </View>
          )}

          <View style={styles.quickAmountsContainer}>
            {quickAmounts.map((amountValue, index) => (
              <TouchableOpacity
                activeOpacity={0.9}
                hitSlop={9}
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
            hitSlop={0.9}
            activeOpacity={0.9}
            style={[
              styles.button,
              (loading || (isDirty && !isValid) || hasInsufficientBalance) &&
                styles.buttonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={
              loading || (isDirty && !isValid) || hasInsufficientBalance
            }
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

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      paddingBottom: 20,
    },
    header: {
      fontSize: normalize(24),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      marginBottom: 24,
      textAlign: "center",
    },
    balanceCard: {
      paddingHorizontal: normalize(10),
      paddingVertical: normalize(9),
    },
    balanceLabel: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: 4,
    },
    balanceValue: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("900"),
      color: colors.text,
    },
    subHeader: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      marginBottom: 12,
      color: colors.text,
    },
    networkRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    networkButton: {
      padding: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "white",
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
      color: "white",
      fontSize: normalize(18),
      fontFamily: getFontFamily("900"),
    },
    networkButtonActive: {
      borderColor: colors.border,
    },
    networkLogo: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    amountSection: {
      marginBottom: 24,
    },
    label: {
      marginBottom: 6,
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    input: {
      paddingVertical: normalize(18),
      paddingHorizontal: normalize(18),
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
    },
    amountInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
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
    quickAmountItem: {
      width: "31%",
    },
    quickAmountButton: {
      paddingHorizontal: normalize(10),
      paddingVertical: normalize(14),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      width: "30%",
    },
    quickAmountButtonActive: {
      borderColor: COLORS.secondary,
      backgroundColor: COLORS.secondary + "20",
      color: colors.text,
    },
    quickAmountText: {
      fontSize: normalize(19),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      textAlign: "center",
    },
    quickAmountTextActive: {
      color: colors.text,
      fontSize: normalize(19),
      fontFamily: getFontFamily("800"),
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
      color: colors.error,
      marginTop: 6,
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      marginLeft: 4,
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
      color: colors?.error,
      fontSize: normalize(16),
      fontFamily: getFontFamily("800"),
      textAlign: "center",
    },
  });
