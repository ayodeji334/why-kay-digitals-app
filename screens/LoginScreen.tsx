import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import LoginForm from "../components/forms/LoginForm";
import { getFontFamily, normalize } from "../constants/settings";
import { useNavigation } from "@react-navigation/native";
import { AppText } from "../components/AppText";
import BiometricLoginButton from "../components/BiometricLoginBtn";
import { useBiometricLogin } from "../hooks/useBiometricLogin";
import { useColors, useResolvedTheme } from "../hooks/useTheme";

export default function LoginScreen() {
  const navigation = useNavigation();
  const { isReady } = useBiometricLogin();
  const colors = useColors();
  const styles = makeStyles(colors);

  const handleNavigate = () => {
    navigation.navigate("SignUp" as never);
  };

  const resolvedTheme = useResolvedTheme();

  return (
    <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <AppText style={styles.title}>Welcome</AppText>
          <AppText
            style={[
              {
                fontFamily: getFontFamily(400),
                fontSize: normalize(20),
                color: colors.text,
              },
            ]}
          >
            Log in to your account to continue
          </AppText>
        </View>

        <LoginForm />

        {isReady && <BiometricLoginButton />}

        <View
          style={{
            gap: 10,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <AppText
            style={{
              fontSize: normalize(18),
              fontFamily: getFontFamily(700),
              color: colors.text,
            }}
          >
            Don’t have an account?
          </AppText>
          <AppText
            onPress={handleNavigate}
            style={[
              {
                fontSize: normalize(18),
                fontFamily: getFontFamily(700),
              },
              { color: colors.primaryLight },
            ]}
          >
            Sign up here
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    header: {
      marginVertical: 10,
    },
    title: {
      fontSize: normalize(23),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    highlight: {
      color: COLORS.primary,
    },
  });
