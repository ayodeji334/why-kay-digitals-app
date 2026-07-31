import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import HalfScreenModal from "../components/HalfScreenModal";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import ChangePasswordForm from "../components/forms/ChangePasswordForm";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";

export default function ChangePasswordScreen() {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const navigation = useNavigation();
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
      >
        <View style={{ gap: 5 }}>
          <AppText style={styles.subtitle}>
            Your password protects your account and personal information.
            Updating it regularly helps keep your account secure. Choose a
            strong password with a mix of letters, numbers, and symbols that
            others cannot easily guess.
          </AppText>
        </View>

        <ChangePasswordForm />

        <HalfScreenModal
          isVisible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            navigation.navigate("SignIn" as never);
          }}
          title="Password changed Successfully"
          description="Return to the login screen to enter the Home Screen"
          buttonText="Return to Sign In"
        />
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
      flexGrow: 1,
      paddingHorizontal: 20,
    },
    header: {
      marginBottom: 23,
    },
    subtitle: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.text,
      // lineHeight: 20,
    },
    highlight: {
      color: COLORS.primary,
    },
  });
