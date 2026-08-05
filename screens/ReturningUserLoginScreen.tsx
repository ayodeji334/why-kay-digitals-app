import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../stores/authSlice";
import ReturningUserLoginForm from "../components/forms/ReturningUserLoginForm";
import { AppText } from "../components/AppText";
import BiometricLoginButton from "../components/BiometricLoginBtn";
import { useBiometricLogin } from "../hooks/useBiometricLogin";
import { capitalizeFirst } from "../libs/helpers";
import { useColors, useResolvedTheme } from "../hooks/useTheme";

export default function ReturningUserLoginScreen() {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);
  const { isReady } = useBiometricLogin();
  const colors = useColors();
  const styles = makeStyles(colors);
  const resolvedTheme = useResolvedTheme();

  const handleNavigate = () => {
    navigation.navigate("SignIn" as never);
  };

  return (
    <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <AppText style={styles.title}>
            Welcome Back,{" "}
            {user?.username ? capitalizeFirst(user?.username) : ""}
          </AppText>
          <AppText
            style={[
              styles.title,
              {
                fontFamily: getFontFamily(400),
                fontSize: normalize(20),
              },
            ]}
          >
            Log in to your account to continue
          </AppText>
        </View>

        <ReturningUserLoginForm />
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
            Want to switch an account?
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
            Switch Account
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
      fontSize: normalize(22),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    highlight: {
      color: COLORS.primary,
    },
  });
