import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import LoginForm from "../components/forms/LoginForm";
import { normalize } from "../constants/settings";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../stores/authSlice";

export default function LoginScreen() {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);

  const handleNavigate = () => {
    navigation.navigate("SignUp" as never);
  };

  return (
    <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Welcome Back, {user?.first_name ?? "User"}
          </Text>
          <Text
            style={[
              styles.title,
              {
                fontWeight: "300",
                fontSize: normalize(11),
                marginTop: 6,
                marginLeft: 1,
              },
            ]}
          >
            Log in to your account to continue
          </Text>
        </View>

        <LoginForm />
        <Text style={{ textAlign: "center", fontSize: normalize(11) }}>
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
