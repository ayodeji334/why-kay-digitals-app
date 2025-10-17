import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { normalize, width } from "../constants/settings";
import {
  ArrowRight2,
  Camera,
  Clock,
  Location,
  ShieldSecurity,
  ShieldTick,
  TagUser,
  User,
  UserSquare,
} from "iconsax-react-nativejs";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../stores/authSlice";

interface MenuItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  isDangerous?: boolean;
  color?: string;
  IconComponent?: React.ComponentType<any>;
  isVerified?: boolean; // ✅ New prop
}

const MenuItem = ({
  title,
  subtitle,
  onPress,
  showArrow = true,
  isDangerous = false,
  color = "#000",
  IconComponent = ArrowRight2,
  isVerified = false,
}: MenuItemProps) => {
  return (
    <TouchableOpacity
      disabled={isVerified}
      activeOpacity={0.5}
      style={[styles.menuItem]}
      onPress={onPress}
    >
      <View
        style={{
          marginRight: 12,
          height: 30,
          width: 30,
          borderRadius: 100,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <IconComponent variant="Outline" size={20} color={"#E89E00"} />
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

      {isVerified ? (
        <View
          style={{
            backgroundColor: "#22C55E20",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: "#077730ff",
              fontSize: normalize(10),
              fontWeight: "600",
            }}
          >
            Verified
          </Text>
        </View>
      ) : (
        showArrow && <ArrowRight2 size={16} color={color} />
      )}
    </TouchableOpacity>
  );
};

export default function KYCVerificationScreen() {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.profileSection,
            {
              marginVertical: 9,
              backgroundColor: "#e6fff4ff",
              borderRadius: 10,
              padding: 15,
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 9,
              flex: 1,
            }}
          >
            <UserSquare size="23" color="#0a611fff" />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.title}>Complete Your KYC</Text>
              <Text style={{ fontWeight: "300", fontSize: normalize(11) }}>
                Verify your identity to unlock all features and enjoy a
                seamless, secure experience.
              </Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <MenuItem
            title="BVN Verification"
            subtitle="Link your BVN for account security"
            onPress={() => navigation.navigate("BVNVerification" as never)}
            IconComponent={TagUser}
            isVerified={!!user?.bvn}
          />
          <MenuItem
            title="Proof of Identity"
            subtitle="Link your government-issued ID"
            onPress={() => navigation.navigate("IdentityVerification" as never)}
            IconComponent={ShieldTick}
          />
          <MenuItem
            title="Proof of Address"
            subtitle="Provide utility bill or similar document"
            onPress={() => navigation.navigate("Proof Of Address" as never)}
            IconComponent={Location}
            isVerified={true}
          />
          {/* <MenuItem
            title="Selfie Verification"
            subtitle="Check your current transaction limits"
            onPress={() => navigation.navigate("Profile" as never)}
            IconComponent={Camera}
          /> */}
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
  versionText: {
    textAlign: "center",
    color: "#888",
    fontSize: 14,
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
    fontSize: normalize(12),
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
    fontSize: normalize(12),
    fontWeight: "600",
    marginBottom: 12,
    color: COLORS.darkBackground,
  },
  profileSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignContent: "center",
  },
  email: {
    fontWeight: "300",
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: "white",
    fontSize: 14,
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
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: "#D2D2D2",
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: normalize(12),
    color: COLORS.darkBackground,
    fontWeight: "600",
  },
  menuItemSubtitle: {
    fontSize: normalize(11),
    color: COLORS.dark,
    fontWeight: "300",
    marginTop: 2,
  },
  arrow: {
    fontSize: normalize(13),
    color: COLORS.gray,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#D2D2D2",
    marginVertical: 16,
  },
});
