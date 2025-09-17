import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { width } from "../constants/settings";
import { useNavigation } from "@react-navigation/native";
import RegisterForm from "../components/forms/RegisterForm";

export default function RegisterScreen() {
  const navigation = useNavigation();

  const handleNavigate = () => {
    navigation.navigate("SignIn" as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Getting Started</Text>
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
              Let’s create your account here.
            </Text>
          </View>

          <RegisterForm />

          <Text style={{ textAlign: "center", marginTop: 20 }}>
            Already have an account?
            <Text onPress={handleNavigate} style={{ color: "blue" }}>
              {" "}
              Sign in here
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginTop: -30,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: width * 0.05144,
    fontWeight: "700",
  },
  highlight: {
    color: COLORS.primary,
  },
});
