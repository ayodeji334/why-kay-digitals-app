import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import NINVerificationForm from "../components/forms/NINVerificationForm";

export default function IdentityVerificationScreen() {
  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          We'll authenticate your National Identification Number (NIN) by
          matching it with a live selfie for secure identity verification. This
          process ensures regulatory compliance and account security.
        </Text>

        <View style={styles.formSection}>
          <NINVerificationForm />
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
    fontSize: normalize(14),
    fontWeight: "400",
    color: "#666",
    fontFamily: getFontFamily(500),
    paddingVertical: 20,
  },
  formSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  helpLink: {
    marginTop: 12,
  },
  helpText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#007AFF",
    textAlign: "center",
  },
  infoSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  bulletList: {
    gap: 12,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 16,
    color: "#666",
    marginRight: 8,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "400",
    color: "#666",
    lineHeight: 20,
  },
  spacer: {
    height: 100,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
});
