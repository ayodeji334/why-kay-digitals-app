import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import VerificationForm from "../components/forms/VerificationForm";
import { getFontFamily, normalize } from "../constants/settings";

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
                fontSize: normalize(18),
                marginTop: 2,
                marginLeft: 1,
              },
            ]}
          >
            We sent you a 4 digit code to verify your email address
            <Text style={{ color: "blue" }}>({email})</Text>. Enter in the field
            below. Enter the verification code sent to your email address
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
    fontSize: normalize(29),
    fontFamily: getFontFamily("800"),
  },
  highlight: {
    color: COLORS.primary,
  },
});
