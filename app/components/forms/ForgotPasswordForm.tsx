import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import TextInputField from "../TextInputField";
import { COLORS } from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { width } from "../../constants/settings";
import { AxiosError } from "axios";
import { showError } from "../../utlis/toast";
import apiClient from "../../api/axios";
import CustomLoading from "../CustomLoading";

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
});

type ForgotPasswordInputs = {
  email: string;
};

const ForgotPasswordForm: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setIsLoading] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInputs>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: ForgotPasswordInputs) => {
    try {
      setIsLoading(true);

      await apiClient.post("/auth/password/forgot", data);

      navigation.navigate("SetNewPassword" as never, { email: data?.email });
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message || "Forgot Password failed. Try again.";
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInputField
        label="Email or Phone number"
        control={control}
        name="email"
        placeholder="Enter your email address or phone number"
        rules={{ required: "Email is required" }}
      />

      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <CustomLoading loading={loading} />
    </View>
  );
};

export default ForgotPasswordForm;

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
