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
import CustomIcon from "../components/CustomIcon";
import {
  ShieldCheckIcon,
  UserVerificationShieldIcon,
  CallIcon,
} from "../assets";
import { AppText } from "../components/AppText";
import { showError } from "../utlis/toast";
import { useColors } from "../hooks/useTheme";
import { useStyles } from "../hooks/useStyles";
import { usePhoneVerification } from "../hooks/usePhoneVerification";
import {
  ID_DOCS,
  IdDocType,
  isDocVerified,
  nextDocToVerify,
} from "../libs/kyc";

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
  const styles = useStyles(makeStyles);

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
            paddingVertical: normalizeSpacing(3),
            borderRadius: 12,
          }}
        >
          <AppText
            style={{
              color: colors.primaryLight,
              fontSize: normalize(13),
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
  const styles = useStyles(makeStyles);

  // Same check as the rest of the app (a missing value means "not verified").
  const { isPhoneVerified: isPhoneNumberVerified } = usePhoneVerification();

  // BVN or NIN, in either order: one gives Tier 2, both give Tier 3.
  const nextDoc = nextDocToVerify(user);
  const docSubtitle = (doc: IdDocType) =>
    isDocVerified(user, doc)
      ? `Your ${ID_DOCS[doc].label} is verified`
      : nextDoc === doc
      ? "Verify to reach the highest tier and increase your limits"
      : "Verify with either your BVN or NIN to upgrade your account";

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <AppText style={styles.introText}>
            Verify your phone number, then confirm your identity with your BVN
            or NIN. Add both to reach the highest tier and limits.
          </AppText>
        </View>

        <View
          style={{
            gap: normalizeSpacing(10),
            marginTop: normalizeSpacing(20),
          }}
        >
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
            subtitle={docSubtitle("bvn")}
            onPress={() => navigation.navigate(ID_DOCS.bvn.route as never)}
            isLocked={!isPhoneNumberVerified}
            IconComponent={
              <CustomIcon
                source={UserVerificationShieldIcon}
                size={17}
                color={COLORS.primary}
              />
            }
            isVerified={isDocVerified(user, "bvn")}
            lockedMessage="Complete phone number verification first"
          />
          <MenuItem
            title="NIN Verification"
            subtitle={docSubtitle("nin")}
            onPress={() => navigation.navigate(ID_DOCS.nin.route as never)}
            isLocked={!isPhoneNumberVerified}
            IconComponent={
              <CustomIcon
                source={ShieldCheckIcon}
                size={17}
                fill={COLORS.primary}
              />
            }
            isVerified={isDocVerified(user, "nin")}
            lockedMessage="Complete phone number verification first"
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
    versionText: {
      textAlign: "center",
      color: "#888",
      fontSize: 14,
      marginVertical: normalizeSpacing(10),
    },
    intro: {
      gap: normalizeSpacing(8),
      marginTop: normalizeSpacing(10),
      marginBottom: normalizeSpacing(24),
    },
    introTitle: {
      fontSize: normalize(22),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    introText: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.textSecondary,
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
      gap: 0.8,
    },
    menuItemLocked: {
      backgroundColor: colors.inputBackground,
      borderColor: colors.border,
    },
    menuItemContent: {
      flex: 1,
    },
    menuItemTitle: {
      fontSize: normalize(17),
      color: colors.text,
      fontFamily: getFontFamily("800"),
    },
    menuItemTitleLocked: {
      color: colors.text,
    },
    menuItemSubtitle: {
      fontSize: normalize(16),
      color: colors.textMuted,
      fontFamily: getFontFamily("400"),
      marginTop: normalizeSpacing(2),
      lineHeight: normalize(17),
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
