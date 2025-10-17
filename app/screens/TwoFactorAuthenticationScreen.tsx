import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import { useNavigation } from "@react-navigation/native";
import { FingerScan } from "iconsax-react-nativejs";
import { normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import CustomLoading from "../components/CustomLoading";
import useAxios from "../api/axios";
import { useAuthStore } from "../stores/authSlice";
import { showSuccess, showError } from "../utlis/toast";
import { getItem, removeItem, setItem } from "../utlis/storage";

const TwoFactorAuthenticationScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const { apiGet } = useAxios();
  const user = useAuthStore(state => state.user);
  const { setIsGoogleAuthenticatorEnabled, isGoogleAuthenticatorEnabled } =
    useAuthStore();

  const existingOtp = getItem("2fa_auth_url");
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const is2FAEnabled = user?.biometric_enabled || isGoogleAuthenticatorEnabled;

  const handleGenerateQRCode = useCallback(async () => {
    if (existingOtp) return;

    setIsLoading(true);
    try {
      const response = await apiGet("2fa-auth/generate");
      const url = response?.data.data?.otpauth_url;
      setOtpauthUrl(JSON.stringify(url));
      setItem("2fa_auth_url", url);
      showSuccess(
        "Secret fetched successfully. Scan the QR code in Google Authenticator.",
      );
    } catch (error) {
      console.error("Generate QR error:", error);
      showError("Failed to fetch 2FA secret.");
    } finally {
      setIsLoading(false);
    }
  }, [apiGet, existingOtp]);

  const handleDisable2FA = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiGet("2fa-auth/disable");

      setIsGoogleAuthenticatorEnabled(false);
      removeItem("2fa_auth_url");
      showSuccess("2FA disabled successfully.");
    } catch (error) {
      console.error("Disable 2FA error:", error);
      showError("Failed to disable 2FA.");
    } finally {
      setIsLoading(false);
    }
  }, [apiGet, setIsGoogleAuthenticatorEnabled]);

  const handleSkip = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const getPrimaryButtonAction = () => {
    if (is2FAEnabled && existingOtp) return handleDisable2FA;
    if (existingOtp)
      return () =>
        navigation.navigate("ConfirmTwoFactorAuthentication" as never);
    return handleGenerateQRCode;
  };

  const getPrimaryButtonText = () => {
    if (is2FAEnabled) return "Disable Google Authenticator";
    if (otpauthUrl || existingOtp) return "Continue";
    return "Enable Google Authenticator";
  };

  const getSecondaryButtonText = () => {
    return is2FAEnabled ? "Back" : "Skip for now";
  };

  const getDescriptionText = () => {
    return is2FAEnabled
      ? "2FA is currently enabled. You can disable it below."
      : "Secure your account with Google Authenticator.";
  };

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {!is2FAEnabled && !existingOtp && (
            <>
              <View style={styles.textContainer}>
                <Text style={styles.description}>{getDescriptionText()}</Text>
              </View>

              <View style={styles.iconContainer}>
                <FingerScan
                  size={normalize(60)}
                  color={is2FAEnabled ? COLORS.primary : COLORS.secondary}
                />
                {is2FAEnabled && (
                  <View style={styles.enabledBadge}>
                    <Text style={styles.enabledBadgeText}>Enabled</Text>
                  </View>
                )}
              </View>
            </>
          )}

          {(existingOtp || otpauthUrl) && (
            <View style={styles.qrContainer}>
              <QRCode value={otpauthUrl ?? existingOtp} size={200} />
              <Text style={styles.qrText}>
                Scan this QR code with Google Authenticator
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={getPrimaryButtonAction()}
              style={[
                styles.primaryButton,
                is2FAEnabled && styles.disableButton,
              ]}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {getPrimaryButtonText()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkip}
              style={styles.secondaryButton}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>
                {getSecondaryButtonText()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: normalize(12),
    color: "#666",
    textAlign: "center",
  },
  iconContainer: {
    borderRadius: 40,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    position: "relative",
  },
  enabledBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  enabledBadgeText: {
    color: "#FFF",
    fontSize: normalize(8),
    fontWeight: "500",
  },
  qrContainer: {
    marginVertical: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  qrText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: normalize(12),
    color: "#666",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 30,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  disableButton: {
    backgroundColor: COLORS.secondary,
  },
  primaryButtonText: {
    color: "#000",
    fontSize: normalize(12),
    fontWeight: "500",
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  secondaryButtonText: {
    fontSize: normalize(12),
    fontWeight: "500",
    color: "#666",
  },
});

export default TwoFactorAuthenticationScreen;
