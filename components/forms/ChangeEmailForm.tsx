import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import TextInputField from "../TextInputField";
import OtpInputField from "../OtpInputField";
import CustomLoading from "../CustomLoading";
import InfoCard from "../InfoCard";
import { InfoCircle } from "iconsax-react-nativejs";
import { COLORS } from "../../constants/colors";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../../constants/settings";
import { showError, showSuccess } from "../../utlis/toast";
import { useAuthStore } from "../../stores/authSlice";
import useAxios from "../../hooks/useAxios";
import { useNavigation } from "@react-navigation/native";
import { AppText } from "../AppText";
import { AxiosError } from "axios";
import { useColors } from "../../hooks/useTheme";
import { useStyles } from "../../hooks/useStyles";

const emailSchema = yup.object({
  newEmail: yup
    .string()
    .email("Enter a valid email address")
    .required("Email address is required"),
  // The server asks for the current password before moving the account to a new inbox.
  password: yup.string().required("Enter your current password"),
});

const otpSchema = yup.object({
  otp: yup
    .string()
    .required("Enter the code sent to your new email")
    .matches(/^\d+$/, "Code must contain only numbers")
    .length(6, "Code must be 6 digits"),
});

// Fixed, independent of however long the backend keeps the code itself
// valid (10 minutes) — this is just "how long before you can ask for
// another one", the same resend-cooldown pattern used for phone OTP.
const RESEND_COOLDOWN_SECONDS = 60;

type VerificationStep = "email" | "otp";

interface ChangeEmailFormProps {
  onStepChange?: (step: VerificationStep) => void;
}

