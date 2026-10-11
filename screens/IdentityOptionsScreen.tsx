import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { AppText } from "../components/AppText";
import CustomIcon from "../components/CustomIcon";
import { ShieldCheckIcon, UserVerificationShieldIcon } from "../assets";
import { COLORS } from "../constants/colors";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { useAuthStore } from "../stores/authSlice";
import { useColors } from "../hooks/useTheme";
import { useStyles } from "../hooks/useStyles";
import {
  ID_DOCS,
  IdDocType,
  isDocVerified,
  isFullyVerified,
  nextDocToVerify,
} from "../libs/kyc";
import { MenuItem } from "./KYCVerificationScreen";

/**
 * BVN or NIN: either one verifies the user (Tier 2); adding the other later
 * gives Tier 3. Opened from the KYC screen's "Identity Verification" row.
 */
export default function IdentityOptionsScreen() {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);
  const styles = useStyles(makeStyles);

  const fullyVerified = isFullyVerified(user);
  const nextDoc = nextDocToVerify(user);

  const description = fullyVerified
    ? "You're fully verified with both your BVN and NIN. There's nothing else to do here."
    : nextDoc
    ? `Your identity is verified. Add your ${ID_DOCS[nextDoc].label} as well to reach the highest tier and unlock higher limits.`
    : "Choose either your BVN or your NIN to start. You only need one to verify your identity and upgrade your account. You can add the other later to reach the highest tier.";

  const docSubtitle = (doc: IdDocType) =>
    isDocVerified(user, doc)
      ? `Your ${ID_DOCS[doc].label} is verified`
      : nextDoc === doc
      ? "Verify to reach the highest tier and increase your limits"
      : ID_DOCS[doc].fullName;

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={styles.description}>{description}</AppText>

        <View style={styles.options}>
          <MenuItem
            title="BVN Verification"
            subtitle={docSubtitle("bvn")}
            onPress={() => navigation.navigate(ID_DOCS.bvn.route as never)}
            IconComponent={
              <CustomIcon
                source={UserVerificationShieldIcon}
                size={17}
                color={COLORS.primary}
              />
            }
            isVerified={isDocVerified(user, "bvn")}
          />
          <MenuItem
            title="NIN Verification"
            subtitle={docSubtitle("nin")}
            onPress={() => navigation.navigate(ID_DOCS.nin.route as never)}
            IconComponent={
              <CustomIcon
                source={ShieldCheckIcon}
                size={17}
                fill={COLORS.primary}
              />
            }
            isVerified={isDocVerified(user, "nin")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: normalizeSpacing(20),
      paddingVertical: normalizeSpacing(20),
    },
    description: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.textSecondary,
      marginBottom: normalizeSpacing(20),
    },
    options: { gap: normalizeSpacing(10) },
  });
