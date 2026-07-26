// import {
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { COLORS } from "../constants/colors";
// import { getFontFamily, normalize } from "../constants/settings";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import OtpInputField from "../components/OtpInputField";
// import { useState } from "react";
// import { showError, showSuccess } from "../utlis/toast";
// import { AxiosError } from "axios";
// import CustomLoading from "../components/CustomLoading";
// import { useAuthStore } from "../stores/authSlice";
// import useAxios from "../hooks/useAxios";
// import { AppText } from "../components/AppText";

// type FormData = {
//   pin: string;
// };

// const schema = yup.object().shape({
//   pin: yup
//     .string()
//     .length(6, "PIN must be 4 digits")
//     .required("PIN is required"),
// });

// export default function ConfirmTwoFactorAuthenticationScreen() {
//   const { setIsGoogleAuthenticatorEnabled } = useAuthStore(state => state);
//   const { post } = useAxios();
//   const navigation = useNavigation();
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const { control, handleSubmit } = useForm<FormData>({
//     resolver: yupResolver(schema),
//     defaultValues: { pin: "" },
//   });

//   const handleVerifyCodeAndEnable2FA = async (values: FormData) => {
//     if (!values.pin || values.pin.length < 6) {
//       showError("Invalid code");
//       return;
//     }
//     try {
//       setIsLoading(true);

//       await post("2fa-auth/verify-enable", {
//         code: values.pin,
//       });

//       setIsGoogleAuthenticatorEnabled(true);
//       showSuccess("2FA enabled sunccessfully");
//       navigation.goBack();
//     } catch (err: unknown) {
//       if (err instanceof AxiosError) {
//         const errorMessage =
//           err.response?.data?.message ||
//           "Google Authentication failed. Try again.";
//         showError(errorMessage);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
//       <StatusBar barStyle="dark-content" />
//       <ScrollView style={styles.scrollContainer}>
//         <View style={styles.header}>
//           <AppText style={styles.title}>Complete 2FA Setup</AppText>
//           <AppText style={styles.subtitle}>
//             Finalize your account security by entering the code from your
//             authenticator app
//           </AppText>
//         </View>

//         <OtpInputField control={control} name="pin" boxes={6} />

//         <TouchableOpacity
//           style={styles.button}
//           onPress={handleSubmit(handleVerifyCodeAndEnable2FA)}
//         >
//           <AppText style={styles.buttonText}>Set Pin</AppText>
//         </TouchableOpacity>
//       </ScrollView>

//       <CustomLoading loading={isLoading} />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "white",
//   },
//   button: {
//     marginTop: 30,
//     backgroundColor: COLORS.secondary,
//     padding: 14,
//     borderRadius: 80,
//   },
//   buttonText: {
//     color: "#fff",
//     textAlign: "center",
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(18),
//   },
//   subtitle: {
//     fontFamily: getFontFamily("400"),
//     fontSize: normalize(18),
//     textAlign: "left",
//     color: "#666",
//     lineHeight: 18,
//   },
//   scrollContainer: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   header: {
//     marginBottom: 23,
//   },
//   title: {
//     fontFamily: getFontFamily("800"),
//     fontSize: normalize(20),
//   },
//   highlight: {
//     color: COLORS.primary,
//   },
// });
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import OtpInputField from "../components/OtpInputField";
import { useState } from "react";
import { showError, showSuccess } from "../utlis/toast";
import { AxiosError } from "axios";
import CustomLoading from "../components/CustomLoading";
import { useAuthStore } from "../stores/authSlice";
import useAxios from "../hooks/useAxios";
import { AppText } from "../components/AppText";
import { useColors, useResolvedTheme } from "../hooks/useTheme";

type FormData = {
  pin: string;
};

const schema = yup.object().shape({
  pin: yup
    .string()
    .length(6, "PIN must be 4 digits")
    .required("PIN is required"),
});

export default function ConfirmTwoFactorAuthenticationScreen() {
  const { setIsGoogleAuthenticatorEnabled } = useAuthStore(state => state);
  const { post } = useAxios();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const colors = useColors();
  const resolvedTheme = useResolvedTheme();
  const styles = makeStyles(colors);
  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { pin: "" },
  });

  const handleVerifyCodeAndEnable2FA = async (values: FormData) => {
    if (!values.pin || values.pin.length < 6) {
      showError("Invalid code");
      return;
    }
    try {
      setIsLoading(true);

      await post("2fa-auth/verify-enable", {
        code: values.pin,
      });

      setIsGoogleAuthenticatorEnabled(true);
      showSuccess("2FA enabled sunccessfully");
      navigation.goBack();
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message ||
          "Google Authentication failed. Try again.";
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <AppText style={styles.title}>Complete 2FA Setup</AppText>
          <AppText style={styles.subtitle}>
            Finalize your account security by entering the code from your
            authenticator app
          </AppText>
        </View>

        <OtpInputField control={control} name="pin" boxes={6} />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(handleVerifyCodeAndEnable2FA)}
        >
          <AppText style={styles.buttonText}>Set Pin</AppText>
        </TouchableOpacity>
      </ScrollView>

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    button: {
      marginTop: 30,
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 80,
    },
    buttonText: {
      color: "#fff",
      textAlign: "center",
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
    },
    subtitle: {
      fontFamily: getFontFamily("400"),
      fontSize: normalize(18),
      textAlign: "left",
      color: colors.textMuted,
      lineHeight: 18,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    header: {
      marginBottom: 23,
    },
    title: {
      fontFamily: getFontFamily("800"),
      fontSize: normalize(20),
      color: colors.text,
    },
    highlight: {
      color: colors.primary,
    },
  });
