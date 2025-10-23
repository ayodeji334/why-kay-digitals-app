import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import SetNewPasswordForm from "../components/forms/SetNewPasswordForm";
import { getFontFamily, normalize } from "../constants/settings";
import HalfScreenModal from "../components/HalfScreenModal";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

export default function SetNewPasswordScreen({ route }: any) {
  const { email } = route.params;
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const navigation = useNavigation();

  return (
    <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Set A New Password</Text>
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
  },
  header: {
    marginBottom: 23,
  },
  title: {
    fontSize: normalize(23),
    fontFamily: getFontFamily("800"),
  },
  highlight: {
    color: COLORS.primary,
  },
});
