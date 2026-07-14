import React, { useState } from "react";
import { View, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BiometryTypes } from "react-native-biometrics";
import CustomLoading from "../components/CustomLoading";
import { COLORS } from "../constants/colors";
import { useBiometricPromptStore } from "../stores/biometricPromptSlice";
import { useShouldPromptBiometric } from "../hooks/useShouldPromptBiometric";
import { FingerScan, TickCircle } from "iconsax-react-nativejs";
import { getFontFamily, normalize } from "../constants/settings";
import { AppText } from "../components/AppText";
import { useBiometricEnrollment } from "../hooks/useBiometricEnrollment";

export default function BiometricPromptScreen() {
  const { enroll, isLoading, biometryType } = useBiometricEnrollment();
  const { markSkipped, markDeclinedForever, markEnrolled, setHoldGate } =
    useBiometricPromptStore(s => s);
  const { isSecondAsk } = useShouldPromptBiometric();

  const [enrolled, setEnrolled] = useState(false);

  const label =
    biometryType === BiometryTypes.FaceID
      ? "Face ID"
      : biometryType === BiometryTypes.TouchID
      ? "Touch ID"
      : "Biometrics";

  const handleEnable = async () => {
    setHoldGate(true);

    const ok = await enroll({ silent: true });
    if (ok) {
      setEnrolled(true);
    } else {
      setHoldGate(false);
    }
  };

  const handleContinue = async () => {
    await markEnrolled();
    setHoldGate(false); // release → gate closes → Dashboard
  };

  return (
    <SafeAreaView
      edges={["top", "right", "bottom", "left"]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.content}>
        <View style={styles.hero}>
          <View
            style={[
              styles.iconContainer,
              enrolled && styles.iconContainerSuccess,
            ]}
          >
            {enrolled ? (
              <TickCircle
                size={normalize(38)}
                color={COLORS.primary ?? "#12A150"}
                variant="Bold"
              />
            ) : (
              <FingerScan size={normalize(38)} color={COLORS.primary} />
            )}
          </View>

          <View style={styles.textContainer}>
            <AppText style={styles.title}>
              {enrolled ? `${label} is setup now!` : "Sign in faster next time"}
            </AppText>
            <AppText style={styles.description}>
              {enrolled
                ? `Next time you open the app, log in with ${label} instead of your password. You can turn this off anytime in Settings.`
                : `Use ${label} to log in without typing your password. You can change this anytime in Settings.`}
            </AppText>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {enrolled ? (
            <TouchableOpacity
              onPress={handleContinue}
              activeOpacity={0.98}
              hitSlop={10}
              style={styles.primaryButton}
            >
              <AppText style={styles.primaryButtonText}>Continue</AppText>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={handleEnable}
                activeOpacity={0.98}
                hitSlop={10}
                style={[
                  styles.primaryButton,
                  isLoading && styles.buttonDisabled,
                ]}
                disabled={isLoading}
              >
                <AppText style={styles.primaryButtonText}>
                  Enable {label}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                hitSlop={10}
                onPress={markSkipped}
                activeOpacity={0.98}
                style={styles.secondaryButton}
                disabled={isLoading}
              >
                <AppText style={styles.secondaryButtonText}>Not now</AppText>
              </TouchableOpacity>

              {isSecondAsk && (
                <TouchableOpacity
                  hitSlop={5}
                  onPress={markDeclinedForever}
                  activeOpacity={0.9}
                  style={styles.tertiaryButton}
                  disabled={isLoading}
                >
                  <AppText style={styles.tertiaryButtonText}>
                    Don't ask again
                  </AppText>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
}

// export default function BiometricPromptScreen() {
//   const { enroll, isLoading, biometryType } = useBiometricEnrollment();
//   const { markSkipped, markDeclinedForever, markEnrolled } =
//     useBiometricPromptStore(s => s);
//   const { isSecondAsk } = useShouldPromptBiometric();

//   const label =
//     biometryType === BiometryTypes.FaceID
//       ? "Face ID"
//       : biometryType === BiometryTypes.TouchID
//       ? "Touch ID"
//       : "biometrics";

//   const handleEnable = async () => {
//     const ok = await enroll();
//     if (ok) await markEnrolled(); // nav gate flips, screen unmounts
//   };

//   return (
//     <SafeAreaView
//       edges={["top", "right", "bottom", "left"]}
//       style={styles.container}
//     >
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

//       <View style={styles.content}>
//         <View style={styles.hero}>
//           <View style={styles.iconContainer}>
//             <FingerScan size={normalize(38)} color={COLORS.primary} />
//           </View>

//           <View style={styles.textContainer}>
//             <AppText style={styles.title}>Sign in faster next time</AppText>
//             <AppText style={styles.description}>
//               Use {label} to log in without typing your password. You can change
//               this anytime in Settings.
//             </AppText>
//           </View>
//         </View>

//         <View style={styles.buttonContainer}>
//           <TouchableOpacity
//             onPress={handleEnable}
//             activeOpacity={0.98}
//             hitSlop={10}
//             style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
//             disabled={isLoading}
//           >
//             <AppText style={styles.primaryButtonText}>Enable {label}</AppText>
//           </TouchableOpacity>

//           <TouchableOpacity
//             hitSlop={10}
//             onPress={markSkipped}
//             activeOpacity={0.98}
//             style={styles.secondaryButton}
//             disabled={isLoading}
//           >
//             <AppText style={styles.secondaryButtonText}>Not now</AppText>
//           </TouchableOpacity>

//           {isSecondAsk && (
//             <TouchableOpacity
//               hitSlop={5}
//               onPress={markDeclinedForever}
//               activeOpacity={0.9}
//               style={styles.tertiaryButton}
//               disabled={isLoading}
//             >
//               <AppText style={styles.tertiaryButtonText}>
//                 Don't ask again
//               </AppText>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       <CustomLoading loading={isLoading} />
//     </SafeAreaView>
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: normalize(29),
    paddingBottom: normalize(24),
    justifyContent: "space-between",
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: normalize(28),
  },
  iconContainer: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(48),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${COLORS.primary}14`,
  },
  iconContainerSuccess: {
    backgroundColor: `${COLORS.primary ?? "#12A150"}14`,
  },
  textContainer: {
    alignItems: "center",
    gap: normalize(10),
  },
  title: {
    fontSize: normalize(24),
    fontFamily: getFontFamily(800),
    color: COLORS.darkBackground ?? "#111111",
    textAlign: "center",
  },
  description: {
    fontSize: normalize(20),
    lineHeight: normalize(24),
    fontFamily: getFontFamily(400),
    color: COLORS.darkBackground,
    textAlign: "center",
    paddingHorizontal: normalize(8),
  },
  buttonContainer: {
    gap: normalize(12),
    paddingBottom: 23,
  },
  primaryButton: {
    height: normalize(56),
    borderRadius: 10000,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily(700),
    color: "#FFFFFF",
  },
  secondaryButton: {
    height: normalize(56),
    borderRadius: 10000,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#b7b7b7",
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily(700),
    color: COLORS.darkBackground ?? "#111111",
  },
  tertiaryButton: {
    height: normalize(56),
    alignItems: "center",
    justifyContent: "center",
  },
  tertiaryButtonText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily(700),
    color: COLORS.darkBackground,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
