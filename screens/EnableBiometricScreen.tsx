// import React, { useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StatusBar,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { getFontFamily, normalize } from "../constants/settings";
// import { COLORS } from "../constants/colors";
// import { FingerScan } from "iconsax-react-nativejs";
// import { useNavigation } from "@react-navigation/native";
// import BiometricService from "../services/Biometrcs";
// import { BiometryTypes } from "react-native-biometrics";
// import { showError, showSuccess } from "../utlis/toast";
// import CustomLoading from "../components/CustomLoading";
// import DeviceInfo from "react-native-device-info";
// import { useAuthStore } from "../stores/authSlice";
// import useAxios from "../hooks/useAxios";
// import { AppText } from "../components/AppText";
// import { Alert, Linking, Platform } from "react-native";

// const BiometricsScreen = () => {
//   const user = useAuthStore(state => state.user);
//   const { enableBiometric, disableBiometric } = useAuthStore();
//   const navigation = useNavigation();
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const { post, patch } = useAxios();

//   // add to imports:

//   /** Shared error handler for the biometric flows */
//   const handleBiometricError = useCallback((err: any) => {
//     console.log(err);
//     const msg = String(err?.message ?? "");
//     if (msg.includes("cancel") || msg.includes("User cancelled")) {
//       return; // user backed out — not an error
//     }
//     if (err?.code === "ERR_NETWORK") {
//       showError("Network error. Please check your connection.");
//     } else if (msg.includes("NONE_ENROLLED")) {
//       showEnrollmentAlert();
//     } else if (err?.response?.status === 400) {
//       showError(err.response.data?.message || "Invalid request");
//     } else {
//       showError("Something went wrong. Please try again.");
//     }
//   }, []);

//   const showEnrollmentAlert = () => {
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
//   };

//   /**
//    * Pre-flight "permission" check: sensor present AND something enrolled.
//    * (Android has no runtime permission dialog for biometrics; iOS shows its
//    * Face ID permission automatically at the first prompt.)
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
//   }, []);

//   const handleSendDetailToServer = useCallback(
//     async (
//       success: boolean,
//       biometricType?: string,
//       isEnabling: boolean = true,
//     ) => {
//       // simplePrompt resolves { success: false } on CANCEL — stay silent
//       if (!success) return;

//       setIsLoading(true);
//       try {
//         if (isEnabling) {
//           const deviceOs = DeviceInfo.getSystemName();
//           const deviceName = await DeviceInfo.getDeviceName();
//           const deviceId = await DeviceInfo.getUniqueId();
//           const publicKey = await BiometricService.createKeys();

//           try {
//             await post("biometrics/register", {
//               public_key: publicKey,
//               device_name: deviceName,
//               device_id: deviceId,
//               device_os: deviceOs,
//               biometric_type: biometricType,
//             });
//           } catch (apiErr) {
//             // Registration failed — don't leave an orphaned local keypair
//             await BiometricService.deleteKeys().catch(() => {});
//             throw apiErr;
//           }

//           enableBiometric();
//           showSuccess("Biometric authentication enabled successfully");
//         } else {
//           await patch("biometrics/disable");
//           await BiometricService.deleteKeys().catch(() => {});
//           disableBiometric();
//           showSuccess("Biometric authentication disabled successfully");
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [post, patch, enableBiometric, disableBiometric], // ← patch was missing
//   );

//   const handleEnableBiometric = useCallback(async () => {
//     try {
//       // 1) Ask/verify biometric access BEFORE anything else
//       const { ok, biometryType } = await ensureBiometricAccess();
//       if (!ok) return;

//       let promptMessage = "Confirm your identity";
//       switch (biometryType) {
//         case BiometryTypes.TouchID:
//           promptMessage = "Scan your fingerprint to enable biometrics";
//           break;
//         case BiometryTypes.FaceID:
//           promptMessage = "Scan your face to enable biometrics";
//           break;
//         case BiometryTypes.Biometrics:
//           promptMessage = "Confirm your biometrics to enable";
//           break;
//       }

//       // 2) On iOS this first prompt also triggers the system's
//       //    Face ID permission dialog (needs NSFaceIDUsageDescription)
//       const success = await BiometricService.simplePrompt(promptMessage);

