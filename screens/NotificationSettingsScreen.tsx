import { Alert, Linking, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { useAuthStore } from "../stores/authSlice";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import useAxios from "../hooks/useAxios";
import { MenuItem } from "./AccountSecurityScreen";
import { showError, showSuccess } from "../utlis/toast";
import CustomLoading from "../components/CustomLoading";
import { Notification } from "iconsax-react-nativejs";
import { COLORS } from "../constants/colors";

import {
  OneSignal,
  PushSubscriptionChangedState,
} from "react-native-onesignal";
import { useColors } from "../hooks/useTheme";
import { useStyles } from "../hooks/useStyles";

export default function NotificationSettingsScreen() {
  const { patch } = useAxios();
  const { user: userData, setUser } = useAuthStore(state => state);
  const [isPushLoading, setIsPushLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const styles = useStyles(makeStyles);

  const backendPushEnabled = userData?.is_push_notification_enabled ?? false;

  // Device state from OneSignal. `optedIn` only becomes true once OneSignal
  // has permission AND an APNs/FCM push token, so it can lag behind the
  // user's choice (or stay false if the token never arrives).
  const [isDeviceOptedIn, setIsDeviceOptedIn] = useState<boolean | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const readDeviceState = useCallback(async () => {
    try {
      const [optedIn, permission] = await Promise.all([
        OneSignal.User.pushSubscription.getOptedInAsync(),
        OneSignal.Notifications.getPermissionAsync(),
      ]);
      setIsDeviceOptedIn(optedIn);
      setHasPermission(permission);
    } catch {
      setIsDeviceOptedIn(null);
      setHasPermission(null);
    }
  }, []);

  // Re-read on focus (the user may have changed permission in Settings).
  useFocusEffect(
    useCallback(() => {
      readDeviceState();
    }, [readDeviceState]),
  );

  useEffect(() => {
    const onSubscriptionChange = (event: PushSubscriptionChangedState) =>
      setIsDeviceOptedIn(event.current.optedIn);
    const onPermissionChange = (granted: boolean) => setHasPermission(granted);

    OneSignal.User.pushSubscription.addEventListener(
      "change",
      onSubscriptionChange,
    );
    OneSignal.Notifications.addEventListener(
      "permissionChange",
      onPermissionChange,
    );
    return () => {
      OneSignal.User.pushSubscription.removeEventListener(
        "change",
        onSubscriptionChange,
      );
      OneSignal.Notifications.removeEventListener(
        "permissionChange",
        onPermissionChange,
      );
    };
  }, []);

  // Self-heal: the user wants push and has granted permission, but this
  // device isn't opted in (older app version, reinstall, token arrived late).
  useEffect(() => {
    if (
      !isPushLoading &&
      backendPushEnabled &&
      hasPermission === true &&
      isDeviceOptedIn === false
    ) {
      OneSignal.User.pushSubscription.optIn();
    }
  }, [backendPushEnabled, hasPermission, isDeviceOptedIn, isPushLoading]);

  // The switch shows the user's saved choice, turned off only when the OS
  // permission has been revoked (the one thing only Settings can fix).
  const isPushNotificationEnabled =
    backendPushEnabled && hasPermission !== false;

  // On, but OneSignal has no push token yet — nothing will be delivered
  // to this device until it does.
  const isPushPendingOnDevice =
    isPushNotificationEnabled && isDeviceOptedIn === false;

  const isEmailNotificationEnabled =
    userData?.is_email_notification_enabled ?? false;

  // Resolves once OneSignal reports the wanted opt-in state (or times out),
  // since optIn()/optOut() return immediately and apply asynchronously.
  const waitForOptIn = async (wanted: boolean, timeoutMs = 5000) => {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      if (
        (await OneSignal.User.pushSubscription.getOptedInAsync()) === wanted
      ) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    return false;
  };

  const logPushDiagnostics = async (wanted: boolean) => {
    const [optedIn, permission, subscriptionId, pushToken] = await Promise.all([
      OneSignal.User.pushSubscription.getOptedInAsync(),
      OneSignal.Notifications.getPermissionAsync(),
      OneSignal.User.pushSubscription.getIdAsync(),
      OneSignal.User.pushSubscription.getTokenAsync(),
    ]).catch(e => [`unavailable: ${String(e)}`, null, null, null]);

    console.warn("Push opt-in did not reach the requested state", {
      wanted: wanted ? "opted in" : "opted out",
      optedIn,
      hasPermission: permission,
      subscriptionId,
      hasPushToken: !!pushToken,
    });
  };

  // Notification permission is required before a device can be opted in.
  const ensurePermission = async (): Promise<boolean> => {
    if (await OneSignal.Notifications.getPermissionAsync()) return true;

    if (await OneSignal.Notifications.canRequestPermission()) {
      return OneSignal.Notifications.requestPermission(true);
    }

    // Previously denied: only the system Settings app can grant it now.
    Alert.alert(
      "Notifications are turned off",
      "Allow notifications for WhyKay in your phone's Settings, then come back to turn push notifications on.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ],
    );
    return false;
  };

  const handleTogglePush = async () => {
    if (isPushLoading) return;
    setIsPushLoading(true);

    try {
      const isEnabling = !isPushNotificationEnabled;

      if (isEnabling) {
        if (!(await ensurePermission())) return;
        setHasPermission(true);
        OneSignal.User.pushSubscription.optIn();
      } else {
        OneSignal.User.pushSubscription.optOut();
      }

      const reachedState = await waitForOptIn(isEnabling);
      await readDeviceState();

      if (!reachedState) {
        await logPushDiagnostics(isEnabling);

        // Opting out never needs a token, so failing here is a real error.
        if (!isEnabling) {
          showError(
            "We couldn't turn off push notifications for this device. Please try again.",
          );
          return;
        }
        // Opting in: permission is granted and optIn() was called, so the
        // user's intent is clear. OneSignal flips to opted-in on its own when
        // the push token arrives — don't block saving the preference on it.
      }

      // The endpoint flips the saved flag, so only call it when the backend
      // disagrees with the new state.
      if (backendPushEnabled !== isEnabling) {
        const [subscriptionId, onesignalId] = await Promise.all([
          OneSignal.User.pushSubscription.getIdAsync(),
          OneSignal.User.getOnesignalId(),
        ]);

        const response = await patch("users/notifications/push/toggle", {
          ...(isEnabling && {
            // The device's push subscription id (what OneSignal delivers to)…
            ...(subscriptionId && { push_subscription_id: subscriptionId }),
            // …and the OneSignal user id, kept for backward compatibility.
            ...(onesignalId && { onesignal_user_id: onesignalId }),
          }),
        });
        setUser(response.data.data);
      }

      showSuccess(
        !isEnabling
          ? "Push notifications turned off"
          : reachedState
          ? "Push notifications turned on"
          : "Push notifications turned on. This device is still registering and will start receiving them shortly.",
      );
    } catch (error: any) {
      await readDeviceState();
      showError(error?.response?.data?.message ?? "Something went wrong");
    } finally {
      setIsPushLoading(false);
    }
  };

  const handleToggleEmail = async () => {
    if (isEmailLoading) return;
    setIsEmailLoading(true);

    try {
      const response = await patch("users/notifications/email/toggle");
      const updatedUser = response.data.data;

      setUser(updatedUser);

      showSuccess("Email Notification Setting Updated");
    } catch (error: any) {
      console.error("Failed to toggle email notification:", error);
      showError(error?.response?.data?.message ?? "Something went wrong");
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: normalizeSpacing(20) }}>
          <MenuItem
            title="Push Notifications"
            subtitle={
              isPushPendingOnDevice
                ? "Setting up push notifications on this device…"
                : "Get push notifications on your device"
            }
            onSwitchChange={handleTogglePush}
            IconComponent={<Notification color={COLORS.primary} size={18} />}
            showSwitch
            switchValue={isPushNotificationEnabled}
            disable={isPushLoading}
          />

          <MenuItem
            title="Email Notifications"
            subtitle="Receive notifications via email"
            onSwitchChange={handleToggleEmail}
            IconComponent={<Notification color={COLORS.primary} size={18} />}
            showSwitch
            switchValue={isEmailNotificationEnabled}
            disable={isEmailLoading}
          />
        </View>
      </ScrollView>

      <CustomLoading loading={isEmailLoading || isPushLoading} />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: normalizeSpacing(20),
    },
    menuItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: normalizeSpacing(13),
      paddingHorizontal: normalizeSpacing(10),
      borderWidth: 0.5,
      borderColor: "#D2D2D2",
      marginVertical: normalizeSpacing(5),
      borderRadius: 8,
      backgroundColor: colors.inputBackground,
      gap: 10,
    },
    menuItemContent: {
      flex: 1,
    },
    menuItemTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
    },
    menuItemSubtitle: {
      fontSize: normalize(16),
      fontFamily: getFontFamily("400"),
      color: "#000",
      marginTop: normalizeSpacing(2),
    },
  });
