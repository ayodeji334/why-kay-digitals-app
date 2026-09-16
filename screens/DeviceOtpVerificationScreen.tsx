import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { AppText } from "../components/AppText";
import { COLORS } from "../constants/colors";
import OtpInputField from "../components/OtpInputField";
import CustomLoading from "../components/CustomLoading";
import { useColors } from "../hooks/useTheme";
import useAxios from "../hooks/useAxios";
import { useCountdown } from "../hooks/useCountdown";
import { useCompleteLogin } from "../hooks/useCompleteLogin";
import { useBlockGoBack } from "../hooks/useBlockGoBack";
import { showError, showSuccess } from "../utlis/toast";
import {
  getDeviceVerificationErrorMessage,
  isDeviceVerificationExpired,
} from "../utlis/deviceVerification";

type RouteParams = {
  verificationToken: string;
  deviceId: string;
  login?: string;
};

type FormData = { otp: string };

const otpSchema = yup.object().shape({
  otp: yup
    .string()
    .required("Code is required")
    .length(6, "Code must be exactly 6 digits"),
});

// Matches the backend's send-otp cooldown (AuthController.php:306-310) —
// the resend link is disabled client-side for the same window so it never
// looks live when the server would just reject it anyway.
const RESEND_COOLDOWN_SECONDS = 60;

const maskEmail = (email: string) => {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const maskedUser =
    user.length > 2
      ? user.slice(0, 2) + "*".repeat(user.length - 2)
      : user[0] + "*";
  return `${maskedUser}@${domain}`;
};

