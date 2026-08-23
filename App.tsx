import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import NavigationRoot from "./navigation/Navigation";
import SplashScreen from "./screens/SplashScreen";
import ToastHost from "./components/ToastHost";
import { useEffect, useState } from "react";
import { useAuthStore } from "./stores/authSlice";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./libs/queryClient";
import { OneSignal, LogLevel } from "react-native-onesignal";
import { Text, TextInput } from "react-native";
import { ONE_SIGNAL_ID } from "./config";
import { refreshBiometricState } from "./stores/biometricSlice";
import { useBiometricPromptStore } from "./stores/biometricPromptSlice";

// remove logs from production build
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// Disable dynamic type scaling globally
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.allowFontScaling = false;

function App() {
  OneSignal.Debug.setLogLevel(LogLevel.Verbose);
  OneSignal.initialize(ONE_SIGNAL_ID);
  OneSignal.Notifications.requestPermission(false);

  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
      <ToastHost />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
      default: "System",
    }),
  },
});

// function MainApp() {
//   const [isLoading, setIsLoading] = useState(true);
//   const initializeAuth = useAuthStore(state => state.initializeAuth);

//   useEffect(() => {
//     const initializeApp = async () => {
//       await initializeAuth();
//       setIsLoading(false);
//     };

//     initializeApp();
//   }, [initializeAuth]);

//   if (isLoading) {
//     return <SplashScreen />;
//   }

//   return (
//     <SafeAreaProvider>
//       <View style={styles.container}>
//         <NavigationRoot />
//       </View>
//     </SafeAreaProvider>
//   );
// }

function MainApp() {
  const [isLoading, setIsLoading] = useState(true);
  const initializeAuth = useAuthStore(state => state.initializeAuth);

  useEffect(() => {
    const initializeApp = async () => {
      // Auth first — the prompt store keys off user.uuid, so it can't
      // hydrate until the user record is in the store.
      await initializeAuth();

      await Promise.all([
        refreshBiometricState(),
        useBiometricPromptStore.getState().hydrate(),
      ]);

      setIsLoading(false);
    };

    initializeApp();
  }, [initializeAuth]);

  if (isLoading) return <SplashScreen />;

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <NavigationRoot />
      </View>
    </SafeAreaProvider>
  );
}

export default App;
