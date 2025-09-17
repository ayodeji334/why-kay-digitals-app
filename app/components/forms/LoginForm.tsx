import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import TextInputField from "../TextInputField";
import PasswordInputField from "../PaswordInputField";
import { COLORS } from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import apiClient from "../../api/axios";
import { setItem } from "../../utlis/storage";
import { width } from "../../constants/settings";
import CustomLoading from "../CustomLoading";
import { showError } from "../../utlis/toast";
import { AxiosError } from "axios";
import { useAuth } from "../../context/AppContext";

const loginSchema = yup.object().shape({
  login: yup.string().required("Email or Username is required"),
  password: yup.string().required("Password is required"),
});

type LoginFormInputs = {
  login: string;
  password: string;
};

const LoginForm: React.FC = () => {
  const { setIsAuthenticated } = useAuth();
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

      const response = await apiClient.post("/auth/login", { login, password });

      const authData = response.data?.data?.auth;

      if (authData?.accessToken && authData?.refreshToken) {
        setItem("auth_token", authData.accessToken);
        setItem("refresh_token", authData.refreshToken);
      }

      if (response.data?.data?.user) {
        setItem("user", JSON.stringify(response.data?.data?.user));
      }

      setIsAuthenticated(true);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
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
        style={{ paddingVertical: 10, fontSize: width * 0.0354, color: "blue" }}
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
    alignItems: "center",
  },
  buttonText: {
    color: "#00",
    fontWeight: "600",
    fontSize: width * 0.0345,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: "500",
  },
});
