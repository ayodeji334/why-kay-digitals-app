import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { formatAmount } from "../libs/formatNumber";

const PendingSwapScreen = () => {
  const navigation: any = useNavigation();
  const route = useRoute();
  const { transaction }: any = route.params;

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Dashboard" as never }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.content}>
        <Image source={require("../assets/success.png")} style={styles.icon} />
        <Text style={styles.title}>Transaction Submitted</Text>
        <Text style={styles.message}>
          Your swap of{" "}
          {formatAmount(Number(transaction?.meta?.amount), false, "USD")} worth
          of {transaction?.meta?.asset_symbol} to{" "}
          {transaction?.meta?.to_asset_symbol} has been submitted. You’ll be
          notified once we have an update.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 29,
  },
  icon: { width: 80, height: 80, marginBottom: 20 },
  title: {
    fontSize: normalize(22),
    fontFamily: getFontFamily("800"),
    color: COLORS.primary,
    marginBottom: 12,
  },
  message: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: COLORS.primary,
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
    color: "#93C5FD",
  },
});

export default PendingSwapScreen;
