// // import React, { useRef, useState } from "react";
// // import {
// //   View,
// //   StyleSheet,
// //   TouchableOpacity,
// //   Linking,
// //   Dimensions,
// //   Alert,
// // } from "react-native";
// // import { Camera, useCameraDevice } from "react-native-vision-camera";
// // import Svg, { Ellipse } from "react-native-svg";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import { getFontFamily, normalize } from "../constants/settings";
// // import FaceOverlay from "../components/FaceOverlay";
// // import CaptureButton from "../components/CaptureButton";
// // import { COLORS } from "../constants/colors";
// // import { useNavigation } from "@react-navigation/native";
// // import CustomIcon from "../components/CustomIcon";
// // import { FaceIdIcon } from "../assets";
// // import ReactNativeBlobUtil from "react-native-blob-util";
// // import { Image } from "react-native-compressor";
// // import { AppText } from "../components/AppText";
// // import { useColors } from "../hooks/useTheme";

// // const MAX_BASE64_SIZE = 900 * 1024; // 900 KB

// // // export async function captureAndCompress(path: string) {
// // //   let quality = 0.8;
// // //   // start at 80% let
// // //   let compressedPath = path;
// // //   // initial read
// // //   let base64String = await ReactNativeBlobUtil.fs.readFile(path, "base64");
// // //   // check size and compress iteratively
// // //   while (base64String.length * 0.75 > MAX_BASE64_SIZE && quality > 0.3) {
// // //     compressedPath = await Image.compress(compressedPath, {
// // //       compressionMethod: "manual",
// // //       quality,
// // //       maxWidth: 800,
// // //       maxHeight: 800,
// // //     });
// // //     base64String = await ReactNativeBlobUtil.fs.readFile(
// // //       compressedPath,
// // //       "base64",
// // //     );
// // //     quality -= 0.1;
// // //   }

// // //   return { path: compressedPath, base64: base64String };
// // // }

// // function stripFileScheme(path: string) {
// //   return path.startsWith("file://") ? path.replace("file://", "") : path;
// // }

// // export async function captureAndCompress(path: string) {
// //   const cleanPath = stripFileScheme(path);

// //   let quality = 0.8;

// //   // start at 80% let
// //   let compressedPath = cleanPath;

// //   // initial read
// //   let base64String = await ReactNativeBlobUtil.fs.readFile(
// //     compressedPath,
// //     "base64",
// //   );

// //   // check size and compress iteratively
// //   while (base64String.length * 0.75 > MAX_BASE64_SIZE && quality > 0.3) {
// //     compressedPath = stripFileScheme(
// //       await Image.compress(compressedPath, {
// //         compressionMethod: "manual",
// //         quality,
// //         maxWidth: 800,
// //         maxHeight: 800,
// //       }),
// //     );
// //     base64String = await ReactNativeBlobUtil.fs.readFile(
// //       compressedPath,
// //       "base64",
// //     );
// //     quality -= 0.1;
// //   }

// //   return { path: compressedPath, base64: base64String };
// // }

// // const { width, height } = Dimensions.get("window");

// // export default function SelfieVerificationScreen() {
// //   const cameraRef = useRef<Camera>(null);
// //   const device = useCameraDevice("front");
// //   const navigation: any = useNavigation();
// //   const [showCamera, setShowCamera] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const colors = useColors();
// //   const styles = makeStyles(colors);

// //   // Request permission logic
// //   const handleVerifyClick = async () => {
// //     setLoading(true);
// //     const status = await Camera.requestCameraPermission();

// //     if (status === "denied") {
// //       await Linking.openSettings();
// //     }

// //     // setCameraPermission(status);
// //     setLoading(false);

// //     if (status === "granted") {
// //       setShowCamera(true);
// //     }
// //   };

// //   // const takeSelfie = async () => {
// //   //   if (cameraRef.current) {
// //   //     const photo = await cameraRef.current.takePhoto({ flash: "off" });

// //   //     const result = await captureAndCompress(photo.path);

