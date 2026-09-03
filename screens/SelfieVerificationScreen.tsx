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
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import LivenessCheck from "../components/LivenessCheck";

// What the user needs to know before starting, so the check passes on the
// first try instead of failing (and forcing a retry) partway through.
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

export default function SelfieVerificationScreen() {
  const navigation: any = useNavigation();
  const route = useRoute();
  const { bvn }: any = route.params ?? {};
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const colors = useColors();
  const styles = makeStyles(colors);

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
      "We need camera access to verify your identity with a selfie. You can enable it in Settings.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ],
    );
  };

  // LivenessCheck now owns alignment, capture and the blink/turn challenge
  // in one continuous flow — it hands back the already-compressed base64
  // image only once the whole challenge has passed.
  const handleLivenessSuccess = (base64Image: string) => {
    navigation.replace("SelfieConfirmation", {
      image: { base64: base64Image },
      bvn,
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
    <SafeAreaView style={styles.container} edges={["left", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={styles.title}>Prepare for Verification</AppText>
        <AppText style={styles.subtitle}>
          Follow these guidelines for a successful verification
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
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    headerBtn: {
      padding: 4,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 24,
    },
    title: {
      fontSize: normalize(23),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
      marginBottom: 28,
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
      padding: 16,
      marginBottom: 16,
    },
    cardIconBadge: {
      width: normalize(44),
      height: normalize(44),
      borderRadius: normalize(22),
      backgroundColor: COLORS.fadeBackgroundPrimary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    cardTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      marginBottom: 4,
    },
    cardDescription: {
      fontSize: normalize(16),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
      lineHeight: normalize(18),
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 8,
    },
    primaryButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: 16,
      borderRadius: 25,
      alignItems: "center",
    },
    primaryButtonText: {
      color: "#fff",
      fontSize: 14,
      fontFamily: getFontFamily("700"),
    },
  });
