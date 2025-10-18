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
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { FingerScan } from "iconsax-react-nativejs";
import { useNavigation } from "@react-navigation/native";
import BiometricService from "../services/Biometrcs";
import { BiometryTypes } from "react-native-biometrics";
import { showError, showSuccess } from "../utlis/toast";
import CustomLoading from "../components/CustomLoading";
import DeviceInfo from "react-native-device-info";
import useAxios from "../api/axios";
import { useAuthStore } from "../stores/authSlice";

const BiometricsScreen = () => {
  const user = useAuthStore(state => state.user);
  const { enableBiometric, disableBiometric } = useAuthStore();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { post, patch } = useAxios();

  const handleSendDetailToServer = useCallback(
    async (
      success: boolean,
      biometricType?: string,
      isEnabling: boolean = true,
    ) => {
      if (!success) {
        showError("Biometric authentication failed");
        return;
      }

      setIsLoading(true);

      try {
        if (isEnabling) {
          // Enable biometrics
          const deviceOs = DeviceInfo.getSystemName();
          const signature = await BiometricService.createKeys();
          const deviceName = await DeviceInfo.getDeviceName();
          const deviceId = await DeviceInfo.getUniqueId();

          await post("biometrics/register", {
            public_key: signature,
            device_name: deviceName,
            device_id: deviceId,
            device_os: deviceOs,
            biometric_type: biometricType,
          });

          // Update local state
          enableBiometric();

          showSuccess("Biometric authentication enabled successfully");
        } else {
          // Disable biometrics
          await patch("biometrics/disable");

          // Update local state
          disableBiometric();

          showSuccess("Biometric authentication disabled successfully");
        }
      } catch (err: any) {
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [post, enableBiometric, disableBiometric],
  );

  const handleEnableBiometric = useCallback(async () => {
    try {
      const { available, biometryType } =
        await BiometricService.isSensorAvailable();

      if (!available) {
        showError("Biometric authentication is not available on this device");
        return;
      }

      let promptMessage = "Confirm your identity";
      let biometricType = "";

      switch (biometryType) {
        case BiometryTypes.TouchID:
          biometricType = BiometryTypes.TouchID;
          promptMessage = "Scan your fingerprint to enable biometrics";
          break;
        case BiometryTypes.FaceID:
          biometricType = BiometryTypes.FaceID;
          promptMessage = "Scan your face to enable biometrics";
          break;
        case BiometryTypes.Biometrics:
          biometricType = BiometryTypes.Biometrics;
          promptMessage = "Confirm your biometrics to enable";
          break;
      }

      const success = await BiometricService.simplePrompt(promptMessage);

      await handleSendDetailToServer(
        success,
        biometricType,
        user?.biometric_enabled,
      );
    } catch (err: any) {
      if (err?.code === "ERR_NETWORK") {
        showError("Network error. Please check your connection.");
      } else if (err?.response?.status === 400) {
        showError(err.response.data?.message || "Invalid request");
      } else if (
        err?.message?.includes("cancel") ||
        err?.message?.includes("User cancelled")
      ) {
        // User cancelled the biometric prompt - no need to show error
        return;
      } else {
        showError("Something went wrong. Please try again.");
      }
    }
  }, [handleSendDetailToServer]);

  const handleDisableBiometric = useCallback(async () => {
    try {
      // For disabling, we still want to verify the user's identity
      const promptMessage = "Confirm your identity to disable biometrics";

      const success = await BiometricService.simplePrompt(promptMessage);
      await handleSendDetailToServer(success, undefined, false);
    } catch (err: any) {
      if (err?.code === "ERR_NETWORK") {
        showError("Network error. Please check your connection.");
      } else if (err?.response?.status === 400) {
        showError(err.response.data?.message || "Invalid request");
      } else if (
        err?.message?.includes("cancel") ||
        err?.message?.includes("User cancelled")
      ) {
        // User cancelled the biometric prompt - no need to show error
        return;
      } else {
        showError("Something went wrong. Please try again.");
      }
    }
  }, [handleSendDetailToServer]);

  const handleSkip = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const isBiometricEnabled =
    user?.biometric_enabled || useAuthStore(state => state.isBiometricEnabled);

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.description}>
              {isBiometricEnabled
                ? "Biometric authentication is currently enabled. You can disable it here."
                : "Secure your account with biometrics for quick, easy sign-in."}
            </Text>
          </View>

          <View style={styles.iconContainer}>
            <FingerScan
              size={normalize(60)}
              color={isBiometricEnabled ? COLORS.primary : COLORS.secondary}
            />
            {isBiometricEnabled && (
              <View style={styles.enabledBadge}>
                <Text style={styles.enabledBadgeText}>Enabled</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={
                isBiometricEnabled
                  ? handleDisableBiometric
                  : handleEnableBiometric
              }
              activeOpacity={0.8}
              style={[
                styles.primaryButton,
                isBiometricEnabled && styles.disableButton,
              ]}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  isBiometricEnabled && styles.disableButtonText,
                ]}
              >
                {isBiometricEnabled
                  ? "Disable Biometrics"
                  : "Enable Biometrics"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkip}
              activeOpacity={0.8}
              style={styles.secondaryButton}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>
                {isBiometricEnabled ? "Back" : "Skip for now"}
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    color: "#000000",
    marginBottom: 12,
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
    color: "#FFFFFF",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
  },
  buttonContainer: {
    width: "100%",
    paddingBottom: 30,
  },
  description: {
    fontFamily: getFontFamily("400"),
    fontSize: normalize(18),
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 92,
    alignItems: "center",
    marginBottom: 12,
  },
  disableButton: {
    backgroundColor: COLORS.secondary,
  },
  primaryButtonText: {
    color: "#000000",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
  },
  disableButtonText: {
    color: "#000",
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 120,
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  secondaryButtonText: {
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    color: "#666666",
  },
});

export default BiometricsScreen;
