import { StatusBar, StyleSheet, useColorScheme, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import NavigationRoot from "./app/navigation/Navigation";
import SplashScreen from "./app/screens/SplashScreen";
import { RootSiblingParent } from "react-native-root-siblings";
import { AuthProvider, useAuth } from "./app/context/AppContext";

function App() {
  return (
    <RootSiblingParent>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </RootSiblingParent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

function MainApp() {
  const isDarkMode = useColorScheme() === "dark";
  const { isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={styles.container}>
        <NavigationRoot />
      </View>
    </SafeAreaProvider>
  );
}

export default App;
