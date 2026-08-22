import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize, width } from "../constants/settings";
import { useNavigation } from "@react-navigation/native";
import RegisterForm from "../components/forms/RegisterForm";
import { AppText } from "../components/AppText";
import { useColors, useResolvedTheme } from "../hooks/useTheme";

export default function RegisterScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const resolvedTheme = useResolvedTheme();
  const navigation = useNavigation();

  const handleNavigate = () => {
    navigation.navigate("SignIn" as never);
  };

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppText style={styles.title}>Getting Started</AppText>
          <AppText
            style={[
              {
                fontFamily: getFontFamily(400),
                fontSize: normalize(20),
                color: colors.text,
              },
            ]}
          >
            Let’s create your account here.
          </AppText>
        </View>

        <RegisterForm />

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
            Already have an account?
          </AppText>
          <AppText
            onPress={handleNavigate}
            style={[
              {
                fontSize: normalize(18),
                fontFamily: getFontFamily(700),
                color: colors.primaryLight,
              },
            ]}
          >
            Sign in here
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
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
