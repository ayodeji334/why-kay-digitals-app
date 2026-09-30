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
import { LONG_REQUEST_TIMEOUT_MS } from "../api/axios";
import { showError } from "../utlis/toast";
import { useAuthStore } from "../stores/authSlice";
import { CloseCircle, TickCircle } from "iconsax-react-nativejs";
import { AxiosError } from "axios";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import CustomLoading from "../components/CustomLoading";
import IdentityVerifying from "../components/IdentityVerifying";
import { useStyles } from "../hooks/useStyles";

// By the time we get here, LivenessCheck has already run its full
// align/capture/blink/turn challenge and handed back a ready-to-submit,
// already-compressed base64 image — a static, unchallenged photo can never
// reach this screen. This screen's only job now is submitting it and
// showing the outcome; there's no separate preview/confirm step to repeat
// what LivenessCheck's own review ("Looks good / Retake") already covered.
export default function SelfieConfirmationScreen() {
  const route = useRoute();
  const navigation: any = useNavigation();
  const { image, bvn }: any = route.params;
  const axiosInstance = useAxios();
  const setUser = useAuthStore(state => state.setUser);
  const colors = useColors();
  const styles = useStyles(makeStyles);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  // Only populated for a 400 response, whose message is specific enough
  // (e.g. "face doesn't match BVN record") to show the user directly —
  // every other failure (network error, 5xx, etc.) keeps the generic
  // hardcoded description below instead.
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRetake = () => {
    // Keep the already-verified bvn — only the photo/liveness check needs redoing.
    navigation.replace("SelfieVerification", { bvn });
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);

      if (!bvn) {
        showError("Missing BVN — please restart verification.");
        setStatus("error");
        return;
      }

      const base64Image: string | undefined = image?.base64;
      if (!base64Image) {
        showError(
          "Unable to process selfie verification. Kindly try again after some minutes",
        );
        setStatus("error");
        return;
      }

      // Single combined call — backend matches this image against the
      // pending BVN verification and writes both bvn + selfie data at once.
      const payload = { bvn, image: base64Image };
      const response = await axiosInstance.post(
        "/kyc/verify-bvn-selfie",
        payload,
        { timeout: LONG_REQUEST_TIMEOUT_MS },
      );

      setStatus("success");
      setUser(response.data.data?.user);
    } catch (err: any) {
      setStatus("error");
      if (err instanceof AxiosError) {
        const backendMessage = err.response?.data?.message;
        if (err.response?.status === 400 && backendMessage) {
          setErrorMessage(backendMessage);
        }
        showError(backendMessage || "Something went wrong. Try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleConfirm();
    // Submit exactly once on mount with the image/bvn this screen was
    // opened with — deliberately not re-running if handleConfirm's
    // identity changes on re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {isLoading || status === "idle" ? (
        <IdentityVerifying loading={isLoading || status === "idle"} />
      ) : status === "success" ? (
        <View style={styles.statusContent}>
          <View
            style={{
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <TickCircle size={40} color={colors.primary} variant="Bold" />
            <AppText style={styles.statusTitle}>Verification Complete</AppText>
            <AppText style={styles.statusDescription}>
              Your identity has been successfully verified. You now have full
              access to upgrade your account and increase your transaction
              limits.
            </AppText>
          </View>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              { marginLeft: normalizeSpacing(0), width: "100%" },
            ]}
            onPress={() => navigation.pop(2)}
          >
            <AppText style={styles.buttonText}>Continue</AppText>
          </TouchableOpacity>
        </View>
      ) : status === "error" ? (
        <View style={styles.statusContent}>
          <View
            style={{
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <CloseCircle size={40} color={colors.error} variant="Bold" />
            <AppText style={styles.statusTitle}>Verification Failed</AppText>
            <AppText style={styles.statusDescription}>
              {errorMessage ??
                "We couldn't get a clear match of your face. Please ensure you are in a well-lit area and your face is fully centered in the frame."}
            </AppText>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.retakeButton}
            onPress={handleRetake}
          >
            <AppText style={styles.buttonText}>Try Again</AppText>
          </TouchableOpacity>
        </View>
      ) : null}
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
      paddingBottom: normalizeSpacing(60),
      paddingTop: normalizeSpacing(30),
    },
    retakeButton: {
      backgroundColor: colors.error,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 120,
      marginRight: normalizeSpacing(8),
      alignItems: "center",
    },
    confirmButton: {
      backgroundColor: colors.primary,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 120,
      marginLeft: normalizeSpacing(8),
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
    },
    retakeText: {
      color: colors.error,
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
