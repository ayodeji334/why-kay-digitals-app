import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize, width } from "../constants/settings";
import { ArrowRight2, DocumentText, ReceiptEdit } from "iconsax-react-nativejs";
import { useNavigation } from "@react-navigation/native";

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
          height: 40,
          width: 40,
          borderRadius: 100,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <IconComponent
          variant="Outline"
          size={20}
          color={isDangerous ? "red" : COLORS.primary}
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
      {showArrow && !showSwitch && <ArrowRight2 size={15} color={color} />}
      {showSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: COLORS.gray, true: "green" }}
          style={{ transform: [{ scaleX: 0.6 }, { scaleY: 0.6 }] }}
        />
      )}
    </TouchableOpacity>
  );
};

export default function LegalScreen() {
  const navigation: any = useNavigation();

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Description */}
        <Text style={styles.screenDescription}>
          Stay informed about our terms, policies, and how we handle your data.
          You can review the Privacy Policy and Terms & Conditions here.
        </Text>

        {/* Menu Items */}
        <View style={{ marginTop: 20 }}>
          <MenuItem
            title="Privacy Policy"
            subtitle="Learn how we collect and protect your personal data."
            onPress={() =>
              navigation.navigate(
                "WebView" as never,
                {
                  url: "https://whykay.net/faq/",
                } as never,
              )
            }
            IconComponent={DocumentText}
          />

          <MenuItem
            title="Terms & Conditions"
            subtitle="Review the rules and guidelines for using our platform."
            onPress={() =>
              navigation.navigate(
                "WebView" as never,
                {
                  url: "https://whykay.net",
                } as never,
              )
            }
            IconComponent={ReceiptEdit}
          />
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
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("700"),
    color: COLORS.darkBackground,
    marginBottom: 8,
  },
  screenDescription: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: COLORS.dark,
    lineHeight: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: "#D2D2D2",
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    gap: 2,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
  menuItemSubtitle: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
    color: COLORS.gray,
    marginTop: 2,
  },
});
