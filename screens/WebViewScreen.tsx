import React, { useState } from "react";
import {
  StyleSheet,
  View,
  StatusBar,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { COLORS } from "../constants/colors";
import { InfoCircle } from "iconsax-react-nativejs";
import { getFontFamily } from "../constants/settings";

interface WebPageScreenProps {
  route: {
    params: {
      url: string;
    };
  };
}

export default function WebPageScreen({ route }: WebPageScreenProps) {
  const { url } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleRetry = () => {
    setError(false);
    setLoading(true);
  };

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {error ? (
        <View style={styles.errorContainer}>
          {/* Icon */}
          <View style={styles.errorIconContainer}>
            <InfoCircle size={60} color={COLORS.error} variant="Bold" />
          </View>

          {/* Title */}
          <Text style={styles.errorTitle}>Page Load Failed</Text>

          {/* Description */}
          <Text style={styles.errorText}>
            Oops! Something went wrong while loading the page. Please check your
            internet connection or try again later.
          </Text>

          {/* Retry Button */}
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {loading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}
          <WebView
            source={{ uri: url }}
            onHttpError={e => console.log(e)}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={event => {
              console.log(event);
              setLoading(false);
              setError(true);
            }}
            style={{ flex: 1 }}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.dark,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  errorIconContainer: {
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    fontFamily: getFontFamily("700"),
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: getFontFamily("700"),
  },
});
