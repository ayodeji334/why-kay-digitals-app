import React from "react";
import {
  View,
  Text,
  StyleSheet,
  // Image,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { formatAmount } from "../libs/formatNumber";
import { ArrowLeft, ArrowRight } from "iconsax-react-nativejs";

const PendingSwapScreen = () => {
  const navigation: any = useNavigation();
  const route = useRoute();
  const { transaction }: any = route.params;

  console.log(transaction);

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Dashboard" as never }],
    });
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
              <ArrowRight size={20} color="#333" />
              <ArrowLeft size={20} color="#333" />
            </View>
            <Image
              source={{ uri: transaction?.to_asset_logo }}
              style={{ width: 35, height: 35, borderRadius: 25 }}
            />
          </View>
          <Text style={styles.title}>Transaction Processing</Text>
          <Text style={styles.message}>
            Your swap of{" "}
            {formatAmount(Number(transaction?.meta?.amount), {
              currency: "USD",
            })}{" "}
            worth of {transaction?.meta?.asset_symbol} to{" "}
            {transaction?.meta?.to_asset_symbol} is currently being processed.
            We’ll notify you as soon as there is an update.
          </Text>
        </View>

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
    justifyContent: "space-between",
    padding: 20,
  },
  icon: { width: 80, height: 80, marginBottom: 20 },
  title: {
    fontSize: normalize(22),
    fontFamily: getFontFamily("800"),
    color: COLORS.dark,
    marginBottom: 12,
  },
  message: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
    textAlign: "center",
    paddingHorizontal: 20,
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