//       // 3) Register with the backend
//       await handleSendDetailToServer(success, biometryType, true);
//     } catch (err: any) {
//       handleBiometricError(err);
//     }
//   }, [ensureBiometricAccess, handleSendDetailToServer, handleBiometricError]);

//   const handleDisableBiometric = useCallback(async () => {
//     try {
//       const { ok } = await ensureBiometricAccess();
//       if (!ok) return;

//       const success = await BiometricService.simplePrompt(
//         "Confirm your identity to disable biometrics",
//       );
//       await handleSendDetailToServer(success, undefined, false);
//     } catch (err: any) {
//       handleBiometricError(err);
//     }
//   }, [ensureBiometricAccess, handleSendDetailToServer, handleBiometricError]);

//   // const handleSendDetailToServer = useCallback(
//   //   async (
//   //     success: boolean,
//   //     biometricType?: string,
//   //     isEnabling: boolean = true,
//   //   ) => {
//   //     if (!success) {
//   //       showError("Biometric authentication failed");
//   //       return;
//   //     }

//   //     setIsLoading(true);

//   //     try {
//   //       if (isEnabling) {
//   //         // Enable biometrics
//   //         const deviceOs = DeviceInfo.getSystemName();
//   //         const signature = await BiometricService.createKeys();
//   //         const deviceName = await DeviceInfo.getDeviceName();
//   //         const deviceId = await DeviceInfo.getUniqueId();

//   //         await post("biometrics/register", {
//   //           public_key: signature,
//   //           device_name: deviceName,
//   //           device_id: deviceId,
//   //           device_os: deviceOs,
//   //           biometric_type: biometricType,
//   //         });

//   //         // Update local state
//   //         enableBiometric();

//   //         showSuccess("Biometric authentication enabled successfully");
//   //       } else {
//   //         // Disable biometrics
//   //         await patch("biometrics/disable");

//   //         // Update local state
//   //         disableBiometric();

//   //         showSuccess("Biometric authentication disabled successfully");
//   //       }
//   //     } catch (err: any) {
//   //       throw err;
//   //     } finally {
//   //       setIsLoading(false);
//   //     }
//   //   },
//   //   [post, enableBiometric, disableBiometric],
//   // );

//   // const handleEnableBiometric = useCallback(async () => {
//   //   try {
//   //     const { available, biometryType } =
//   //       await BiometricService.isSensorAvailable();

//   //     if (!available) {
//   //       showError("Biometric authentication is not available on this device");
//   //       return;
//   //     }

//   //     let promptMessage = "Confirm your identity";
//   //     let biometricType = "";

//   //     switch (biometryType) {
//   //       case BiometryTypes.TouchID:
//   //         biometricType = BiometryTypes.TouchID;
//   //         promptMessage = "Scan your fingerprint to enable biometrics";
//   //         break;
//   //       case BiometryTypes.FaceID:
//   //         biometricType = BiometryTypes.FaceID;
//   //         promptMessage = "Scan your face to enable biometrics";
//   //         break;
//   //       case BiometryTypes.Biometrics:
//   //         biometricType = BiometryTypes.Biometrics;
//   //         promptMessage = "Confirm your biometrics to enable";
//   //         break;
//   //     }

//   //     const success = await BiometricService.simplePrompt(promptMessage);

//   //     await handleSendDetailToServer(success, biometricType, true);
//   //   } catch (err: any) {
//   //     console.log(err);
//   //     if (err?.code === "ERR_NETWORK") {
//   //       showError("Network error. Please check your connection.");
//   //     } else if (err?.response?.status === 400) {
//   //       showError(err.response.data?.message || "Invalid request");
//   //     } else if (
//   //       err?.message?.includes("cancel") ||
//   //       err?.message?.includes("User cancelled")
//   //     ) {
//   //       // User cancelled the biometric prompt - no need to show error
//   //       return;
//   //     } else {
//   //       showError("Something went wrong. Please try again.");
//   //     }
//   //   }
//   // }, [handleSendDetailToServer]);

//   // const handleDisableBiometric = useCallback(async () => {
//   //   try {
//   //     // For disabling, we still want to verify the user's identity
//   //     const promptMessage = "Confirm your identity to disable biometrics";

