import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import TextInputField from "../TextInputField";
import PasswordInputField from "../PasswordInputField";
import { COLORS } from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import CustomLoading from "../CustomLoading";
import { useToastHelpers } from "../../utlis/toast";
import { AxiosError } from "axios";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../../constants/settings";
import { SelectInput } from "../SelectInputField";
import useAxios from "../../hooks/useAxios";
import EmailInputField from "../EmailInputField";
import { AppText } from "../AppText";
import { useColors } from "../../hooks/useTheme";
import { getDeviceMeta } from "../../utlis/device";
import { useStyles } from "../../hooks/useStyles";
import { useUsernameAvailability } from "../../hooks/useUsernameAvailability";

export interface RegisterFormHandle {
  refetchHeardAboutOptions: () => void;
}

const registerSchema = yup.object().shape({
  username: yup
    .string()
    .min(5, "Your username is too short")
    .max(30, "Your username is too long")
    .required("Username is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
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

const RegisterForm = forwardRef<RegisterFormHandle>((_, ref) => {
  const { apiGet, post } = useAxios();
  const { showSuccess, showError } = useToastHelpers();
  const navigation: any = useNavigation();
  const [loading, setLoading] = useState(false);

  const styles = useStyles(makeStyles);

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
  });

  const username = useWatch({ control, name: "username" });
  // Shared with Edit Profile: debounced availability check, and submit stays
  // blocked while a check is pending/in flight or the name is taken.
  const {
    isChecking: checkingUsername,
    status: usernameStatus,
    isBlocking: usernameBlocksSubmit,
  } = useUsernameAvailability({ username, setError, clearErrors });

  const {
    data: heardAboutOptions = [],
    isLoading: loadingHeardAboutOptions,
    isError: heardAboutOptionsFailed,
    refetch: refetchHeardAboutOptions,
  } = useQuery({
    queryKey: ["how-heard-about-options"],
    queryFn: async ({ signal }) => {
      try {
        const res = await apiGet("/how-heard-about-options", { signal });
        const raw = res.data?.data ?? res.data ?? [];

        return raw.map((item: any) => ({
          label: item.label ?? item.name,
          value: item.uuid ?? item.value,
        }));
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  useImperativeHandle(ref, () => ({
    refetchHeardAboutOptions: () => refetchHeardAboutOptions(),
  }));

  useEffect(() => {
    if (heardAboutOptionsFailed) {
      showError("Couldn't load 'how did you hear about us' options.");
    }
  }, [heardAboutOptionsFailed, showError]);

  const handleRegister = async (values: any) => {
    // The button is disabled while checking, but guard the submit path too.
    if (usernameBlocksSubmit) return;
    const deviceMeta = await getDeviceMeta();
    try {
      setLoading(true);
      await post("/auth/register", {
        ...values,
        ...deviceMeta,
      });
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

  const disableSubmit = loading || usernameBlocksSubmit;

  return (
    <View style={styles.container}>
      <TextInputField
        label="Create Username"
        control={control}
        name="username"
        placeholder="Choose a username"
      />
      {checkingUsername && (
        <AppText style={styles.checkingText}>Checking availability...</AppText>
      )}
      {/* The input already renders field errors (e.g. "Username is already
          taken"), so only show the status line when there isn't one. */}
      {!checkingUsername && usernameStatus.message && !errors.username && (
        <AppText
          style={[
            styles.checkingText,
            usernameStatus.available ? styles.available : styles.taken,
          ]}
        >
          {usernameStatus.message}
        </AppText>
      )}

      <EmailInputField
        label="Email"
        control={control}
        name="email"
        placeholder="Enter your email address"
      />

      <PasswordInputField
        label="Password"
        control={control}
        showHints
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
        options={heardAboutOptions}
        label="How did you hear about us?"
        control={control}
        name="how_do_heard_about_us"
        placeholder={
          loadingHeardAboutOptions ? "Loading options..." : "Select option"
        }
        loading={loadingHeardAboutOptions}
        isDisabled={loadingHeardAboutOptions}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.button, disableSubmit && styles.buttonDisabled]}
        onPress={handleSubmit(handleRegister)}
        disabled={disableSubmit}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <AppText style={styles.buttonText}>Continue</AppText>
        )}
      </TouchableOpacity>

      <CustomLoading loading={loading} />
    </View>
  );
});

export default RegisterForm;

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    buttonDisabled: { opacity: 0.6 },
    container: {
      paddingVertical: normalizeSpacing(20),
      flexGrow: 1,
    },
    checkingText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      marginTop: normalizeSpacing(-5),
      marginBottom: normalizeSpacing(10),
    },
    available: {
      color: colors.primaryLight,
    },
    taken: {
      color: "red",
    },
    button: {
      backgroundColor: COLORS.primary,
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
