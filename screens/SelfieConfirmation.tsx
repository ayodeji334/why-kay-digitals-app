import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import ReactNativeBlobUtil from "react-native-blob-util";
import useAxios from "../hooks/useAxios";
import { showError } from "../utlis/toast";
import { useAuthStore } from "../stores/authSlice";
import CustomLoading from "../components/CustomLoading";

export default function SelfieConfirmationScreen() {
  const route = useRoute();
  const navigation: any = useNavigation();
  const { image }: any = route.params;
  const axiosInstance = useAxios();
  const setUser = useAuthStore(state => state.setUser);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRetake = () => {
    navigation.goBack();
  };

  async function convertImageToBase64(imagePath: string): Promise<string> {
    try {
      const base64String = await ReactNativeBlobUtil.fs.readFile(
        imagePath,
        "base64",
      );
      return base64String;
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw error;
    }
  }
  const errorMessage =
    "Unable to process selfie verification. Kindly try again after some minutes";

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      const base64Image = await convertImageToBase64(image.path);

      if (!base64Image) {
        showError(errorMessage);
      }

      const payload = {
        image: base64Image,
      };

      const response = await axiosInstance.post("/kyc/verify-selfie", payload);

      setUser(response.data.user ?? null);
      navigation.navigate("Verification");
    } catch (err: any) {
      console.log(err?.response?.data);
      showError(err?.response?.data?.message ?? errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["bottom", "left"]} style={styles.container}>
      {/* <Text style={styles.title}>Confirm Your Selfie</Text> */}

      <Image
        source={{ uri: `file://${image.path}` }}
        style={styles.previewImage}
        resizeMode="cover"
      />

      <Text style={styles.instructions}>
        Make sure your face is clearly visible and centered. If you're happy
        with this photo, continue with verification.
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
          <Text style={styles.buttonText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.buttonText}>Use This Photo</Text>
        </TouchableOpacity>
      </View>

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  title: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("800"),
    textAlign: "center",
    marginBottom: 16,
  },
  previewImage: {
    width: "100%",
    height: 400,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructions: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: "#eb1515ff",
    paddingVertical: 14,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
});
