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
import { getFontFamily, normalize, width } from "../constants/settings";
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
import InfoCard from "../components/InfoCard";

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
            backgroundColor: "#80d09d34",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: "#044b1eff",
              fontSize: normalize(15),
              fontFamily: getFontFamily(800),
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
        <InfoCard
          IconComponent={UserSquare}
          title="Complete Your KYC!"
          description={
            "Verify your identity to unlock all features and enjoy a seamless, secure experience."
          }
        />

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
    fontSize: normalize(18),
    color: COLORS.darkBackground,
    fontFamily: getFontFamily("700"),
  },
  menuItemSubtitle: {
    fontSize: normalize(16),
    color: COLORS.dark,
    fontFamily: getFontFamily("400"),
    marginTop: 2,
  },
  arrow: {
    fontSize: normalize(13),
    color: COLORS.gray,
    fontFamily: getFontFamily("900"),
  },
  divider: {
    height: 1,
    backgroundColor: "#D2D2D2",
    marginVertical: 16,
  },
});
