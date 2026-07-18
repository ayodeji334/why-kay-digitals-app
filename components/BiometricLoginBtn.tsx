import React from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { FingerScan, Scan } from "iconsax-react-nativejs";
import { useQueryClient } from "@tanstack/react-query";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import { AppText } from "./AppText";
import { useBiometricLogin } from "../hooks/useBiometricLogin";
import { useAuthStore } from "../stores/authSlice";
// import { storage, STORAGE_KEYS } from "../utlis/storage";
import { showError } from "../utlis/toast";

const BiometricLoginButton = () => {
  const queryClient = useQueryClient();

  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  const setToken = useAuthStore(state => state.setToken);
  const setIsAuthenticated = useAuthStore(state => state.setIsAuthenticated);

  const { biometryLabel, isReady, isBusy, loginWithBiometrics } =
    useBiometricLogin();

  // Fall back gracefully while the sensor check resolves / when unknown
  const label = biometryLabel ?? "Biometrics";
  const Icon = biometryLabel === "Face ID" ? Scan : FingerScan;

  const completeLogin = async () => {
    // Prompts Face ID / fingerprint, signs the payload, and has the
    // backend verify the signature. Returns the verify response data
    // (or null on cancel/failure — toasts are handled inside the hook).
    const result = await loginWithBiometrics(user?.uuid);

    const { user: updatedUser, auth } = result?.data ?? {};

    if (updatedUser?.uuid) {
      setUser(updatedUser);
    }

    // if (auth?.accessToken && auth?.refreshToken) {
    //   setToken(auth.accessToken, auth.refreshToken);
    // }

    // // Warm the caches exactly like the password login does
    // queryClient.prefetchQuery({ queryKey: ["assets"] });
    // queryClient.prefetchQuery({ queryKey: ["banks"] });
    // queryClient.prefetchQuery({ queryKey: ["supported-pairs"] });

    // setIsAuthenticated(true);

    if (!auth && updatedUser.is_email_verified) {
      showError(
        "Please verify your email before logging in. Code has been sent to your email.",
      );

      console.log("Navigating to VerifyCode with email:", updatedUser.email);

      navigation.navigate(
        "VerifyCode" as never,
        { email: updatedUser.email ?? "" } as never,
      );
      return;
    }

    if (!auth?.accessToken || !auth?.refreshToken || !user) {
      throw new Error("Invalid login response");
    }

    // fetch wallets
    queryClient.prefetchQuery({ queryKey: ["assets"] });
    queryClient.prefetchQuery({ queryKey: ["banks"] });
    queryClient.prefetchQuery({ queryKey: ["supported-pairs"] });

    setToken(auth.accessToken, auth.refreshToken);
    setUser(user);
    setIsAuthenticated(true);
  };

  const handlePress = () => {
    if (isBusy) return;

    if (!isReady) {
      Alert.alert(
        "Biometric login not set up",
        "Log in with your password first, then enable biometric login from Account & Security settings.",
      );
      return;
    }

    // Confirm with the user before firing the native biometric prompt
    // Alert.alert(
    //   `Log in with ${label}?`,
    //   `Confirm to authenticate with ${label} and sign in to your account.`,
    //   [
    //     { text: "Cancel", style: "cancel" },
    //     { text: "Continue", onPress: completeLogin },
    //   ],
    // );
    completeLogin();
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <AppText style={styles.dividerText}>or</AppText>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        onPress={handlePress}
        disabled={isBusy}
        activeOpacity={0.8}
        hitSlop={10}
        style={[styles.button, isBusy && { opacity: 0.6 }]}
      >
        {isBusy ? (
          <ActivityIndicator size={normalize(12)} />
        ) : (
          <Icon size={22} color={COLORS.whiteBackground} />
        )}

        <AppText style={styles.buttonLabel}>
          {isBusy ? "Verifying..." : `Log in with ${label}`}
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

export default BiometricLoginButton;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 40,
    gap: 14,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily(400),
    color: "#6B7280",
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}`,
  },
  buttonLabel: {
    fontSize: normalize(18),
    fontFamily: getFontFamily(700),
    color: COLORS.whiteBackground,
  },
});
