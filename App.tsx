import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import NavigationRoot from "./navigation/Navigation";
import SplashScreen from "./screens/SplashScreen";
import { RootSiblingParent } from "react-native-root-siblings";
import { useEffect, useState } from "react";
import { useAuthStore } from "./stores/authSlice";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./libs/queryClient";
import { OneSignal, LogLevel } from "react-native-onesignal";
// remove logs
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

function App() {
  OneSignal.Debug.setLogLevel(LogLevel.Verbose);
  // Initialize with your OneSignal App ID
  OneSignal.initialize("c78f896b-eca6-4a03-9a1d-f49da347bf1d");
  // Use this method to prompt for push notifications.
  // We recommend removing this method after testing and instead use In-App Messages to prompt for notification permission.
  OneSignal.Notifications.requestPermission(false);

  return (
    <QueryClientProvider client={queryClient}>
      <RootSiblingParent>
        <MainApp />
      </RootSiblingParent>
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

  useEffect(() => {
    const initializeApp = async () => {
      await initializeAuth();
      setIsLoading(false);
    };

    initializeApp();
  }, [initializeAuth]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <NavigationRoot />
      </View>
    </SafeAreaProvider>
  );
}

export default App;
