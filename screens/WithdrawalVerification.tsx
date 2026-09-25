import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { AxiosError } from "axios";
import { showError, showSuccess } from "../utlis/toast";
import useAxios from "../hooks/useAxios";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import OtpInputField from "../components/OtpInputField";
import NumberInputField from "../components/NumberInputField";
import CustomLoading from "../components/CustomLoading";
import { AppText } from "../components/AppText";
import { useColors, useResolvedTheme } from "../hooks/useTheme";

// Validation schema
const schema = yup.object().shape({
  token: yup
    .string()
    .required("Verification token is required")
    .matches(/^\d+$/, "Token must be numeric"),
  pin: yup
    .string()
    .required("Transaction PIN is required")
    .length(4, "PIN must be 4 digits"),
});

// Utility function to mask email
const maskEmail = (email: string) => {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;

  const maskedUser =
    user.length > 2
      ? user.slice(0, 2) + "*".repeat(user.length - 2)
      : user[0] + "*";

  return `${maskedUser}@${domain}`;
};

export default function WithdrawalVerificationScreen({ route }: any) {
  const { email } = route.params;
  const { post } = useAxios();
  const queryClient = useQueryClient();
  const navigation: any = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const colors = useColors();
  const resolvedTheme = useResolvedTheme();
  const styles = makeStyles(colors);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { token: "", pin: "" },
  });

  const onSubmit = async (values: { token: string; pin: string }) => {
    try {
      setIsLoading(true);

      const response = await post("/withdrawals/verify", {
        token: values.token,
        pin: values.pin,
        email,
      });

      showSuccess("Verification successful!");

      // Example: refresh assets and navigate
      queryClient.prefetchQuery({ queryKey: ["assets"] });
      navigation.navigate("WithdrawalConfirmed", {
        user: response.data?.data?.user,
        transaction: response.data?.data?.transaction,
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
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
      >
        <View style={styles.header}>
          <AppText style={styles.title}>Verify your withdrawal</AppText>
          <AppText style={styles.description}>
            We sent a 6‑digit code to{" "}
            <AppText style={styles.highlight}>{maskEmail(email)}</AppText>.
            Enter the code and your transaction PIN below to proceed.
          </AppText>
        </View>

        {/* Token input */}
        <NumberInputField
          label="Verification Token"
          control={control}
          name="token"
          placeholder="Enter your token"
        />

        {/* PIN input */}
        <OtpInputField
          control={control}
          name="pin"
          isSecuredText={true}
          boxes={4}
          label="Transaction PIN"
        />

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          <AppText style={styles.buttonText}>Confirm Withdrawal</AppText>
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
      paddingHorizontal: normalizeSpacing(20),
    },
    header: {
      marginBottom: normalizeSpacing(23),
    },
    title: {
      fontSize: normalize(23),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    description: {
      fontFamily: getFontFamily(400),
      fontSize: normalize(18),
      marginTop: normalizeSpacing(8),
      color: colors.textMuted,
    },
    highlight: {
      fontFamily: getFontFamily("800"),
      color: colors.primary,
    },
    errorText: {
      color: colors.error,
      fontSize: normalize(14),
      marginTop: normalizeSpacing(4),
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: normalizeSpacing(14),
      paddingHorizontal: normalizeSpacing(14),
      borderRadius: 80,
      marginTop: normalizeSpacing(40),
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: normalize(18),
      fontFamily: getFontFamily(700),
    },
  });
