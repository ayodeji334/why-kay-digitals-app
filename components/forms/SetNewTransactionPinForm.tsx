import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PasswordInputField from "../PaswordInputField";
import { COLORS } from "../../constants/colors";
import NumberInputField from "../NumberInputField";
import { getFontFamily, normalize, width } from "../../constants/settings";
import CustomLoading from "../CustomLoading";
import { AxiosError } from "axios";
import { showError, showSuccess } from "../../utlis/toast";
import useAxios from "../../api/axios";

const loginSchema = yup.object().shape({
  password: yup.string().required("Password is required"),
  new_pin: yup
    .string()
    .max(4, "Password must not be more than 6 characters")
    .min(4, "Password must be at least 6 characters")
    .required("Password is required"),
  confirm_pin: yup
    .string()
    .oneOf([yup.ref("new_pin")], "Passwords must match")
    .required("Confirm Password is required"),
});

type SetNewTransactionPinFormInputs = {
  new_pin: string;
  confirm_pin: string;
  password: string;
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
      <PasswordInputField
        label="Account Password"
        control={control}
        showHints={false}
        name="password"
        placeholder="Enter your password"
        rules={{ required: "Password is required" }}
      />

      <NumberInputField
        label="New Transaction Pin"
        control={control}
        name="new_pin"
        placeholder="Enter your transaction pin"
        rules={{ required: "Transaction pin is required" }}
      />

      <NumberInputField
        label="Confirm New Transaction Pin"
        control={control}
        name="confirm_pin"
        placeholder="Enter your password"
        rules={{ required: "Confirm Transaction Pin is required" }}
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
    color: "#00",
    fontWeight: "600",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
  },
});
