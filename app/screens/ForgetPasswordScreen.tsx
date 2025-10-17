import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import ForgotPasswordForm from "../components/forms/ForgotPasswordForm";
import { normalize } from "../constants/settings";

export default function ForgetPasswordScreen() {
  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text
            style={[
              styles.title,
              {
                fontWeight: "300",
                fontSize: normalize(12),
                marginTop: 6,
                marginLeft: 1,
              },
            ]}
          >
            Opps. It happens to the best of us. Input your email address to fix
            the issue.
          </Text>
        </View>

        <ForgotPasswordForm />
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
    marginBottom: 10,
  },
  title: {
    fontSize: normalize(15),
    fontWeight: "700",
  },
  highlight: {
    color: COLORS.primary,
  },
});