// //   //     if (result) {
// //   //       navigation.replace("SelfieConfirmation", { image: result });
// //   //     }
// //   //   }
// //   // };

// //   const [capturing, setCapturing] = useState(false);

// //   const takeSelfie = async () => {
// //     if (!cameraRef.current || capturing) return;

// //     try {
// //       setCapturing(true);
// //       const photo = await cameraRef.current.takePhoto();
// //       // Alert.alert("Photo captured at:", photo.path);

// //       const result = await captureAndCompress(photo.path);
// //       // Alert.alert("Compression result:", result?.path);

// //       if (result) {
// //         navigation.replace("SelfieConfirmation", { image: result });
// //       }
// //     } catch (error: any) {
// //       Alert.alert("Capture failed", error?.message ?? String(error));
// //     } finally {
// //       setCapturing(false);
// //     }
// //   };

// //   if (!showCamera) {
// //     return (
// //       <SafeAreaView style={styles.container}>
// //         <View style={styles.content}>
// //           <View style={styles.iconContainer}>
// //             <CustomIcon
// //               source={FaceIdIcon}
// //               size={normalize(40)}
// //               color={COLORS.primary}
// //             />
// //           </View>

// //           <AppText style={styles.infoTitle}>Face Verification</AppText>
// //           <AppText style={styles.infoSubtitle}>
// //             Your face will be scanned to verify your identity to upgrade your
// //             account.
// //           </AppText>
// //         </View>

// //         <View style={styles.footer}>
// //           <TouchableOpacity
// //             onPress={handleVerifyClick}
// //             activeOpacity={0.8}
// //             disabled={loading}
// //             style={styles.primaryButton}
// //           >
// //             <AppText style={styles.primaryButtonText}>
// //               {loading ? "Checking..." : "Verify My Face"}
// //             </AppText>
// //           </TouchableOpacity>
// //         </View>
// //       </SafeAreaView>
// //     );
// //   }

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <View
// //         style={{
// //           backgroundColor: colors.background,
// //           position: "absolute",
// //           top: height * 0.16,
// //           left: width * 0.18,
// //           width: width * 0.64,
// //           height: height * 0.44,
// //           overflow: "hidden",
// //           borderRadius: Math.min(width * 0.32, height * 0.22),
// //         }}
// //       >
// //         <Camera
// //           ref={cameraRef}
// //           style={StyleSheet.absoluteFill}
// //           device={device!}
// //           isActive={true}
// //           photo={true}
// //         />
// //       </View>

// //       <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
// //         <Ellipse
// //           cx={width / 2}
// //           cy={height * 0.38}
// //           rx={width * 0.32}
// //           ry={height * 0.22}
// //           stroke="#055316"
// //           strokeWidth={4}
// //           fill="transparent"
// //         />
// //       </Svg>

// //       <FaceOverlay />

// //       <View style={styles.cameraInstructions}>
// //         <AppText style={styles.title}>Align your face</AppText>
// //         <AppText style={styles.subtitle}>
// //           Make sure your face is centered within the frame
// //         </AppText>
// //       </View>

// //       <View style={styles.captureWrapper}>
// //         <CaptureButton onPress={takeSelfie} />
// //       </View>
// //     </SafeAreaView>
// //   );
// // }

