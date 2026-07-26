import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import CustomLoading from "../components/CustomLoading";
import OtpInputField from "../components/OtpInputField";
import useAxios from "../hooks/useAxios";
import { AxiosError } from "axios";
import { showError } from "../utlis/toast";
import NumberInputField from "../components/NumberInputField";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";

const schema = yup.object().shape({
  token: yup
    .string()
    .required("Verification token is required")
    .matches(/^\d+$/, "Token must be numeric"),
  pin: yup
    .string()
    .required("Transaction PIN is required")
    .length(4, "PIN must be 4 digits"),
  googleCode: yup
    .string()
    .required("Authenticator code is required")
    .length(6, "Code must be 6 digits"),
});

type FormData = {
  token: string;
  pin: string;
  googleCode: string;
};

export default function ConfirmCryptoWithdrawScreen() {
  const { post, apiGet } = useAxios();
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const [isLoading, setIsLoading] = useState(false);
  const colors = useColors();
  const styles = makeStyles(colors);
  const { payload, email } = route.params;

  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { token: "", pin: "", googleCode: "" },
  });

  console.log(payload);

  const onSubmit = async (values: FormData) => {
    try {
      setIsLoading(true);

      const { url, ...rest } = payload;

      console.log(rest);

      const response = await post("crypto/user/confirm-withdrawal", {
        email,
        verification_token: values.token,
        transaction_pin: values.pin,
        google_2fa_code: values.googleCode,
        ...rest,
      });

      apiGet("walelts/crypto/refresh");

      // showSuccess("Withdrawal verified successfully!");

      // navigation.navigate("TransactionDetail", {
      //   transaction: response?.data?.data,
      // });

      navigation.dispatch((state: any) => {
        // Remove ConfirmTransaction (current screen) from the stack
        const routesWithoutConfirm = state.routes.filter(
          (r: any) => r.name !== "ConfirmCryptoWithdrawTransaction",
        );

        // Append TransactionDetail
        const newRoutes = [
          ...routesWithoutConfirm,
          {
            name: "TransactionDetail",
            params: { transaction: response?.data?.data },
          },
        ];

        return CommonActions.reset({
          ...state,
          routes: newRoutes,
          index: newRoutes.length - 1,
        });
      });
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || "Verification failed. Try again."
          : "Verification failed. Try again.";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{
          flex: 1,
          justifyContent: "space-between",
          paddingBottom: 12,
        }}
      >
        <View style={styles.header}>
          <AppText style={styles.description}>
            Enter the verification token sent to your email, your transaction
            PIN, and the 6‑digit code from the Authenticator to continue.
          </AppText>

          <OtpInputField
            control={control}
            name="pin"
            isSecuredText={true}
            boxes={4}
            label="Transaction PIN"
          />

          <NumberInputField
            control={control}
            name="token"
            // isSecuredText={false}
            // boxes={6}
            maxLength={6}
            label="Verification Token"
            placeholder="Enter verification Token"
          />

          <NumberInputField
            control={control}
            name="googleCode"
            // isSecuredText={false}
            // boxes={6}
            maxLength={6}
            label="Authenticator Code"
            placeholder="Enter Authenticator Code"
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          <AppText style={styles.buttonText}>Continue</AppText>
        </TouchableOpacity>
      </ScrollView>

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    header: {
      marginBottom: 23,
    },
    title: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    description: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      marginTop: 6,
      marginBottom: 26,
      color: colors.text,
    },
    errorText: {
      color: colors.error,
      fontSize: normalize(14),
      marginTop: 4,
    },
    button: {
      marginTop: 30,
      backgroundColor: COLORS.secondary,
      padding: 14,
      borderRadius: 80,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
    },
  });
