import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import VerificationForm from "../components/forms/VerificationForm";
import { width } from "../constants/settings";

export default function VerificationCodeScreen({ route }: any) {
  const { email } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Verification Code</Text>
          <Text
            style={[
              styles.title,
              {
                fontWeight: "300",
                fontSize: width * 0.0434,
                marginTop: 6,
                marginLeft: 1,
              },
            ]}
          >
            Enter the verification code sent to your email address{" "}
            <Text style={{ color: "blue" }}>({email})</Text> to verify your
            account recovery
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
    marginTop: -40,
  },
  header: {
    marginBottom: 23,
  },
  title: {
    fontSize: width * 0.0644,
    fontWeight: "700",
  },
  highlight: {
    color: COLORS.primary,
  },
});
