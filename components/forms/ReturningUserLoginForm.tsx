import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PasswordInputField from "../PasswordInputField";
import { COLORS } from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../../constants/settings";
import CustomLoading from "../CustomLoading";
import { showError } from "../../utlis/toast";
import { AxiosError } from "axios";
import useAxios from "../../hooks/useAxios";
import { useUser } from "../../stores/authSlice";
import { AppText } from "../AppText";
import { useCompleteLogin } from "../../hooks/useCompleteLogin";
import { useColors } from "../../hooks/useTheme";
import { getDeviceMeta } from "../../utlis/device";
import { resolveDefaultDeviceVerificationOption } from "../../utlis/deviceVerification";
import { useStyles } from "../../hooks/useStyles";

const loginSchema = yup.object().shape({
  password: yup.string().required("Password is required"),
});

type ReturningUserLoginFormInputs = {
  password: string;
};

const ReturningUserLoginForm: React.FC = () => {
  const { post } = useAxios();
  const userDetail = useUser();
  const navigation: any = useNavigation();
  const [loading, setLoading] = useState<boolean>(false);
  const completeLogin = useCompleteLogin();
  const styles = useStyles(makeStyles);

  const { control, handleSubmit } = useForm<ReturningUserLoginFormInputs>({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
  });

  const handleLogin = async ({ password }: ReturningUserLoginFormInputs) => {
    try {
      setLoading(true);

      const deviceMeta = await getDeviceMeta();

      const res = await post("/auth/login", {
        login: userDetail?.email || userDetail?.username,
        password,
        ...deviceMeta,
      });

      const data = res.data?.data ?? {};

      // Password was correct, but this device hasn't been seen before —
      // the backend has already emailed/pushed a "new device" alert and is
      // holding the real session pending a selfie or OTP challenge.
      if (data.requiresDeviceVerification) {
        const login = userDetail?.email || userDetail?.username;
        const screenName =
          resolveDefaultDeviceVerificationOption(login) === "selfie"
            ? "DeviceSelfieVerification"
            : "DeviceOtpVerification";

        navigation.navigate(
          screenName as never,
          {
            verificationToken: data.verificationToken,
            deviceId: data.deviceId ?? deviceMeta.device_id,
            login,
          } as never,
        );
        return;
      }

      // Password was correct, but the email hasn't been verified yet — the
      // backend has already sent a fresh code and is withholding the real
      // session until it's confirmed.
      if (data.is_email_verified === false) {
        showError(
          res.data?.message ??
            "Please verify your email before logging in. Code has been sent to your email.",
        );

        navigation.navigate(
          "VerifyCode" as never,
          {
            email: data.email ?? userDetail?.email ?? userDetail?.username,
          } as never,
        );
        return;
      }

      const { auth, user } = data;
      if (!auth?.accessToken || !auth?.refreshToken || !user) {
        throw new Error("Invalid login response");
      }

      await completeLogin(auth, user);
    } catch (err: any) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message ?? "Unable to login. Please try again.";
        showError(errorMessage);
      } else {
        showError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <PasswordInputField
        label="Password"
        control={control}
        name="password"
        placeholder="Enter your password"
        rules={{ required: "Password is required" }}
      />

      <AppText
        onPress={() => navigation.navigate("ForgetPassword" as never)}
        style={styles.link}
      >
        Forget Password
      </AppText>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.button}
        onPress={handleSubmit(handleLogin)}
      >
        <AppText style={styles.buttonText}>Sign In</AppText>
      </TouchableOpacity>

      <CustomLoading loading={loading} />
    </View>
  );
};

export default ReturningUserLoginForm;

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      paddingVertical: normalizeSpacing(20),
    },
    button: {
      backgroundColor: COLORS.secondary,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 100,
      marginTop: normalizeSpacing(30),
      justifyContent: "center",
      alignContent: "center",
    },
    buttonText: {
      color: "#fff",
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
      textAlign: "center",
    },
    modalBackground: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
    },
    link: {
      paddingVertical: normalizeSpacing(10),
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
      color: colors.primaryLight,
    },
  });

// 9f602fb0be2b2f09baeeb8946cb006cb
