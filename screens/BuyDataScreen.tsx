// import React, { useState, useMemo, useCallback } from "react";
// import {
//   View,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   RefreshControl,
// } from "react-native";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { showError } from "../utlis/toast";
// import { SelectInput } from "../components/SelectInputField";
// import { getFontFamily, normalize } from "../constants/settings";
// import { COLORS } from "../constants/colors";
// import { useFocusEffect, useNavigation } from "@react-navigation/native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import SaveAsBeneficiarySwitch from "../components/SaveAsBeneficiarySwitch";
// import NumberInputField from "../components/NumberInputField";
// import useAxios from "../hooks/useAxios";
// import { formatAmount } from "../libs/formatNumber";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import SavedBeneficiaries from "../components/banks/SavedBeneficiaries";
// import { useResetFormOnMount } from "../hooks/useResetFormOnMount";
// import { AppText } from "../components/AppText";
// import { useFiatBalance } from "../hooks/useFiatBalance";
// import { useColors } from "../hooks/useTheme";

// const schema = yup.object({
//   phone: yup
//     .string()
//     .required("Phone number is required")
//     .matches(/^(?:\+234|0)[789][01]\d{8}$/, "Invalid Phone Number"),
//   network: yup.string().required("Please select a network provider"),
//   plan: yup.string().nullable(),
// });

// const formatPhoneNumber = (phone: string) => {
//   if (phone.startsWith("+234")) {
//     return phone;
//   }

//   if (phone.startsWith("0")) {
//     return `+234${phone.slice(1)}`;
//   }

//   return phone;
// };

// export default function BuyDataScreen() {
//   const { fiatBalance, refetch: refetchBalance } = useFiatBalance();
//   const [saveBeneficiary, setSaveBeneficiary] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const { apiGet, apiDelete } = useAxios();
//   const [selectedBeneficiary, setSelectedBeneficiary] = useState<string | null>(
//     null,
//   );
//   const navigation: any = useNavigation();
//   const {
//     control,
//     handleSubmit,
//     setValue,
//     watch,
//     reset,
//     formState: { errors },
//   } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       phone: "",
//       network: "",
//       plan: "",
//     },
//     mode: "onChange",
//   });

//   const colors = useColors();
//   const styles = makeStyles(colors);

//   const selectedNetwork = watch("network");
//   const selectedPlanCode = watch("plan");

//   const { data: dataPlans = [], isLoading } = useQuery({
//     queryKey: ["dataPlans", selectedNetwork],
//     queryFn: async () => {
//       if (!selectedNetwork) return [];
//       const res = await apiGet(`/bills/data-plans/${selectedNetwork}`);
//       return res.data?.data || [];
//     },
//     enabled: !!selectedNetwork,
//     staleTime: 4000,
//   });

//   // Fetch beneficiaries
//   const {
//     data,
//     isLoading: isLoadingSavedData,
//     isError,
//     refetch,
//     isRefetching,
//   } = useQuery({
//     queryKey: ["saved-beneficiaries-data"],
//     queryFn: async () => {
//       const res = await apiGet("/beneficiaries/type", {
//         params: { type: "data" },
//       });
//       return res?.data?.data || [];
//     },
//   });

//   // Refresh the balance every time this screen regains focus (e.g. coming
//   // back from ConfirmTransaction, or reopening the app to it), not just on
//   // first mount.
//   useFocusEffect(
//     useCallback(() => {
//       refetchBalance?.();
//     }, [refetchBalance]),
//   );

//   // Pull-to-refresh: re-fetch balance + saved beneficiaries together, since
//   // both are screen-level data the user would expect a pull-down to update.
//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     try {
//       await Promise.all([refetchBalance?.(), refetch()]);
//     } finally {
//       setRefreshing(false);
//     }
//   }, [refetchBalance, refetch]);

//   const onSubmit = async (values: any) => {
//     try {
//       setLoading(true);

//       const selectedPlan = dataPlans.find(
//         (plan: any) => plan.item_code === values.plan,
//       );

//       if (!selectedPlan) {
//         showError("Please select a valid data plan");
//         return;
//       }

//       const payload = {
//         item_code: values.plan,
//         customer: formatPhoneNumber(values.phone),
//         amount: selectedPlan.amount,
//         type: "DATA",
//         network: selectedNetwork,
//         biller_name: selectedPlan.biller_code || values.network,
//         url: "/bills/buy-data",
//         save_as_beneficiary: saveBeneficiary,
//       };

//       navigation.navigate("ConfirmTransaction" as never, {
//         payload,
//       });
//     } catch (error: any) {
//       showError(error.response?.data?.message || "Data purchase failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const selectedPlan = useMemo(
//     () => dataPlans.find((plan: any) => plan.item_code === selectedPlanCode),
//     [dataPlans, selectedPlanCode],
//   );

