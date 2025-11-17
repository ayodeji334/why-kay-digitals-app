// import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { COLORS } from "../constants/colors";
// import { getFontFamily, normalize } from "../constants/settings";
// import HalfScreenModal from "../components/HalfScreenModal";
// import { useState } from "react";
// import { useNavigation } from "@react-navigation/native";
// import SetNewTransactionPinForm from "../components/forms/SetNewTransactionPinForm";

// export default function ChangeTransactionPinScreen() {
//   const [modalVisible, setModalVisible] = useState<boolean>(false);
//   const navigation = useNavigation();

//   return (
//     <SafeAreaView edges={["bottom", "left", "right"]} style={styles.container}>
//       <StatusBar barStyle="dark-content" />
//       <ScrollView style={styles.scrollContainer}>
//         <View>
//           <Text style={styles.subtitle}>
//             Your transaction PIN is a 4-digit code used to authorize payments
//             and sensitive actions on your account. Changing your PIN helps keep
//             your money and data safe.
//           </Text>
//         </View>

//         <SetNewTransactionPinForm />

//         <HalfScreenModal
//           isVisible={modalVisible}
//           onClose={() => {
//             setModalVisible(false);
//             navigation.navigate("SignIn" as never);
//           }}
//           title="Password changed Successfully"
//           description="Return to the login screen to enter the Home Screen"
//           buttonText="Return to Sign In"
//         />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "white",
//   },
//   title: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("800"),
//     marginBottom: 12,
//   },
//   subtitle: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("400"),
//     color: COLORS.dark,
//     lineHeight: 20,
//   },
//   scrollContainer: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   header: {
//     marginBottom: 23,
//   },
//   highlight: {
//     color: COLORS.primary,
//   },
// });
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import SetNewTransactionPinForm from "../components/forms/SetNewTransactionPinForm";
import useAxios from "../api/axios";
import PasswordInputField from "../components/PaswordInputField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { showError } from "../utlis/toast";
import { AxiosError } from "axios";
import CustomLoading from "../components/CustomLoading";

export default function ChangeTransactionPinScreen() {
  const [step, setStep] = useState<"password" | "newPin">("password");
  const { post } = useAxios();
  const [loading, setIsLoading] = useState<boolean>(false);

  const loginSchema = yup.object().shape({
    password: yup.string().required("Password is required"),
  });

  const { control, handleSubmit, reset } = useForm<any>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);

      await post("users/change-transaction-pin", data);

      reset();

      setIsLoading(false);
      setStep("newPin");
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message || "Set New Password failed. Try again.";
        showError(errorMessage);
      }
    }
  };

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {step === "password" && (
          <View>
            <Text style={styles.subtitle}>
              Enter your current password to proceed with changing your
              Transaction PIN.
            </Text>

            <PasswordInputField
              label="Account Password"
              control={control}
              showHints={false}
              name="password"
              placeholder="Enter your password"
              rules={{ required: "Password is required" }}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.button}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "newPin" && (
          <View>
            <Text style={styles.subtitle}>
              Your transaction PIN is a 4-digit code used to authorize payments
              and sensitive actions on your account. Changing your PIN helps
              keep your money and data safe.
            </Text>

            <SetNewTransactionPinForm />
          </View>
        )}
      </ScrollView>

      <CustomLoading loading={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 20 },
  subtitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: COLORS.dark,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: normalize(16),
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
  },
});
