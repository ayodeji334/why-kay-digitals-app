// import React, { useState, useCallback } from "react";
// import {
//   Alert,
//   Linking,
//   Platform,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useNavigation } from "@react-navigation/native";
// import { FingerScan } from "iconsax-react-nativejs";
// import DeviceInfo from "react-native-device-info";
// import { getFontFamily, normalize } from "../constants/settings";
// import { COLORS } from "../constants/colors";
// import BiometricService, { BiometryTypes } from "../services/Biometrcs";
// import { showError, showSuccess } from "../utlis/toast";
// import CustomLoading from "../components/CustomLoading";
// import { useAuthStore } from "../stores/authSlice";
// import useAxios from "../hooks/useAxios";
// import { AppText } from "../components/AppText";
// import { removeItem, setItem, STORAGE_KEYS } from "../utlis/storage";

// const BiometricsScreen = () => {
//   const navigation = useNavigation();
//   const { post, patch } = useAxios();
//   const { isBiometricEnabled, setUser, enableBiometric, disableBiometric } =
//     useAuthStore(state => state);

//   const [isLoading, setIsLoading] = useState(false);

//   const showEnrollmentAlert = useCallback(() => {
//     Alert.alert(
//       "No biometrics set up",
//       `Add a ${
//         Platform.OS === "ios"
//           ? "Face ID / Touch ID"
//           : "fingerprint or face unlock"
//       } in your device settings first, then come back to enable it here.`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Open Settings",
//           onPress: () =>
//             Platform.OS === "ios"
//               ? Linking.openURL("App-Prefs:PASSCODE").catch(() =>
//                   Linking.openSettings(),
//                 )
//               : Linking.sendIntent("android.settings.SECURITY_SETTINGS").catch(
//                   () => Linking.openSettings(),
//                 ),
//         },
//       ],
//     );
//   }, []);

//   const handleBiometricError = useCallback(
//     (err: any) => {
//       console.error("Biometric flow error:", err);
//       const msg = String(err?.message ?? "");

//       if (msg.includes("cancel") || msg.includes("User cancelled")) {
//         return; // user backed out — not an error
//       }
//       if (err?.code === "ERR_NETWORK") {
//         showError("Network error. Please check your connection.");
//       } else if (msg.includes("NONE_ENROLLED")) {
//         showEnrollmentAlert();
//       } else if (err?.response?.status === 400) {
//         showError(err.response.data?.message || "Invalid request");
//       } else {
//         showError("Something went wrong. Please try again.");
//       }
//     },
//     [showEnrollmentAlert],
//   );

//   /**
//    * Pre-flight check: sensor present AND something enrolled.
//    * (Android has no runtime permission dialog for biometrics; iOS shows
//    * its Face ID permission automatically at the first prompt.)
//    */
//   const ensureBiometricAccess = useCallback(async (): Promise<{
//     ok: boolean;
//     biometryType?: string;
//   }> => {
//     const { available, biometryType, error } =
//       await BiometricService.isSensorAvailable();

//     if (available) return { ok: true, biometryType };

//     if (String(error ?? "").includes("NONE_ENROLLED")) {
//       showEnrollmentAlert();
//     } else {
//       showError("Biometric authentication is not available on this device");
//     }
//     return { ok: false };
//   }, [showEnrollmentAlert]);

//   const handleEnableBiometric = async () => {
//     try {
//       const { ok, biometryType } = await ensureBiometricAccess();
//       if (!ok) return;

//       const promptMessage =
//         biometryType === BiometryTypes.FaceID
//           ? "Scan your face to enable biometrics"
//           : biometryType === BiometryTypes.TouchID
//           ? "Scan your fingerprint to enable biometrics"
//           : "Confirm your biometrics to enable";

//       const success = await BiometricService.simplePrompt(promptMessage);
//       if (!success) return; // user cancelled the prompt

//       setIsLoading(true);

//       const [deviceName, deviceId] = await Promise.all([
//         DeviceInfo.getDeviceName(),
//         DeviceInfo.getUniqueId(),
//       ]);
//       const publicKey = await BiometricService.createKeys();

//       let res;
//       try {
//         res = await post("biometrics/register", {
//           public_key: publicKey,
//           device_name: deviceName,
//           device_id: deviceId,
//           device_os: DeviceInfo.getSystemName(),
//           biometric_type: biometryType,
//         });
//       } catch (apiErr) {
//         // Registration failed — don't leave an orphaned local keypair
//         await BiometricService.deleteKeys().catch(() => {});
//         throw apiErr;
//       }

//       console.log(res);

//       // The register endpoint returns the updated user — make it the
//       // global truth so biometric_enabled/_at match the database exactly
//       // const updatedUser = res?.data?.data;

//       // console.log(updatedUser);
//       // setUser(updatedUser);
//       // enableBiometric();

//       // showSuccess("Biometric authentication enabled successfully");
//       const { user: updatedUser, key_id } = res?.data?.data ?? {};

//       if (!key_id) {
//         // Registration technically succeeded but we can't complete login setup
//         await BiometricService.deleteKeys().catch(() => {});
//         showError("Could not finish biometric setup. Please try again.");
//         return;
//       }

