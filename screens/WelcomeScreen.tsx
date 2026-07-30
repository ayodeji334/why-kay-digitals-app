import React from "react";
import {
  View,
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
import { AppText } from "../components/AppText";

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
            source={require("../assets/welcome-slider.webp")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.contentWrapper}>
          {/* <View style={styles.header}>
            <AppText style={styles.title}>
              Lorem ipsum dolor sit amet,{" "}
              <AppText style={styles.highlight}>consectetur</AppText>
            </Text>
            <AppText style={styles.subtitle}>
              Experience seamless transactions, smart insights, and instant
              access to your funds.
            </AppText>
          </View> */}
          <View style={styles.header}>
            <AppText style={styles.title}>
              Smarter way to{" "}
              <AppText style={styles.highlight}>pay, trade, and grow</AppText>
            </AppText>

            <AppText style={styles.subtitle}>
              From crypto to daily payments, manage everything seamlessly in one
              powerful platform.
            </AppText>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              onPress={() => {
                navigation.navigate("SignUp" as never);
              }}
              style={[styles.button, styles.createButton]}
            >
              <AppText style={styles.createButtonText}>Create Account</AppText>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("SignIn" as never)}
              style={[styles.button, styles.signInButton]}
            >
              <AppText style={styles.signInButtonText}>Sign In</AppText>
            </Pressable>
          </View>

          <AppText style={styles.termsText}>
            By tapping{" "}
            <AppText style={styles.termsHighlight}>Create account</AppText> or{" "}
            <AppText style={styles.termsHighlight}>Sign in</AppText>, you agree
            to our{" "}
            <AppText
              onPress={() =>
                navigation.navigate(
                  "WebView" as never,
                  {
                    url: "https://why-kay-digitals.netlify.app/terms",
                  } as never,
                )
              }
              style={styles.termsHighlight}
            >
              Term & Conditions
            </AppText>
            .{"\n"}
            Learn more about how we process your data in our{" "}
            <AppText
              onPress={() =>
                navigation.navigate(
                  "WebView" as never,
                  {
                    url: "https://why-kay-digitals.netlify.app/privacy",
                  } as never,
                )
              }
              style={styles.termsHighlight}
            >
              Privacy Policy
            </AppText>
          </AppText>
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
    alignContent: "center",
  },
  header: {
    marginBottom: screenHeight * 0.04,
    alignItems: "center",
  },
  title: {
    fontSize: normalize(30),
    color: COLORS.whiteBackground,
    textAlign: "center",
    fontFamily: getFontFamily(800),
    maxWidth: "90%",
    marginHorizontal: "auto",
    marginBottom: 10,
    // lineHeight: 28,
  },
  highlight: {
    color: "#72FFB0",
  },
  subtitle: {
    fontSize: normalize(20),
    color: COLORS.whiteBackground,
    textAlign: "center",
    // lineHeight: 24,
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
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
  signInButtonText: {
    color: COLORS.whiteBackground,
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
  termsText: {
    fontSize: normalize(17),
    color: COLORS.whiteBackground,
    fontFamily: getFontFamily("400"),
    // lineHeight: 19,
    textAlign: "center",
    paddingHorizontal: 2,
  },
  termsHighlight: {
    color: "#72FFB0",
    fontFamily: getFontFamily("400"),
  },
});

// export default WelcomeScreen;
// import React from "react";
// import {
//   View,
//   StyleSheet,
//   Image,
//   Pressable,
//   ScrollView,
//   Dimensions,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useNavigation } from "@react-navigation/native";
// import { getFontFamily, normalize } from "../constants/settings";
// import { AppText } from "../components/AppText";
// import { useColors } from "../hooks/useTheme";

// const { height: screenHeight } = Dimensions.get("window");

// const WelcomeScreen = () => {
//   const navigation: any = useNavigation();
//   const colors = useColors();
//   const styles = makeStyles(colors);

//   return (
//     <SafeAreaView
//       edges={["right", "bottom", "left", "top"]}
//       style={styles.container}
//     >
//       <ScrollView
//         style={styles.scrollContainer}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.imageWrapper}>
//           <Image
//             source={require("../assets/welcome-slider.webp")}
//             style={styles.image}
//             resizeMode="contain"
//           />
//         </View>

//         <View style={styles.contentWrapper}>
//           <View style={styles.header}>
//             <AppText style={styles.title}>
//               Smarter way to{" "}
//               <AppText style={styles.highlight}>pay, trade, and grow</AppText>
//             </AppText>

