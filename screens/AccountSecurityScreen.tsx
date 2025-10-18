import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import {
  ArrowRight2,
  FingerScan,
  Key,
  Lock,
  ShieldTick,
} from "iconsax-react-nativejs";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import InfoCard from "../components/InfoCard";
import { useAuthStore } from "../stores/authSlice";

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
  IconComponent?: React.ComponentType<any>;
}

const MenuItem = ({
  title,
  subtitle,
  onPress,
  showArrow = true,
  showSwitch = false,
  switchValue,
  isDangerous = false,
  color = "#000",
  IconComponent = ArrowRight2,
  onSwitchChange,
}: MenuItemProps) => {
  const bgColor = isDangerous ? "#DC262611" : "#EFF7EC";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.menuItem]}
      onPress={onPress}
      disabled={switchValue}
    >
      <View
        style={{
          marginRight: 12,
          backgroundColor: bgColor,
          height: 40,
          width: 40,
          borderRadius: 100,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <IconComponent
          variant="Outline"
          size={19}
          color={isDangerous ? "red" : "#E89E00"}
        />
      </View>
      <View style={styles.menuItemContent}>
        <Text
          style={[
            styles.menuItemTitle,
            { color: isDangerous ? "#DC2626" : color },
          ]}
        >
          {title}
        </Text>
        {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && !showSwitch && <ArrowRight2 size={15} color={color} />}
      {showSwitch && (
        <Switch
          onChange={onSwitchChange}
          value={switchValue}
          trackColor={{ false: COLORS.gray, true: "green" }}
          style={{ transform: [{ scaleX: 0.6 }, { scaleY: 0.6 }] }}
        />
      )}
    </TouchableOpacity>
  );
};

export default function AccountSecurityScreen() {
  const { user: userData, isGoogleAuthenticatorEnabled } = useAuthStore(
    state => state,
  );
  const navigation = useNavigation();
  const isBiometricEnabled =
    userData?.biometric_enabled ||
    useAuthStore(state => state.isBiometricEnabled);

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <InfoCard
          title="Keep Your Money Safe"
          description="Update your password, set a transaction PIN, and enable two-factor authentication to secure your account."
          IconComponent={ShieldTick}
          iconColor="#0a611fff"
        />

        <View style={{ marginTop: 20 }}>
          <MenuItem
            title="Password"
            subtitle="Update your login password to keep your account secure"
            onPress={() => navigation.navigate("ChangePassword" as never)}
            IconComponent={Key}
          />
          <MenuItem
            title="Transaction Pin"
            subtitle="Set or update your 4-digit PIN for faster transactions"
            onPress={() => navigation.navigate("ChangeTransactionPin" as never)}
            IconComponent={Lock}
          />
          <MenuItem
            title="Authenticator"
            subtitle="Enable Google Authenticator for extra protection"
            onPress={() =>
              navigation.navigate("TwoFactorAuthentication" as never)
            }
            IconComponent={ShieldTick}
            onSwitchChange={() => {
              navigation.navigate("TwoFactorAuthentication" as never);
            }}
            showSwitch={true}
            switchValue={isGoogleAuthenticatorEnabled}
          />
          <MenuItem
            title="Use FaceID/Fingerprint"
            subtitle="Log in and approve transactions with biometrics"
            onPress={() => {
              navigation.navigate("BiometricSettings" as never);
            }}
            IconComponent={FingerScan}
            showSwitch={true}
            switchValue={isBiometricEnabled}
            onSwitchChange={() => {
              navigation.navigate("BiometricSettings" as never);
            }}
          />
        </View>
      </ScrollView>
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
    gap: 2,
  },
  menuItemTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
  menuItemSubtitle: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
    color: COLORS.gray,
    marginTop: 2,
  },
});
