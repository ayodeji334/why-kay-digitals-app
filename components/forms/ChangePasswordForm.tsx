import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PasswordInputField from "../PaswordInputField";
import { COLORS } from "../../constants/colors";
import { getFontFamily, normalize, width } from "../../constants/settings";
import CustomLoading from "../CustomLoading";
import apiClient from "../../api/axios";
import { AxiosError } from "axios";
import { showError, showSuccess } from "../../utlis/toast";
import useAxios from "../../api/axios";

const loginSchema = yup.object().shape({
  current_password: yup.string().required("Current Password is required"),
  new_password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords must match")
    .required("Confirm Password is required"),
});

type ChangePasswordFormInputs = {
  confirm_password: string;
  new_password: string;
  current_password: string;
};

const ChangePasswordForm: React.FC<{}> = () => {
  const { patch } = useAxios();
  const [loading, setIsLoading] = useState<boolean>(false);
  const { control, handleSubmit, reset } = useForm<ChangePasswordFormInputs>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: ChangePasswordFormInputs) => {
    try {
      setIsLoading(true);

      await patch("users/change-password", data);

      showSuccess("Password Chqnged successfully");

      reset();

      setIsLoading(false);
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
      <PasswordInputField
        label="Current Password"
        control={control}
        name="current_password"
        placeholder="Enter the current password"
        rules={{ required: "Current password is required" }}
      />

      <PasswordInputField
        label="New Password"
        control={control}
        name="new_password"
        showHints={true}
        placeholder="Enter your password"
        rules={{ required: "Password is required" }}
      />

      <PasswordInputField
        label="Confirm New Password"
        control={control}
        name="confirm_password"
        placeholder="Enter your password"
        rules={{ required: "Password is required" }}
      />

      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      <CustomLoading loading={loading} />
    </View>
  );
};

export default ChangePasswordForm;

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
    color: "#fff",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    textAlign: "center",
  },
});
