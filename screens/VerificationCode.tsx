import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import VerificationForm from "../components/forms/VerificationForm";
import { getFontFamily, normalize } from "../constants/settings";

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

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={"white"} />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify your email address</Text>
          <Text
            style={[
              {
                fontFamily: getFontFamily(400),
                fontSize: normalize(20),
                marginTop: 2,
                marginLeft: 1,
              },
            ]}
          >
            We sent you a 6 digit code to verify your email address
            <Text
              style={{
                fontFamily: getFontFamily("800"),
                paddingHorizontal: 10,
              }}
            >
              {" "}
              {maskEmail(email)}
            </Text>
            . Enter in the field below. Enter the verification code sent to your
            email address
          </Text>
        </View>

        <VerificationForm email={email} />
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
  header: {
    marginBottom: 23,
  },
  title: {
    fontSize: normalize(23),
    fontFamily: getFontFamily("800"),
  },
  highlight: {
    color: COLORS.primary,
  },
});
