// import React from "react";
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   Image,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { getFontFamily, normalize } from "../constants/settings";
// import { COLORS } from "../constants/colors";
// import {
//   CommonActions,
//   useNavigation,
//   useRoute,
// } from "@react-navigation/native";
// import { ArrowRight } from "iconsax-react-nativejs";
// import { AppText } from "../components/AppText";

// const PendingSwapScreen = () => {
//   const navigation: any = useNavigation();
//   const route = useRoute();
//   const { transaction }: any = route.params;

//   const handleContinue = () => {
//     try {
//       const state = navigation.getState();
//       const routes = state.routes;
//       const previousRoute = routes[routes.length - 2];

//       if (previousRoute) {
//         navigation.dispatch({
//           ...CommonActions.setParams({ resetForm: true }),
//           source: previousRoute.key,
//         });

//         navigation.goBack();
//       } else {
//         navigation.goBack();
//       }
//     } catch (error) {
//       navigation.goBack();
//     }
//   };

//   return (
//     <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       <View style={styles.content}>
//         <View style={{ alignItems: "center", paddingTop: 40 }}>
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               columnGap: 19,
//               marginTop: 20,
//               padding: 20,
//             }}
//           >
//             <Image
//               source={{ uri: transaction?.from_asset_logo }}
//               style={{ width: 35, height: 35, borderRadius: 25 }}
//             />
//             <View>
//               <ArrowRight size={20} color="#333" />
//             </View>
//             <Image
//               source={{ uri: transaction?.to_asset_logo }}
//               style={{ width: 35, height: 35, borderRadius: 25 }}
//             />
//           </View>
//           <AppText style={styles.title}>Transaction Processing</AppText>
//           <AppText style={styles.message}>
//             Your asset conversion from {transaction?.meta?.asset_symbol} to{" "}
//             {transaction?.meta?.to_asset_symbol} is currently being processed.
//             We’ll notify you as soon as the process is completed.
//           </AppText>
//         </View>

//         <TouchableOpacity
//           activeOpacity={0.8}
//           style={styles.button}
//           onPress={handleContinue}
//         >
//           <AppText style={styles.buttonText}>Continue</AppText>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   content: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: 20,
//   },
//   icon: { width: 80, height: 80, marginBottom: 20 },
//   title: {
//     fontSize: normalize(22),
//     fontFamily: getFontFamily("900"),
//     color: COLORS.dark,
//     marginBottom: 12,
//   },
//   message: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("700"),
//     color: "#000",
//     textAlign: "center",
//     paddingHorizontal: 20,
//   },
//   button: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     paddingHorizontal: 40,
//     borderRadius: 25,
//     marginBottom: 12,
//     width: "100%",
//   },
//   buttonText: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("800"),
//     color: "#fff",
//     textAlign: "center",
//   },
//   link: { marginTop: 8 },
//   linkText: {
//     fontSize: normalize(14),
//     fontFamily: getFontFamily("400"),
//     color: "#93C5FD",
//   },
// });

// export default PendingSwapScreen;
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { ArrowRight } from "iconsax-react-nativejs";
import { AppText } from "../components/AppText";
import { useColors, useResolvedTheme } from "../hooks/useTheme";

const PendingSwapScreen = () => {
  const navigation: any = useNavigation();
  const route = useRoute();
  const { transaction }: any = route.params;
  const colors = useColors();
  const resolvedTheme = useResolvedTheme();
  const styles = makeStyles(colors);

  const handleContinue = () => {
    try {
      const state = navigation.getState();
      const routes = state.routes;
      const previousRoute = routes[routes.length - 2];

      if (previousRoute) {
        navigation.dispatch({
          ...CommonActions.setParams({ resetForm: true }),
          source: previousRoute.key,
        });

        navigation.goBack();
      } else {
        navigation.goBack();
      }
    } catch (error) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View style={styles.content}>
        <View style={{ alignItems: "center", paddingTop: 40 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              columnGap: 19,
              marginTop: 20,
              padding: 20,
            }}
          >
            <Image
              source={{ uri: transaction?.from_asset_logo }}
              style={{ width: 35, height: 35, borderRadius: 25 }}
            />
            <View>
              <ArrowRight size={20} color={colors.textMuted} />
            </View>
            <Image
              source={{ uri: transaction?.to_asset_logo }}
              style={{ width: 35, height: 35, borderRadius: 25 }}
            />
          </View>
          <AppText style={styles.title}>Transaction Processing</AppText>
          <AppText style={styles.message}>
            Your asset conversion from {transaction?.meta?.asset_symbol} to{" "}
            {transaction?.meta?.to_asset_symbol} is currently being processed.
            We’ll notify you as soon as the process is completed.
          </AppText>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={handleContinue}
        >
          <AppText style={styles.buttonText}>Continue</AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "space-between",
      padding: 20,
    },
    icon: { width: 80, height: 80, marginBottom: 20 },
    title: {
      fontSize: normalize(22),
      fontFamily: getFontFamily("900"),
      color: colors.text,
      marginBottom: 12,
    },
    message: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: colors.textMuted,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: 25,
      marginBottom: 12,
      width: "100%",
    },
    buttonText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: "#fff",
      textAlign: "center",
    },
    link: { marginTop: 8 },
    linkText: {
      fontSize: normalize(14),
      fontFamily: getFontFamily("400"),
      color: colors.primaryLight,
    },
  });

export default PendingSwapScreen;
