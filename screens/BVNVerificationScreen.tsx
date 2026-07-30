import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  // TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BVNForm from "../components/forms/BVNVerificationForm";
import { getFontFamily, normalize } from "../constants/settings";
// import { useUser } from "../stores/authSlice";
import { COLORS } from "../constants/colors";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
// import { useNavigation } from "@react-navigation/native";

export default function BVNVerificationScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  // const user = useUser();
  // const navigation = useNavigation();
  // const isProfileComplete = !!user?.first_name && !!user?.last_name;

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* {!isProfileComplete ? (
          <View style={styles.infoSection}>
            <App={stAppTextyles.subtitle}>
              To verify your NIN, please update your profile with the same first
              name and last name used for your NIN or BVN.
            </App=>
            <App={stAppTextyles.bulletText}>
              Go to the Edit Profile screen to complete your details.
            </App=>

            <TouchableOpacity
              activeOpacity={0.89}
              style={styles.editButton}
              onPress={() => navigation.navigate("EditProfile" as never)}
            >
              <App={stAppTextyles.editButtonText}>Go to Edit Profile</App=>
            </TouchableOpacity>
          </View>
        ) : ( */}
        <>
          <AppText style={styles.subtitle}>
            We'll match your BVN details with a live selfie to confirm your
            identity. This process is quick and secure.
          </AppText>
          <View style={styles.formSection}>
            <BVNForm />
          </View>
        </>
        {/* )} */}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flexGrow: 1,
      paddingHorizontal: 20,
      backgroundColor: colors.background,
    },
    subtitle: {
      fontSize: normalize(18),
      color: colors.text,
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
      // lineHeight: 20,
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