//   const hasInsufficientBalance = useMemo(() => {
//     const numericBalance = parseFloat(fiatBalance);
//     return (
//       !!selectedPlan &&
//       !isNaN(numericBalance) &&
//       selectedPlan.amount > numericBalance
//     );
//   }, [selectedPlan?.id, fiatBalance]);

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

//   const { mutate: deleteAll, isPending: deleting } = useMutation({
//     mutationFn: async () => {
//       return apiDelete("/beneficiaries/type", {
//         params: { type: "data" },
//       });
//     },
//     onSuccess: () => {
//       refetch();
//       setSelectedBeneficiary(null);
//     },
//   });

//   useResetFormOnMount(reset, { network: "", phone: "", plan: "" });

//   return (
//     <SafeAreaView edges={["right", "left"]} style={styles.container}>
//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.content}
//         showsVerticalScrollIndicator={false}
//         showsHorizontalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             tintColor={COLORS.secondary}
//             colors={[COLORS.secondary]}
//           />
//         }
//       >
//         <NumberInputField
//           placeholder="Enter the phone number"
//           label="Phone Number"
//           name="phone"
//           control={control}
//         />

//         <View style={{ marginBottom: 10 }}>
//           <SavedBeneficiaries
//             onRefetch={refetch}
//             data={data ?? []}
//             isRefetching={isRefetching}
//             isLoading={isLoadingSavedData || isRefetching}
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
//         <View style={{ marginBottom: 10 }}>
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
//           {errors.network && (
//             <AppText style={styles.errorText}>
//               {errors.network.message as string}
//             </AppText>
//           )}
//         </View>

//         <SelectInput
//           control={control}
//           name="plan"
//           label="Data Plan"
//           loading={isLoading}
//           showPlanPrice={true}
//           options={dataPlans.map((plan: any) => ({
//             label: `${plan.biller_name} Plan`,
//             value: plan.item_code,
//             balance: plan.amount,
//             validity_period: plan?.validity_period,
//           }))}
//           placeholder={
//             isLoading ? "Loading network plans..." : "Select Data Plan"
//           }
//         />
//         <View style={styles.balanceCard}>
//           <AppText style={styles.balanceLabel}>
//             Wallet Balance: {formatAmount(fiatBalance ?? 0)}
//           </AppText>
//         </View>
//         {hasInsufficientBalance && (
//           <View style={styles.warningContainer}>
//             <AppText style={styles.warningText}>
//               Insufficent Balance. You do not have enough money in your fiat
//               wallet to complete this transaction.
//             </AppText>
//           </View>
//         )}

//         <SaveAsBeneficiarySwitch
//           value={saveBeneficiary}
//           onValueChange={setSaveBeneficiary}
//           disabled={loading}
//         />

