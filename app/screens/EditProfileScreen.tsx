import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import {
  CameraOptions,
  launchCamera,
  launchImageLibrary,
} from "react-native-image-picker";
import { showError, showSuccess } from "../utlis/toast";
import TextInputField from "../components/TextInputField";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CardEdit } from "iconsax-react-nativejs";
import { SelectInput } from "../components/SelectInputField";
import { normalize } from "../constants/settings";
import CustomLoading from "../components/CustomLoading";
import useAxios, { BASE_URL } from "../api/axios";
import { useAuthStore } from "../stores/authSlice";
import { useNavigation } from "@react-navigation/native";

const profileSchema = yup.object().shape({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  username: yup.string().required("Username is required"),
  gender: yup.string().required("Gender is required"),
  phone_number: yup
    .string()
    .matches(
      /^234\d{10}$/,
      "Phone number must start with 234 and be followed by 10 digits",
    )
    .required("Phone number is required"),
});

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, setUser, token } = useAuthStore(state => state);
  const { patch, post } = useAxios();
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(user?.profile_picture);

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      username: user?.username || "",
      gender: user?.gender || "",
      phone_number: user?.phone_number || "",
    },
  });

  // const handleUpdateProfile = async (data: any) => {
  //   setLoading(true);

  //   try {
  //     // Upload the image if it exists
  //     let uploadedImageUrl = imageUri;

  //     const formData = new FormData();

  //     formData.append("file", {
  //       uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
  //       type: "image/jpeg",
  //       name: `profile_${Date.now()}.jpg`,
  //     } as any);

  //     const res = await fetch(`${BASE_URL}/files/upload`, {
  //       method: "POST",
  //       body: formData,
  //       headers: {
  //         Accept: "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     const result = await res.json();

  //     if (res.ok && result?.success && result?.data?.url) {
  //       uploadedImageUrl = result.data.url;
  //     } else {
  //       console.log("Upload failed:", result);
  //       showError(result?.message || "Failed to upload image");
  //       setLoading(false);
  //       return;
  //     }
  //     // Update profile with uploaded image URL
  //     const response = await patch("/users/update-user-profile", {
  //       ...data,
  //       profile_picture_url: uploadedImageUrl,
  //     });

  //     if (response.data?.success) {
  //       if (response?.data?.data) {
  //         setUser(response.data?.data);
  //       }
  //       showSuccess("Profile updated successfully");
  //       navigation.goBack();
  //     } else {
  //       showError(response.data?.message || "Failed to update profile");
  //     }
  //   } catch (error: any) {
  //     console.log(error?.response);
  //     if (error.response) {
  //       showError(
  //         error.response.data?.message ||
  //           "An error occurred while updating profile",
  //       );
  //     } else if (error.request) {
  //       showError(
  //         "No response from server. Please check your internet connection.",
  //       );
  //     } else {
  //       showError("Something went wrong. Please try again.");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleUpdateProfile = async (data: any) => {
    setLoading(true);

    try {
      let uploadedImageUrl = imageUri;

      if (imageUri) {
        const formData = new FormData();
        formData.append("file", {
          uri: uploadedImageUrl,
          type: "image/jpeg",
          name: `profile_${Date.now()}.jpg`,
        } as any);

        console.log("FormData: ", formData);

        const res = await post(`${BASE_URL}/files/upload`, formData, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
            // "cache-control": "no-cache",
          },
        });

        const result = res.data;
        console.log("Upload result:", result);

        if (result?.success && result?.data?.secure_url) {
          uploadedImageUrl = result.data.secure_url;
        } else {
          showError(result?.message || "Failed to upload image");
          setLoading(false);
          return;
        }
      }

      const response = await patch("/users/update-user-profile", {
        ...data,
        profile_picture_url: uploadedImageUrl,
      });

      if (response.data?.success) {
        setUser(response.data?.data);
        showSuccess("Profile updated successfully");
        navigation.goBack();
      } else {
        showError(response.data?.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.log("Upload error:", error.response?.data || error.message);
      showError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const options: CameraOptions = {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      };

      launchImageLibrary(options, response => {
        if (response.didCancel) return;
        if (response.errorCode)
          return showError(response.errorMessage ?? "Failed to pick image");

        if (response.assets && response.assets[0].uri) {
          const uri = response.assets[0].uri;
          setImageUri(uri);
        }
      });
    } catch (error) {
      showError("Failed to pick image");
    }
  };

  const takePhoto = async () => {
    try {
      const options: CameraOptions = {
        mediaType: "photo",
        includeBase64: false,
        saveToPhotos: true,
      };

      launchCamera(options, response => {
        if (response.didCancel) return;
        if (response.errorCode)
          return showError(response.errorMessage ?? "Failed to take photo");

        if (response.assets && response.assets[0].uri) {
          setImageUri(response.assets[0].uri);
        }
      });
    } catch (error) {
      showError("Failed to take photo");
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert("Update Profile Picture", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Gallery", onPress: handleImagePick },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profilePictureSection}>
          <View>
            <Image
              source={{
                uri: imageUri || user?.profile_picture || "",
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              // onPress={showImagePickerOptions}
              style={styles.changePhotoText}
            >
              <CardEdit size={16} color={COLORS.primary} />
            </TouchableOpacity>

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
            // error={errors.first_name?.message}
          />
          <TextInputField
            label="Last Name"
            control={control}
            name="last_name"
            placeholder="Enter last name"
            // error={errors.last_name?.message}
          />
          <TextInputField
            label="Username"
            control={control}
            name="username"
            placeholder="Choose a username"
            // error={errors.username?.message}
          />
          <SelectInput
            control={control}
            name="gender"
            label="Gender"
            options={[
              { label: "Male", value: "MALE" },
              { label: "Female", value: "FEMALE" },
            ]}
            // error={errors.gender?.message}
          />
          <TextInputField
            label="Phone Number"
            control={control}
            name="phone_number"
            placeholder="234XXXXXXXXXX"
            // error={errors.phone_number?.message}
          />
        </View>

        <TouchableOpacity
          style={[styles.updateButton, loading && styles.updateButtonDisabled]}
          onPress={handleSubmit(handleUpdateProfile)}
          disabled={loading}
        >
          <Text style={styles.updateButtonText}>Update Profile</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomLoading loading={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scrollView: { flex: 1 },
  profilePictureSection: { alignItems: "center", padding: 20 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e7e7e7",
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
    padding: 6,
  },
  formSection: { padding: 20 },
  updateButton: {
    backgroundColor: COLORS.secondary,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 48,
    alignItems: "center",
  },
  updateButtonDisabled: { opacity: 0.6 },
  updateButtonText: {
    color: "black",
    fontSize: normalize(12),
    fontWeight: "600",
  },
});
