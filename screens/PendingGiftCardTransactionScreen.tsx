import React from "react";
import { View, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { AppText } from "../components/AppText";
import { Activity } from "iconsax-react-nativejs";

const PendingGiftCardScreen = () => {
  const navigation: any = useNavigation();
  const route = useRoute();
  const { transaction }: any = route.params;

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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.content}>
        <View style={{ alignItems: "center", paddingTop: 40 }}>
          <Activity size={48} color={COLORS.primary} variant="Bold" />
          {/* <Image
            source={{ uri: transaction?.meta?.offer_snapshot?.brand_logo }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              marginBottom: 20,
            }}
          /> */}
          <AppText style={styles.title}>Gift Card Processing</AppText>
          <AppText style={styles.message}>
            Your purchase of {transaction?.meta?.quantity} ×{" "}
            {transaction?.meta?.offer_snapshot?.brand_name} gift card(s) is
            currently being processed. We’ll notify you as soon as your vouchers
            are available.
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  title: {
    fontSize: normalize(22),
    fontFamily: getFontFamily("900"),
    color: COLORS.dark,
    marginVertical: 12,
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
    marginVertical: 12,
    width: "100%",
  },
  buttonText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#fff",
    textAlign: "center",
  },
});

export default PendingGiftCardScreen;