const ChangeEmailForm = ({ onStepChange }: ChangeEmailFormProps) => {
  const navigation: any = useNavigation();
  const setUser = useAuthStore(state => state.setUser);
  const { post } = useAxios();
  const [step, setStepState] = useState<VerificationStep>("email");
  const [newEmail, setNewEmail] = useState("");
  // Kept only for "Resend code", which the server also checks against the password.
  const [password, setPassword] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const styles = useStyles(makeStyles);

  const setStep = (next: VerificationStep) => {
    setStepState(next);
    onStepChange?.(next);
  };

  const startResendCooldown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setResendCooldown(RESEND_COOLDOWN_SECONDS);

    intervalRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const emailForm = useForm({
    resolver: yupResolver(emailSchema),
    mode: "onChange",
    defaultValues: { newEmail: "", password: "" },
  });

  const otpForm = useForm({
    resolver: yupResolver(otpSchema),
    mode: "onChange",
    defaultValues: { otp: "" },
  });

  // Calling this again while a code is already pending silently supersedes
  // the old one server-side — so both the initial request and "change
  // email address" (going back to re-enter a different address) reuse the
  // exact same call, no separate "cancel" step needed.
  const onSubmitEmail = async (data: any) => {
    try {
      const response = await post("/users/email/change", {
        new_email: data.newEmail,
        password: data.password,
      });
      const result = response.data?.data;

      setNewEmail(result?.newEmail ?? data.newEmail);
      setPassword(data.password);
      setStep("otp");
      startResendCooldown();

      showSuccess(
        response.data?.message ??
          "A verification code has been sent to your new email address",
      );
    } catch (err: any) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message ??
          "Unable to send verification code at the moment";
        showError(errorMessage);
      } else {
        showError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const onSubmitOtp = async (data: any) => {
    try {
      const response = await post("/users/email/change/verify", {
        code: data.otp,
      });

      setUser(response.data?.data?.user);

      otpForm.reset();
      emailForm.reset();
      setPassword("");

      showSuccess(
        response.data?.message ?? "Email address updated successfully",
      );
      navigation.goBack();
    } catch (err: any) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message ??
          "Cannot verify your email at the moment";
        showError(errorMessage);

        // 5 wrong attempts invalidates the code server-side — the message
        // stops mentioning "attempt(s) left" once that happens, which is
        // the only signal that the code is gone and step 1 has to restart.
        if (!/attempt/i.test(errorMessage)) {
          otpForm.reset();
          setStep("email");
        }
      } else {
        showError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      const response = await post("/users/email/change", {
        new_email: newEmail,
        password,
      });

      startResendCooldown();
      otpForm.reset();

      showSuccess(
        response.data?.message ?? "A new code has been sent to your email",
      );
    } catch (err: any) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message ?? "Unable to resend code at the moment";
        showError(errorMessage);
      } else {
        showError("An unexpected error occurred. Please try again.");
      }
    }
  };

  if (step === "otp") {
    return (
      <View style={styles.form}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: normalizeSpacing(14),
          }}
        >
          <OtpInputField control={otpForm.control} name="otp" boxes={6} />
        </View>

        <AppText style={styles.instruction}>
          We sent a code to {newEmail}.{" "}
          {resendCooldown > 0 ? (
            <AppText style={styles.resendDisabled}>
              Resend code in {resendCooldown}s
            </AppText>
          ) : (
            <AppText style={styles.resendLink} onPress={handleResend}>
              Resend code
            </AppText>
          )}
        </AppText>

        <InfoCard
          IconComponent={<InfoCircle size={17} />}
          title="Didn't get the code?"
          description={[
            "Check the inbox (and spam folder) of your NEW email address — that's where the code was sent, not your current one.",
            "Codes expire after 10 minutes — request a new one if yours has expired.",
            "Contact our support team if you keep having issues.",
          ]}
        />

        <TouchableOpacity
          disabled={
            (!otpForm.formState.isValid && otpForm.formState.isDirty) ||
            otpForm.formState.isSubmitting
          }
          activeOpacity={0.8}
          style={styles.button}
          onPress={otpForm.handleSubmit(onSubmitOtp)}
        >
          <AppText style={styles.buttonText}>Verify Code</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.changeEmailLink}
          onPress={() => {
            setStep("email");
            otpForm.reset();
          }}
        >
          <AppText style={styles.changeEmailText}>Change email address</AppText>
        </TouchableOpacity>

        <CustomLoading loading={otpForm.formState.isSubmitting} />
      </View>
    );
  }

  return (
    <View style={styles.form}>
      <TextInputField
        control={emailForm.control}
        name="newEmail"
        label="New Email Address"
        placeholder="Enter your new email address"
        keyboardType="email-address"
      />

      <TextInputField
        control={emailForm.control}
        name="password"
        label="Current Password"
        placeholder="Enter your current password"
        secureTextEntry
      />

      <InfoCard
        IconComponent={<InfoCircle size={17} />}
        title="Why is this needed?"
        description={[
          "We'll send a verification code to the new address to confirm you own it.",
          "Your current email stays active and unchanged until the new one is verified.",
          "For your security, withdrawals and transfers are paused for 24 hours after the change.",
        ]}
      />

      <TouchableOpacity
        disabled={
          (!emailForm.formState.isValid && emailForm.formState.isDirty) ||
          emailForm.formState.isSubmitting
        }
        activeOpacity={0.8}
        style={styles.button}
        onPress={emailForm.handleSubmit(onSubmitEmail)}
      >
        <AppText style={styles.buttonText}>Continue</AppText>
      </TouchableOpacity>

      <CustomLoading loading={emailForm.formState.isSubmitting} />
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    form: {
      width: "100%",
    },
    button: {
      backgroundColor: COLORS.secondary,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 100,
      marginTop: normalizeSpacing(30),
      justifyContent: "center",
      alignContent: "center",
    },
    buttonText: {
      color: "#fff",
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
      textAlign: "center",
    },
    instruction: {
      color: colors.text,
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
      textAlign: "center",
    },
    resendLink: {
      color: colors.primaryLight,
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
    },
    resendDisabled: {
      color: "#999",
      fontFamily: getFontFamily("700"),
      fontSize: normalize(17),
    },
    changeEmailLink: {
      marginTop: normalizeSpacing(16),
      alignItems: "center",
    },
    changeEmailText: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      color: colors.primaryLight,
    },
  });

export default ChangeEmailForm;
