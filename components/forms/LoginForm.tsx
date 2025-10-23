import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import TextInputField from "../TextInputField";
import PasswordInputField from "../PaswordInputField";
import { COLORS } from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { setItem } from "../../utlis/storage";
import { getFontFamily, normalize } from "../../constants/settings";
import CustomLoading from "../CustomLoading";
import { showError } from "../../utlis/toast";
import { AxiosError } from "axios";
import useAxios from "../../api/axios";
import { useAuthStore } from "../../stores/authSlice";

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
  const { setUser, setToken, setIsAuthenticated } = useAuthStore(
    state => state,
  );
  const navigation = useNavigation();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema),
  });

  const handleLogin = async ({ login, password }: LoginFormInputs) => {
    try {
      setLoading(true);

      const response = await post("/auth/login", { login, password });

      const authData = response.data?.data?.auth;

      if (authData?.accessToken && authData?.refreshToken) {
        setItem("auth_token", authData.accessToken);
        setItem("refresh_token", authData.refreshToken);
        setToken(authData.accessToken);
      }

      if (response.data?.data?.user) {
        setItem("user", JSON.stringify(response.data?.data?.user));
        setUser(response.data?.data?.user);
      }

      setTimeout(() => setIsAuthenticated(true), 1000);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.log(err.response);
        const errorMessage =
          err.response?.data?.message || "Something went wrong. Try again.";
        showError(errorMessage);
      } else {
        console.error("Unexpected error:", err);
        showError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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

      <Text
        onPress={() => navigation.navigate("ForgetPassword" as never)}
        style={styles.link}
      >
        Forget Password
      </Text>

      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.button}
        onPress={handleSubmit(handleLogin)}
      >
        <Text style={styles.buttonText}>Sign In</Text>
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
    color: "#00",
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
    fontFamily: getFontFamily("400"),
    fontSize: normalize(18),
    color: "blue",
  },
});

// 9f602fb0be2b2f09baeeb8946cb006cb
