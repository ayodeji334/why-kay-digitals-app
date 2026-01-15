import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../stores/authSlice";
import ReturningUserLoginForm from "../components/forms/ReturningUserLoginForm";

export default function ReturningUserLoginScreen() {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);

  const handleNavigate = () => {
    navigation.navigate("SignIn" as never);
  };

  return (
    <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back, {user?.username}</Text>
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

        <ReturningUserLoginForm />
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
            Want to switch an account?
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
            Switch Account
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
