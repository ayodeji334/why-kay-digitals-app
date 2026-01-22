import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import NINVerificationForm from "../components/forms/NINVerificationForm";
import { useUser } from "../stores/authSlice";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants/colors";

export default function IdentityVerificationScreen() {
  const user = useUser();
  const navigation = useNavigation();

  const isProfileComplete = !!user?.first_name && !!user?.last_name;

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {!isProfileComplete ? (
          <View style={styles.infoSection}>
            <Text style={styles.subtitle}>
              To verify your NIN, please update your profile with the same first
              name and last name used for your NIN or BVN.
            </Text>
            <Text style={styles.bulletText}>
              Go to the Edit Profile screen to complete your details.
            </Text>

            <TouchableOpacity
              activeOpacity={0.89}
              style={styles.editButton}
              onPress={() => navigation.navigate("EditProfile" as never)}
            >
              <Text style={styles.editButtonText}>Go to Edit Profile</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              We'll authenticate your National Identification Number (NIN) by
              matching it with a live selfie for secure identity verification.
              This process ensures regulatory compliance and account security.
            </Text>

            <View style={styles.formSection}>
              <NINVerificationForm />
            </View>
          </>
        )}
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
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  subtitle: {
    fontSize: normalize(18),
    color: "black",
    fontFamily: getFontFamily(700),
    paddingVertical: 20,
  },
  formSection: {
    marginBottom: 32,
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  bulletText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 80,
    alignItems: "center",
    marginTop: 30,
  },
  editButtonText: {
    color: "#FFF",
    fontSize: normalize(16),
    fontFamily: getFontFamily(700),
  },
});
