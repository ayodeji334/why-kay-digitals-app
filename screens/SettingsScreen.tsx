import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  TouchableOpacity,
  Switch,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import React, { useMemo, useState } from "react";
import { ArrowRight2, Message, Notification } from "iconsax-react-nativejs";
import DeviceInfo from "react-native-device-info";
import { useNavigation } from "@react-navigation/native";
import HalfScreenModal from "../components/HalfScreenModal";
import { useAuthStore } from "../stores/authSlice";
import CustomIcon from "../components/CustomIcon";
import {
  AlarmIcon,
  CallServiceIcon,
  FileIcon,
  GiftIcon,
  LogoutIcon,
  ShieldCheckIcon,
  ShieldIcon,
  ThemeIcon,
  TrashIcon,
  UserIcon,
  UserIdCardIcon,
} from "../assets";
import { AppText } from "../components/AppText";
import { setItem } from "../utlis/storage";
import { biometricPromptKey } from "../stores/biometricPromptSlice";
import { useQueryClient } from "@tanstack/react-query";
import { useColors, useResolvedTheme } from "../hooks/useTheme";

export const DEFAULT_IMAGE = require("../assets/avatar.png");
interface MenuItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  color?: string;
  isDangerous?: boolean;
  IconComponent?: React.JSX.Element;
}

const Section = ({ title, children, style }: any) => {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <View style={[styles.section, style]}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      {children}
    </View>
  );
};

