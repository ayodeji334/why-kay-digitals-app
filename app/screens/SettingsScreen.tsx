import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { normalize } from "../constants/settings";
import { useState } from "react";
import {
  ArrowRight2,
  CallCalling,
  Clock,
  DocumentText,
  Gift,
  LoginCurve,
  LogoutCurve,
  ShieldSecurity,
  ShieldTick,
  Sun1,
  Trash,
  User,
  UserSquare,
} from "iconsax-react-nativejs";
import DeviceInfo from "react-native-device-info";
import { useNavigation } from "@react-navigation/native";
import InfoCard from "../components/InfoCard";
import HalfScreenModal from "../components/HalfScreenModal";
import { useAuthStore } from "../stores/authSlice";

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
  IconComponent?: React.ComponentType<any>;
}

const Section = ({ title, children, style }: any) => (
  <View style={[styles.section, style]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const MenuItem = ({
  title,
  subtitle,
  onPress,
  showArrow = true,
  showSwitch = false,
  switchValue,
  onSwitchChange,
  isDangerous = false,
  color = "#000",
  IconComponent = ArrowRight2,
}: MenuItemProps) => {
  const bgColor = isDangerous ? "#DC262611" : "#EFF7EC";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.menuItem]}
      onPress={onPress}
      disabled={showSwitch}
    >
      <View
        style={{
          marginRight: 12,
          backgroundColor: bgColor,
          height: 37,
          width: 37,
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
      {showArrow && !showSwitch && <ArrowRight2 size={17} color={color} />}
      {showSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: COLORS.gray, true: "green" }}
          style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
        />
      )}
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const appVersion = DeviceInfo.getVersion();
  const buildNumber = DeviceInfo.getBuildNumber();
  const { user: userData, logout } = useAuthStore(state => state);

  const handleEditInfo = () => {
    navigation.navigate("EditProfile" as never);
  };

  const handleKYCPress = () => {
    navigation.navigate("Verification" as never);
  };

  const handleLogout = async () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "SignIn" as never }],
    });
  };

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileSection, { marginVertical: 19 }]}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              alignContent: "center",
              marginBottom: 10,
            }}
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
              }}
              style={styles.profileImage}
            />
            <View>
              <Text style={styles.title}>
                {userData?.fullName ?? userData?.name}
              </Text>
              <Text style={styles.email}>{userData?.email}</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.editButton}
            onPress={handleEditInfo}
          >
            <Text style={styles.editButtonText}>Edit Info</Text>
          </TouchableOpacity>
        </View>

        <InfoCard
          title="Complete Your KYC!"
          description="You need to complete your KYC to enjoy a seamless experience."
          buttonText="Update Now"
          onButtonPress={handleKYCPress}
          IconComponent={UserSquare}
          iconColor="#0a611fff"
        />

        <Section title="Settings" style={{ marginTop: 20 }}>
          <MenuItem
            title="Profile"
            onPress={() => navigation.navigate("Profile" as never)}
            IconComponent={User}
          />
          <MenuItem
            title="KYC Verification"
            onPress={() => navigation.navigate("Verification" as never)}
            IconComponent={ShieldTick}
          />
          <MenuItem
            title="Account Security"
            onPress={() => navigation.navigate("AccountSecurity" as never)}
            IconComponent={ShieldSecurity}
          />
          <MenuItem
            title="Account Limits"
            onPress={() => navigation.navigate("AccountLimit" as never)}
            IconComponent={Clock}
          />

          <MenuItem
            title="Theme (Dark Mode)"
            showSwitch={true}
            switchValue={darkMode}
            onSwitchChange={setDarkMode}
            IconComponent={Sun1}
          />
        </Section>

        <Section title="More">
          <MenuItem
            title="Contact Us"
            onPress={() => navigation.navigate("ContactUs" as never)}
            IconComponent={CallCalling}
          />
          <MenuItem
            title="Refer&Earn"
            onPress={() => navigation.navigate("ReferAndEarn" as never)}
            IconComponent={Gift}
          />
          <MenuItem
            title="Legal"
            onPress={() => navigation.navigate("Legal" as never)}
            IconComponent={DocumentText}
          />
          <MenuItem
            title="Delete Account"
            onPress={() => navigation.navigate("DeleteAccount" as never)}
            IconComponent={Trash}
          />
          <MenuItem
            title="Sign Out"
            isDangerous={true}
            onPress={() => setModalVisible(true)}
            IconComponent={LoginCurve}
          />
        </Section>
        <View style={{ paddingVertical: 20 }}>
          <Text style={styles.versionText}>
            Version {appVersion} (Build {buildNumber})
          </Text>
        </View>

        <HalfScreenModal
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Confirm Sign Out"
          description="Are you sure you want to sign out of this account?"
          buttonText="Yes, Sign Me Out"
          actionButton={handleLogout}
          secondaryButtonText="Cancel"
          secondaryAction={() => setModalVisible(false)}
          iconBackgroundColor="#FFF3E0"
          IconComponent={LogoutCurve}
          iconColor={COLORS.error}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingBottom: 30,
  },
  versionText: {
    textAlign: "center",
    color: "#888",
    fontSize: normalize(12),
    marginVertical: 10,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "green",
  },
  title: {
    fontSize: normalize(14),
    fontWeight: "700",
    marginBottom: 4,
  },
  highlight: {
    color: COLORS.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: normalize(15),
    fontWeight: "600",
    marginBottom: 12,
    color: COLORS.darkBackground,
  },
  profileSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    alignContent: "center",
  },
  email: {
    fontWeight: "300",
    marginBottom: 12,
    fontSize: normalize(11),
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: "white",
    fontSize: normalize(11),
    fontWeight: "500",
    textAlign: "center",
  },
  kycSubtitle: {
    fontSize: 14,
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
    color: COLORS.darkBackground,
    fontSize: 14,
    fontWeight: "500",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderColor: "#D2D2D2",
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: normalize(11.8),
    fontWeight: "500",
  },
  menuItemSubtitle: {
    fontSize: normalize(12),
    color: COLORS.gray,
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: COLORS.gray,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#D2D2D2",
    marginVertical: 16,
  },
});
