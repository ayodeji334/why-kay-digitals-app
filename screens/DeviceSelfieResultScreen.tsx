import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { useNavigation, useRoute } from "@react-navigation/native";
import useAxios from "../hooks/useAxios";
import { getDeviceLabel } from "../utlis/device";
import { LONG_REQUEST_TIMEOUT_MS } from "../api/axios";
import { showError } from "../utlis/toast";
import { CloseCircle, TickCircle } from "iconsax-react-nativejs";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import IdentityVerifying from "../components/IdentityVerifying";
import { useCompleteLogin } from "../hooks/useCompleteLogin";
import { useBlockGoBack } from "../hooks/useBlockGoBack";
import {
  getDeviceVerificationErrorMessage,
  isDeviceVerificationExpired,
} from "../utlis/deviceVerification";
import { useStyles } from "../hooks/useStyles";

type RouteParams = {
  image: { base64: string };
  verificationToken: string;
  deviceId: string;
  login?: string;
};

// By the time we get here, LivenessCheck has already run its full
// align/capture/blink/turn challenge and handed back a ready-to-submit,
// already-compressed base64 image — a static, unchallenged photo can never
// reach this screen. This screen's only job is submitting it against the
// current device-verification challenge and showing the outcome.
export default function DeviceSelfieResultScreen() {
  const route = useRoute();
  const navigation: any = useNavigation();
  const { image, verificationToken, deviceId, login } =
    (route.params as RouteParams) ?? {};
  const { post } = useAxios();
  const completeLogin = useCompleteLogin();
  const colors = useColors();
  const styles = useStyles(makeStyles);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  // Shown verbatim, per spec — carries the live "X attempt(s) left" count.
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useBlockGoBack(navigation);

  const handleRetake = () => {
    navigation.replace("DeviceSelfieVerification", {
      verificationToken,
      deviceId,
      login,
    });
  };

  const handleUseEmailCode = () => {
    navigation.replace("DeviceOtpVerification", {
      verificationToken,
      deviceId,
      login,
    });
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);

      const base64Image = image?.base64;
      if (!base64Image) {
        showError(
          "Unable to process selfie verification. Kindly try again after some minutes",
        );
        setStatus("error");
        return;
      }

      const res = await post(
        "/auth/device/verify-selfie",
        {
          image: base64Image,
          device_id: deviceId,
          ...(await getDeviceLabel()),
        },
        {
          headers: { Authorization: `Bearer ${verificationToken}` },
          timeout: LONG_REQUEST_TIMEOUT_MS,
        },
      );

      const { auth, user } = res.data?.data ?? {};
      if (!auth?.accessToken || !auth?.refreshToken || !user) {
        throw new Error("Invalid verification response");
      }

      setStatus("success");
      await completeLogin(auth, user);
      // No further navigation call — flipping isAuthenticated re-evaluates
      // the root navigator's SignedOut/App groups, same as a normal login.
    } catch (err) {
      setStatus("error");

      if (isDeviceVerificationExpired(err)) {
        const message = getDeviceVerificationErrorMessage(
          err,
          "Please log in again to retry.",
        );
        showError(message);
        navigation.reset({ index: 0, routes: [{ name: "SignIn" }] });
        return;
      }

      const message = getDeviceVerificationErrorMessage(
        err,
        "We couldn't verify your identity. Please try again.",
      );
      setErrorMessage(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleConfirm();
    // Submit exactly once on mount with the image this screen was opened
    // with — deliberately not re-running if handleConfirm's identity
    // changes on re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {isLoading || status === "idle" ? (
        <IdentityVerifying loading={isLoading || status === "idle"} />
      ) : status === "success" ? (
        <View style={styles.statusContent}>
          <View style={styles.statusIconWrap}>
            <TickCircle size={40} color={colors.primary} variant="Bold" />
            <AppText style={styles.statusTitle}>Device Verified</AppText>
            <AppText style={styles.statusDescription}>
              We've confirmed it's you. Signing you in…
            </AppText>
          </View>
        </View>
      ) : (
        <View style={styles.statusContent}>
          <View style={styles.statusIconWrap}>
            <CloseCircle size={40} color={colors.error} variant="Bold" />
            <AppText style={styles.statusTitle}>Verification Failed</AppText>
            <AppText style={styles.statusDescription}>
              {errorMessage ??
                "We couldn't get a clear match of your face. Please ensure you are in a well-lit area and your face is fully centered in the frame."}
            </AppText>
          </View>
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.retakeButton}
              onPress={handleRetake}
            >
              <AppText style={styles.buttonText}>Try Again</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.secondaryButton}
              onPress={handleUseEmailCode}
            >
              <AppText style={styles.secondaryButtonText}>
                Use Email Code Instead
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: normalizeSpacing(20),
    },
    statusContent: {
      flex: 1,
      alignContent: "center",
      justifyContent: "space-between",
      paddingBottom: normalizeSpacing(40),
      paddingTop: normalizeSpacing(30),
    },
    statusIconWrap: {
      justifyContent: "center",
      alignContent: "center",
      alignItems: "center",
    },
    footer: {
      width: "100%",
    },
    retakeButton: {
      backgroundColor: colors.error,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 120,
      alignItems: "center",
      marginBottom: normalizeSpacing(12),
    },
    secondaryButton: {
      paddingVertical: normalizeSpacing(14),
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: normalize(16),
      fontFamily: getFontFamily("700"),
    },
    statusTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginTop: normalizeSpacing(24),
      marginBottom: normalizeSpacing(12),
      textAlign: "center",
    },
    statusDescription: {
      fontSize: normalize(16),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
      textAlign: "center",
      marginBottom: normalizeSpacing(40),
      paddingHorizontal: normalizeSpacing(10),
    },
  });
