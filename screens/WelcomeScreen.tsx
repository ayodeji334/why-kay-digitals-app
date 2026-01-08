import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { getFontFamily, normalize } from "../constants/settings";

const { height: screenHeight } = Dimensions.get("window");

const WelcomeScreen = () => {
  const navigation: any = useNavigation();

  return (
    <SafeAreaView
      edges={["right", "bottom", "left", "top"]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={"#03001A"} />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={require("../assets/welcome-illustration.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Lorem ipsum dolor sit amet,{" "}
              <Text style={styles.highlight}>consectetur</Text>
            </Text>
            <Text style={styles.subtitle}>
              Experience seamless transactions, smart insights, and instant
              access to your funds.
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
            By tapping <Text style={styles.termsHighlight}>Create account</Text>{" "}
            or <Text style={styles.termsHighlight}>Sign in</Text>, you agree to
            our{" "}
            <Text
              onPress={() =>
                navigation.navigate(
                  "WebView" as never,
                  {
                    url: "https://whykay.net/faq/",
                  } as never,
                )
              }
              style={styles.termsHighlight}
            >
              Term & Conditions
            </Text>
            .{"\n"}
            Learn more about how we process your data in our{" "}
            <Text
              onPress={() =>
                navigation.navigate(
                  "WebView" as never,
                  {
                    url: "https://whykay.net/faq/",
                  } as never,
                )
              }
              style={styles.termsHighlight}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#03001A",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#03001A",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  imageWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: screenHeight * 0.4,
    paddingHorizontal: 20,
    paddingTop: screenHeight * 0.05,
  },
  image: {
    width: "100%",
    height: "100%",
    maxHeight: 500,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
    justifyContent: "flex-end",
  },
  header: {
    marginBottom: screenHeight * 0.04,
    alignItems: "center",
  },
  title: {
    fontSize: normalize(40),
    color: COLORS.whiteBackground,
    textAlign: "center",
    fontFamily: getFontFamily(800),
    maxWidth: "80%",
    marginHorizontal: "auto",
    marginBottom: 10,
    lineHeight: 30,
  },
  highlight: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: normalize(19),
    color: COLORS.whiteBackground,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
    fontFamily: getFontFamily(400),
  },
  buttonContainer: {
    marginBottom: screenHeight * 0.03,
  },
  button: {
    borderRadius: 30,
    paddingVertical: 14,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  createButton: {
    backgroundColor: COLORS.primary,
  },
  signInButton: {
    borderWidth: 1,
    borderColor: COLORS.whiteBackground,
  },
  createButtonText: {
    color: COLORS.whiteBackground,
    fontSize: normalize(20),
    fontFamily: getFontFamily("700"),
  },
  signInButtonText: {
    color: COLORS.whiteBackground,
    fontSize: normalize(20),
    fontFamily: getFontFamily("700"),
  },
  termsText: {
    fontSize: normalize(15),
    color: COLORS.whiteBackground,
    fontFamily: getFontFamily("400"),
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  termsHighlight: {
    color: "#72FFB0",
    fontFamily: getFontFamily("400"),
  },
});

export default WelcomeScreen;