//         <View style={styles.buttonWrapper}>
//           <TouchableOpacity
//             activeOpacity={0.89}
//             style={[
//               styles.button,
//               (loading || hasInsufficientBalance) && styles.buttonDisabled,
//             ]}
//             onPress={handleSubmit(onSubmit)}
//             disabled={loading || hasInsufficientBalance}
//           >
//             <AppText style={styles.buttonText}>
//               {loading ? "Processing..." : "Proceed"}
//             </AppText>
//           </TouchableOpacity>
//         </View>
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
//     },
//     header: {
//       fontSize: normalize(20),
//       fontFamily: getFontFamily("700"),
//       color: colors.text,
//       marginBottom: 16,
//     },
//     subHeader: {
//       marginTop: 20,
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("800"),
//       marginBottom: 8,
//       color: colors.text,
//     },
//     networkRow: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       marginBottom: 8,
//     },
//     networkButton: {
//       borderWidth: 1,
//       borderColor: colors.border,
//       backgroundColor: "white",
//       borderRadius: 10,
//       alignItems: "center",
//       justifyContent: "center",
//       width: 75,
//       height: 75,
//     },
//     networkButtonActive: {
//       borderColor: "#181817ff",
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
//       fontSize: normalize(20),
//       fontFamily: getFontFamily(900),
//     },
//     networkLogo: {
//       width: 70,
//       height: 70,
//       borderRadius: 10,
//       resizeMode: "contain",
//     },
//     errorText: {
//       color: colors.error,
//       marginTop: 4,
//       marginBottom: 10,
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("800"),
//     },
//     balanceLabel: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("800"),
//       color: "#000000",
//       marginBottom: 4,
//     },
//     balanceValue: {
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("900"),
//       color: "#000",
//     },
//     balanceCard: {
//       paddingHorizontal: normalize(10),
//       paddingVertical: normalize(9),
//     },
//     loader: {
//       marginTop: 12,
//     },
//     buttonWrapper: {
//       marginTop: 32,
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
//       color: colors.error,
//       fontSize: normalize(16),
//       fontFamily: getFontFamily("800"),
//       textAlign: "center",
//     },
//     button: {
//       backgroundColor: COLORS.secondary,
//       paddingVertical: 14,
//       borderRadius: 100,
//       marginTop: 30,
//       justifyContent: "center",
//       alignContent: "center",
//     },
//     buttonDisabled: {
//       backgroundColor: "#9CA3AF",
//     },
//     buttonText: {
//       color: "#fff",
//       fontFamily: getFontFamily("700"),
//       fontSize: normalize(20),
//       textAlign: "center",
//     },
//   });
import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  RefreshControl,
  Switch,
} from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { showError } from "../utlis/toast";
import { SelectInput } from "../components/SelectInputField";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import SaveAsBeneficiarySwitch from "../components/SaveAsBeneficiarySwitch";
import NumberInputField from "../components/NumberInputField";
import useAxios from "../hooks/useAxios";
import { formatAmount } from "../libs/formatNumber";
import { useMutation, useQuery } from "@tanstack/react-query";
import SavedBeneficiaries from "../components/banks/SavedBeneficiaries";
import { useResetFormOnMount } from "../hooks/useResetFormOnMount";
import { AppText } from "../components/AppText";
import { useFiatBalance } from "../hooks/useFiatBalance";
import { useColors } from "../hooks/useTheme";
import { usePointsBalance } from "../hooks/usePointBalance";
import { FundingSourceSelector } from "../components/FundSourceSelector";

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
  const { fiatBalance, refetch: refetchBalance } = useFiatBalance();
  const {
    pointsBalance,
    pointsWorth,
    refetch: refetchPoints,
  } = usePointsBalance();
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);
  const [usePoints, setUsePoints] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { apiGet, apiDelete } = useAxios();
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string | null>(
    null,
  );
  const navigation: any = useNavigation();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      phone: "",
      network: "",
      plan: "",
    },
    mode: "onChange",
  });

  const colors = useColors();
  const styles = makeStyles(colors);

  const selectedNetwork = watch("network");
  const selectedPlanCode = watch("plan");

  const { data: dataPlans = [], isLoading } = useQuery({
    queryKey: ["dataPlans", selectedNetwork],
    queryFn: async () => {
      if (!selectedNetwork) return [];
      const res = await apiGet(`/bills/data-plans/${selectedNetwork}`);
      return res.data?.data || [];
    },
    enabled: !!selectedNetwork,
    staleTime: 4000,
  });

  // Fetch beneficiaries
  const {
    data,
    isLoading: isLoadingSavedData,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["saved-beneficiaries-data"],
    queryFn: async () => {
      const res = await apiGet("/beneficiaries/type", {
        params: { type: "data" },
      });
      return res?.data?.data || [];
    },
  });

  // Refresh both balances every time this screen regains focus (e.g. coming
  // back from ConfirmTransaction, or reopening the app to it), not just on
  // first mount.
  useFocusEffect(
    useCallback(() => {
      refetchBalance?.();
      refetchPoints?.();
    }, [refetchBalance, refetchPoints]),
  );

  // Pull-to-refresh: re-fetch both balances + saved beneficiaries together,
  // since all three are screen-level data a pull-down should update.
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchBalance?.(), refetchPoints?.(), refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchBalance, refetchPoints, refetch]);

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);

      const selectedPlan = dataPlans.find(
        (plan: any) => plan.item_code === values.plan,
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
        network: selectedNetwork,
        biller_name: selectedPlan.biller_code || values.network,
        url: "/bills/buy-data",
        save_as_beneficiary: saveBeneficiary,
        use_points: usePoints,
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

  const selectedPlan = useMemo(
    () => dataPlans.find((plan: any) => plan.item_code === selectedPlanCode),
    [dataPlans, selectedPlanCode],
  );

  // Follows the blended funding model: usePoints=true means "apply points
  // toward this, wallet covers the rest" — so the check is against the
  // COMBINED balance, not either source alone. usePoints=false checks the
  // wallet only, same as before.
  const hasInsufficientBalance = useMemo(() => {
    if (!selectedPlan) return false;

    if (usePoints) {
      const numericFiat = parseFloat(fiatBalance) || 0;
      const combined = pointsWorth + numericFiat;
      return selectedPlan.amount > combined;
    }

    const numericBalance = parseFloat(fiatBalance);
    return !isNaN(numericBalance) && selectedPlan.amount > numericBalance;
  }, [
    selectedPlan?.id,
    selectedPlan?.amount,
    usePoints,
    pointsWorth,
    fiatBalance,
  ]);

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
        params: { type: "data" },
      });
    },
    onSuccess: () => {
      refetch();
      setSelectedBeneficiary(null);
    },
  });

  useResetFormOnMount(reset, { network: "", phone: "", plan: "" });

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.secondary}
            colors={[COLORS.secondary]}
          />
        }
      >
        <NumberInputField
          placeholder="Enter the phone number"
          label="Phone Number"
          name="phone"
          control={control}
        />

        <View style={{ marginBottom: 10 }}>
          <SavedBeneficiaries
            onRefetch={refetch}
            data={data ?? []}
            isRefetching={isRefetching}
            isLoading={isLoadingSavedData || isRefetching}
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
        <View style={{ marginBottom: 10 }}>
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
            <AppText style={styles.errorText}>
              {errors.network.message as string}
            </AppText>
          )}
        </View>

        <SelectInput
          control={control}
          name="plan"
          label="Data Plan"
          loading={isLoading}
          showPlanPrice={true}
          options={dataPlans.map((plan: any) => ({
            label: `${plan.biller_name} Plan`,
            value: plan.item_code,
            balance: plan.amount,
            validity_period: plan?.validity_period,
          }))}
          placeholder={
            isLoading ? "Loading network plans..." : "Select Data Plan"
          }
        />

        <FundingSourceSelector
          fiatBalance={fiatBalance}
          onUsePointsChange={setUsePoints}
          pointsBalance={pointsBalance}
          pointsWorth={pointsWorth}
          usePoints={usePoints}
          disabled={loading || pointsWorth <= 0}
        />

        {/* <View style={styles.fundingSourceCard}>
          <View style={styles.fundingSourceRow}>
            <View style={{ flex: 1 }}>
              <AppText style={styles.balanceLabel}>
                {usePoints
                  ? `${pointsBalance} pts (${formatAmount(
                      pointsWorth,
                    )}) + Wallet ${formatAmount(fiatBalance ?? 0)}`
                  : `Wallet Balance: ${formatAmount(fiatBalance ?? 0)}`}
              </AppText>
              <AppText style={styles.fundingSourceHint}>
                {usePoints
                  ? "Points applied first, wallet covers the rest"
                  : "Paying from your fiat wallet"}
              </AppText>
            </View>
            <Switch
              value={usePoints}
              onValueChange={setUsePoints}
              disabled={loading || pointsWorth <= 0}
              // trackColor={{ true: COLORS.secondary }}
              trackColor={{ false: "#D1D5DB", true: COLORS.secondary }}
              thumbColor="#fff"
              // disabled={{loading || pointsWorth <= 0}
              style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
            />
          </View>
          {pointsWorth <= 0 && (
            <AppText style={styles.fundingSourceHint}>
              You don't have any points to spend yet.
            </AppText>
          )}
        </View> */}

        {hasInsufficientBalance && (
          <View style={styles.warningContainer}>
            <AppText style={styles.warningText}>
              {usePoints
                ? "Insufficient balance. Your points plus wallet balance combined don't cover this plan."
                : "Insufficent Balance. You do not have enough money in your fiat wallet to complete this transaction."}
            </AppText>
          </View>
        )}

        <SaveAsBeneficiarySwitch
          value={saveBeneficiary}
          onValueChange={setSaveBeneficiary}
          disabled={loading}
        />

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            activeOpacity={0.89}
            style={[
              styles.button,
              (loading || hasInsufficientBalance) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading || hasInsufficientBalance}
          >
            <AppText style={styles.buttonText}>
              {loading ? "Processing..." : "Proceed"}
            </AppText>
          </TouchableOpacity>
        </View>
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
    },
    header: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      marginBottom: 16,
    },
    subHeader: {
      marginTop: 20,
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      marginBottom: 8,
      color: colors.text,
    },
    networkRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    networkButton: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "white",
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
      color: "white",
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
      color: colors.error,
      marginTop: 4,
      marginBottom: 10,
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
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
      color: "#000",
    },
    balanceCard: {
      paddingHorizontal: normalize(10),
      paddingVertical: normalize(9),
    },
    fundingSourceCard: {
      paddingHorizontal: normalize(10),
      paddingVertical: normalize(9),
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 8,
    },
    fundingSourceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    fundingSourceHint: {
      fontSize: normalize(14),
      fontFamily: getFontFamily("400"),
      color: colors.text,
    },
    loader: {
      marginTop: 12,
    },
    buttonWrapper: {
      marginTop: 32,
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
    button: {
      backgroundColor: COLORS.secondary,
      paddingVertical: 14,
      borderRadius: 100,
      marginTop: 30,
      justifyContent: "center",
      alignContent: "center",
    },
    buttonDisabled: {
      backgroundColor: "#9CA3AF",
    },
    buttonText: {
      color: "#fff",
      fontFamily: getFontFamily("700"),
      fontSize: normalize(20),
      textAlign: "center",
    },
  });
