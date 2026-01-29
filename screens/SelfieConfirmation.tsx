// import React, { useState } from "react";
// import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { getFontFamily, normalize } from "../constants/settings";
// import { COLORS } from "../constants/colors";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import ReactNativeBlobUtil from "react-native-blob-util";
// import useAxios from "../hooks/useAxios";
// import { showError, showSuccess } from "../utlis/toast";
// import { useAuthStore } from "../stores/authSlice";
// import CustomLoading from "../components/CustomLoading";

// export default function SelfieConfirmationScreen() {
//   const route = useRoute();
//   const navigation: any = useNavigation();
//   const { image }: any = route.params;
//   const axiosInstance = useAxios();
//   const setUser = useAuthStore(state => state.setUser);
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   const handleRetake = () => {
//     navigation.goBack();
//   };

//   async function convertImageToBase64(imagePath: string): Promise<string> {
//     try {
//       const base64String = await ReactNativeBlobUtil.fs.readFile(
//         imagePath,
//         "base64",
//       );
//       return base64String;
//     } catch (error) {
//       console.error("Error converting image to base64:", error);
//       throw error;
//     }
//   }
//   const errorMessage =
//     "Unable to process selfie verification. Kindly try again after some minutes";

//   const handleConfirm = async () => {
//     try {
//       setIsLoading(true);
//       const base64Image = await convertImageToBase64(image.path);

//       if (!base64Image) {
//         showError(errorMessage);
//       }

//       const payload = {
//         image: base64Image,
//       };

//       const response = await axiosInstance.post("/kyc/verify-selfie", payload);
//       console.log(response?.data);

//       setUser(response.data.data?.user ?? null);
//       navigation.navigate("Verification");

//       showSuccess("Selfie Verified successfully");
//     } catch (err: any) {
//       console.log(err?.response?.data);
//       showError(err?.response?.data?.message ?? errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView edges={["bottom", "left"]} style={styles.container}>
//       <Image
//         source={{ uri: `file://${image.path}` }}
//         style={styles.previewImage}
//         resizeMode="cover"
//       />

//       <Text style={styles.instructions}>
//         Make sure your face is clearly visible and centered. If you're happy
//         with this photo, continue with verification.
//       </Text>

//       <View style={styles.buttonRow}>
//         <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
//           <Text style={styles.buttonText}>Retake</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
//           <Text style={styles.buttonText}>Use This Photo</Text>
//         </TouchableOpacity>
//       </View>

//       <CustomLoading loading={isLoading} />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     paddingHorizontal: 20,
//     paddingTop: 0,
//   },
//   title: {
//     fontSize: normalize(20),
//     fontFamily: getFontFamily("800"),
//     textAlign: "center",
//     marginBottom: 16,
//   },
//   previewImage: {
//     width: "100%",
//     height: 400,
//     borderRadius: 12,
//     marginBottom: 20,
//   },
//   instructions: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("700"),
//     color: "#000",
//     textAlign: "center",
//     marginBottom: 24,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 20,
//   },
//   retakeButton: {
//     flex: 1,
//     backgroundColor: "#eb1515ff",
//     paddingVertical: 14,
//     borderRadius: 10,
//     marginRight: 10,
//     alignItems: "center",
//   },
//   confirmButton: {
//     flex: 1,
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     borderRadius: 10,
//     marginLeft: 10,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("700"),
//   },
// });
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
import { CloseCircle, TickCircle } from "iconsax-react-nativejs";
import IdentityVerifying from "../components/IdentityVerifying";

export default function SelfieConfirmationScreen() {
  const route = useRoute();
  const navigation: any = useNavigation();
  const { image }: any = route.params;
  const axiosInstance = useAxios();
  const setUser = useAuthStore(state => state.setUser);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleRetake = () => {
    navigation.replace("SelfieVerification");
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
        setStatus("error");
        return;
      }

      const payload = { image: base64Image };
      const response = await axiosInstance.post("/kyc/verify-selfie", payload);

      setStatus("success");
      setUser(response.data.data?.user);
    } catch (err: any) {
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {isLoading ? (
        <IdentityVerifying loading={isLoading} />
      ) : status === "success" ? (
        <View style={styles.statusContent}>
          <View
            style={{
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <TickCircle size={40} color={COLORS.primary} variant="Bold" />
            <Text style={styles.statusTitle}>Verification Complete</Text>
            <Text style={styles.statusDescription}>
              Your identity has been successfully verified. You now have full
              access to upgrade your account and increase your transaction
              limits.
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.confirmButton, { marginLeft: 0, width: "100%" }]}
            onPress={() => navigation.replace("Verification")}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      ) : status === "error" ? (
        // ERROR STATE
        <View style={styles.statusContent}>
          <View
            style={{
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <CloseCircle size={40} color="#FF4D4D" variant="Bold" />
            <Text style={styles.statusTitle}>Verification Failed</Text>
            <Text style={styles.statusDescription}>
              We couldn't get a clear match of your face. Please ensure you are
              in a well-lit area and your face is fully centered in the frame.
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.retakeButton}
            onPress={handleRetake}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // IDLE STATE
        <View style={styles.idleContent}>
          <Image
            source={{ uri: `file://${image.path}` }}
            style={styles.previewImage}
            resizeMode="cover"
          />
          <Text style={styles.instructions}>
            Make sure your face is clearly visible and centered.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.retakeButton, { flex: 1 }]}
              onPress={handleRetake}
            >
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.confirmButton, { flex: 1 }]}
              onPress={handleConfirm}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );

  // return (
  //   <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
  //     <IdentityVerificationScreen loading={isLoading} />

  //     {/* SUCCESS STATE */}
  //     {!isLoading && status === "success" && (
  //       <View style={styles.statusContent}>
  //         <View>
  //           <TickCircle size={80} color={COLORS.primary} variant="Bold" />
  //           <Text style={styles.statusTitle}>Verification Complete</Text>
  //           <Text style={styles.statusDescription}>
  //             Your identity has been successfully verified. You now have full
  //             access to upgrade your account and increase your transaction
  //             limits.
  //           </Text>
  //           <TouchableOpacity
  //             style={[styles.confirmButton, { marginLeft: 0, width: "100%" }]}
  //             onPress={() => navigation.navigate("Verification")}
  //           >
  //             <Text style={styles.buttonText}>Continue to Dashboard</Text>
  //           </TouchableOpacity>
  //         </View>
  //       </View>
  //     )}

  //     {/* ERROR STATE */}
  //     {!isLoading && status === "error" && (
  //       <View style={styles.statusContent}>
  //         <View
  //           style={{
  //             justifyContent: "center",
  //             alignItems: "center",
  //           }}
  //         >
  //           <CloseCircle size={40} color="#FF4D4D" variant="Bold" />
  //           <Text style={styles.statusTitle}>Verification Failed</Text>
  //           <Text style={styles.statusDescription}>
  //             We couldn't get a clear match of your face. Please ensure you are
  //             in a well-lit area and your face is fully centered in the frame.
  //           </Text>
  //         </View>
  //         <View>
  //           <TouchableOpacity
  //             activeOpacity={0.8}
  //             style={[styles.retakeButton]}
  //             onPress={handleRetake}
  //           >
  //             <Text style={styles.buttonText}>Try Again</Text>
  //           </TouchableOpacity>
  //         </View>
  //       </View>
  //     )}

  //     {!isLoading && status === "idle" && (
  //       <View style={styles.idleContent}>
  //         <Image
  //           source={{ uri: `file://${image.path}` }}
  //           style={styles.previewImage}
  //           resizeMode="cover"
  //         />

  //         <Text style={styles.instructions}>
  //           Make sure your face is clearly visible and centered.
  //         </Text>

  //         <View style={styles.buttonRow}>
  //           <TouchableOpacity
  //             activeOpacity={0.8}
  //             style={[styles.retakeButton, { flex: 1 }]}
  //             onPress={handleRetake}
  //           >
  //             <Text style={styles.buttonText}>Retake</Text>
  //           </TouchableOpacity>

  //           <TouchableOpacity
  //             activeOpacity={0.8}
  //             style={[styles.confirmButton, { flex: 1 }]}
  //             onPress={handleConfirm}
  //           >
  //             <Text style={styles.buttonText}>Confirm</Text>
  //           </TouchableOpacity>
  //         </View>
  //       </View>
  //     )}
  //   </SafeAreaView>
  // );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  idleContent: {
    flex: 1,
    paddingTop: 20,
  },
  statusContent: {
    flex: 1,
    alignContent: "center",
    justifyContent: "space-between",
    paddingBottom: 60,
    paddingTop: 30,
  },
  previewImage: {
    width: "100%",
    height: "60%",
    borderRadius: 24,
    marginBottom: 24,
  },
  instructions: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000000ff",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
  },
  retakeButton: {
    backgroundColor: "#d30b0bff",
    paddingVertical: 16,
    borderRadius: 120,
    marginRight: 8,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 120,
    marginLeft: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
  retakeText: {
    color: "#FF4D4D",
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  statusDescription: {
    fontSize: 14,
    fontFamily: getFontFamily("400"),
    color: "#000",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
});
