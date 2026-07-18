import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import TextInputField from "../TextInputField";
import PasswordInputField from "../PasswordInputField";
import { COLORS } from "../../constants/colors";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getFontFamily, normalize } from "../../constants/settings";
import CustomLoading from "../CustomLoading";
import { showError } from "../../utlis/toast";
import { AxiosError } from "axios";
import useAxios from "../../hooks/useAxios";
import { useAuthStore, useIsAuthenticated } from "../../stores/authSlice";
import { OneSignal } from "react-native-onesignal";
import { useQueryClient } from "@tanstack/react-query";
import { AppText } from "../AppText";
import {
  refreshBiometricState,
  useBiometricStore,
} from "../../stores/biometricSlice";
import { useBiometricPromptStore } from "../../stores/biometricPromptSlice";
import { useBiometricLogin } from "../../hooks/useBiometricLogin";

const loginSchema = yup.object().shape({
  login: yup.string().required("Email or Username is required"),
  password: yup.string().required("Password is required"),
});

type LoginFormInputs = {
  login: string;
  password: string;
};

const LoginForm: React.FC = () => {
  const { post } = useAxios();
  const queryClient = useQueryClient();
  const setToken = useAuthStore(state => state.setToken);
  const setUser = useAuthStore(state => state.setUser);
  const setIsAuthenticated = useAuthStore(state => state.setIsAuthenticated);
  const navigation: any = useNavigation();
  const [loading, setLoading] = useState<boolean>(false);
  const { clearBiometricsIfDifferentUser } = useBiometricLogin();

  const { control, handleSubmit } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema),
  });

  const handleLogin = async ({ login, password }: LoginFormInputs) => {
    try {
      setLoading(true);

      const userOneSignalID = await OneSignal.User.getOnesignalId();

      const res = await post("/auth/login", {
        login,
        password,
        device_id: userOneSignalID,
      });

      console.log("Login response:", res.data);

      if (res?.data?.data?.is_email_verified) {
        showError(
          "Please verify your email before logging in. Code has been sent to your email.",
        );

        console.log(
          "Navigating to VerifyCode with email:",
          res.data?.data?.email,
        );

        navigation.navigate(
          "VerifyCode" as never,
          { email: res?.data?.data?.email ?? "" } as never,
        );
        return;
      }

      const { auth, user } = res.data?.data ?? {};

      if (!auth && !res?.data?.data?.is_email_verified) {
        showError(
          "Please verify your email before logging in. Code has been sent to your email.",
        );

        console.log(
          "Navigating to VerifyCode with email:",
          res.data?.data?.email,
        );

        navigation.navigate(
          "VerifyCode" as never,
          { email: res?.data?.data?.email ?? "" } as never,
        );
        return;
      }

      if (!auth?.accessToken || !auth?.refreshToken || !user) {
        throw new Error("Invalid login response");
      }

      // fetch wallets
      queryClient.prefetchQuery({ queryKey: ["assets"] });
      queryClient.prefetchQuery({ queryKey: ["banks"] });
      queryClient.prefetchQuery({ queryKey: ["supported-pairs"] });

      setToken(auth.accessToken, auth.refreshToken);
      setUser(user);

      await clearBiometricsIfDifferentUser(user.uuid);
      await useBiometricPromptStore.getState().hydrate();
      await refreshBiometricState();

      setIsAuthenticated(true);
    } catch (err: any) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message ?? "Unable to login. Please try again.";
        showError(errorMessage);
      } else {
        console.error("Unexpected login error:", err);
        showError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["banks"] });
    queryClient.invalidateQueries({ queryKey: ["supported-pairs"] });
  });

  return (
    <View style={styles.container}>
      <TextInputField
        label="Email or Username"
        control={control}
        name="login"
        placeholder="Enter your email or username"
        rules={{ required: "Email is required" }}
      />

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

export default LoginForm;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
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
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    paddingVertical: 10,
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    color: "blue",
  },
});

// 9f602fb0be2b2f09baeeb8946cb006cb