// // const makeStyles = (colors: ReturnType<typeof useColors>) =>
// //   StyleSheet.create({
// //     container: {
// //       flex: 1,
// //       backgroundColor: colors.background,
// //     },
// //     header: {
// //       flexDirection: "row",
// //       alignItems: "center",
// //       paddingHorizontal: 20,
// //       paddingVertical: 15,
// //     },
// //     headerTitle: {
// //       fontSize: 18,
// //       fontFamily: getFontFamily("700"),
// //       marginLeft: 15,
// //       color: colors.text,
// //     },
// //     content: {
// //       flex: 1,
// //       alignItems: "center",
// //       justifyContent: "center",
// //       paddingHorizontal: 40,
// //     },
// //     iconContainer: {
// //       marginBottom: 40,
// //       borderRadius: 200,
// //       backgroundColor: COLORS.fadeBackgroundPrimary,
// //       padding: 20,
// //       marginTop: normalize(-100),
// //     },
// //     faceIcon: {
// //       width: 50,
// //       height: 50,
// //       tintColor: COLORS.primary,
// //     },
// //     infoTitle: {
// //       fontSize: normalize(22),
// //       fontFamily: getFontFamily("800"),
// //       color: colors.text,
// //       marginBottom: 8,
// //       textAlign: "center",
// //     },
// //     infoSubtitle: {
// //       fontSize: normalize(19),
// //       fontFamily: getFontFamily("400"),
// //       color: colors.textMuted,
// //       textAlign: "center",
// //       // lineHeight: 15,
// //     },
// //     footer: {
// //       paddingHorizontal: 20,
// //       paddingBottom: 20,
// //     },
// //     primaryButton: {
// //       backgroundColor: COLORS.primary,
// //       paddingVertical: 16,
// //       borderRadius: 25,
// //       alignItems: "center",
// //       marginBottom: 20,
// //     },
// //     primaryButtonText: {
// //       color: "#fff",
// //       fontSize: 14,
// //       fontFamily: getFontFamily("700"),
// //     },
// //     loader: {
// //       flex: 1,
// //       backgroundColor: colors.overlay,
// //       justifyContent: "center",
// //       alignItems: "center",
// //     },
// //     cameraInstructions: {
// //       position: "absolute",
// //       bottom: 140,
// //       width: "100%",
// //       alignItems: "center",
// //       backgroundColor: colors.background,
// //     },
// //     title: {
// //       color: colors.text,
// //       fontSize: normalize(19),
// //       fontFamily: getFontFamily("700"),
// //       marginBottom: 6,
// //     },
// //     subtitle: {
// //       color: colors.text,
// //       fontSize: normalize(19),
// //       fontFamily: getFontFamily("700"),
// //       textAlign: "center",
// //     },
// //     captureWrapper: {
// //       position: "absolute",
// //       bottom: 40,
// //       width: "100%",
// //       alignItems: "center",
// //     },
// //   });
// import React, { useRef, useState } from "react";
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   Linking,
//   Dimensions,
//   Alert,
// } from "react-native";
// import { Camera, useCameraDevice } from "react-native-vision-camera";
// import Svg, { Ellipse } from "react-native-svg";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { getFontFamily, normalize } from "../constants/settings";
// import FaceOverlay from "../components/FaceOverlay";
// import CaptureButton from "../components/CaptureButton";
// import { COLORS } from "../constants/colors";
// import { useNavigation } from "@react-navigation/native";
// import CustomIcon from "../components/CustomIcon";
// import { FaceIdIcon } from "../assets";
// import ReactNativeBlobUtil from "react-native-blob-util";
// import { Image } from "react-native-compressor";
// import { AppText } from "../components/AppText";
// import { useColors } from "../hooks/useTheme";

// const MAX_BASE64_SIZE = 900 * 1024; // 900 KB

// function stripFileScheme(path: string) {
//   return path.startsWith("file://") ? path.replace("file://", "") : path;
// }

// export async function captureAndCompress(path: string) {
//   const cleanPath = stripFileScheme(path);

//   let quality = 0.8;

//   // start at 80% let
//   let compressedPath = cleanPath;

//   // initial read
//   let base64String = await ReactNativeBlobUtil.fs.readFile(
//     compressedPath,
//     "base64",
//   );

//   // check size and compress iteratively
//   while (base64String.length * 0.75 > MAX_BASE64_SIZE && quality > 0.3) {
//     compressedPath = stripFileScheme(
//       await Image.compress(compressedPath, {
//         compressionMethod: "manual",
//         quality,
//         maxWidth: 800,
//         maxHeight: 800,
//       }),
//     );
//     base64String = await ReactNativeBlobUtil.fs.readFile(
//       compressedPath,
//       "base64",
//     );
//     quality -= 0.1;
//   }

