import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import LoginForm from "../components/forms/LoginForm";
import { height, width } from "../constants/settings";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const navigation = useNavigation();

  const handleNavigate = () => {
    navigation.navigate("SignUp" as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back, Philip</Text>
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
            Log in to your account to continue
          </Text>
        </View>

        <LoginForm />
        <Text style={{ textAlign: "center" }}>
          Don’t have an account?
          <Text onPress={handleNavigate} style={{ color: "blue" }}>
            {" "}
            Sign up here
          </Text>
        </Text>
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
    marginTop: -20,
  },
  header: {
    marginBottom: height * 0,
  },
  title: {
    fontSize: width * 0.0644,
    fontWeight: "700",
  },
  highlight: {
    color: COLORS.primary,
  },
});
