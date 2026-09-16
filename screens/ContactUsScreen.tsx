import React from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  StyleSheet,
} from "react-native";
import {
  ArrowRight2,
  Call,
  Sms,
  Instagram,
  Facebook,
  Global,
  Clock,
  Message,
  Xrp,
} from "iconsax-react-nativejs";

import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { COLORS } from "../constants/colors";
import { AppText } from "../components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "../hooks/useTheme";
import { useLiveChat } from "../context/LiveChatProvider";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  style?: any;
}

interface MenuItemProps {
  title: string;
  subtitle?: string | string[];
  onPress?: () => void;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  isDangerous?: boolean;
  color?: string;
  IconComponent?: React.ComponentType<any>;
}

const Section: React.FC<SectionProps> = ({ title, children, style }) => {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <View style={[styles.section, style]}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      {children}
    </View>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({
  title,
  subtitle,
  onPress,
  showSwitch = false,
  isDangerous = false,
  color = "#000",
  IconComponent = ArrowRight2,
  showArrow = true,
}) => {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.menuItem}
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={[styles.iconContainer]}>
        <IconComponent
          variant="Outline"
          size={18}
          color={isDangerous ? colors.error : colors.primaryLight}
        />
      </View>
      <View style={styles.menuItemContent}>
        <AppText
          style={[
            styles.menuItemTitle,
            { color: isDangerous ? colors.error : colors?.text },
          ]}
        >
          {title}
        </AppText>
        {/* Subtitle handling: string or array */}
        {typeof subtitle === "string" ? (
          <AppText style={styles.menuItemSubtitle}>{subtitle}</AppText>
        ) : Array.isArray(subtitle) ? (
          <View style={styles.listContainer}>
            {subtitle.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <AppText style={styles.listText}>{item}</AppText>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <View style={{ alignSelf: "center" }}>
        {showArrow && !showSwitch && (
          <ArrowRight2 size={13} color={colors?.text} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const HelpSupportScreen: React.FC = () => {
  const colors = useColors();
  const styles = makeStyles(colors);
  const { openLiveChat } = useLiveChat();

  const handleCall = () => {
    Linking.openURL("tel:09161610054");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:support@whykay.net");
  };

  const handleInstagram = () => {
    Linking.openURL("https://instagram.com/whykayapp");
  };

  const handleFacebook = () => {
    Linking.openURL("https://facebook.com/WhykayDigitals");
  };

  const handleTwitter = () => {
    Linking.openURL("https://x.com/WhykayDigitals");
  };

  const handleWebsite = () => {
    Linking.openURL("https://www.whykay.net");
  };

  return (
    <SafeAreaView edges={["right", "left"]} style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={styles.container}
      >
        <Section title="">
          <MenuItem
            title="Available Hours"
            subtitle={[
              "Monday - Friday: 9am - 6pm",
              "Saturday: 9am - 6pm",
              "Sunday: Closed",
            ]}
            onPress={handleInstagram}
            IconComponent={Clock}
            showArrow={false}
          />
        </Section>

        <Section title="INSTANT SUPPORT">
          <MenuItem
            title="Live Chat"
            subtitle={["Chat with a support agent", "Response time: 1-5 mins"]}
            onPress={openLiveChat}
            IconComponent={Message}
          />
          <MenuItem
            title="Call Us (09161610054)"
            subtitle="Speak directly with our support agent"
            onPress={handleCall}
            IconComponent={Call}
          />

          <MenuItem
            title="Email"
            subtitle="support@whykay.net"
            onPress={handleEmail}
            IconComponent={Sms}
          />
        </Section>

        <Section title="CONNECT WITH US">
          <MenuItem
            title="Instagram"
            subtitle="@whykayapp"
            onPress={handleInstagram}
            IconComponent={Instagram}
          />
          <MenuItem
            title="Facebook"
            subtitle="@WhykayDigitals"
            onPress={handleFacebook}
            IconComponent={Facebook}
          />{" "}
          <MenuItem
            title="X (Formerly Twitter)"
            subtitle="@WhykayDigitals"
            onPress={handleTwitter}
            IconComponent={Xrp}
          />
          <MenuItem
            title="Website"
            subtitle="www.whykay.net"
            onPress={handleWebsite}
            IconComponent={Global}
          />
        </Section>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.contactButton}
          onPress={openLiveChat}
        >
          <AppText style={styles.contactButtonText}>Live Chat</AppText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.background,
      paddingBottom: normalizeSpacing(10),
    },
    section: {
      paddingHorizontal: normalizeSpacing(20),
      marginBottom: normalizeSpacing(24),
    },
    sectionTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalizeSpacing(16),
    },
    hoursSection: {
      marginTop: normalizeSpacing(16),
    },
    hoursContainer: {
      backgroundColor: colors.inputBackground,
      padding: normalizeSpacing(16),
      borderRadius: 12,
      flex: 1,
      gap: 12,
      alignItems: "flex-start",
      flexDirection: "row",
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: normalizeSpacing(12),
      marginBottom: normalizeSpacing(8),
      backgroundColor: colors.inputBackground,
      gap: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
    },
    iconContainer: {
      borderRadius: 100,
      justifyContent: "center",
      alignItems: "center",
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
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.text,
      marginTop: normalizeSpacing(2),
    },
    listContainer: {
      marginTop: normalizeSpacing(4),
    },
    listItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      marginTop: normalizeSpacing(2),
      color: colors.text,
    },
    bullet: {
      fontSize: normalize(16),
      marginRight: normalizeSpacing(6),
      color: "#6B7280",
    },
    listText: {
      fontSize: normalize(17),
      color: colors.text,
      flexShrink: 1,
      fontFamily: getFontFamily("400"),
    },
    contactButton: {
      backgroundColor: COLORS.primary,
      marginHorizontal: normalizeSpacing(20),
      marginTop: normalizeSpacing(20),
      paddingVertical: normalizeSpacing(14),
      borderRadius: 120,
      alignItems: "center",
      marginBottom: normalizeSpacing(40),
    },
    contactButtonText: {
      color: "#fff",
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
    },
  });

export default HelpSupportScreen;
