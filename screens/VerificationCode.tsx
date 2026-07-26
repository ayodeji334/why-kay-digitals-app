import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import VerificationForm from "../components/forms/VerificationForm";
import { getFontFamily, normalize } from "../constants/settings";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";

// Utility function to mask email
const maskEmail = (email: string) => {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;

  // Show first 2 characters of the username, mask the rest
  const maskedUser =
    user.length > 2
      ? user.slice(0, 2) + "*".repeat(user.length - 2)
      : user[0] + "*";

  return `${maskedUser}@${domain}`;
};

export default function VerificationCodeScreen({ route }: any) {
  const { email } = route.params;
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <AppText style={styles.title}>Verify your email address</AppText>
          <AppText
            style={[
              {
                fontFamily: getFontFamily(400),
                fontSize: normalize(18),
                marginTop: 2,
                marginLeft: 1,
                color: colors.text,
              },
            ]}
          >
            We sent you a 6 digit code to verify your email address
            <AppText
              style={{
                fontFamily: getFontFamily("800"),
                paddingHorizontal: 10,
                color: colors.text,
              }}
            >
              {" "}
              {maskEmail(email)}
            </AppText>
            . Enter in the field below. Enter the verification code sent to your
            email address
          </AppText>
        </View>

        <VerificationForm email={email} />
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
      paddingHorizontal: 20,
    },
    header: {
      marginBottom: 23,
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
