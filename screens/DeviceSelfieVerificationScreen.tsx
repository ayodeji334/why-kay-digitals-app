import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ScrollView,
} from "react-native";
import { Camera } from "react-native-vision-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Lamp,
  EyeSlash,
  ProfileCircle,
  EmojiNormal,
} from "iconsax-react-nativejs";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { COLORS } from "../constants/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import LivenessCheck from "../components/LivenessCheck";
import { useBlockGoBack } from "../hooks/useBlockGoBack";

// Same checklist as the KYC selfie screen — it's the same liveness
// challenge underneath, so the same conditions make it pass first try.
const GUIDELINES = [
  {
    Icon: Lamp,
    title: "Good lighting",
    description: "Make sure your face is clearly visible",
  },
  {
    Icon: EyeSlash,
    title: "No glasses",
    description: "Take off glasses and other accessories",
  },
  {
    Icon: ProfileCircle,
    title: "No hats",
    description: "Remove hats and anything covering your face",
  },
  {
    Icon: EmojiNormal,
    title: "Neutral expression",
    description: "Keep a natural, neutral facial expression",
  },
];

type RouteParams = {
  verificationToken: string;
  deviceId: string;
  login?: string;
};

export default function DeviceSelfieVerificationScreen() {
  const navigation: any = useNavigation();
  const route = useRoute();
  const { verificationToken, deviceId, login } =
    (route.params as RouteParams) ?? {};
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const colors = useColors();
  const styles = makeStyles(colors);

  // The verification challenge shouldn't be escapable back into the login
  // form by accident — only "Use a different account" below, or the
  // result screen's session-expired handling, may leave it.
  useBlockGoBack(navigation);

  const handleVerifyClick = async () => {
    setLoading(true);

    const currentStatus = Camera.getCameraPermissionStatus();

    let status = currentStatus;
    if (currentStatus !== "granted" && currentStatus !== "denied") {
      status = await Camera.requestCameraPermission();
    }

    setLoading(false);

    if (status === "granted") {
      setShowCamera(true);
      return;
    }

    Alert.alert(
      "Camera Permission Required",
      "We need camera access to confirm it's really you on this new device. You can enable it in Settings.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ],
    );
  };

  // LivenessCheck owns alignment, capture and the blink/turn challenge in
  // one continuous flow — it hands back the already-compressed base64
  // image only once the whole challenge has passed.
  const handleLivenessSuccess = (base64Image: string) => {
    navigation.replace("DeviceSelfieResult", {
      image: { base64: base64Image },
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

  if (showCamera) {
    return (
      <LivenessCheck
        onSuccess={handleLivenessSuccess}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "bottom", "top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={styles.title}>Verify This Device</AppText>
        <AppText style={styles.subtitle}>
          We don't recognize this device. Take a quick live selfie so we can
          match it against the photo on file from your identity
          verification.
        </AppText>
        <AppText style={styles.alertNote}>
          We've sent an alert to your email — if this wasn't you, ignore the
          code and change your password.
        </AppText>

        <View style={styles.grid}>
          {GUIDELINES.map(({ Icon, title, description }) => (
            <View key={title} style={styles.card}>
              <View style={styles.cardIconBadge}>
                <Icon
                  size={normalize(25)}
                  color={COLORS.primary}
                  variant="Bold"
                />
              </View>
              <AppText style={styles.cardTitle}>{title}</AppText>
              <AppText style={styles.cardDescription}>{description}</AppText>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleVerifyClick}
          activeOpacity={0.8}
          disabled={loading}
          style={styles.primaryButton}
        >
          <AppText style={styles.primaryButtonText}>
            {loading ? "Checking..." : "I am ready"}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleUseEmailCode}
        >
          <AppText style={styles.secondaryButtonText}>
            Use Email Code Instead
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.differentAccountButton}
          onPress={() =>
            navigation.reset({ index: 0, routes: [{ name: "SignIn" }] })
          }
        >
          <AppText style={styles.differentAccountText}>
            Use a different account
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: normalizeSpacing(20),
      paddingTop: normalizeSpacing(16),
      paddingBottom: normalizeSpacing(24),
    },
    title: {
      fontSize: normalize(23),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalizeSpacing(8),
    },
    subtitle: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
      lineHeight: 22,
      marginBottom: normalizeSpacing(14),
    },
    alertNote: {
      fontSize: normalize(14),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
      lineHeight: 18,
      marginBottom: normalizeSpacing(28),
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    card: {
      width: "48%",
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      padding: normalizeSpacing(16),
      marginBottom: normalizeSpacing(16),
    },
    cardIconBadge: {
      width: normalize(44),
      height: normalize(44),
      borderRadius: normalize(22),
      backgroundColor: COLORS.fadeBackgroundPrimary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: normalizeSpacing(14),
    },
    cardTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      marginBottom: normalizeSpacing(4),
    },
    cardDescription: {
      fontSize: normalize(16),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
      lineHeight: normalize(18),
    },
    footer: {
      paddingHorizontal: normalizeSpacing(20),
      paddingBottom: normalizeSpacing(20),
      paddingTop: normalizeSpacing(8),
    },
    primaryButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 25,
      alignItems: "center",
    },
    primaryButtonText: {
      color: "#fff",
      fontSize: 14,
      fontFamily: getFontFamily("700"),
    },
    secondaryButton: {
      paddingVertical: normalizeSpacing(14),
      alignItems: "center",
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: normalize(15),
      fontFamily: getFontFamily("700"),
    },
    differentAccountButton: {
      alignItems: "center",
      paddingVertical: normalizeSpacing(6),
    },
    differentAccountText: {
      fontSize: normalize(14),
      fontFamily: getFontFamily("700"),
      color: colors.textMuted,
      textDecorationLine: "underline",
    },
  });
