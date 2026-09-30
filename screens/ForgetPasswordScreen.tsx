import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import ForgotPasswordForm from "../components/forms/ForgotPasswordForm";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import LiveChatButton from "../components/LiveChatButton";
import { useStyles } from "../hooks/useStyles";

export default function ForgetPasswordScreen() {
  const styles = useStyles(makeStyles);

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        style={styles.scrollContainer}
      >
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
