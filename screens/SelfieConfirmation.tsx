import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import { LONG_REQUEST_TIMEOUT_MS } from "../api/axios";
import { useAuthStore } from "../stores/authSlice";
import { CloseCircle, TickCircle } from "iconsax-react-nativejs";
import { AxiosError } from "axios";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import IdentityVerifying from "../components/IdentityVerifying";
import { useStyles } from "../hooks/useStyles";
import { getRequestErrorMessage } from "../libs/requestError";
import {
  ID_DOCS,
  IdDocType,
  isFullyVerified,
  nextDocToVerify,
} from "../libs/kyc";

// Submits a BVN or NIN verification and shows the outcome.
//
// Reached two ways (see IdNumberForm):
// - requires_selfie was true: from SelfieVerification with a liveness-checked
//   image (LivenessCheck has already run align/capture/blink/turn), which is
//   sent along.
// - requires_selfie was false (the second document): directly, with no image,
//   and `image` is left out of the request.
export default function SelfieConfirmationScreen() {
  const route = useRoute();
  const navigation: any = useNavigation();
  const params: any = route.params ?? {};
  const idType: IdDocType = params.idType ?? "bvn";
  // `bvn` is still accepted from older navigation paths.
  const idNumber: string | undefined = params.idNumber ?? params.bvn;
  const image: { base64?: string } | undefined = params.image;
  const requiresSelfie: boolean = params.requiresSelfie ?? !!image;
  const doc = ID_DOCS[idType];

  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  const colors = useColors();
  const styles = useStyles(makeStyles);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  // A specific message (backend 400s, missing data). Other failures fall
  // back to the default description for the path that was taken.
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRetry = () => {
    if (requiresSelfie) {
      // Keep the number; only the selfie needs redoing.
      navigation.replace("SelfieVerification", { idType, idNumber });
    } else {
      // Back to the number form (still filled in) to check it and resubmit.
      navigation.goBack();
    }
  };

  // Back to the KYC hub, wherever the flow was started from.
  const handleDone = () => navigation.popTo("Verification");

  const handleVerifyOther = (next: IdDocType) =>
    navigation.replace(ID_DOCS[next].route);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);

      if (!idNumber) {
        setErrorMessage(
          `Your ${doc.label} is missing. Please start the verification again.`,
        );
        setStatus("error");
        return;
      }

      const base64Image: string | undefined = image?.base64;
      if (requiresSelfie && !base64Image) {
        setErrorMessage("We didn't receive your selfie. Please take it again.");
        setStatus("error");
        return;
      }

      // `image` only when the usability check asked for a selfie.
      const payload = {
        [idType]: idNumber,
        ...(requiresSelfie && base64Image ? { image: base64Image } : {}),
      };
      const response = await axiosInstance.post(doc.verifyPath, payload, {
        timeout: LONG_REQUEST_TIMEOUT_MS,
      });

      const updatedUser = response.data?.data?.user;
      if (updatedUser) setUser(updatedUser);
      // The virtual account is created in the background after verification.
      queryClient.invalidateQueries({ queryKey: ["userBankAccounts"] });
      setStatus("success");
    } catch (err: any) {
      if (err instanceof AxiosError && err.response?.status === 400) {
        const backendMessage = err.response?.data?.message;
        if (backendMessage) setErrorMessage(backendMessage);
      } else {
        setErrorMessage(getRequestErrorMessage(err));
      }
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleConfirm();
    // Submit exactly once on mount with the params this screen was opened
    // with — deliberately not re-running if handleConfirm's identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After success, `user` is the updated record from the verify response.
  const fullyVerified = isFullyVerified(user);
  const nextDoc = nextDocToVerify(user);

  const defaultErrorDescription = requiresSelfie
    ? "We couldn't get a clear match of your face. Please ensure you are in a well-lit area and your face is fully centered in the frame."
    : `We couldn't verify your ${doc.label}. Please check the number and try again.`;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {isLoading || status === "idle" ? (
        <IdentityVerifying loading={isLoading || status === "idle"} />
      ) : status === "success" ? (
        <View style={styles.statusContent}>
          <View style={styles.statusCenter}>
            <TickCircle size={40} color={colors.primary} variant="Bold" />
            <AppText style={styles.statusTitle}>{doc.label} verified</AppText>
            <AppText style={styles.statusDescription}>
              {fullyVerified
                ? "Your identity is fully verified. You now have access to the highest account limits."
                : nextDoc
                ? `Your account has been upgraded. Verify your ${ID_DOCS[nextDoc].label} as well to reach the highest tier and increase your limits further.`
                : "Your identity has been verified and your account has been upgraded."}
            </AppText>
          </View>
          <View style={styles.actions}>
            {nextDoc && !fullyVerified && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.primaryButton}
                onPress={() => handleVerifyOther(nextDoc)}
                accessibilityRole="button"
              >
                <AppText style={styles.buttonText}>
                  Verify my {ID_DOCS[nextDoc].label}
                </AppText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              activeOpacity={0.8}
              style={
                nextDoc && !fullyVerified
                  ? styles.secondaryButton
                  : styles.primaryButton
              }
              onPress={handleDone}
              accessibilityRole="button"
            >
              <AppText
                style={
                  nextDoc && !fullyVerified
                    ? styles.secondaryButtonText
                    : styles.buttonText
                }
              >
                {nextDoc && !fullyVerified ? "Maybe later" : "Continue"}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      ) : status === "error" ? (
        <View style={styles.statusContent}>
          <View style={styles.statusCenter}>
            <CloseCircle size={40} color={colors.error} variant="Bold" />
            <AppText style={styles.statusTitle}>Verification failed</AppText>
            <AppText style={styles.statusDescription}>
              {errorMessage ?? defaultErrorDescription}
            </AppText>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.retryButton}
            onPress={handleRetry}
            accessibilityRole="button"
          >
            <AppText style={styles.buttonText}>Try again</AppText>
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
    statusCenter: {
      justifyContent: "center",
      alignItems: "center",
    },
    actions: { gap: normalizeSpacing(12) },
    retryButton: {
      backgroundColor: colors.error,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 120,
      alignItems: "center",
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 120,
      alignItems: "center",
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 120,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: normalize(18),
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
