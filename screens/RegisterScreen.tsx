import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize, width } from "../constants/settings";
import { useNavigation } from "@react-navigation/native";
import RegisterForm from "../components/forms/RegisterForm";

export default function RegisterScreen() {
  const navigation = useNavigation();

  const handleNavigate = () => {
    navigation.navigate("SignIn" as never);
  };

  return (
    <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
                fontFamily: getFontFamily(400),
                fontSize: normalize(18),
                marginTop: 2,
                marginLeft: 1,
              },
            ]}
          >
            Let’s create your account here.
          </Text>
        </View>

        <RegisterForm />

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
            Already have an account?
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
            Sign in here
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
