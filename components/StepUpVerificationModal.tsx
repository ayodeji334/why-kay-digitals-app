import React, { useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ReactNativeBiometrics from "react-native-biometrics";
import {
  FingerScan,
  ShieldSecurity,
  CloseCircle,
} from "iconsax-react-nativejs";
import { COLORS } from "../constants/colors";
import { HIGH_VALUE_WITHDRAWAL_THRESHOLD } from "../constants/transactionLimits";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { AppText } from "./AppText";
import OtpInputField from "./OtpInputField";
import { useColors } from "../hooks/useTheme";
import { useStepUpAvailability } from "../hooks/useStepUpAvailability";
import { storage, STORAGE_KEYS } from "../utlis/storage";
import { showError } from "../utlis/toast";
import useAxios from "../hooks/useAxios";
import { fetchBiometricChallenge } from "../utlis/biometricChallenge";

// Same instance shape as useBiometricLogin's — createSignature() is what
// forces the OS Face ID/Touch ID prompt and only succeeds if it passes.
// A second instance here (rather than reusing useBiometricLogin's) keeps
// this modal from accidentally going through that hook's login-specific
// endpoint call.
// Biometrics only — the device PIN must not be able to approve a withdrawal.
const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: false,
});

export type StepUpResult =
  | { authenticator_code: string }
  | {
      biometric_key_id: number;
      biometric_payload: string;
      biometric_signature: string;
    };

type Props = {
  visible: boolean;
  amount: number;
  // Destination bank account number for this withdrawal — part of the
  // exact string the backend expects to verify the biometric signature
  // against: "withdrawal|<amount>|<accountNumber>|<timestamp>".
  accountNumber: string;
  // The real, backend-reported threshold for this withdrawal (see
  // walletSummary.high_value_withdrawal_threshold) — falls back to the
  // static default only if the caller doesn't have one yet.
  threshold?: number;
  onClose: () => void;
  onVerified: (result: StepUpResult) => void;
  // Neither factor is set up at all — caller navigates to Account Security.
  onSetUpRequired: () => void;
};

const otpSchema = yup.object({
  code: yup
    .string()
    .required("Enter the 6-digit code")
    .matches(/^\d+$/, "Code must contain only numbers")
    .length(6, "Code must be 6 digits"),
});

type OtpFormData = { code: string };

/**
 * Shown by ConfirmTransactionScreen right before submitting a fiat
 * withdrawal above `threshold` (the backend-reported
 * high_value_withdrawal_threshold) — the backend rejects such a withdrawal
 * without an authenticator_code or biometric_* trio alongside the
 * transaction PIN, so this collects whichever the user has set up and
 * hands it back; it never calls any API itself.
 */
