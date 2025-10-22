import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import LoginForm from "../components/forms/LoginForm";
import { getFontFamily, normalize } from "../constants/settings";
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
            Welcome Back,{" "}
            {(user?.first_name
              ? user.first_name.charAt(0).toUpperCase() +
                user.first_name.slice(1)
              : "") || "User"}
          </Text>
          <Text
            style={[
              styles.title,
              {
                fontFamily: getFontFamily(400),
                fontSize: normalize(18),
                marginTop: 2,
                marginLeft: 1,
              },
            ]}
          >
            Log in to your account to continue
          </Text>
        </View>

        <LoginForm />
        <View
          style={{
            gap: 10,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: normalize(18),
              fontFamily: getFontFamily(400),
            }}
          >
            Don’t have an account?
          </Text>
          <Text
            onPress={handleNavigate}
            style={[
              {
                fontSize: normalize(18),
                fontFamily: getFontFamily(400),
              },
              { color: "blue" },
            ]}
          >
            Sign up here
          </Text>
        </View>
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
    fontSize: normalize(23),
    fontFamily: getFontFamily("800"),
  },
  highlight: {
    color: COLORS.primary,
  },
});
