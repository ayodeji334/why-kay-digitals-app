import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useForm, useWatch } from "react-hook-form";
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
import useAxios from "../../hooks/useAxios";
import parsePhoneNumberFromString from "libphonenumber-js";
import PhoneNumberInputField from "../PhoneNumberInputField";
import EmailInputField from "../EmailInputField";

const registerSchema = yup.object().shape({
  username: yup
    .string()
    .min(5, "Your username is too short")
    .max(30, "Your username is too long")
    .required("Username is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone_number: yup
    .string()
    .required("Phone number is required")
    .test(
      "is-valid-phone",
      "Please provide a valid phone number",
      function (value) {
        if (!value) return false;

        try {
          // Remove any non-digit characters except + at the beginning
          const cleanedValue = value.replace(/(?!^\+)[^\d]/g, "");

          // Parse the phone number with Nigeria as default country
          const phoneNumber = parsePhoneNumberFromString(cleanedValue, "NG");

          // Return true if valid, false if invalid
          return phoneNumber ? phoneNumber.isValid() : false;
        } catch (error) {
          // console.log("Phone number parsing error:", error);
          return false;
        }
      },
    ),
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

// src/utils/debounce.ts
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: any;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

const RegisterForm: React.FC = () => {
  const { apiGet, post } = useAxios();
  const { showSuccess } = useToastHelpers();
  const navigation: any = useNavigation();
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingUsername, setCheckingUsername] = useState<boolean>(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    available?: boolean;
    message?: string;
  }>({});

  const { control, handleSubmit, setError, setValue, clearErrors, trigger } =
    useForm<any>({
      resolver: yupResolver(registerSchema),
      mode: "onBlur",
    });

  const username = useWatch({ control, name: "username" });

  const checkUsernameAvailability = useCallback(
    debounce(async (usernameValue: string) => {
      if (!usernameValue || usernameValue.length < 5) {
        setUsernameStatus({});
        clearErrors("username");
        return;
      }

      setCheckingUsername(true);
      try {
        const res = await apiGet(
          `/auth/check-username?username=${usernameValue}`,
        );

        setUsernameStatus({
          available: res.data.available,
          message: res.data.message,
        });

        if (res.data.available === false) {
          setError("username", {
            type: "manual",
            message: "Username is already taken",
          });
        } else {
          clearErrors("username");
        }

        setValue("username", usernameValue.trim());
      } catch (err) {
        setUsernameStatus({
          available: false,
          message: "Error checking username",
        });
      } finally {
        setCheckingUsername(false);
      }
    }, 400),
    [],
  );

  useEffect(() => {
    checkUsernameAvailability(username);
  }, [username]);

  const handleRegister = async (values: any) => {
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
        const errorMessage =
          err.response?.data?.message || "Registration failed. Try again.";
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const disableSubmit =
    loading || checkingUsername || usernameStatus.available === false;

  return (
    <View style={styles.container}>
      <TextInputField
        label="Create Username"
        control={control}
        name="username"
        placeholder="Choose a username"
      />
      {checkingUsername && (
        <Text style={styles.checkingText}>Checking availability...</Text>
      )}
      {!checkingUsername && usernameStatus.available && (
        <Text
          style={[
            styles.checkingText,
            usernameStatus.available ? styles.available : styles.taken,
          ]}
        >
          {usernameStatus.message}
        </Text>
      )}

      <EmailInputField
        label="Email"
        control={control}
        name="email"
        placeholder="Enter your email address"
      />
      <PhoneNumberInputField
        label="Phone Number"
        control={control}
        trigger={trigger}
        name="phone_number"
        placeholder="Enter your phone number"
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
        options={[{ label: "Social Media", value: "Social" }]}
        label="How did you hear about us?"
        control={control}
        name="how_do_heard_about_us"
        placeholder="Select option"
      />

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.button, disableSubmit && { opacity: 0.6 }]}
        onPress={handleSubmit(handleRegister)}
        disabled={disableSubmit}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
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
  checkingText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    marginTop: -5,
    marginBottom: 10,
  },
  available: {
    color: "green",
  },
  taken: {
    color: "red",
  },
  button: {
    backgroundColor: COLORS.primary,
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
