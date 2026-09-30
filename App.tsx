import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import NavigationRoot from "./navigation/Navigation";
import SplashScreen from "./screens/SplashScreen";
import ToastHost from "./components/ToastHost";
import { useEffect, useState } from "react";
import { authHydration, useAuthStore } from "./stores/authSlice";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./libs/queryClient";
import { OneSignal, LogLevel } from "react-native-onesignal";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemedStatusBar } from "./components/AppStatusBar";
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
      {/* Last-resort safety net for crashes outside a screen (providers,
          navigator); screens have their own boundary in Navigation.tsx. */}
      <ErrorBoundary
        title="Something went wrong"
        message="WhyKay ran into an unexpected problem. Tap Try again to reload."
      >
        <MainApp />
      </ErrorBoundary>
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

function MainApp() {
  const [isLoading, setIsLoading] = useState(true);
  const initializeAuth = useAuthStore(state => state.initializeAuth);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const userUuid = useAuthStore(state => state.user?.uuid);

  // Link this device's push subscription to the account (OneSignal
  // external_id). Runs on every app start once the user is known and on
  // every login / account switch, as OneSignal recommends. The backend can
  // then target the user by external_id, which survives OneSignal id changes.
  // There's deliberately no OneSignal.logout() on sign-out, so the device
  // keeps receiving the account's notifications until another account logs in.
  useEffect(() => {
    if (isAuthenticated && userUuid) {
      OneSignal.login(userUuid);
    }
  }, [isAuthenticated, userUuid]);

  useEffect(() => {
    const initializeApp = async () => {
      // Auth first — the prompt store keys off user.uuid, so it can't
      // hydrate until the user record is in the store. The session itself is
      // read from the Keychain asynchronously, so wait for it first — checking
      // auth before it loads would see no token and log the user out.
      await authHydration;
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
      <ThemedStatusBar />
      <View style={styles.container}>
        <NavigationRoot />
      </View>
    </SafeAreaProvider>
  );
}

export default App;