const MenuItem = ({
  title,
  subtitle,
  onPress,
  showArrow = true,
  showSwitch = false,
  switchValue,
  onSwitchChange,
  isDangerous = false,
  IconComponent = <ArrowRight2 />,
}: MenuItemProps) => {
  const colors = useColors();
  const styles = makeStyles(colors);
  const bgColor = isDangerous ? "#DC262611" : "#EFF7EC";
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.menuItem]}
      onPress={onPress}
      disabled={showSwitch}
      hitSlop={4}
    >
      <View
        style={{
          marginRight: 10,
          backgroundColor: bgColor,
          height: 32,
          width: 32,
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
            { color: isDangerous ? "#DC2626" : colors.text },
          ]}
        >
          {title}
        </AppText>
        {subtitle && (
          <AppText style={styles.menuItemSubtitle}>{subtitle}</AppText>
        )}
      </View>
      {showArrow && !showSwitch && (
        <ArrowRight2 size={14} color={colors.text} />
      )}
      {showSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: "black", true: "green" }}
          style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
        />
      )}
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const appVersion = DeviceInfo.getVersion();
  const buildNumber = DeviceInfo.getBuildNumber();
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const colors = useColors();
  const resolvedTheme = useResolvedTheme();
  const styles = makeStyles(colors);

  const handleEditInfo = () => {
    navigation.navigate("EditProfile" as never);
  };

  const hasCompleteVerification = useMemo(
    () =>
      user?.nin_verification_status === "VERIFIED" &&
      user?.bvn_verification_status === "VERIFIED" &&
      user?.selfie_verification_status === "VERIFIED",
    [
      user?.nin_verification_status,
      user?.bvn_verification_status,
      user?.selfie_verification_status,
    ],
  );

  const handleLogout = async () => {
    const uuid = useAuthStore.getState().user?.uuid;
    await setItem(
      biometricPromptKey(uuid!),
      JSON.stringify({ status: "skipped", promptCount: 1, lastPromptedAt: 0 }),
    );

    logout();

    queryClient.clear();
  };

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={[styles.profileSection, { marginVertical: 20 }]}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            <View style={styles.imageWrapper}>
              <Image
                source={
                  user?.selfie_url
                    ? {
                        uri: `data:image/png;base64,${user?.selfie_url}`,
                      }
                    : DEFAULT_IMAGE
                }
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>

            <View>
              <AppText style={styles.title}>
                {user?.username
                  ? user.username.charAt(0).toUpperCase() +
                    user.username.slice(1)
                  : "User"}
              </AppText>
              <AppText style={styles.email}>{user?.email}</AppText>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.89}
            style={styles.editButton}
            onPress={handleEditInfo}
          >
            <AppText style={styles.editButtonText}>Edit Info</AppText>
            <ArrowRight2 size={13} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {!hasCompleteVerification && (
          <View style={styles.verificationBanner}>
            <View style={styles.verificationIcon}>
              <CustomIcon
                source={UserIdCardIcon}
                size={17}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.verificationText}>
              <AppText
                style={[
                  styles.verificationTitle,
                  { fontSize: normalize(19), fontFamily: getFontFamily("800") },
                ]}
              >
                KYC
              </AppText>
              <AppText style={styles.verificationTitle}>
                Please add your BVN details
              </AppText>
            </View>
            <TouchableOpacity
              activeOpacity={0.83}
              onPress={() => navigation.navigate("Verification" as never)}
              style={{
                backgroundColor: COLORS.primary,
                borderRadius: 900,
                paddingHorizontal: 15,
                paddingVertical: 7,
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
              }}
            >
              <AppText
                style={{
                  color: "white",
                  fontSize: normalize(16),
                  fontFamily: getFontFamily("800"),
                }}
              >
                Verify Identity
              </AppText>
              <ArrowRight2 size={13} color={COLORS.whiteBackground} />
            </TouchableOpacity>
          </View>
        )}

        <Section title="Settings" style={{ marginTop: 20 }}>
          <MenuItem
            title="Profile"
            onPress={() => navigation.navigate("Profile" as never)}
            IconComponent={<CustomIcon source={UserIcon} size={14} />}
          />
          <MenuItem
            title="KYC Verification"
            onPress={() => navigation.navigate("Verification" as never)}
            IconComponent={<CustomIcon source={ShieldCheckIcon} size={14} />}
          />
          <MenuItem
            title="Account Security"
            onPress={() => navigation.navigate("AccountSecurity" as never)}
            IconComponent={<CustomIcon source={ShieldIcon} size={14} />}
          />
          <MenuItem
            title="Notification Setting"
            onPress={() => navigation.navigate("NotificationSettings" as never)}
            IconComponent={
              <Notification color={COLORS.primary} variant="Linear" size={14} />
            }
          />
          <MenuItem
            title="Account Limits"
            onPress={() => navigation.navigate("AccountLimit" as never)}
            IconComponent={<CustomIcon source={AlarmIcon} size={17} />}
          />
          <MenuItem
            title="Suggestion Box"
            onPress={() => navigation.navigate("Suggestion" as never)}
            IconComponent={<Message color={COLORS.primary} size={17} />}
          />
          <MenuItem
            title="Theme"
            showSwitch={false}
            switchValue={false}
            onPress={() => navigation.navigate("Theme" as never)}
            IconComponent={<CustomIcon source={ThemeIcon} size={14} />}
          />
        </Section>

        <Section title="More">
          <MenuItem
            title="Contact Us"
            onPress={() => navigation.navigate("ContactUs" as never)}
            IconComponent={<CustomIcon source={CallServiceIcon} size={14} />}
          />
          <MenuItem
            title="Refer&Earn"
            onPress={() => navigation.navigate("ReferAndEarn" as never)}
            IconComponent={<CustomIcon source={GiftIcon} size={17} />}
          />
          <MenuItem
            title="Legal"
            onPress={() => navigation.navigate("Legal" as never)}
            IconComponent={<CustomIcon source={FileIcon} size={14} />}
          />
          <MenuItem
            title="Delete Account"
            onPress={() => navigation.navigate("DeleteAccount" as never)}
            IconComponent={
              <CustomIcon source={TrashIcon} size={17} color={COLORS.primary} />
            }
          />
          <MenuItem
            title="Sign Out"
            isDangerous={true}
            onPress={() => setModalVisible(true)}
            IconComponent={
              <CustomIcon
                source={LogoutIcon}
                size={17}
                color={COLORS.primary}
              />
            }
          />
        </Section>
        <View style={{ paddingVertical: 20 }}>
          <AppText style={styles.versionText}>Version {appVersion}</AppText>
        </View>

        <HalfScreenModal
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Confirm Sign Out"
          description="Are you sure you want to sign out of this account?"
          buttonText="Yes, Sign Me Out"
          actionButton={handleLogout}
          secondaryButtonText="Close"
          secondaryAction={() => setModalVisible(false)}
          iconBackgroundColor="#FF4D4D1A"
          IconComponent={
            <CustomIcon source={LogoutIcon} size={17} color={COLORS.primary} />
          }
          iconColor={COLORS.error}
          isDangerous={true}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingBottom: 30,
    },
    versionText: {
      textAlign: "center",
      color: "#888",
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      marginVertical: 10,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 20,
    },
    imageWrapper: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
      overflow: "hidden",
      backgroundColor: "#f0f0f0",
    },
    profileImage: {
      width: "100%",
      height: "100%",
    },
    verificationBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.infoCardBackgroundColor,
      borderRadius: 16,
      padding: 18,
      gap: 12,
    },
    verificationIcon: {
      borderRadius: 20,
      borderColor: colors.border,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 7,
    },
    verificationText: {
      flex: 1,
      gap: 1,
    },
    verificationTitle: {
      color: colors.text,
      fontSize: normalize(16),
      fontFamily: getFontFamily("400"),
    },
    title: {
      fontSize: normalize(19),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      marginBottom: 12,
      color: colors.textMuted,
    },
    profileSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      alignContent: "center",
    },
    email: {
      marginBottom: 12,
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.text,
    },
    editButton: {
      backgroundColor: "#F0FDF4",
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 60,
      flexDirection: "row",
      gap: 1,
      alignItems: "center",
    },
    editButtonText: {
      color: COLORS.primary,
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      textAlign: "center",
    },
    kycSubtitle: {
      fontSize: normalize(14),
      fontFamily: getFontFamily("700"),
      color: COLORS.gray,
      marginBottom: 8,
    },
    kycButton: {
      backgroundColor: COLORS.whiteBackground,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      alignSelf: "flex-start",
    },
    kycButtonText: {
      color: colors.text,
      fontSize: normalize(14),
      fontFamily: getFontFamily("700"),
    },
    menuItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 4,
      borderBottomWidth: 0.5,
      borderColor: colors.border,
    },
    menuItemContent: {
      flex: 1,
    },
    menuItemTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: colors.text,
    },
    menuItemSubtitle: {
      fontSize: normalize(16),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      marginTop: 2,
    },
    arrow: {
      fontSize: normalize(18),
      color: colors.text,
      fontFamily: getFontFamily("800"),
    },
    divider: {
      height: 1,
      backgroundColor: "#D2D2D2",
      marginVertical: 16,
    },
  });