//       setItem(STORAGE_KEYS.BIOMETRIC_KEY_ID, String(key_id));

//       if (!!updatedUser) {
//         setUser(updatedUser);
//       }

//       enableBiometric();

//       showSuccess("Biometric authentication enabled successfully");
//     } catch (err: any) {
//       handleBiometricError(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDisableBiometric = async () => {
//     try {
//       const { ok } = await ensureBiometricAccess();
//       if (!ok) return;

//       const success = await BiometricService.simplePrompt(
//         "Confirm your identity to disable biometrics",
//       );
//       if (!success) return; // user cancelled the prompt

//       setIsLoading(true);

//       // const res = await patch("biometrics/disable");

//       // console.log(res);

//       // await BiometricService.deleteKeys().catch(() => {});

//       // Mirror the backend's answer into the user record
//       // const user = res?.data?.data ?? false;
//       // if (user) {
//       //   console.log(user);
//       //   setUser(user);
//       // }

//       // disableBiometric();

//       const res = await patch("biometrics/disable");
//       await BiometricService.deleteKeys().catch(() => {});
//       removeItem(STORAGE_KEYS.BIOMETRIC_KEY_ID);

//       const user = res?.data?.data ?? null;
//       if (user) setUser(user);
//       disableBiometric();

//       showSuccess("Biometric authentication disabled successfully");
//     } catch (err: any) {
//       handleBiometricError(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSkip = useCallback(() => {
//     navigation.goBack();
//   }, [navigation]);

//   return (
//     <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
//       <ScrollView
//         style={styles.scrollContainer}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.content}>
//           <View style={styles.textContainer}>
//             <AppText style={styles.description}>
//               {isBiometricEnabled
//                 ? "Biometric authentication is currently enabled. You can disable it here."
//                 : "Secure your account with biometrics for quick, easy sign-in."}
//             </AppText>
//           </View>

//           <View style={styles.iconContainer}>
//             <FingerScan
//               size={normalize(40)}
//               color={isBiometricEnabled ? COLORS.primary : COLORS.secondary}
//             />
//             {isBiometricEnabled && (
//               <View style={styles.enabledBadge}>
//                 <AppText style={styles.enabledBadgeText}>Enabled</AppText>
//               </View>
//             )}
//           </View>

//           <View style={styles.buttonContainer}>
//             <TouchableOpacity
//               onPress={
//                 isBiometricEnabled
//                   ? handleDisableBiometric
//                   : handleEnableBiometric
//               }
//               activeOpacity={0.8}
//               style={styles.primaryButton}
//               disabled={isLoading}
//             >
//               <AppText style={styles.primaryButtonText}>
//                 {isBiometricEnabled
//                   ? "Disable Biometrics"
//                   : "Enable Biometrics"}
//               </AppText>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={handleSkip}
//               activeOpacity={0.8}
//               style={styles.secondaryButton}
//               disabled={isLoading}
//             >
//               <AppText style={styles.secondaryButtonText}>
//                 {isBiometricEnabled ? "Back" : "Skip for now"}
//               </AppText>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//       <CustomLoading loading={isLoading} />
//     </SafeAreaView>
//   );
// };
import React, { useState, useCallback } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { FingerScan } from "iconsax-react-nativejs";
import DeviceInfo from "react-native-device-info";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import BiometricService, { BiometryTypes } from "../services/Biometrcs";
import { showError, showSuccess } from "../utlis/toast";
import CustomLoading from "../components/CustomLoading";
import { useAuthStore } from "../stores/authSlice";
import useAxios from "../hooks/useAxios";
import { AppText } from "../components/AppText";
import { removeItem, setItem, STORAGE_KEYS } from "../utlis/storage";
import { useBiometricLogin } from "../hooks/useBiometricLogin";

