import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { showError, showSuccess } from "../utlis/toast";
import TextInputField from "../components/TextInputField";
import * as yup from "yup";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { SelectInput } from "../components/SelectInputField";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import CustomLoading from "../components/CustomLoading";
import { useAuthStore } from "../stores/authSlice";
import { useNavigation } from "@react-navigation/native";
import useAxios from "../hooks/useAxios";
import { LONG_REQUEST_TIMEOUT_MS } from "../api/axios";
import { AppText } from "../components/AppText";
import { DEFAULT_IMAGE } from "./SettingsScreen";
import { useColors } from "../hooks/useTheme";
import { useStyles } from "../hooks/useStyles";
import { useUsernameAvailability } from "../hooks/useUsernameAvailability";

const profileSchema = yup.object().shape({
  first_name: yup.string().required("First Name is required"),
  last_name: yup.string().required("Last Name is required"),
  // Same rules as registration.
  username: yup
    .string()
    .trim()
    .min(5, "Your username is too short")
    .max(30, "Your username is too long")
    .required("Username is required"),
  gender: yup.string().required("Gender is required"),
});

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useAuthStore(state => state);
  const { patch } = useAxios();
  const [loading, setLoading] = useState(false);
  const styles = useStyles(makeStyles);

  const { control, handleSubmit, setError, clearErrors } = useForm({
    resolver: yupResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      username: user?.username || "",
      gender: user?.gender || "",
    },
  });

  // Same availability check as registration; the user's current username is
  // always allowed, so saving other fields doesn't need a check.
  const username = useWatch({ control, name: "username" });
  const {
    isChecking: checkingUsername,
    status: usernameStatus,
    isBlocking: usernameBlocksSubmit,
  } = useUsernameAvailability({
    username,
    currentUsername: user?.username,
    setError,
    clearErrors,
  });

  const disableSubmit = loading || usernameBlocksSubmit;

  const handleUpdateProfile = async (data: any) => {
    // The button is disabled while checking, but guard the submit path too.
    if (usernameBlocksSubmit) return;
    setLoading(true);

    try {
      const response = await patch(
        "/users/update-user-profile",
        {
          ...data,
        },
        { timeout: LONG_REQUEST_TIMEOUT_MS },
      );

      if (response.data?.success) {
        setUser(response.data?.data);
        showSuccess("Profile updated successfully");
        navigation.goBack();
      } else {
        showError(response.data?.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.log("Upload error:", error.response?.data || error.message);
      showError(
        error.response?.data?.message ?? "An error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.profilePictureSection}>
          <View>
            <View style={styles.imageWrapper}>
              <Image
                source={
                  user?.selfie_url
                    ? {
                        uri: `data:image/png;base64,${user?.selfie_url}`,
                      }
                    : DEFAULT_IMAGE
                }
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>

            {loading && (
              <View style={styles.imageOverlay}>
                <ActivityIndicator color="white" />
              </View>
            )}
          </View>
        </View>

        <View style={styles.formSection}>
          <TextInputField
            label="First Name"
            control={control}
            name="first_name"
            placeholder="Enter first name"
            isEditable={false}
          />
          <TextInputField
            label="Last Name"
            control={control}
            name="last_name"
            placeholder="Enter last name"
            isEditable={false}
          />
          <TextInputField
            label="Username"
            control={control}
            name="username"
            placeholder="Choose a username"
          />
          {checkingUsername && (
            <AppText style={styles.checkingText}>
              Checking availability...
            </AppText>
          )}
          {/* The field already shows errors such as "Username is already
              taken", so this line only shows the success / couldn't-check state. */}
          {!checkingUsername &&
            usernameStatus.message &&
            usernameStatus.available !== false && (
              <AppText style={[styles.checkingText, styles.usernameAvailable]}>
                {usernameStatus.message}
              </AppText>
            )}
          {!checkingUsername &&
            usernameStatus.available === false &&
            usernameStatus.message === "Couldn't check that username" && (
              <AppText style={[styles.checkingText, styles.usernameTaken]}>
                {usernameStatus.message}. Please try again.
              </AppText>
            )}
          <SelectInput
            control={control}
            name="gender"
            label="Gender"
            options={[
              { label: "Male", value: "MALE" },
              { label: "Female", value: "FEMALE" },
            ]}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.87}
          style={[
            styles.updateButton,
            disableSubmit && styles.updateButtonDisabled,
          ]}
          onPress={handleSubmit(handleUpdateProfile)}
          disabled={disableSubmit}
        >
          <AppText style={styles.updateButtonText}>Update Profile</AppText>
        </TouchableOpacity>
      </ScrollView>

      <CustomLoading loading={loading} />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollView: { flexGrow: 1 },
    profilePictureSection: {
      alignItems: "center",
      padding: normalizeSpacing(20),
    },
    imageWrapper: {
      width: 70,
      height: 70,
      borderRadius: 2500,
      marginRight: normalizeSpacing(12),
      overflow: "hidden",
      padding: normalizeSpacing(5),
      backgroundColor: colors.text,
    },
    profileImage: {
      width: "100%",
      height: "100%",
    },
    imageOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    changePhotoText: {
      backgroundColor: "#F9FAFB",
      position: "absolute",
      borderRadius: 60,
      right: 0,
      padding: normalizeSpacing(6),
    },
    formSection: { padding: normalizeSpacing(20) },
    updateButton: {
      backgroundColor: COLORS.secondary,
      marginHorizontal: normalizeSpacing(20),
      marginTop: normalizeSpacing(20),
      marginBottom: normalizeSpacing(30),
      paddingVertical: normalizeSpacing(14),
      borderRadius: 48,
      alignItems: "center",
    },
    updateButtonDisabled: { opacity: 0.6 },
    checkingText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      marginTop: normalizeSpacing(-5),
      marginBottom: normalizeSpacing(10),
      color: colors.textSecondary,
    },
    usernameAvailable: { color: colors.primaryLight },
    usernameTaken: { color: colors.error },
    updateButtonText: {
      color: "white",
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
    },
  });
