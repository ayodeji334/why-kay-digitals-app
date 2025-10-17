// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   Pressable,
//   ScrollView,
//   StatusBar,
// } from "react-native";
// import { COLORS } from "../constants/colors";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useNavigation } from "@react-navigation/native";
// import { height, normalize, width } from "../constants/settings";

// const WelcomeScreen = () => {
//   const navigation = useNavigation();

//   return (
//     <SafeAreaView
//       edges={["right", "bottom", "left", "top"]}
//       style={styles.container}
//     >
//       <StatusBar barStyle="light-content" backgroundColor={"black"} />
//       <ScrollView style={styles.scrollContainer}>
//         <View style={styles.imageWrapper}>
//           <Image
//             source={require("../assets/splash_logo.png")}
//             style={styles.image}
//             resizeMode="contain"
//           />
//         </View>
//         <View style={{ flex: 1, paddingHorizontal: 10 }}>
//           <View style={styles.header}>
//             <Text style={styles.title}> Lorem ipsum dolor</Text>
//             <Text style={styles.title}>
//               sit amet, <Text style={styles.highlight}> consectetur</Text>
//             </Text>
//             <Text style={styles.subtitle}>
//               Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
//               eiusmod tempor.
//             </Text>
//           </View>
//           <View style={styles.buttonContainer}>
//             <Pressable
//               onPress={() => {
//                 navigation.navigate("SignUp" as never);
//               }}
//               style={[styles.button, styles.createButton]}
//             >
//               <Text style={styles.createButtonText}>Create Account</Text>
//             </Pressable>
//             <Pressable
//               onPress={() => navigation.navigate("SignIn" as never)}
//               style={[styles.button, styles.signInButton]}
//             >
//               <Text style={styles.signInButtonText}>Sign In</Text>
//             </Pressable>
//           </View>
//           <Text style={styles.termsText}>
//             By tapping{" "}
//             <Text style={{ color: COLORS.secondary }}>Create account</Text> or
//             <Text style={{ color: COLORS.secondary }}> Sign in</Text>, you agree
//             to our
//             <Text style={{ color: COLORS.secondary }}> Term & Conditions</Text>.
//             Learn more about how we process your data in our Privacy Policy
//           </Text>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.darkBackground,
//   },
//   scrollContainer: {
//     flex: 1,
//     paddingHorizontal: 20,
//     backgroundColor: COLORS.darkBackground,
//   },
//   header: {
//     marginBottom: height * 0.02,
//   },
//   imageWrapper: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 20,
//   },
//   image: {
//     width: width * 0.61,
//     height: width * 0.61,
//   },
//   title: {
//     fontSize: normalize(20),
//     fontWeight: "bold",
//     color: COLORS.whiteBackground,
//     marginTop: height * 0.04,
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   highlight: {
//     color: COLORS.primary,
//   },
//   subtitle: {
//     fontSize: width * 0.03881,
//     color: COLORS.whiteBackground,
//     textAlign: "center",
//     lineHeight: height * 0.025,
//   },
//   termsText: {
//     fontSize: width * 0.03,
//     color: COLORS.whiteBackground,
//     fontWeight: "400",
//     lineHeight: height * 0.0172,
//     marginVertical: height * 0.023,
//     textAlign: "center",
//   },
//   buttonContainer: {
//     marginTop: 10,
//     paddingHorizontal: height * 0.027,
//   },
//   button: {
//     borderRadius: 120,
//     paddingVertical: height * 0.02,
//     marginBottom: height * 0.015,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   createButton: {
//     backgroundColor: COLORS.primary,
//   },
//   signInButton: {
//     backgroundColor: COLORS.secondary,
//     borderWidth: 1,
//     borderColor: COLORS.secondary,
//   },
//   createButtonText: {
//     color: COLORS.whiteBackground,
//     fontSize: width * 0.043,
//     fontWeight: "600",
//   },
//   signInButtonText: {
//     color: COLORS.darkBackground,
//     fontSize: width * 0.043,
//     fontWeight: "600",
//   },
// });

// export default WelcomeScreen;
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
import { normalize } from "../constants/settings";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView
      edges={["right", "bottom", "left", "top"]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={"black"} />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={require("../assets/welcome_illustration.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Text style={styles.title}>Lorem ipsum dolor</Text>
            <Text style={styles.title}>
              sit amet, <Text style={styles.highlight}>consectetur</Text>
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
            By tapping <Text style={styles.termsHighlight}>Create account</Text>{" "}
            or <Text style={styles.termsHighlight}>Sign in</Text>, you agree to
            our <Text style={styles.termsHighlight}>Term & Conditions</Text>.
            {"\n"}
            Learn more about how we process your data in our{" "}
            <Text style={styles.termsHighlight}>Privacy Policy</Text>
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
    backgroundColor: COLORS.darkBackground,
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
    width: screenWidth * 0.7,
    height: screenWidth * 0.7,
    maxWidth: 300,
    maxHeight: 300,
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
    fontSize: normalize(25),
    fontWeight: "bold",
    color: COLORS.whiteBackground,
    textAlign: "center",
    lineHeight: 32,
  },
  highlight: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: normalize(14),
    color: COLORS.whiteBackground,
    textAlign: "center",
    lineHeight: 24,
    marginTop: 16,
    paddingHorizontal: 10,
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
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  createButtonText: {
    color: COLORS.whiteBackground,
    fontSize: normalize(14),
    fontWeight: "600",
  },
  signInButtonText: {
    color: COLORS.darkBackground,
    fontSize: normalize(14),
    fontWeight: "600",
  },
  termsText: {
    fontSize: normalize(10),
    color: COLORS.whiteBackground,
    fontWeight: "400",
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  termsHighlight: {
    color: COLORS.secondary,
    fontWeight: "500",
  },
});

export default WelcomeScreen;