//   return { path: compressedPath, base64: base64String };
// }

// const { width, height } = Dimensions.get("window");

// export default function SelfieVerificationScreen() {
//   const cameraRef = useRef<Camera>(null);
//   const device = useCameraDevice("front");
//   const navigation: any = useNavigation();
//   const [showCamera, setShowCamera] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const colors = useColors();
//   const styles = makeStyles(colors);

//   // Request permission logic
//   const handleVerifyClick = async () => {
//     setLoading(true);

//     // If the user has already permanently denied access, don't re-prompt
//     // the system dialog (it won't appear again) — just explain why we
//     // need it and let them decide whether to open Settings.
//     const currentStatus = Camera.getCameraPermissionStatus();

//     let status = currentStatus;
//     if (currentStatus !== "granted" && currentStatus !== "denied") {
//       // "not-determined" (or similar) — safe to trigger the system prompt
//       status = await Camera.requestCameraPermission();
//     }

//     setLoading(false);

//     if (status === "granted") {
//       setShowCamera(true);
//       return;
//     }

//     // Denied / restricted — inform the user and let THEM choose to open
//     // Settings. Never redirect automatically.
//     Alert.alert(
//       "Camera Permission Required",
//       "We need camera access to verify your identity with a selfie. You can enable it in Settings.",
//       [
//         { text: "Cancel", style: "cancel" },
//         { text: "Open Settings", onPress: () => Linking.openSettings() },
//       ],
//     );
//   };

//   const [capturing, setCapturing] = useState(false);

//   const takeSelfie = async () => {
//     if (!cameraRef.current || capturing) return;

//     try {
//       setCapturing(true);
//       const photo = await cameraRef.current.takePhoto();

//       const result = await captureAndCompress(photo.path);

//       if (result) {
//         navigation.replace("SelfieConfirmation", { image: result });
//       }
//     } catch (error: any) {
//       Alert.alert("Capture failed", error?.message ?? String(error));
//     } finally {
//       setCapturing(false);
//     }
//   };

//   if (!showCamera) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.content}>
//           <View style={styles.iconContainer}>
//             <CustomIcon
//               source={FaceIdIcon}
//               size={normalize(40)}
//               color={COLORS.primary}
//             />
//           </View>

//           <AppText style={styles.infoTitle}>Face Verification</AppText>
//           <AppText style={styles.infoSubtitle}>
//             Your face will be scanned to verify your identity to upgrade your
//             account.
//           </AppText>
//         </View>

//         <View style={styles.footer}>
//           <TouchableOpacity
//             onPress={handleVerifyClick}
//             activeOpacity={0.8}
//             disabled={loading}
//             style={styles.primaryButton}
//           >
//             <AppText style={styles.primaryButtonText}>
//               {loading ? "Checking..." : "Verify My Face"}
//             </AppText>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View
//         style={{
//           backgroundColor: colors.background,
//           position: "absolute",
//           top: height * 0.16,
//           left: width * 0.18,
//           width: width * 0.64,
//           height: height * 0.44,
//           overflow: "hidden",
//           borderRadius: Math.min(width * 0.32, height * 0.22),
//         }}
//       >
//         <Camera
//           ref={cameraRef}
//           style={StyleSheet.absoluteFill}
//           device={device!}
//           isActive={true}
//           photo={true}
//         />
//       </View>

//       <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
//         <Ellipse
//           cx={width / 2}
//           cy={height * 0.38}
//           rx={width * 0.32}
//           ry={height * 0.22}
//           stroke="#055316"
//           strokeWidth={4}
//           fill="transparent"
//         />
//       </Svg>

//       <FaceOverlay />

//       <View style={styles.cameraInstructions}>
//         <AppText style={styles.title}>Align your face</AppText>
//         <AppText style={styles.subtitle}>
//           Make sure your face is centered within the frame
//         </AppText>
//       </View>

//       <View style={styles.captureWrapper}>
//         <CaptureButton onPress={takeSelfie} />
//       </View>
//     </SafeAreaView>
//   );
// }

