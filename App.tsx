import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import NavigationRoot from "./app/navigation/Navigation";
import SplashScreen from "./app/screens/SplashScreen";
import { RootSiblingParent } from "react-native-root-siblings";
import { useEffect, useState } from "react";
import { useAuthStore } from "./app/stores/authSlice";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./app/libs/queryClient";

function App() {
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
