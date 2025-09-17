import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
} from "react-native";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { height, width } from "../constants/settings";

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.imageWrapper}>
          <Image
            source={require("../assets/splash_logo.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Lorem ipsum dolor sit amet,{" "}
              <Text style={styles.highlight}>consectetur</Text>
            </Text>
            <Text style={styles.subtitle}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              onPress={() => {
                navigation.navigate("SignUp" as never);
              }}
              style={[styles.button, styles.createButton]}
            >
              <Text style={styles.createButtonText}>Create Account</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("SignIn" as never)}
              style={[styles.button, styles.signInButton]}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </Pressable>
          </View>

          <Text style={styles.termsText}>
            By tapping{" "}
            <Text style={{ color: COLORS.secondary }}>Create account</Text> or
            <Text style={{ color: COLORS.secondary }}> Sign in</Text>, you agree
            to our
            <Text style={{ color: COLORS.secondary }}> Term & Conditions</Text>.
            Learn more about how we process your data in our Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBackground,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: COLORS.darkBackground,
  },
  header: {
    marginBottom: height * 0.02,
  },
  imageWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.91,
    height: width * 0.91,
  },
  title: {
    fontSize: width * 0.064,
    fontWeight: "bold",
    color: COLORS.whiteBackground,
    marginTop: height * 0.04,
    marginBottom: 10,
    textAlign: "center",
  },
  highlight: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: width * 0.03881,
    color: COLORS.whiteBackground,
    textAlign: "center",
    lineHeight: height * 0.025,
  },
  termsText: {
    fontSize: width * 0.03,
    color: COLORS.whiteBackground,
    fontWeight: "400",
    lineHeight: height * 0.0172,
    marginVertical: height * 0.023,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 10,
    paddingHorizontal: height * 0.027,
  },
  button: {
    borderRadius: 120,
    paddingVertical: height * 0.02,
    marginBottom: height * 0.015,
    alignItems: "center",
    justifyContent: "center",
  },
  createButton: {
    backgroundColor: COLORS.primary,
  },
  signInButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  createButtonText: {
    color: COLORS.whiteBackground,
    fontSize: width * 0.043,
    fontWeight: "600",
  },
  signInButtonText: {
    color: COLORS.darkBackground,
    fontSize: width * 0.043,
    fontWeight: "600",
  },
});

export default WelcomeScreen;
