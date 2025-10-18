import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PasswordInputField from "../PaswordInputField";
import { COLORS } from "../../constants/colors";
import NumberInputField from "../NumberInputField";
import { width } from "../../constants/settings";
import CustomLoading from "../CustomLoading";
import { AxiosError } from "axios";
import { showError } from "../../utlis/toast";
import useAxios from "../../api/axios";

const loginSchema = yup.object().shape({
  token: yup.string().max(6, "Invalid code").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

type SetNewPasswordFormInputs = {
  password_confirmation: string;
  password: string;
  token: string;
};

// 45123082112
const SetNewPasswordForm: React.FC<{
  email: string;
  onSuccess: () => void;
}> = ({ email, onSuccess }) => {
  const { post } = useAxios();
  const [loading, setIsLoading] = useState<boolean>(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SetNewPasswordFormInputs>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: SetNewPasswordFormInputs) => {
    try {
      setIsLoading(true);

      await post("/auth/password/reset", { ...data, email });
      setIsLoading(false);
      setTimeout(() => onSuccess(), 1000);
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
    <View style={styles.container}>
      <NumberInputField
        label="Token (Code sent to you)"
        control={control}
        name="token"
        placeholder="Enter the token"
        rules={{ required: "Token is required" }}
      />

      <PasswordInputField
        label="Password"
        control={control}
        name="password"
        showHints={true}
        placeholder="Enter your password"
        rules={{ required: "Password is required" }}
      />

      <PasswordInputField
        label="Confirm password"
        control={control}
        name="password_confirmation"
        placeholder="Enter your password"
        rules={{ required: "Password is required" }}
      />

      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.buttonText}>Submit Password</Text>
      </TouchableOpacity>

      <CustomLoading loading={loading} />
    </View>
  );
};

export default SetNewPasswordForm;

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
});
