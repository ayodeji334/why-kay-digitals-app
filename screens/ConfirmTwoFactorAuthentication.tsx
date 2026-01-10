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
import { useNavigation, useRoute } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import OtpInputField from "../components/OtpInputField";
import { useState } from "react";
import { showError, showSuccess } from "../utlis/toast";
import { AxiosError } from "axios";
import CustomLoading from "../components/CustomLoading";
import { useAuthStore } from "../stores/authSlice";
import useAxios from "../hooks/useAxios";

type FormData = {
  pin: string;
};

const schema = yup.object().shape({
  pin: yup
    .string()
    .length(6, "PIN must be 4 digits")
    .required("PIN is required"),
});

export default function ConfirmTwoFactorAuthenticationScreen() {
  const { setIsGoogleAuthenticatorEnabled } = useAuthStore(state => state);
  const { post } = useAxios();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { pin: "" },
  });

  const handleVerifyCodeAndEnable2FA = async (values: FormData) => {
    if (!values.pin || values.pin.length < 6) {
      showError("Invalid code");
      return;
    }
    try {
      setIsLoading(true);

      await post("2fa-auth/verify-enable", {
        code: values.pin,
      });

      setIsGoogleAuthenticatorEnabled(true);
      showSuccess("2FA enabled sunccessfully");
      navigation.goBack();
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message ||
          "Google Authentication failed. Try again.";
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete 2FA Setup</Text>
          <Text style={styles.subtitle}>
            Finalize your account security by entering the code from your
            authenticator app
          </Text>
        </View>

        <OtpInputField control={control} name="pin" boxes={6} />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(handleVerifyCodeAndEnable2FA)}
        >
          <Text style={styles.buttonText}>Set Pin</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  button: {
    marginTop: 30,
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 80,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
  },
  subtitle: {
    fontFamily: getFontFamily("400"),
    fontSize: normalize(18),
    textAlign: "left",
    color: "#666",
    lineHeight: 18,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 23,
  },
  title: {
    fontFamily: getFontFamily("800"),
    fontSize: normalize(20),
  },
  highlight: {
    color: COLORS.primary,
  },
});