export default function StepUpVerificationModal({
  visible,
  amount,
  accountNumber,
  threshold = HIGH_VALUE_WITHDRAWAL_THRESHOLD,
  onClose,
  onVerified,
  onSetUpRequired,
}: Props) {
  const { client } = useAxios();
  const colors = useColors();
  const styles = makeStyles(colors);
  const { hasAuthenticator, hasBiometric, biometryLabel, hasAnyStepUpMethod } =
    useStepUpAvailability();

  const [mode, setMode] = useState<"choose" | "authenticator" | "biometric">(
    "choose",
  );
  const [isVerifyingBiometric, setIsVerifyingBiometric] = useState(false);

  const { control, handleSubmit, reset } = useForm<OtpFormData>({
    resolver: yupResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const description =
    mode === "authenticator"
      ? "Enter the 6-digit code from your authenticator app to confirm it’s you."
      : mode === "biometric"
      ? `Confirm it’s you with ${biometryLabel ?? "biometrics"} to continue.`
      : "This withdrawal requires biometric verification or an authenticator code. Please confirm it’s you with one more step.";

  const resetAndClose = () => {
    setMode("choose");
    reset();
    onClose();
  };

  const handleAuthenticatorSubmit = (data: OtpFormData) => {
    setMode("choose");
    reset();
    onVerified({ authenticator_code: data.code });
  };

  const handleBiometric = async () => {
    const keyId = storage.getString(STORAGE_KEYS.BIOMETRIC_KEY_ID);
    if (!keyId) {
      showError("Biometric verification isn't set up on this device.");
      return;
    }

    try {
      setIsVerifyingBiometric(true);
      setMode("biometric");

      // Bind the signature to this withdrawal and a server-issued one-time
      // challenge. Legacy timestamp payload only while the endpoint rolls out.
      const challenge = await fetchBiometricChallenge(
        client,
        keyId,
        "withdrawal",
      );
      const payload = `withdrawal|${amount}|${accountNumber}|${
        challenge ?? Date.now()
      }`;

      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage: `Confirm with ${biometryLabel ?? "biometrics"}`,
        payload,
        cancelButtonText: "Cancel",
      });

      // User backed out of the native prompt — not an error, let them
      // pick something else instead of showing a scary toast.
      if (!success || !signature) return;

      onVerified({
        biometric_key_id: Number(keyId),
        biometric_payload: payload,
        biometric_signature: signature,
      });
    } catch (err) {
      console.error("Biometric step-up failed:", err);
      showError(
        "Couldn't verify with biometrics. Try the authenticator code instead.",
      );
    } finally {
      setIsVerifyingBiometric(false);
      setMode("choose");
    }
  };

  // Neither factor is set up at all — nothing to choose between, so send
  // the user to set one up. ConfirmTransactionScreen keeps the entered PIN
  // and re-offers this modal once they come back with one enabled.
  if (!hasAnyStepUpMethod) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.iconBadge}>
              <ShieldSecurity
                size={normalize(28)}
                color={colors.primary}
                variant="Bold"
              />
            </View>
            <AppText style={styles.title}>Extra Verification Required</AppText>
            <AppText style={styles.description}>
              You need an authenticator code or Face ID/Touch ID, in addition to
              your transaction PIN. Set one of these up to continue.
            </AppText>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.primaryButton}
              onPress={onSetUpRequired}
            >
              <AppText style={styles.primaryButtonText}>Set Up Now</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.secondaryButton}
              onPress={resetAndClose}
            >
              <AppText style={styles.secondaryButtonText}>Cancel</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={resetAndClose}
    >
      {/* RN's Modal renders in its own native window, so a KeyboardAvoidingView
          on the invoking screen has no effect here — it has to live inside
          the Modal itself, or the keyboard just covers the OTP field. */}
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.closeButton}
            hitSlop={20}
            onPress={resetAndClose}
          >
            <CloseCircle size={22} color={colors.textMuted} />
          </Pressable>

          <View style={styles.iconBadge}>
            <ShieldSecurity
              size={normalize(28)}
              color={colors.primary}
              variant="Bold"
            />
          </View>
          <AppText style={styles.title}>Extra Verification Required</AppText>
          <AppText style={styles.description}>{description}</AppText>

          {mode === "authenticator" ? (
            <View style={styles.body}>
              <View style={styles.otpWrap}>
                <OtpInputField control={control} name="code" boxes={6} />
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.primaryButton}
                onPress={handleSubmit(handleAuthenticatorSubmit)}
              >
                <AppText style={styles.primaryButtonText}>Verify</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.secondaryButton}
                onPress={() => setMode("choose")}
              >
                <AppText style={styles.secondaryButtonText}>Back</AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.body}>
              {hasBiometric && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.optionButton}
                  disabled={isVerifyingBiometric}
                  onPress={handleBiometric}
                >
                  <FingerScan size={20} color={colors.primary} variant="Bold" />
                  <AppText style={styles.optionButtonText}>
                    {isVerifyingBiometric
                      ? "Verifying…"
                      : `Use ${biometryLabel ?? "Biometrics"}`}
                  </AppText>
                </TouchableOpacity>
              )}
              {hasAuthenticator && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.optionButton}
                  onPress={() => setMode("authenticator")}
                >
                  <ShieldSecurity
                    size={20}
                    color={colors.primary}
                    variant="Bold"
                  />
                  <AppText style={styles.optionButtonText}>
                    Use Authenticator Code
                  </AppText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.secondaryButton}
                onPress={resetAndClose}
              >
                <AppText style={styles.secondaryButtonText}>Cancel</AppText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      width: "100%",
      backgroundColor: colors.inputBackground,
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
      padding: normalizeSpacing(24),
      paddingBottom: normalizeSpacing(40),
      alignItems: "center",
      position: "relative",
    },
    closeButton: {
      position: "absolute",
      top: 16,
      right: 16,
      zIndex: 10,
    },
    iconBadge: {
      width: normalize(56),
      height: normalize(56),
      borderRadius: normalize(28),
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginTop: normalizeSpacing(16),
      marginBottom: normalizeSpacing(16),
    },
    title: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("900"),
      color: colors.text,
      paddingBottom: normalizeSpacing(10),
      textAlign: "center",
    },
    description: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.text,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: normalizeSpacing(20),
    },
    body: {
      width: "100%",
    },
    otpWrap: {
      alignItems: "center",
      marginBottom: normalizeSpacing(12),
    },
    optionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 100,
      width: "100%",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.primary,
      marginBottom: normalizeSpacing(12),
    },
    optionButtonText: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      color: "white",
    },
    primaryButton: {
      paddingVertical: normalizeSpacing(14),
      borderRadius: 100,
      width: "100%",
      alignItems: "center",
      backgroundColor: COLORS.secondary,
      marginBottom: normalizeSpacing(10),
    },
    primaryButtonText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: "#fff",
    },
    secondaryButton: {
      paddingVertical: normalizeSpacing(14),
      borderRadius: 100,
      width: "100%",
      alignItems: "center",
    },
    secondaryButtonText: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      color: colors.textMuted,
    },
  });
