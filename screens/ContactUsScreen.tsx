import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  StyleSheet,
  Switch,
} from "react-native";
import {
  ArrowRight2,
  Message,
  Call,
  Sms,
  Instagram,
  Facebook,
  Global,
  Clock,
} from "iconsax-react-nativejs";
import { getFontFamily, normalize, width } from "../constants/settings";
import { COLORS } from "../constants/colors";

// Types
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

// Components
const Section: React.FC<SectionProps> = ({ title, children, style }) => (
  <View style={[styles.section, style]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const MenuItem: React.FC<MenuItemProps> = ({
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
}) => {
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
          color={isDangerous ? "#DC2626" : "#E89E00"}
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
        {/* Subtitle handling: string or array */}
        {typeof subtitle === "string" ? (
          <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
        ) : Array.isArray(subtitle) ? (
          <View style={styles.listContainer}>
            {subtitle.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <View style={{ alignSelf: "center" }}>
        {showArrow && !showSwitch && <ArrowRight2 size={16} color={color} />}
        {showSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: "#D1D5DB", true: "#10B981" }}
            style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const HelpSupportScreen: React.FC = () => {
  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/07012345678");
  };

  const handleCall = () => {
    Linking.openURL("tel:07012345678");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:support@whjkaydigitals.com");
  };

  const handleInstagram = () => {
    Linking.openURL("https://instagram.com/whjkaydigital");
  };

  const handleFacebook = () => {
    Linking.openURL("https://facebook.com/whjkaydigitals");
  };

  const handleWebsite = () => {
    Linking.openURL("https://www.whjkay.net");
  };

  return (
    <ScrollView style={styles.container}>
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
          title="WhatsApp"
          subtitle={["Chat with a support agent", "Response time: 1-5 mins"]}
          onPress={handleWhatsApp}
          IconComponent={Message}
        />
        <MenuItem
          title="Call Us (070 1234 5678)"
          subtitle="Speak directly with our support agent"
          onPress={handleCall}
          IconComponent={Call}
        />
        <MenuItem
          title="Email"
          subtitle="Support@whjkaydigitals.com"
          onPress={handleEmail}
          IconComponent={Sms}
        />
      </Section>

      <Section title="CONNECT WITH US">
        <MenuItem
          title="Instagram"
          subtitle="@whjkaydigital"
          onPress={handleInstagram}
          IconComponent={Instagram}
        />
        <MenuItem
          title="Facebook"
          subtitle="@whjkaydigitals"
          onPress={handleFacebook}
          IconComponent={Facebook}
        />
        <MenuItem
          title="Website"
          subtitle="www.whjkay.net"
          onPress={handleWebsite}
          IconComponent={Global}
        />
      </Section>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.contactButton}
        onPress={handleWhatsApp}
      >
        <Text style={styles.contactButtonText}>Contact Support Now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 16,
  },
  hoursSection: {
    marginTop: 16,
  },
  hoursContainer: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    flex: 1,
    gap: 12,
    alignItems: "flex-start",
    flexDirection: "row",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
    gap: 14,
    borderWidth: 1,
    borderColor: "#e7e7e7",
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
  },
  menuItemSubtitle: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
    color: COLORS.gray,
    marginTop: 2,
  },
  listContainer: {
    marginTop: 4,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
    marginTop: 2,
  },
  bullet: {
    fontSize: normalize(16),
    marginRight: 6,
    color: "#6B7280",
  },
  listText: {
    fontSize: normalize(17),
    color: "#000",
    flexShrink: 1,
    fontFamily: getFontFamily("400"),
  },
  contactButton: {
    backgroundColor: "#E89E00",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 120,
    alignItems: "center",
    marginBottom: 40,
  },
  contactButtonText: {
    color: "#000",
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
  },
});

export default HelpSupportScreen;
