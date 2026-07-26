import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import { ArrowRight2, DocumentText, ReceiptEdit } from "iconsax-react-nativejs";
import { useNavigation } from "@react-navigation/native";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";

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
  const colors = useColors();
  const styles = makeStyles(colors);
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
        <AppText
          style={[
            styles.menuItemTitle,
            { color: isDangerous ? "#DC2626" : colors?.text },
          ]}
        >
          {title}
        </AppText>
        {subtitle && (
          <AppText style={styles.menuItemSubtitle}>{subtitle}</AppText>
        )}
      </View>
      {showArrow && !showSwitch && (
        <ArrowRight2 size={15} color={colors?.text} />
      )}
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
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={styles.screenDescription}>
          Stay informed about our terms, policies, and how we handle your data.
          You can review the Privacy Policy and Terms & Conditions here.
        </AppText>

        {/* Menu Items */}
        <View style={{ marginTop: 20 }}>
          <MenuItem
            title="Privacy Policy"
            subtitle="Learn how we collect and protect your personal data."
            onPress={() =>
              navigation.navigate(
                "WebView" as never,
                {
                  url: "https://why-kay-digitals.netlify.app/privacy",
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
                  url: "https://why-kay-digitals.netlify.app/terms",
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

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
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
      color: colors.text,
      lineHeight: 20,
    },
    menuItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 11,
      paddingHorizontal: 10,
      borderWidth: 0.5,
      borderColor: colors.border,
      marginVertical: 5,
      borderRadius: 8,
      backgroundColor: colors.infoCardBackgroundColor,
      gap: 2,
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
      color: colors.textMuted,
      marginTop: 2,
    },
  });
