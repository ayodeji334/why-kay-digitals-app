import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import TextInputField from "../TextInputField";
import PasswordInputField from "../PaswordInputField";
import { COLORS } from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { getFontFamily, normalize } from "../../constants/settings";
import CustomLoading from "../CustomLoading";
import { showError } from "../../utlis/toast";
import { AxiosError } from "axios";
import useAxios from "../../hooks/useAxios";
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

      const res = await post("/auth/login", { login, password });

      console.log(res?.data);

      const { auth, user } = res.data?.data ?? {};
      if (!auth?.accessToken || !auth?.refreshToken || !user) {
        throw new Error("Invalid login response");
      }

      setToken(auth.accessToken, auth.refreshToken);
      setUser(user);
      setIsAuthenticated(true);
    } catch (err: unknown) {
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
    fontFamily: getFontFamily("400"),
    fontSize: normalize(18),
    color: "blue",
  },
});

// 9f602fb0be2b2f09baeeb8946cb006cb
