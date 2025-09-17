import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import ForgotPasswordForm from "../components/forms/ForgotPasswordForm";
import { height, width } from "../constants/settings";

export default function ForgetPasswordScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text
            style={[
              styles.title,
              {
                fontWeight: "300",
                fontSize: width * 0.0374,
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
    marginTop: -40,
  },
  header: {
    marginBottom: height * 0,
  },
  title: {
    fontSize: width * 0.0544,
    fontWeight: "700",
  },
  highlight: {
    color: COLORS.primary,
  },
});
