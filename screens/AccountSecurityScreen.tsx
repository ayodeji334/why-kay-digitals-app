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
import { ArrowRight2 } from "iconsax-react-nativejs";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../stores/authSlice";
import {
  EyeIcon,
  FingerprintIcon,
  KeyIcon,
  PadlockIcon,
  ShieldCheckIcon,
} from "../assets";
import CustomIcon from "../components/CustomIcon";
import { useState } from "react";

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

const MenuItem = ({
  title,
  subtitle,
  onPress,
  showArrow = true,
  showSwitch = false,
  switchValue,
  isDangerous = false,
  color = "#000",
  IconComponent = <ArrowRight2 />,
  onSwitchChange,
  disable = false,
}: MenuItemProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.menuItem]}
      onPress={onPress}
      disabled={disable}
    >
      <View
        style={{
          marginRight: 2,
          height: 40,
          width: 40,
          borderRadius: 100,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {IconComponent}
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
  const setIsShowBalance = useAuthStore(state => state.setIsShowBalance);
  const isShowBalance = useAuthStore(state => state.isShowBalance);
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
        <View style={{ marginTop: 20 }}>
          <MenuItem
            title="Change Password"
            subtitle="Update your login password to keep your account secure"
            onPress={() => navigation.navigate("ChangePassword" as never)}
            IconComponent={<CustomIcon source={KeyIcon} size={20} />}
          />
          <MenuItem
            title="Transaction Pin"
            subtitle="Set or update your 4-digit PIN for faster transactions"
            onPress={() => navigation.navigate("ChangeTransactionPin" as never)}
            IconComponent={<CustomIcon source={PadlockIcon} size={20} />}
          />
          <MenuItem
            title="Google Authentication"
            subtitle="Enable Google Authenticator for extra protection"
            onPress={() =>
              navigation.navigate("TwoFactorAuthentication" as never)
            }
            IconComponent={
              <CustomIcon
                source={ShieldCheckIcon}
                size={20}
                overrideColor={false}
              />
            }
            showSwitch={true}
            switchValue={isGoogleAuthenticatorEnabled}
          />
          <MenuItem
            title="Use FaceID/Fingerprint"
            subtitle="Log in and approve transactions with biometrics"
            onPress={() => {
              navigation.navigate("BiometricSettings" as never);
            }}
            IconComponent={<CustomIcon source={FingerprintIcon} size={20} />}
            showSwitch={true}
            switchValue={isBiometricEnabled}
          />
          <MenuItem
            title="Show Balance"
            subtitle="Display or hide your account balance for privacy"
            onPress={() => {
              navigation.navigate("BiometricSettings" as never);
            }}
            IconComponent={
              <CustomIcon source={EyeIcon} size={20} overrideColor={false} />
            }
            showSwitch={true}
            switchValue={isShowBalance}
            disable={true}
            onSwitchChange={() => {
              setIsShowBalance(!isShowBalance);
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
