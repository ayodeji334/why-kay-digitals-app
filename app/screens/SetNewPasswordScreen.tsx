import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import SetNewPasswordForm from "../components/forms/SetNewPasswordForm";
import { width } from "../constants/settings";
import HalfScreenModal from "../components/HalfScreenModal";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

export default function SetNewPasswordScreen({ route }: any) {
  const { email } = route.params;
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Set A New Password</Text>
          <Text
            style={[
              styles.title,
              {
                fontWeight: "300",
                fontSize: width * 0.0434,
                marginTop: 6,
                marginLeft: 1,
              },
            ]}
          >
            Enter your new password below and check the hint while setting it.
          </Text>
        </View>

        <SetNewPasswordForm
          email={email}
          onSuccess={() => setModalVisible(true)}
        />

        <HalfScreenModal
          isVisible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            navigation.navigate("SignIn" as never);
          }}
          title="Password Recovery Successfully"
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
    marginTop: -40,
  },
  header: {
    marginBottom: 23,
  },
  title: {
    fontSize: width * 0.0644,
    fontWeight: "700",
  },
  highlight: {
    color: COLORS.primary,
  },
});
