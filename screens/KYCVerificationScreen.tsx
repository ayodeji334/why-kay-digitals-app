import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { ArrowRight2 } from "iconsax-react-nativejs";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../stores/authSlice";
import InfoCard from "../components/InfoCard";
import CustomIcon from "../components/CustomIcon";
import {
  ShieldCheckIcon,
  UserIdCardIcon,
  UserVerificationShieldIcon,
  CallIcon,
} from "../assets";
import { AppText } from "../components/AppText";
import { showError } from "../utlis/toast";
import { useColors } from "../hooks/useTheme";

interface MenuItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  isDangerous?: boolean;
  color?: string;
  IconComponent?: React.JSX.Element;
  isVerified?: boolean;
  isLocked?: boolean;
  lockedMessage?: string;
}

const MenuItem = ({
  title,
  subtitle,
  onPress,
  showArrow = true,
  isDangerous = false,
  // color,
  IconComponent = <ArrowRight2 />,
  isVerified = false,
  isLocked = false,
  lockedMessage,
}: MenuItemProps) => {
  const colors = useColors();
  const styles = makeStyles(colors);

  const handlePress = () => {
    if (isLocked) {
      if (lockedMessage) showError(lockedMessage);
      return;
    }
    onPress?.();
  };

  return (
    <TouchableOpacity
      disabled={isVerified}
      activeOpacity={0.8}
      style={[styles.menuItem, isLocked && styles.menuItemLocked]}
      onPress={handlePress}
    >
      <View
        style={{
          marginRight: normalizeSpacing(12),
          height: 30,
          width: 30,
          borderRadius: 100,
          justifyContent: "center",
          alignItems: "center",
          opacity: isLocked ? 0.4 : 1,
        }}
      >
        {IconComponent}
      </View>

      <View style={styles.menuItemContent}>
        <AppText
          style={[
            styles.menuItemTitle,
            { color: isDangerous ? colors.error : colors?.text },
            isLocked && styles.menuItemTitleLocked,
          ]}
        >
          {title}
        </AppText>

        {subtitle && (
          <AppText
            style={[
              styles.menuItemSubtitle,
              isLocked && styles.menuItemSubtitleLocked,
            ]}
          >
            {isLocked ? lockedMessage ?? subtitle : subtitle}
          </AppText>
        )}
      </View>

      {isVerified ? (
        <View
          style={{
            backgroundColor: "#80d09d34",
            paddingHorizontal: normalizeSpacing(10),
            paddingVertical: normalizeSpacing(4),
            borderRadius: 12,
          }}
        >
          <AppText
            style={{
              color: colors.primaryLight,
              fontSize: normalize(15),
              fontFamily: getFontFamily(800),
            }}
          >
            Verified
          </AppText>
        </View>
      ) : (
        showArrow && (
          <ArrowRight2
            size={normalize(18)}
            color={isLocked ? "#B0B0B0" : colors.text}
          />
        )
      )}
    </TouchableOpacity>
  );
};

export default function KYCVerificationScreen() {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);
  const colors = useColors();
  const styles = makeStyles(colors);

  const isBvnVerified = user?.bvn_verification_status === "VERIFIED";
  const isPhoneNumberVerified = user?.phone_verified_at !== null;
  const isNinVerified = user?.nin_verification_status === "VERIFIED";

  const isNinLocked = !isBvnVerified;
  const isBVNLocked = !isPhoneNumberVerified;

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <InfoCard
          IconComponent={
            <CustomIcon source={UserIdCardIcon} size={17} color={colors.text} />
          }
          title="Complete Your KYC!"
          description={
            "Verify your identity to unlock all features and enjoy a seamless, secure experience."
          }
        />

        <View style={{ marginTop: normalizeSpacing(20) }}>
          <MenuItem
            title="Phone Number Verification"
            subtitle="Verify your phone number for account security"
            onPress={() =>
              navigation.navigate("PhoneNumberVerification" as never)
            }
            IconComponent={
              <CustomIcon source={CallIcon} size={17} color={COLORS.primary} />
            }
            isVerified={isPhoneNumberVerified}
          />
          <MenuItem
            title="BVN Verification"
            subtitle="Link your BVN for account security"
            onPress={() => navigation.navigate("BVNVerification" as never)}
            isLocked={isBVNLocked}
            IconComponent={
              <CustomIcon
                source={UserVerificationShieldIcon}
                size={17}
                color={COLORS.primary}
              />
            }
            isVerified={isBvnVerified}
            lockedMessage="Complete phone number verification first"
          />
          <MenuItem
            title="Proof of Identity"
            subtitle="Link your government-issued ID"
            onPress={() => navigation.navigate("IdentityVerification" as never)}
            IconComponent={
              <CustomIcon
                source={ShieldCheckIcon}
                size={17}
                fill={COLORS.primary}
              />
            }
            isVerified={isNinVerified}
            isLocked={isNinLocked}
            lockedMessage="Complete BVN verification first"
          />
          {/* <MenuItem
            title="Selfie Verification"
            subtitle="Check your current transaction limits"
            onPress={() => navigation.navigate("SelfieVerification" as never)}
            IconComponent={
              <CustomIcon
                source={ShieldCheckIcon}
                size={17}
                fill={COLORS.primary}
              />
            }
            isVerified={user?.selfie_verification_status === "VERIFIED"}
            isLocked={isSelfieLocked}
            lockedMessage="Complete BVN and NIN verification first"
          /> */}
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
    versionText: {
      textAlign: "center",
      color: "#888",
      fontSize: 14,
      marginVertical: normalizeSpacing(10),
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: normalizeSpacing(20),
    },
    menuItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: normalizeSpacing(13),
      paddingHorizontal: normalizeSpacing(10),
      borderWidth: 0.5,
      borderColor: colors.border,
      marginVertical: normalizeSpacing(5),
      borderRadius: 8,
      backgroundColor: colors.inputBackground,
    },
    menuItemLocked: {
      backgroundColor: colors.inputBackground,
      borderColor: colors.border,
    },
    menuItemContent: {
      flex: 1,
    },
    menuItemTitle: {
      fontSize: normalize(18),
      color: colors.text,
      fontFamily: getFontFamily("800"),
    },
    menuItemTitleLocked: {
      color: colors.text,
    },
    menuItemSubtitle: {
      fontSize: normalize(17),
      color: colors.textMuted,
      fontFamily: getFontFamily("400"),
      marginTop: normalizeSpacing(2),
    },
    menuItemSubtitleLocked: {
      color: colors.text,
    },
    arrow: {
      fontSize: normalize(13),
      color: colors.text,
      fontFamily: getFontFamily("900"),
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: normalizeSpacing(16),
    },
  });
