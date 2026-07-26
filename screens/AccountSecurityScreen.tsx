import {
  ScrollView,
  StatusBar,
  StyleSheet,
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
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";

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

export const MenuItem = ({
  title,
  subtitle,
  onPress,
  showArrow = true,
  showSwitch = false,
  switchValue,
  isDangerous = false,
  IconComponent = <ArrowRight2 />,
  onSwitchChange,
  disable = false,
}: MenuItemProps) => {
  const colors = useColors();
  const styles = makeStyles(colors);

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
          height: 20,
          width: 20,
          borderRadius: 100,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {IconComponent}
      </View>
      <View style={styles.menuItemContent}>
        <AppText
          style={[
            styles.menuItemTitle,
            { color: isDangerous ? "#DC2626" : colors?.text },
          ]}
        >
          {title}
        </AppText>
        {subtitle && (
          <AppText style={styles.menuItemSubtitle}>{subtitle}</AppText>
        )}
      </View>
      {showArrow && !showSwitch && (
        <ArrowRight2 size={15} color={colors?.text} />
      )}
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
  const userData = useAuthStore(state => state.user);
  const isGoogleAuthenticatorEnabled = useAuthStore(
    state => state?.isGoogleAuthenticatorEnabled,
  );

  const colors = useColors();
  const styles = makeStyles(colors);
  const navigation = useNavigation();
  const setIsShowBalance = useAuthStore(state => state.setIsShowBalance);
  const isShowBalance = useAuthStore(state => state.isShowBalance);
  const is2FAEnabled = userData?.two_factor_enabled || false;

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
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
            title="2FA Authentication"
            subtitle="Enable Authenticator for extra protection"
            onPress={() =>
              navigation.navigate("TwoFactorAuthentication" as never)
            }
            showSwitch={false}
            IconComponent={
              <CustomIcon
                source={ShieldCheckIcon}
                size={20}
                overrideColor={false}
              />
            }
            switchValue={is2FAEnabled || isGoogleAuthenticatorEnabled}
          />
          <MenuItem
            title="Use FaceID/Fingerprint"
            subtitle="Log in and approve transactions with biometrics"
            onPress={() => {
              navigation.navigate("BiometricSettings" as never);
            }}
            IconComponent={<CustomIcon source={FingerprintIcon} size={20} />}
            showSwitch={false}
            // switchValue={isReady}
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

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 20,
    },
    menuItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 13,
      paddingHorizontal: 10,
      borderWidth: 0.5,
      borderColor: colors.border,
      marginVertical: 5,
      borderRadius: 8,
      backgroundColor: colors.inputBackground,
      gap: 10,
    },
    menuItemContent: {
      flex: 1,
    },
    menuItemTitle: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    menuItemSubtitle: {
      fontSize: normalize(16),
      fontFamily: getFontFamily("400"),
      color: colors.text,
      marginTop: 2,
    },
  });