//   //     const success = await BiometricService.simplePrompt(promptMessage);
//   //     await handleSendDetailToServer(success, undefined, false);
//   //   } catch (err: any) {
//   //     if (err?.code === "ERR_NETWORK") {
//   //       showError("Network error. Please check your connection.");
//   //     } else if (err?.response?.status === 400) {
//   //       showError(err.response.data?.message || "Invalid request");
//   //     } else if (
//   //       err?.message?.includes("cancel") ||
//   //       err?.message?.includes("User cancelled")
//   //     ) {
//   //       // User cancelled the biometric prompt - no need to show error
//   //       return;
//   //     } else {
//   //       showError("Something went wrong. Please try again.");
//   //     }
//   //   }
//   // }, [handleSendDetailToServer]);

//   const handleSkip = useCallback(() => {
//     navigation.goBack();
//   }, [navigation]);

//   console.log(user);

//   const isBiometricEnabled = user?.biometric_enabled ?? false;

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
//               style={[
//                 styles.primaryButton,
//                 isBiometricEnabled && styles.disableButton,
//               ]}
//               disabled={isLoading}
//             >
//               <AppText
//                 style={[
//                   styles.primaryButtonText,
//                   isBiometricEnabled && styles.disableButtonText,
//                 ]}
//               >
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

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   content: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//   },
//   textContainer: {
//     width: "100%",
//     alignItems: "center",
//   },
//   title: {
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(18),
//     color: "#fff",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   iconContainer: {
//     borderRadius: 30,
//     backgroundColor: "#F5F5F5",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 29,
//     position: "relative",
//   },
//   enabledBadge: {
//     position: "absolute",
//     top: 5,
//     right: -5,
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   enabledBadgeText: {
//     color: "#FFFFFF",
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(15),
//   },
//   buttonContainer: {
//     width: "100%",
//     paddingBottom: 30,
//   },
//   description: {
//     fontFamily: getFontFamily("400"),
//     fontSize: normalize(18),
//     color: "#666666",
//     textAlign: "center",
//     lineHeight: 22,
//   },
//   primaryButton: {
//     width: "100%",
//     backgroundColor: COLORS.secondary,
//     paddingVertical: 16,
//     borderRadius: 92,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   disableButton: {
//     backgroundColor: COLORS.secondary,
//   },
//   primaryButtonText: {
//     color: "#fff",
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(18),
//   },
//   disableButtonText: {
//     color: "#fff",
//   },
//   secondaryButton: {
//     width: "100%",
//     paddingVertical: 16,
//     borderRadius: 120,
//     alignItems: "center",
//     backgroundColor: COLORS.lightGray,
//   },
//   secondaryButtonText: {
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(18),
//     color: "#666666",
//   },
// });

// export default BiometricsScreen;
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

// const BiometricsScreen = () => {
//   const navigation = useNavigation();
//   const { post, patch } = useAxios();

//   const user = useAuthStore(state => state.user);
//   const setUser = useAuthStore(state => state.setUser);

//   const [isLoading, setIsLoading] = useState(false);

//   // Single source of truth: the user record, kept in sync with the backend
//   const isBiometricEnabled = user?.biometric_enabled || false;

//   console.log(user.biometric_enabled);

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

//   const handleEnableBiometric = useCallback(async () => {
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

//       // The register endpoint returns the updated user — make it the
//       // global truth so biometric_enabled/_at match the database exactly
//       const updatedUser = res?.data?.data;
//       if (updatedUser?.uuid) {
//         setUser(updatedUser);
//       } else if (user) {
//         // Fallback if the response shape ever changes
//         setUser({
//           ...user,
//           biometric_enabled: true,
//           biometric_enabled_at: new Date().toISOString(),
//         });
//       }

//       showSuccess("Biometric authentication enabled successfully");
//     } catch (err: any) {
//       handleBiometricError(err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [ensureBiometricAccess, post, setUser, user, handleBiometricError]);

//   const handleDisableBiometric = useCallback(async () => {
//     try {
//       const { ok } = await ensureBiometricAccess();
//       if (!ok) return;

//       const success = await BiometricService.simplePrompt(
//         "Confirm your identity to disable biometrics",
//       );
//       if (!success) return; // user cancelled the prompt

//       setIsLoading(true);

//       const res = await patch("biometrics/disable");
//       await BiometricService.deleteKeys().catch(() => {});

//       // Mirror the backend's answer into the user record
//       const serverEnabled = res?.data?.data?.biometric_enabled ?? false;
//       if (user) {
//         setUser({
//           ...user,
//           biometric_enabled: serverEnabled,
//           biometric_enabled_at: serverEnabled
//             ? user.biometric_enabled_at
//             : null,
//         });
//       }

//       showSuccess("Biometric authentication disabled successfully");
//     } catch (err: any) {
//       handleBiometricError(err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [ensureBiometricAccess, patch, setUser, user, handleBiometricError]);

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

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   content: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//   },
//   textContainer: {
//     width: "100%",
//     alignItems: "center",
//   },
//   iconContainer: {
//     borderRadius: 30,
//     backgroundColor: "#F5F5F5",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 29,
//     position: "relative",
//   },
//   enabledBadge: {
//     position: "absolute",
//     top: 5,
//     right: -5,
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   enabledBadgeText: {
//     color: "#FFFFFF",
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(15),
//   },
//   buttonContainer: {
//     width: "100%",
//     paddingBottom: 30,
//   },
//   description: {
//     fontFamily: getFontFamily("400"),
//     fontSize: normalize(18),
//     color: "#666666",
//     textAlign: "center",
//     lineHeight: 22,
//   },
//   primaryButton: {
//     width: "100%",
//     backgroundColor: COLORS.secondary,
//     paddingVertical: 16,
//     borderRadius: 92,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   primaryButtonText: {
//     color: "#fff",
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(18),
//   },
//   secondaryButton: {
//     width: "100%",
//     paddingVertical: 16,
//     borderRadius: 120,
//     alignItems: "center",
//     backgroundColor: COLORS.lightGray,
//   },
//   secondaryButtonText: {
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(18),
//     color: "#666666",
//   },
// });

// export default BiometricsScreen;
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

const BiometricsScreen = () => {
  const navigation = useNavigation();
  const { post, patch } = useAxios();
  const { isBiometricEnabled, setUser, enableBiometric, disableBiometric } =
    useAuthStore(state => state);
  // const setUser = useAuthStore(state => state.setUser);

  const [isLoading, setIsLoading] = useState(false);

  // Single source of truth: the user record, kept in sync with the backend

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
        return; // user backed out — not an error
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

  /**
   * Pre-flight check: sensor present AND something enrolled.
   * (Android has no runtime permission dialog for biometrics; iOS shows
   * its Face ID permission automatically at the first prompt.)
   */
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
      if (!success) return; // user cancelled the prompt

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
        // Registration failed — don't leave an orphaned local keypair
        await BiometricService.deleteKeys().catch(() => {});
        throw apiErr;
      }

      console.log(res);

      // The register endpoint returns the updated user — make it the
      // global truth so biometric_enabled/_at match the database exactly
      // const updatedUser = res?.data?.data;

      // console.log(updatedUser);
      // setUser(updatedUser);
      // enableBiometric();

      // showSuccess("Biometric authentication enabled successfully");
      const { user: updatedUser, key_id } = res?.data?.data ?? {};

      if (!key_id) {
        // Registration technically succeeded but we can't complete login setup
        await BiometricService.deleteKeys().catch(() => {});
        showError("Could not finish biometric setup. Please try again.");
        return;
      }

      setItem(STORAGE_KEYS.BIOMETRIC_KEY_ID, String(key_id));

      if (!!updatedUser) {
        setUser(updatedUser);
      }

      enableBiometric();

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
      if (!success) return; // user cancelled the prompt

      setIsLoading(true);

      // const res = await patch("biometrics/disable");

      // console.log(res);

      // await BiometricService.deleteKeys().catch(() => {});

      // Mirror the backend's answer into the user record
      // const user = res?.data?.data ?? false;
      // if (user) {
      //   console.log(user);
      //   setUser(user);
      // }

      // disableBiometric();

      const res = await patch("biometrics/disable");
      await BiometricService.deleteKeys().catch(() => {});
      removeItem(STORAGE_KEYS.BIOMETRIC_KEY_ID);

      const user = res?.data?.data ?? null;
      if (user) setUser(user);
      disableBiometric();

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
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    color: "#666666",
  },
});

export default BiometricsScreen;
