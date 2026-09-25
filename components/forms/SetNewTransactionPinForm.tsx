import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { COLORS } from "../../constants/colors";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../../constants/settings";
import CustomLoading from "../CustomLoading";
import { AxiosError } from "axios";
import { showError, showSuccess } from "../../utlis/toast";
import useAxios from "../../hooks/useAxios";
import NumberInputField from "../NumberInputField";
import { useNavigation } from "@react-navigation/native";
import { AppText } from "../AppText";

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
  const navigation = useNavigation();
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
      navigation.goBack();
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message || "Set New Password failed. Try again.";
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <NumberInputField
        control={control}
        name="token"
        label="Token"
        placeholder="Enter 6-digit token"
        maxLength={6}
      />

      <NumberInputField
        control={control}
        name="new_pin"
        label="New Pin"
        placeholder="Enter 4-digit pin"
        maxLength={4}
        secureTextEntry
      />

      <NumberInputField
        control={control}
        name="confirm_pin"
        label="Confirm New Pin"
        placeholder="Re-enter new pin"
        maxLength={4}
        secureTextEntry
      />

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        <AppText style={styles.buttonText}>Save Changes</AppText>
      </TouchableOpacity>

      <CustomLoading loading={loading} />
    </View>
  );
};

export default SetNewTransactionPinForm;

const styles = StyleSheet.create({
  container: {
    paddingVertical: normalizeSpacing(20),
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: normalizeSpacing(14),
    borderRadius: 100,
    marginTop: normalizeSpacing(30),
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
  },
});
