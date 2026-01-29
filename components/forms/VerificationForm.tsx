import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import OtpInputField from "../OtpInputField";
import { COLORS } from "../../constants/colors";
import { useCountdown } from "../../hooks/useCountdown";
import { useNavigation } from "@react-navigation/native";
import { getFontFamily, normalize } from "../../constants/settings";
import CustomLoading from "../CustomLoading";
import { showError, showSuccess } from "../../utlis/toast";
import { AxiosError } from "axios";
import useAxios from "../../hooks/useAxios";
import { useAuthStore } from "../../stores/authSlice";
import { useQueryClient } from "@tanstack/react-query";

const otpSchema = yup.object().shape({
  otp: yup
    .string()
    .required("OTP is required")
    .length(6, "OTP must be exactly 6 digits"),
});

type FormData = {
  otp: string;
};

const VerificationForm = ({ email }: { email: string }) => {
  const navigation = useNavigation();
  const { setUser, setToken } = useAuthStore(state => state);
  const { post } = useAxios();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { control, handleSubmit, watch } = useForm<FormData>({
    resolver: yupResolver(otpSchema),
    defaultValues: { otp: "" },
  });
  const queryClient = useQueryClient();
  const setIsAuthenticated = useAuthStore(state => state.setIsAuthenticated);
  const { countdown, reset, isActive } = useCountdown(20);
  const otp = watch("otp");

  const handleVerify = async (values: FormData) => {
    try {
      setIsLoading(true);

      const response = await post("/auth/verify-email", {
        token: values?.otp,
        email,
      });

      showSuccess("Token verified!");

      const authData = response.data?.data?.auth;

      if (authData?.accessToken && authData?.refreshToken) {
        setToken(authData.accessToken);
      }

      if (response.data?.data?.user) {
        setUser(response.data?.data?.user);
      }

      queryClient.prefetchQuery({ queryKey: ["assets"] });

      setIsAuthenticated(true);

      navigation.navigate("CreatePin" as never);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message || "Verification failed. Try again.";
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setIsLoading(true);

      await post("/auth/resend-verify-email", {
        email,
      });

      showSuccess("Token Sent! Check your mail");
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message || "Verification failed. Try again.";
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isActive && otp.length == 0) {
      reset();
    }
  }, [otp.length]);

  return (
    <View style={styles.container}>
      <OtpInputField control={control} name="otp" boxes={6} />

      {otp.length === 0 && (
        <View style={styles.resendWrapper}>
          <Text style={styles.infoText}>Didn’t get the code? </Text>
          <TouchableOpacity disabled={countdown > 0} onPress={handleResend}>
            <Text
              style={[
                styles.resendText,
                countdown > 0 && styles.disabledResend,
              ]}
            >
              {countdown > 0
                ? `Resend in 00:${countdown.toString().padStart(2, "0")}s`
                : "Resend"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(handleVerify)}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <CustomLoading loading={isLoading} />
    </View>
  );
};

export default VerificationForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  resendWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    paddingVertical: 30,
  },
  infoText: {
    fontFamily: getFontFamily(700),
    fontSize: normalize(18),
    marginTop: 2,
    marginLeft: 1,
    color: COLORS.darkBackground,
  },
  resendText: {
    fontFamily: getFontFamily(700),
    fontSize: normalize(18),
    marginTop: 2,
    marginLeft: 1,
    color: COLORS.secondary,
  },
  disabledResend: {
    color: "#999",
  },
  button: {
    backgroundColor: COLORS.secondary,
    padding: 14,
    borderRadius: 80,
    marginTop: 40,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.whiteBackground,
    fontSize: normalize(18),
    fontFamily: getFontFamily(700),
  },
});
