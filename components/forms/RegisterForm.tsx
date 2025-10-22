import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import TextInputField from "../TextInputField";
import PasswordInputField from "../PaswordInputField";
import { COLORS } from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import CustomLoading from "../CustomLoading";
import { showError, useToastHelpers } from "../../utlis/toast";
import { AxiosError } from "axios";
import { getFontFamily, normalize } from "../../constants/settings";
import { SelectInput } from "../SelectInputField";
import useAxios from "../../api/axios";
import NumberInputField from "../NumberInputField";

type RegisterFormInputs = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone_number: string;
  password: string;
  referral_code: string;
  password_confirmation: string;
  how_do_heard_about_us: string;
};

const registerSchema = yup.object().shape({
  first_name: yup.string().required("First Name is required"),
  last_name: yup.string().required("Last Name is required"),
  username: yup.string().required("Username is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone_number: yup
    .string()
    .matches(
      /^234\d{10}$/,
      "Phone number must start with 234 and be followed by 10 digits",
    )
    .required("The phone number is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  how_do_heard_about_us: yup.string().required("Please select an option"),
});

const RegisterForm: React.FC = () => {
  const { post } = useAxios();
  const { showSuccess } = useToastHelpers();
  const navigation: any = useNavigation();
  const [loading, setLoading] = useState<boolean>(false);

  const { control, handleSubmit } = useForm<any>({
    resolver: yupResolver(registerSchema),
  });

  const handleRegister = async (values: RegisterFormInputs) => {
    try {
      setLoading(true);

      await post("/auth/register", values);

      showSuccess("Registration successful! Please verify your email.");

      navigation.navigate(
        "VerifyCode" as never,
        { email: values.email } as never,
      );
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.log(err.response);

        const errorMessage =
          err.response?.data?.message || "Registration failed. Try again.";
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInputField
        label="First Name"
        control={control}
        name="first_name"
        placeholder="Your first name"
      />
      <TextInputField
        label="Last Name"
        control={control}
        name="last_name"
        placeholder="Your last name"
      />
      <TextInputField
        label="Create Username"
        control={control}
        name="username"
        placeholder="Choose a username"
      />
      <TextInputField
        label="Email"
        control={control}
        name="email"
        placeholder="Enter your email address"
      />
      <NumberInputField
        label="Phone Number"
        control={control}
        name="phone_number"
        placeholder="+234"
      />
      <PasswordInputField
        label="Password"
        control={control}
        showHints={true}
        name="password"
        placeholder="Enter your password"
      />
      <PasswordInputField
        label="Confirm Password"
        control={control}
        name="password_confirmation"
        placeholder="Confirm your password"
      />
      <TextInputField
        label="Referral Code (Optional)"
        control={control}
        name="referral_code"
        placeholder="Enter referral code"
      />
      <SelectInput
        options={[
          {
            label: "Social Media",

            value: "Social",
          },
        ]}
        label="How did you hear about us?"
        control={control}
        name="how_do_heard_about_us"
        placeholder="Select option"
      />

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.button}
        onPress={handleSubmit(handleRegister)}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <CustomLoading loading={loading} />
    </View>
  );
};

export default RegisterForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: "#000",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
  },
});
