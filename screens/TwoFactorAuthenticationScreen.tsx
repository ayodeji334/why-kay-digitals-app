import React, { useState, useCallback, useMemo } from "react";
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
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import CustomLoading from "../components/CustomLoading";
import { useAuthStore } from "../stores/authSlice";
import { showSuccess, showError } from "../utlis/toast";
import { getItem, removeItem, setItem } from "../utlis/storage";
import useAxios from "../hooks/useAxios";
import Clipboard from "@react-native-clipboard/clipboard";
import CustomIcon from "../components/CustomIcon";
import { CopyIcon } from "../assets";

const TwoFactorAuthenticationScreen = () => {
  const navigation = useNavigation();
  const { apiGet } = useAxios();
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  const { setIsGoogleAuthenticatorEnabled, isGoogleAuthenticatorEnabled } =
    useAuthStore();

  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(
    () => getItem("2fa_auth_url") ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const is2FAEnabled = user?.two_factor_enabled || isGoogleAuthenticatorEnabled;
  const hasQrUrl = !!otpauthUrl;

  const secret = useMemo(() => {
    if (!otpauthUrl) return null;
    try {
      const queryIndex = otpauthUrl.indexOf("?");
      if (queryIndex === -1) return null;
      const params = new URLSearchParams(otpauthUrl.slice(queryIndex + 1));
      return params.get("secret");
    } catch {
      return null;
    }
  }, [otpauthUrl]);

  const handleGenerateQRCode = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiGet("2fa-auth/generate");
      const url = response?.data?.data?.otpauth_url;
      if (!url) throw new Error("No URL returned");
      setOtpauthUrl(url);
      setItem("2fa_auth_url", url);
      showSuccess("Scan the QR code in Google Authenticator.");
      setUser(response?.data?.data);
    } catch {
      showError("Failed to fetch 2FA secret.");
    } finally {
      setIsLoading(false);
    }
  }, [apiGet]);

  const handleDisable2FA = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiGet("2fa-auth/disable");
      setIsGoogleAuthenticatorEnabled(false);
      setOtpauthUrl(null);
      removeItem("2fa_auth_url");
      showSuccess("2FA disabled successfully.");
      setUser(response?.data?.data);
    } catch {
      showError("Failed to disable 2FA.");
    } finally {
      setIsLoading(false);
    }
  }, [apiGet, setIsGoogleAuthenticatorEnabled]);

  const handleContinue = useCallback(() => {
    navigation.navigate("ConfirmTwoFactorAuthentication" as never);
  }, [navigation]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const primaryButton = useMemo(() => {
    if (is2FAEnabled) {
      return {
        label: "Disable Authenticator",
        onPress: handleDisable2FA,
        isDestructive: true,
      };
    }
    if (hasQrUrl) {
      return {
        label: "Continue",
        onPress: handleContinue,
        isDestructive: false,
      };
    }
    return {
      label: "Enable Authenticator",
      onPress: handleGenerateQRCode,
      isDestructive: false,
    };
  }, [
    is2FAEnabled,
    hasQrUrl,
    handleDisable2FA,
    handleContinue,
    handleGenerateQRCode,
  ]);

  const secondaryButton = useMemo(
    () => ({
      label: is2FAEnabled ? "Back" : "Skip for now",
      onPress: handleBack,
    }),
    [is2FAEnabled, handleBack],
  );

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {is2FAEnabled && (
            <View style={styles.enabledContainer}>
              <View style={styles.iconContainer}>
                <FingerScan size={normalize(60)} color={COLORS.primary} />
                <View style={styles.enabledBadge}>
                  <Text style={styles.enabledBadgeText}>Enabled</Text>
                </View>
              </View>
              <Text style={styles.description}>
                2FA is currently enabled. You can disable it below.
              </Text>
            </View>
          )}

          {/* ── State: QR not yet generated ── */}
          {!is2FAEnabled && !hasQrUrl && (
            <View style={styles.introContainer}>
              <View style={styles.iconContainer}>
                <FingerScan size={normalize(60)} color={COLORS.secondary} />
              </View>
              <Text style={styles.description}>
                Secure your account with Google Authenticator.
              </Text>
            </View>
          )}

          {/* ── State: QR generated, pending confirmation ── */}
          {!is2FAEnabled && hasQrUrl && (
            <View style={styles.qrContainer}>
              <QRCode value={otpauthUrl!} size={200} />

              <Text style={styles.qrText}>
                Scan this QR code with Google Authenticator or enter the details
                manually below.
              </Text>

              <View style={styles.manualSetupContainer}>
                <SetupRow
                  label="Account name"
                  value={`WhyKayDigitals (${user?.email})`}
                  onCopy={() => {
                    Clipboard.setString(`WhyKayDigitals (${user?.email})`);
                    showSuccess("Account name copied!");
                  }}
                />
                <SetupRow
                  label="Secret key"
                  value={secret ?? "—"}
                  onCopy={() => {
                    Clipboard.setString(secret ?? "");
                    showSuccess("Secret key copied!");
                  }}
                />
                <SetupRow
                  label="Type of key"
                  value="Time based"
                  onCopy={() => {
                    Clipboard.setString("Time based");
                    showSuccess("Copied!");
                  }}
                />
              </View>
            </View>
          )}

          {/* ── Buttons ── */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={primaryButton.onPress}
              style={[
                styles.primaryButton,
                primaryButton.isDestructive && styles.destructiveButton,
              ]}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>
                {primaryButton.label}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={secondaryButton.onPress}
              style={styles.secondaryButton}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>
                {secondaryButton.label}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
};

// ─── SetupRow helper ──────────────────────────────────────────────────────────

const SetupRow = ({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) => (
  <View>
    <Text style={styles.setupLabel}>{label}:</Text>
    <View style={styles.row}>
      <Text style={styles.setupValue} selectable>
        {value}
      </Text>
      <TouchableOpacity activeOpacity={0.8} onPress={onCopy}>
        <CustomIcon source={CopyIcon} size={14} />
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  introContainer: {
    alignItems: "center",
    gap: 20,
    marginTop: 40,
  },
  enabledContainer: {
    alignItems: "center",
    gap: 20,
    marginTop: 40,
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
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
  },
  description: {
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    color: "#000",
    textAlign: "center",
    lineHeight: 24,
  },
  qrContainer: {
    marginVertical: 20,
    alignItems: "center",
    gap: 12,
  },
  qrText: {
    textAlign: "center",
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: "#000",
    paddingHorizontal: 10,
  },
  manualSetupContainer: {
    width: "100%",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    gap: 4,
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    columnGap: 10,
  },
  setupLabel: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 2,
  },
  setupValue: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#444",
    flex: 1,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 30,
    gap: 12,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 92,
    alignItems: "center",
  },
  destructiveButton: {
    backgroundColor: "#FF3B30",
  },
  primaryButtonText: {
    color: "#fff",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 120,
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  secondaryButtonText: {
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    color: "#000",
  },
});

export default TwoFactorAuthenticationScreen;
