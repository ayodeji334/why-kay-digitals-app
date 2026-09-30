import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import { useNavigation } from "@react-navigation/native";
import { FingerScan } from "iconsax-react-nativejs";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { COLORS } from "../constants/colors";
import CustomLoading from "../components/CustomLoading";
import { useAuthStore } from "../stores/authSlice";
import { showSuccess, showError } from "../utlis/toast";
import { getItem, removeItem, setItem } from "../utlis/storage";
import useAxios from "../hooks/useAxios";
import Clipboard from "@react-native-clipboard/clipboard";
import CustomIcon from "../components/CustomIcon";
import { CopyIcon } from "../assets";
import { AppText } from "../components/AppText";
import { useColors, useResolvedTheme } from "../hooks/useTheme";
import OtpInputField from "../components/OtpInputField";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";

type DisableFormData = {
  code: string;
};

const TwoFactorAuthenticationScreen = () => {
  const navigation = useNavigation();
  const resolvedTheme = useResolvedTheme();
  const { apiGet, post } = useAxios();
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  const { setIsGoogleAuthenticatorEnabled, isGoogleAuthenticatorEnabled } =
    useAuthStore();

  const colors = useColors();
  const styles = makeStyles(colors);

  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(
    () => getItem("2fa_auth_url") ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Turning 2FA off needs the current authenticator code (the server refuses without it).
  const { control, handleSubmit, reset } = useForm<DisableFormData>({
    defaultValues: { code: "" },
  });

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
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError ? err.response?.data?.message : undefined;
      showError(message || "Failed to fetch 2FA secret.");
    } finally {
      setIsLoading(false);
    }
  }, [apiGet, setUser]);

  const handleDisable2FA = useCallback(
    async ({ code }: DisableFormData) => {
      if (!code || code.length < 6) {
        showError("Enter the 6-digit code from your authenticator app.");
        return;
      }
      setIsLoading(true);
      try {
        const response = await post("2fa-auth/disable", { code });
        setIsGoogleAuthenticatorEnabled(false);
        setOtpauthUrl(null);
        removeItem("2fa_auth_url");
        reset();
        showSuccess("2FA disabled successfully.");
        setUser(response?.data?.data);
      } catch (err: unknown) {
        const message =
          err instanceof AxiosError ? err.response?.data?.message : undefined;
        showError(message || "Failed to disable 2FA.");
        reset();
      } finally {
        setIsLoading(false);
      }
    },
    [post, reset, setIsGoogleAuthenticatorEnabled, setUser],
  );

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
        onPress: handleSubmit(handleDisable2FA),
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
    handleSubmit,
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
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.content}>
          {is2FAEnabled && (
            <View style={styles.enabledContainer}>
              <View style={styles.iconContainer}>
                <FingerScan size={normalize(60)} color={COLORS.primary} />
                <View style={styles.enabledBadge}>
                  <AppText style={styles.enabledBadgeText}>Enabled</AppText>
                </View>
              </View>
              <AppText style={styles.description}>
                2FA is currently enabled. To disable it, enter the current code
                from your authenticator app.
              </AppText>
              <OtpInputField control={control} name="code" boxes={6} />
            </View>
          )}

          {/* ── State: QR not yet generated ── */}
          {!is2FAEnabled && !hasQrUrl && (
            <View style={styles.introContainer}>
              <View style={styles.iconContainer}>
                <FingerScan size={normalize(60)} color={COLORS.secondary} />
              </View>
              <AppText style={styles.description}>
                Secure your account with Google Authenticator.
              </AppText>
            </View>
          )}

          {/* ── State: QR generated, pending confirmation ── */}
          {!is2FAEnabled && hasQrUrl && (
            <View style={styles.qrContainer}>
              <QRCode value={otpauthUrl!} size={200} />

              <AppText style={styles.qrText}>
                Scan this QR code with Google Authenticator or enter the details
                manually below.
              </AppText>

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
              <AppText style={styles.primaryButtonText}>
                {primaryButton.label}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={secondaryButton.onPress}
              style={styles.secondaryButton}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <AppText style={styles.secondaryButtonText}>
                {secondaryButton.label}
              </AppText>
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
}) => {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <View>
      <AppText style={styles.setupLabel}>{label}:</AppText>
      <View style={styles.row}>
        <AppText style={styles.setupValue} selectable>
          {value}
        </AppText>
        <TouchableOpacity activeOpacity={0.8} onPress={onCopy}>
          <CustomIcon source={CopyIcon} size={14} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flexGrow: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: normalizeSpacing(20),
      paddingBottom: normalizeSpacing(30),
    },
    content: {
      flex: 1,
      justifyContent: "space-between",
    },
    introContainer: {
      alignItems: "center",
      gap: 20,
      marginTop: normalizeSpacing(40),
    },
    enabledContainer: {
      alignItems: "center",
      gap: 20,
      marginTop: normalizeSpacing(40),
    },
    iconContainer: {
      borderRadius: 40,
      backgroundColor: "#F5F5F5",
      alignItems: "center",
      justifyContent: "center",
      padding: normalizeSpacing(30),
      position: "relative",
    },
    enabledBadge: {
      position: "absolute",
      top: -5,
      right: -5,
      backgroundColor: COLORS.primary,
      paddingHorizontal: normalizeSpacing(8),
      paddingVertical: normalizeSpacing(2),
      borderRadius: 10,
    },
    enabledBadgeText: {
      color: "white",
      fontSize: normalize(16),
      fontFamily: getFontFamily("700"),
    },
    description: {
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
      color: colors.text,
      textAlign: "center",
    },
    qrContainer: {
      marginVertical: normalizeSpacing(20),
      alignItems: "center",
      gap: 12,
    },
    qrText: {
      textAlign: "center",
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.text,
      paddingHorizontal: normalizeSpacing(10),
    },
    manualSetupContainer: {
      width: "100%",
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: normalizeSpacing(16),
      gap: 4,
      marginTop: normalizeSpacing(10),
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: normalizeSpacing(12),
      columnGap: 10,
    },
    setupLabel: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalizeSpacing(2),
    },
    setupValue: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      flex: 1,
    },
    buttonContainer: {
      width: "100%",
      marginTop: normalizeSpacing(30),
      gap: 12,
    },
    primaryButton: {
      width: "100%",
      backgroundColor: COLORS.secondary,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 92,
      alignItems: "center",
    },
    destructiveButton: {
      backgroundColor: "red",
    },
    primaryButtonText: {
      color: "white",
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
    },
    secondaryButton: {
      width: "100%",
      paddingVertical: normalizeSpacing(14),
      borderRadius: 120,
      alignItems: "center",
      backgroundColor: COLORS.lightGray,
    },
    secondaryButtonText: {
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
      color: "black",
    },
  });

export default TwoFactorAuthenticationScreen;