//             <AppText style={styles.subtitle}>
//               From crypto to daily payments, manage everything seamlessly in one
//               powerful platform.
//             </AppText>
//           </View>

//           <View style={styles.buttonContainer}>
//             <Pressable
//               onPress={() => {
//                 navigation.navigate("SignUp" as never);
//               }}
//               style={[styles.button, styles.createButton]}
//             >
//               <AppText style={styles.createButtonText}>Create Account</AppText>
//             </Pressable>
//             <Pressable
//               onPress={() => navigation.navigate("SignIn" as never)}
//               style={[styles.button, styles.signInButton]}
//             >
//               <AppText style={styles.signInButtonText}>Sign In</AppText>
//             </Pressable>
//           </View>

//           <AppText style={styles.termsText}>
//             By tapping{" "}
//             <AppText style={styles.termsHighlight}>Create account</AppText> or{" "}
//             <AppText style={styles.termsHighlight}>Sign in</AppText>, you agree
//             to our{" "}
//             <AppText
//               onPress={() =>
//                 navigation.navigate(
//                   "WebView" as never,
//                   {
//                     url: "https://why-kay-digitals.netlify.app/terms",
//                   } as never,
//                 )
//               }
//               style={styles.termsHighlight}
//             >
//               Term & Conditions
//             </AppText>
//             .{"\n"}
//             Learn more about how we process your data in our{" "}
//             <AppText
//               onPress={() =>
//                 navigation.navigate(
//                   "WebView" as never,
//                   {
//                     url: "https://why-kay-digitals.netlify.app/privacy",
//                   } as never,
//                 )
//               }
//               style={styles.termsHighlight}
//             >
//               Privacy Policy
//             </AppText>
//           </AppText>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const makeStyles = (colors: ReturnType<typeof useColors>) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: colors.background,
//     },
//     scrollContainer: {
//       flexGrow: 1,
//       backgroundColor: colors.background,
//     },
//     scrollContent: {
//       flexGrow: 1,
//       backgroundColor: colors.background,
//     },
//     imageWrapper: {
//       flex: 1,
//       alignItems: "center",
//       justifyContent: "center",
//       minHeight: screenHeight * 0.4,
//       paddingHorizontal: 20,
//       paddingTop: screenHeight * 0.05,
//       backgroundColor: colors.background,
//     },
//     image: {
//       width: "100%",
//       height: "100%",
//       maxHeight: 500,
//     },
//     contentWrapper: {
//       flex: 1,
//       paddingHorizontal: 24,
//       paddingBottom: 20,
//       justifyContent: "flex-end",
//       alignContent: "center",
//     },
//     header: {
//       marginBottom: screenHeight * 0.04,
//       alignItems: "center",
//     },
//     title: {
//       fontSize: normalize(30),
//       color: colors.text,
//       textAlign: "center",
//       fontFamily: getFontFamily(800),
//       maxWidth: "90%",
//       marginHorizontal: "auto",
//       marginBottom: 10,
//     },
//     highlight: {
//       color: colors.primary,
//     },
//     subtitle: {
//       fontSize: normalize(20),
//       color: colors.text,
//       textAlign: "center",
//       lineHeight: 24,
//       paddingHorizontal: 10,
//       fontFamily: getFontFamily(400),
//     },
//     buttonContainer: {
//       marginBottom: screenHeight * 0.03,
//     },
//     button: {
//       borderRadius: 30,
//       paddingVertical: 14,
//       marginBottom: 12,
//       alignItems: "center",
//       justifyContent: "center",
//       width: "100%",
//     },
//     createButton: {
//       backgroundColor: colors.primary,
//     },
//     signInButton: {
//       borderWidth: 1,
//       borderColor: colors.text,
//     },
//     createButtonText: {
//       color: "#fff",
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("700"),
//     },
//     signInButtonText: {
//       color: colors.text,
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("700"),
//     },
//     termsText: {
//       fontSize: normalize(17),
//       color: colors.text,
//       fontFamily: getFontFamily("400"),
//       lineHeight: 19,
//       textAlign: "center",
//       paddingHorizontal: 2,
//     },
//     termsHighlight: {
//       color: colors.primary,
//       fontFamily: getFontFamily("400"),
//     },
//   });

export default WelcomeScreen;