// const makeStyles = (colors: ReturnType<typeof useColors>) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: colors.background,
//     },
//     header: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingHorizontal: 20,
//       paddingVertical: 15,
//     },
//     headerTitle: {
//       fontSize: 18,
//       fontFamily: getFontFamily("700"),
//       marginLeft: 15,
//       color: colors.text,
//     },
//     content: {
//       flex: 1,
//       alignItems: "center",
//       justifyContent: "center",
//       paddingHorizontal: 40,
//     },
//     iconContainer: {
//       marginBottom: 40,
//       borderRadius: 200,
//       backgroundColor: COLORS.fadeBackgroundPrimary,
//       padding: 20,
//       marginTop: normalize(-100),
//     },
//     faceIcon: {
//       width: 50,
//       height: 50,
//       tintColor: COLORS.primary,
//     },
//     infoTitle: {
//       fontSize: normalize(22),
//       fontFamily: getFontFamily("800"),
//       color: colors.text,
//       marginBottom: 8,
//       textAlign: "center",
//     },
//     infoSubtitle: {
//       fontSize: normalize(19),
//       fontFamily: getFontFamily("400"),
//       color: colors.textMuted,
//       textAlign: "center",
//     },
//     footer: {
//       paddingHorizontal: 20,
//       paddingBottom: 20,
//     },
//     primaryButton: {
//       backgroundColor: COLORS.primary,
//       paddingVertical: 16,
//       borderRadius: 25,
//       alignItems: "center",
//       marginBottom: 20,
//     },
//     primaryButtonText: {
//       color: "#fff",
//       fontSize: 14,
//       fontFamily: getFontFamily("700"),
//     },
//     loader: {
//       flex: 1,
//       backgroundColor: colors.overlay,
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     cameraInstructions: {
//       position: "absolute",
//       bottom: 140,
//       width: "100%",
//       alignItems: "center",
//       backgroundColor: colors.background,
//     },
//     title: {
//       color: colors.text,
//       fontSize: normalize(19),
//       fontFamily: getFontFamily("700"),
//       marginBottom: 6,
//     },
//     subtitle: {
//       color: colors.text,
//       fontSize: normalize(19),
//       fontFamily: getFontFamily("700"),
//       textAlign: "center",
//     },
//     captureWrapper: {
//       position: "absolute",
//       bottom: 40,
//       width: "100%",
//       alignItems: "center",
//     },
//   });
import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  Alert,
} from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import Svg, { Ellipse } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import FaceOverlay from "../components/FaceOverlay";
import CaptureButton from "../components/CaptureButton";
import { COLORS } from "../constants/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import CustomIcon from "../components/CustomIcon";
import { FaceIdIcon } from "../assets";
import ReactNativeBlobUtil from "react-native-blob-util";
import { Image } from "react-native-compressor";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";

const MAX_BASE64_SIZE = 900 * 1024; // 900 KB

function stripFileScheme(path: string) {
  return path.startsWith("file://") ? path.replace("file://", "") : path;
}

export async function captureAndCompress(path: string) {
  const cleanPath = stripFileScheme(path);

  let quality = 0.8;
  let compressedPath = cleanPath;

  let base64String = await ReactNativeBlobUtil.fs.readFile(
    compressedPath,
    "base64",
  );

  while (base64String.length * 0.75 > MAX_BASE64_SIZE && quality > 0.3) {
    compressedPath = stripFileScheme(
      await Image.compress(compressedPath, {
        compressionMethod: "manual",
        quality,
        maxWidth: 800,
        maxHeight: 800,
      }),
    );
    base64String = await ReactNativeBlobUtil.fs.readFile(
      compressedPath,
      "base64",
    );
    quality -= 0.1;
  }

  return { path: compressedPath, base64: base64String };
}

const { width, height } = Dimensions.get("window");