const BiometricsScreen = () => {
  const navigation = useNavigation();
  const { post, patch } = useAxios();
  const { setUser, enableBiometric, disableBiometric } = useAuthStore(
    state => state,
  );

  const { isReady, refreshAvailability } = useBiometricLogin();
  const isBiometricEnabled = isReady;

  const [isLoading, setIsLoading] = useState(false);

  const showEnrollmentAlert = useCallback(() => {
    Alert.alert(
      "No biometrics set up",
      `Add a ${
        Platform.OS === "ios"
          ? "Face ID / Touch ID"
          : "fingerprint or face unlock"
      } in your device settings first, then come back to enable it here.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () =>
            Platform.OS === "ios"
              ? Linking.openURL("App-Prefs:PASSCODE").catch(() =>
                  Linking.openSettings(),
                )
              : Linking.sendIntent("android.settings.SECURITY_SETTINGS").catch(
                  () => Linking.openSettings(),
                ),
        },
      ],
    );
  }, []);

  const handleBiometricError = useCallback(
    (err: any) => {
      console.error("Biometric flow error:", err);
      const msg = String(err?.message ?? "");

      if (msg.includes("cancel") || msg.includes("User cancelled")) {
        return;
      }
      if (err?.code === "ERR_NETWORK") {
        showError("Network error. Please check your connection.");
      } else if (msg.includes("NONE_ENROLLED")) {
        showEnrollmentAlert();
      } else if (err?.response?.status === 400) {
        showError(err.response.data?.message || "Invalid request");
      } else {
        showError("Something went wrong. Please try again.");
      }
    },
    [showEnrollmentAlert],
  );

  const ensureBiometricAccess = useCallback(async (): Promise<{
    ok: boolean;
    biometryType?: string;
  }> => {
    const { available, biometryType, error } =
      await BiometricService.isSensorAvailable();

    if (available) return { ok: true, biometryType };

    if (String(error ?? "").includes("NONE_ENROLLED")) {
      showEnrollmentAlert();
    } else {
      showError("Biometric authentication is not available on this device");
    }
    return { ok: false };
  }, [showEnrollmentAlert]);

  const handleEnableBiometric = async () => {
    try {
      const { ok, biometryType } = await ensureBiometricAccess();
      if (!ok) return;

      const promptMessage =
        biometryType === BiometryTypes.FaceID
          ? "Scan your face to enable biometrics"
          : biometryType === BiometryTypes.TouchID
          ? "Scan your fingerprint to enable biometrics"
          : "Confirm your biometrics to enable";

      const success = await BiometricService.simplePrompt(promptMessage);
      if (!success) return;

      setIsLoading(true);

      const [deviceName, deviceId] = await Promise.all([
        DeviceInfo.getDeviceName(),
        DeviceInfo.getUniqueId(),
      ]);
      const publicKey = await BiometricService.createKeys();

      let res;
      try {
        res = await post("biometrics/register", {
          public_key: publicKey,
          device_name: deviceName,
          device_id: deviceId,
          device_os: DeviceInfo.getSystemName(),
          biometric_type: biometryType,
        });
      } catch (apiErr) {
        await BiometricService.deleteKeys().catch(() => {});
        throw apiErr;
      }

      const { user: updatedUser, key_id } = res?.data?.data ?? {};

      if (!key_id) {
        await BiometricService.deleteKeys().catch(() => {});
        showError("Could not finish biometric setup. Please try again.");
        return;
      }

      await setItem(STORAGE_KEYS.BIOMETRIC_KEY_ID, String(key_id));
      // Record ownership so isReady (and cross-account detection) stay correct.
      await setItem(
        STORAGE_KEYS.BIOMETRIC_USER_ID,
        String(updatedUser?.uuid ?? useAuthStore.getState().user?.uuid ?? ""),
      );

      if (!!updatedUser) {
        setUser(updatedUser);
      }

      enableBiometric();
      await refreshAvailability(); // re-derive isReady from real state

      showSuccess("Biometric authentication enabled successfully");
    } catch (err: any) {
      handleBiometricError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableBiometric = async () => {
    try {
      const { ok } = await ensureBiometricAccess();
      if (!ok) return;

      const success = await BiometricService.simplePrompt(
        "Confirm your identity to disable biometrics",
      );
      if (!success) return;

      setIsLoading(true);

      const res = await patch("biometrics/disable");
      await BiometricService.deleteKeys().catch(() => {});
      await removeItem(STORAGE_KEYS.BIOMETRIC_KEY_ID);
      await removeItem(STORAGE_KEYS.BIOMETRIC_USER_ID);

      const user = res?.data?.data ?? null;
      if (user) setUser(user);
      disableBiometric();
      await refreshAvailability();

      showSuccess("Biometric authentication disabled successfully");
    } catch (err: any) {
      handleBiometricError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
            <AppText style={styles.description}>
              {isBiometricEnabled
                ? "Biometric authentication is currently enabled. You can disable it here."
                : "Secure your account with biometrics for quick, easy sign-in."}
            </AppText>
          </View>

          <View style={styles.iconContainer}>
            <FingerScan
              size={normalize(40)}
              color={isBiometricEnabled ? COLORS.primary : COLORS.secondary}
            />
            {isBiometricEnabled && (
              <View style={styles.enabledBadge}>
                <AppText style={styles.enabledBadgeText}>Enabled</AppText>
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
              style={styles.primaryButton}
              disabled={isLoading}
            >
              <AppText style={styles.primaryButtonText}>
                {isBiometricEnabled
                  ? "Disable Biometrics"
                  : "Enable Biometrics"}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkip}
              activeOpacity={0.8}
              style={styles.secondaryButton}
              disabled={isLoading}
            >
              <AppText style={styles.secondaryButtonText}>
                {isBiometricEnabled ? "Back" : "Skip for now"}
              </AppText>
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
  iconContainer: {
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 29,
    position: "relative",
  },
  enabledBadge: {
    position: "absolute",
    top: 5,
    right: -5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  enabledBadgeText: {
    color: "#FFFFFF",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(15),
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
  primaryButtonText: {
    color: "#fff",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 120,
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  secondaryButtonText: {
    fontFamily: getFontFamily("800"),
    fontSize: normalize(18),
    color: "#666666",
  },
});

export default BiometricsScreen;
