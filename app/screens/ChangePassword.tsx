import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { width } from "../constants/settings";
import HalfScreenModal from "../components/HalfScreenModal";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import ChangePasswordForm from "../components/forms/ChangePasswordForm";

export default function ChangePasswordScreen() {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const navigation = useNavigation();

  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollContainer}>
        <View style={{ gap: 5 }}>
          <Text style={styles.title}>Update Your Password</Text>
          <Text style={styles.subtitle}>
            Your password protects your account and personal information.
            Updating it regularly helps keep your account secure. Choose a
            strong password with a mix of letters, numbers, and symbols that
            others cannot easily guess.
          </Text>
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
    marginBottom: 23,
  },
  title: {
    fontSize: width * 0.0354,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: width * 0.031,
    fontWeight: "300",
    color: COLORS.dark,
    lineHeight: 20,
  },
  highlight: {
    color: COLORS.primary,
  },
});
