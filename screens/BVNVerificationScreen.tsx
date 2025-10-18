import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BVNForm from "../components/forms/BVNVerificationForm";
import { getFontFamily, normalize } from "../constants/settings";

export default function BVNVerificationScreen() {
  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          We'll match your BVN details with a live selfie to confirm your
          identity. This process is quick and secure.
        </Text>

        <View style={styles.formSection}>
          <BVNForm />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 18,
    backgroundColor: "white",
  },
  subtitle: {
    fontSize: normalize(18),
    color: "#666",
    fontFamily: getFontFamily(700),
    paddingVertical: 20,
  },
  formSection: {
    marginBottom: 32,
  },
});