export default function SelfieVerificationScreen() {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice("front");
  const navigation: any = useNavigation();
  const route = useRoute();
  const { bvn }: any = route.params ?? {};
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const colors = useColors();
  const styles = makeStyles(colors);

  const handleVerifyClick = async () => {
    setLoading(true);

    const currentStatus = Camera.getCameraPermissionStatus();

    let status = currentStatus;
    if (currentStatus !== "granted" && currentStatus !== "denied") {
      status = await Camera.requestCameraPermission();
    }

    setLoading(false);

    if (status === "granted") {
      setShowCamera(true);
      return;
    }

    Alert.alert(
      "Camera Permission Required",
      "We need camera access to verify your identity with a selfie. You can enable it in Settings.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ],
    );
  };

  const [capturing, setCapturing] = useState(false);

  const takeSelfie = async () => {
    if (!cameraRef.current || capturing) return;

    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePhoto();

      const result = await captureAndCompress(photo.path);

      if (result) {
        navigation.replace("SelfieConfirmation", { image: result, bvn });
      }
    } catch (error: any) {
      Alert.alert("Capture failed", error?.message ?? String(error));
    } finally {
      setCapturing(false);
    }
  };

  if (!showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <CustomIcon
              source={FaceIdIcon}
              size={normalize(40)}
              color={COLORS.primary}
            />
          </View>

          <AppText style={styles.infoTitle}>Face Verification</AppText>
          <AppText style={styles.infoSubtitle}>
            Your face will be scanned to verify your identity to upgrade your
            account.
          </AppText>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleVerifyClick}
            activeOpacity={0.8}
            disabled={loading}
            style={styles.primaryButton}
          >
            <AppText style={styles.primaryButtonText}>
              {loading ? "Checking..." : "Verify My Face"}
            </AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          backgroundColor: colors.background,
          position: "absolute",
          top: height * 0.16,
          left: width * 0.18,
          width: width * 0.64,
          height: height * 0.44,
          overflow: "hidden",
          borderRadius: Math.min(width * 0.32, height * 0.22),
        }}
      >
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device!}
          isActive={true}
          photo={true}
        />
      </View>

      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Ellipse
          cx={width / 2}
          cy={height * 0.38}
          rx={width * 0.32}
          ry={height * 0.22}
          stroke="#055316"
          strokeWidth={4}
          fill="transparent"
        />
      </Svg>

      <FaceOverlay />

      <View style={styles.cameraInstructions}>
        <AppText style={styles.title}>Align your face</AppText>
        <AppText style={styles.subtitle}>
          Make sure your face is centered within the frame
        </AppText>
      </View>

      <View style={styles.captureWrapper}>
        <CaptureButton onPress={takeSelfie} />
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: getFontFamily("700"),
      marginLeft: 15,
      color: colors.text,
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
    },
    iconContainer: {
      marginBottom: 40,
      borderRadius: 200,
      backgroundColor: COLORS.fadeBackgroundPrimary,
      padding: 20,
      marginTop: normalize(-100),
    },
    faceIcon: {
      width: 50,
      height: 50,
      tintColor: COLORS.primary,
    },
    infoTitle: {
      fontSize: normalize(22),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: 8,
      textAlign: "center",
    },
    infoSubtitle: {
      fontSize: normalize(19),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
      textAlign: "center",
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    primaryButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: 16,
      borderRadius: 25,
      alignItems: "center",
      marginBottom: 20,
    },
    primaryButtonText: {
      color: "#fff",
      fontSize: 14,
      fontFamily: getFontFamily("700"),
    },
    loader: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      alignItems: "center",
    },
    cameraInstructions: {
      position: "absolute",
      bottom: 140,
      width: "100%",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    title: {
      color: colors.text,
      fontSize: normalize(19),
      fontFamily: getFontFamily("700"),
      marginBottom: 6,
    },
    subtitle: {
      color: colors.text,
      fontSize: normalize(19),
      fontFamily: getFontFamily("700"),
      textAlign: "center",
    },
    captureWrapper: {
      position: "absolute",
      bottom: 40,
      width: "100%",
      alignItems: "center",
    },
  });
