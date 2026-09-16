import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import ForgotPasswordForm from "../components/forms/ForgotPasswordForm";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { AppText } from "../components/AppText";
import { useColors, useResolvedTheme } from "../hooks/useTheme";
import LiveChatButton from "../components/LiveChatButton";

export default function ForgetPasswordScreen() {
  const colors = useColors();
  const resolvedTheme = useResolvedTheme();
  const styles = makeStyles(colors);

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <AppText style={styles.title}>Forgot Password</AppText>
          <AppText
            style={[
              styles.title,
              {
                fontFamily: getFontFamily(400),
                fontSize: normalize(18),
                marginTop: normalizeSpacing(2),
                marginLeft: normalizeSpacing(1),
              },
            ]}
          >
            Opps. It happens to the best of us. Input your email address to fix
            the issue.
          </AppText>
        </View>

        <ForgotPasswordForm />
      </ScrollView>

      <LiveChatButton />
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
      flex: 1,
      paddingHorizontal: normalizeSpacing(20),
    },
    header: {
      marginBottom: normalizeSpacing(10),
    },
    title: {
      fontSize: normalize(21),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    highlight: {
      color: COLORS.primary,
    },
  });
