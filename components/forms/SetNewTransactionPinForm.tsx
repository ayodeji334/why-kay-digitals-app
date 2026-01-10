import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { COLORS } from "../../constants/colors";
import { getFontFamily, normalize } from "../../constants/settings";
import CustomLoading from "../CustomLoading";
import { AxiosError } from "axios";
import { showError, showSuccess } from "../../utlis/toast";
import useAxios from "../../hooks/useAxios";
import OtpInputField from "../OtpInputField";

const loginSchema = yup.object().shape({
  token: yup
    .string()
    .max(6, "Token must not be more than 6 characters")
    .min(6, "Token must be at least 6 characters")
    .required("Confirmation Token is required"),
  new_pin: yup
    .string()
    .max(4, "Pin must not be more than 6 characters")
    .min(4, "Pin must be at least 6 characters")
    .required("Pin is required"),
  confirm_pin: yup
    .string()
    .oneOf([yup.ref("new_pin")], "Pin must match")
    .required("Confirm Pin is required"),
});

type SetNewTransactionPinFormInputs = {
  new_pin: string;
  confirm_pin: string;
  token: string;
};

const SetNewTransactionPinForm: React.FC<any> = () => {
  const { patch } = useAxios();
  const [loading, setIsLoading] = useState<boolean>(false);
  const { control, handleSubmit, reset } =
    useForm<SetNewTransactionPinFormInputs>({
      resolver: yupResolver(loginSchema),
    });

  const onSubmit = async (data: SetNewTransactionPinFormInputs) => {
    try {
      setIsLoading(true);

      await patch("users/change-transaction-pin", data);

      showSuccess("Transaction Pin changed successfully");

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
      <OtpInputField
        control={control}
        name="token"
        isSecuredText={true}
        boxes={6}
        label="Token"
      />

      <OtpInputField
        control={control}
        name="new_pin"
        isSecuredText={true}
        boxes={4}
        label="New Pin"
      />

      <OtpInputField
        control={control}
        name="confirm_pin"
        isSecuredText={true}
        boxes={4}
        label="Confirm New Pin"
      />

      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      <CustomLoading loading={loading} />
    </View>
  );
};

export default SetNewTransactionPinForm;

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
  },
});
