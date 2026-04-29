import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { useAuthStore } from "../stores/authSlice";
import { FingerprintIcon } from "../assets";
import CustomIcon from "../components/CustomIcon";
import { useState } from "react";
import useAxios from "../hooks/useAxios";
import { MenuItem } from "./AccountSecurityScreen";
import { showError, showSuccess, showToast } from "../utlis/toast";
import CustomLoading from "../components/CustomLoading";

interface MenuItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: () => void;
  color?: string;
  isDangerous?: boolean;
  IconComponent?: React.JSX.Element;
  disable?: boolean;
}

export default function NotificationSettingsScreen() {
  const { patch } = useAxios();
  const { user: userData, setUser } = useAuthStore(state => state);
  const [isPushLoading, setIsPushLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const isPushNotificationEnabled =
    userData?.is_push_notification_enabled ?? false;
  const isEmailNotificationEnabled =
    userData?.is_email_notification_enabled ?? false;

  const handleTogglePush = async () => {
    if (isPushLoading) return;
    setIsPushLoading(true);
    try {
      const response = await patch("users/notifications/push/toggle");
      const updatedUser = response.data.data;
      setUser(updatedUser);

      showSuccess("Push Notification Setting Updated");
    } catch (error: any) {
      console.log(error);
      showError(error?.message);
      console.error("Failed to toggle push notification:", error);
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
      console.log(error);
      showError(error?.message);
      console.error("Failed to toggle email notification:", error);
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: 20 }}>
          <MenuItem
            title="Push Notifications"
            subtitle="Get push notifications on your device"
            onSwitchChange={handleTogglePush}
            IconComponent={<CustomIcon source={FingerprintIcon} size={20} />}
            showSwitch={true}
            switchValue={isPushNotificationEnabled}
            disable={isPushLoading}
          />
          <MenuItem
            title="Email Notifications"
            subtitle="Receive notifications via email"
            onSwitchChange={handleToggleEmail}
            IconComponent={<CustomIcon source={FingerprintIcon} size={20} />}
            showSwitch={true}
            switchValue={isEmailNotificationEnabled}
            disable={isEmailLoading}
          />
        </View>
      </ScrollView>

      <CustomLoading loading={isEmailLoading || isPushLoading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: "#D2D2D2",
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
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
    marginTop: 2,
  },
});