export default function DeviceOtpVerificationScreen() {
  const navigation: any = useNavigation();
  const route = useRoute();
  const { verificationToken, deviceId, login } =
    (route.params as RouteParams) ?? {};
  const { post } = useAxios();
  const completeLogin = useCompleteLogin();
  const colors = useColors();
  const styles = makeStyles(colors);

  useBlockGoBack(navigation);

  const {
    control,
    handleSubmit,
    watch,
    reset: resetForm,
  } = useForm<FormData>({
    resolver: yupResolver(otpSchema),
    defaultValues: { otp: "" },
  });
  const otp = watch("otp");
  const {
    countdown,
    isActive: isCoolingDown,
    reset: restartCooldown,
  } = useCountdown(RESEND_COOLDOWN_SECONDS);

  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const authHeader = {
    headers: { Authorization: `Bearer ${verificationToken}` },
  };

  const goBackToLogin = () =>
    navigation.reset({ index: 0, routes: [{ name: "SignIn" }] });

  const sendOtp = async (isResend: boolean) => {
    try {
      setIsSending(true);

      const res = await post(
        "/auth/device/send-otp",
        { device_id: deviceId },
        authHeader,
      );

      setEmail(res.data?.data?.email ?? res.data?.email ?? null);
      restartCooldown();

      if (isResend) showSuccess("A new code has been sent to your email.");
    } catch (err) {
      if (isDeviceVerificationExpired(err)) {
        showError(
          getDeviceVerificationErrorMessage(
            err,
            "Please log in again to retry.",
          ),
        );
        goBackToLogin();
        return;
      }

      console.log(err);

      showError(
        getDeviceVerificationErrorMessage(
          err,
          "Couldn't send the code. Please try again.",
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    sendOtp(false);
    // Send exactly once, the moment this screen mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async ({ otp: code }: FormData) => {
    try {
      setIsVerifying(true);

      const res = await post(
        "/auth/device/verify-otp",
        { device_id: deviceId, code },
        authHeader,
      );

      const { auth, user } = res.data?.data ?? {};
      if (!auth?.accessToken || !auth?.refreshToken || !user) {
        throw new Error("Invalid verification response");
      }

      await completeLogin(auth, user);
      // No further navigation call — flipping isAuthenticated re-evaluates
      // the root navigator's SignedOut/App groups, same as a normal login.
    } catch (err) {
      if (isDeviceVerificationExpired(err)) {
        showError(
          getDeviceVerificationErrorMessage(
            err,
            "Please log in again to retry.",
          ),
        );
        goBackToLogin();
        return;
      }

      // Shown verbatim, per spec — carries the live "X attempt(s) left" count.
      showError(
        getDeviceVerificationErrorMessage(
          err,
          "That code didn't match. Please try again.",
        ),
      );
      resetForm({ otp: "" });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUseSelfie = () => {
    navigation.replace("DeviceSelfieVerification", {
      verificationToken,
      deviceId,
      login,
    });
  };

  return (
    <SafeAreaView
      edges={["right", "left", "top", "bottom"]}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <AppText style={styles.title}>Verify This Device</AppText>
          <AppText style={styles.description}>
            We don't recognize this device.{" "}
            {email
              ? `Enter the 6-digit code we sent to ${maskEmail(email)}.`
              : "Sending a 6-digit code to your email…"}
          </AppText>
          {/* <AppText style={styles.alertNote}>
            We've sent an alert to your email — if this wasn't you, ignore the
            code and change your password.
          </AppText> */}
        </View>

        <OtpInputField control={control} name="otp" boxes={6} />

        <View style={styles.resendWrapper}>
          <AppText style={styles.infoText}>Didn't get the code? </AppText>
          <TouchableOpacity
            disabled={isCoolingDown || isSending}
            onPress={() => sendOtp(true)}
          >
            <AppText
              style={[
                styles.resendText,
                (isCoolingDown || isSending) && styles.disabledResend,
              ]}
            >
              {isCoolingDown
                ? `Resend in 00:${countdown.toString().padStart(2, "0")}s`
                : "Resend"}
            </AppText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          disabled={otp.length !== 6 || isVerifying}
          onPress={handleSubmit(handleVerify)}
        >
          <AppText style={styles.buttonText}>Continue</AppText>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleUseSelfie}
        >
          <AppText style={styles.secondaryButtonText}>
            Use Selfie Instead
          </AppText>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.differentAccountButton}
          onPress={goBackToLogin}
        >
          <AppText style={styles.differentAccountText}>
            Use a different account
          </AppText>
        </TouchableOpacity>
      </ScrollView>

      <CustomLoading loading={isVerifying} />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: normalizeSpacing(20),
    },
    header: {
      marginBottom: normalizeSpacing(23),
      marginTop: normalizeSpacing(12),
    },
    scrollContent: {
      paddingBottom: normalizeSpacing(24),
    },
    title: {
      fontSize: normalize(22),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalizeSpacing(10),
    },
    description: {
      fontFamily: getFontFamily(400),
      fontSize: normalize(18),
      color: colors.text,
      lineHeight: 22,
      marginBottom: normalizeSpacing(12),
    },
    alertNote: {
      fontFamily: getFontFamily(400),
      fontSize: normalize(18),
      color: colors.text,
      lineHeight: 18,
    },
    resendWrapper: {
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: normalizeSpacing(10),
      paddingVertical: normalizeSpacing(30),
    },
    infoText: {
      fontFamily: getFontFamily(700),
      fontSize: normalize(17),
      color: colors.text,
    },
    resendText: {
      fontFamily: getFontFamily(700),
      fontSize: normalize(17),
      color: colors.primary,
    },
    disabledResend: {
      color: colors.textMuted,
    },
    button: {
      backgroundColor: COLORS.primary,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 80,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: normalize(18),
      fontFamily: getFontFamily(700),
    },
    secondaryButton: {
      paddingVertical: normalizeSpacing(16),
      alignItems: "center",
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
    },
    differentAccountButton: {
      alignItems: "center",
      paddingVertical: normalizeSpacing(6),
      marginTop: 10,
    },
    differentAccountText: {
      fontSize: normalize(19),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      // textDecorationLine: "underline",
    },
  });
