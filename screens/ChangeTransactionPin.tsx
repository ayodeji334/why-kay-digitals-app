import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import HalfScreenModal from "../components/HalfScreenModal";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import SetNewTransactionPinForm from "../components/forms/SetNewTransactionPinForm";

export default function ChangeTransactionPinScreen() {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const navigation = useNavigation();

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollContainer}>
        <View>
          <Text style={styles.subtitle}>
            Your transaction PIN is a 4-digit code used to authorize payments
            and sensitive actions on your account. Changing your PIN helps keep
            your money and data safe.
          </Text>
        </View>

        <SetNewTransactionPinForm />

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
  title: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    marginBottom: 12,
  },
  subtitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: COLORS.dark,
    lineHeight: 20,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 23,
  },
  highlight: {
    color: COLORS.primary,
  },
});
