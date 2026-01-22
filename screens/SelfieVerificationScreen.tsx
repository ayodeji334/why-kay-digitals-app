// // import React, { useCallback, useEffect, useRef, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   Linking,
// // } from "react-native";
// // import { Camera, useCameraDevice } from "react-native-vision-camera";
// // import type { CameraPermissionStatus } from "react-native-vision-camera";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import { getFontFamily } from "../constants/settings";
// // import FaceOverlay from "../components/FaceOverlay";
// // import CaptureButton from "../components/CaptureButton";
// // import { COLORS } from "../constants/colors";

// // export default function SelfieVerificationScreen() {
// //   const cameraRef = useRef<Camera>(null);
// //   const device = useCameraDevice("front");

// //   const [cameraPermission, setCameraPermission] =
// //     useState<CameraPermissionStatus>("not-determined");

// //   // Check & request permission
// //   const requestPermission = useCallback(async () => {
// //     const status = await Camera.requestCameraPermission();

// //     if (status === "denied") {
// //       await Linking.openSettings();
// //     }

// //     setCameraPermission(status);
// //   }, []);

// //   useEffect(() => {
// //     Camera.getCameraPermissionStatus();
// //   }, []);

// //   // -----------------------------
// //   // Permission NOT granted UI
// //   // -----------------------------
// //   if (cameraPermission !== "granted") {
// //     return (
// //       <SafeAreaView style={styles.permissionContainer}>
// //         <View style={styles.permissionCard}>
// //           <Text style={styles.permissionTitle}>Camera access required</Text>

// //           <Text style={styles.permissionDescription}>
// //             To continue with identity verification, we need access to your
// //             camera to capture a clear selfie.
// //           </Text>

// //           <TouchableOpacity
// //             onPress={requestPermission}
// //             activeOpacity={0.85}
// //             style={styles.permissionButton}
// //           >
// //             <Text style={styles.permissionButtonText}>Allow Camera Access</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </SafeAreaView>
// //     );
// //   }

// //   // -----------------------------
// //   // Camera unavailable fallback
// //   // -----------------------------
// //   if (!device) {
// //     return <View style={styles.loader} />;
// //   }

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <Camera
// //         ref={cameraRef}
// //         style={StyleSheet.absoluteFill}
// //         device={device}
// //         isActive
// //         photo
// //       />

// //       {/* Overlay */}
// //       <FaceOverlay />

// //       <View style={styles.instructions}>
// //         <Text style={styles.title}>Align your face</Text>
// //         <Text style={styles.subtitle}>
// //           Make sure your face is centered within the frame
// //         </Text>
// //       </View>

// //       {/* Capture */}
// //       <View style={styles.captureWrapper}>
// //         <CaptureButton onPress={takeSelfie} />
// //       </View>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#000",
// //   },

// //   loader: {
// //     flex: 1,
// //     backgroundColor: "#fff",
// //   },

// //   permissionContainer: {
// //     flex: 1,
// //     backgroundColor: "#fff",
// //     justifyContent: "center",
// //     paddingHorizontal: 24,
// //   },

// //   permissionCard: {
// //     backgroundColor: "#fff",
// //     borderRadius: 16,
// //     padding: 24,
// //   },

// //   permissionTitle: {
// //     fontSize: 16,
// //     color: "#000",
// //     fontFamily: getFontFamily(800),
// //     marginBottom: 8,
// //   },

// //   permissionDescription: {
// //     fontSize: 14,
// //     fontFamily: getFontFamily("400"),
// //     color: "#494949ff",
// //     lineHeight: 20,
// //     marginBottom: 24,
// //   },

// //   permissionButton: {
// //     backgroundColor: COLORS.primary,
// //     paddingVertical: 14,
// //     borderRadius: 12,
// //     alignItems: "center",
// //   },

// //   permissionButtonText: {
// //     color: "#fff",
// //     fontSize: 15,
// //     fontFamily: getFontFamily("700"),
// //   },

// //   instructions: {
// //     position: "absolute",
// //     bottom: 140,
// //     width: "100%",
// //     alignItems: "center",
// //     paddingHorizontal: 24,
// //   },

// //   title: {
// //     color: "#fff",
// //     fontSize: 16,
// //     fontFamily: getFontFamily("700"),
// //     marginBottom: 6,
// //   },

// //   subtitle: {
// //     color: "#d1d1d1",
// //     fontSize: 13,
// //     textAlign: "center",
// //   },

// //   captureWrapper: {
// //     position: "absolute",
// //     bottom: 40,
// //     width: "100%",
// //     alignItems: "center",
// //   },
// // });
// import React, { useCallback, useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Linking,
// } from "react-native";
// import { Camera, useCameraDevice } from "react-native-vision-camera";
// import type { CameraPermissionStatus } from "react-native-vision-camera";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { getFontFamily } from "../constants/settings";
// import FaceOverlay from "../components/FaceOverlay";
// import CaptureButton from "../components/CaptureButton";
// import { COLORS } from "../constants/colors";
// import { useNavigation } from "@react-navigation/native";

// export default function SelfieVerificationScreen() {
//   const cameraRef = useRef<Camera>(null);
//   const device = useCameraDevice("front");
//   const navigation: any = useNavigation();
//   console.log(device);

//   const [cameraPermission, setCameraPermission] =
//     useState<CameraPermissionStatus>("not-determined");
//   const [loading, setLoading] = useState(true);

//   // Request permission
//   const requestPermission = useCallback(async () => {
//     const status = await Camera.requestCameraPermission();

//     if (status === "denied") {
//       // If denied, open settings so user can enable manually
//       await Linking.openSettings();
//     }

//     setCameraPermission(status);
//     setLoading(false);
//   }, []);

//   // Check permission on mount
//   useEffect(() => {
//     const checkPermission = async () => {
//       const status = await Camera.getCameraPermissionStatus();
//       setCameraPermission(status);

//       if (status !== "granted") {
//         await requestPermission();
//       } else {
//         setLoading(false);
//       }
//     };

//     checkPermission();
//   }, [requestPermission]);

//   if (loading) {
//     return <View style={styles.loader} />;
//   }

//   if (cameraPermission !== "granted") {
//     return (
//       <SafeAreaView style={styles.permissionContainer}>
//         <View style={styles.permissionCard}>
//           <Text style={styles.permissionTitle}>Camera access required</Text>

//           <Text style={styles.permissionDescription}>
//             To continue with identity verification, we need access to your
//             camera to capture a clear selfie.
//           </Text>

//           <TouchableOpacity
//             onPress={requestPermission}
//             activeOpacity={0.85}
//             style={styles.permissionButton}
//           >
//             <Text style={styles.permissionButtonText}>Allow Camera Access</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (!device) {
//     return <View style={styles.loader} />;
//   }

//   const takeSelfie = async () => {
//     if (cameraRef.current) {
//       const photo = await cameraRef.current.takePhoto({
//         flash: "auto",
//         enableAutoDistortionCorrection: true,
//         enableAutoRedEyeReduction: true,
//       });

//       navigation.navigate("SelfieConfirmation", { image: photo });
//     }
//   };

//   return (
//     <SafeAreaView edges={["bottom"]} style={styles.container}>
//       <Camera
//         ref={cameraRef}
//         style={StyleSheet.absoluteFill}
//         device={device}
//         isActive={true}
//         photo={true}
//       />

//       <FaceOverlay />

//       {/* Instructions */}
//       <View style={styles.instructions}>
//         <Text style={styles.title}>Align your face</Text>
//         <Text style={styles.subtitle}>
//           Make sure your face is centered within the frame
//         </Text>
//       </View>

//       {/* Capture Button */}
//       <View style={styles.captureWrapper}>
//         <CaptureButton onPress={takeSelfie} />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },

//   loader: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },

//   permissionContainer: {
//     flex: 1,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     paddingHorizontal: 24,
//   },

//   permissionCard: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 24,
//   },

//   permissionTitle: {
//     fontSize: 16,
//     color: "#000",
//     fontFamily: getFontFamily(800),
//     marginBottom: 8,
//   },

//   permissionDescription: {
//     fontSize: 14,
//     fontFamily: getFontFamily("400"),
//     color: "#494949ff",
//     lineHeight: 20,
//     marginBottom: 24,
//   },

//   permissionButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: "center",
//   },

//   permissionButtonText: {
//     color: "#fff",
//     fontSize: 15,
//     fontFamily: getFontFamily("700"),
//   },

//   instructions: {
//     position: "absolute",
//     bottom: 140,
//     width: "100%",
//     alignItems: "center",
//     paddingHorizontal: 24,
//   },

//   title: {
//     color: "#fff",
//     fontSize: 16,
//     fontFamily: getFontFamily("700"),
//     marginBottom: 6,
//   },

//   subtitle: {
//     color: "#d1d1d1",
//     fontSize: 13,
//     fontFamily: getFontFamily("700"),
//     textAlign: "center",
//   },

//   captureWrapper: {
//     position: "absolute",
//     bottom: 40,
//     width: "100%",
//     alignItems: "center",
//   },
// });
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import type { CameraPermissionStatus } from "react-native-vision-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily } from "../constants/settings";
import FaceOverlay from "../components/FaceOverlay";
import CaptureButton from "../components/CaptureButton";
import { COLORS } from "../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { FavoriteChart, FingerScan } from "iconsax-react-nativejs";
import CustomIcon from "../components/CustomIcon";
import { FaceIdIcon, TransferIcon } from "../assets";

export default function SelfieVerificationScreen() {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice("front");
  const navigation: any = useNavigation();

  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, setCameraPermission] =
    useState<CameraPermissionStatus>("not-determined");
  const [loading, setLoading] = useState(false);

  // Request permission logic
  const handleVerifyClick = async () => {
    setLoading(true);
    const status = await Camera.requestCameraPermission();

    if (status === "denied") {
      await Linking.openSettings();
    }

    setCameraPermission(status);
    setLoading(false);

    if (status === "granted") {
      setShowCamera(true);
    }
  };

  const takeSelfie = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto({
        flash: "off",
      });
      navigation.navigate("SelfieConfirmation", { image: photo });
    }
  };

  // 1. Initial State UI (The instructional screen)
  if (!showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <CustomIcon source={FaceIdIcon} size={74} color={COLORS.primary} />
          </View>

          <Text style={styles.infoTitle}>Face Verification</Text>
          <Text style={styles.infoSubtitle}>
            Your face will be scanned to verify your identity to upgrade your
            account.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleVerifyClick}
            activeOpacity={0.8}
            disabled={loading}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Checking..." : "Verify My Face"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Camera View (Active State)
  if (!device && showCamera) return <View style={styles.loader} />;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device!}
        isActive={true}
        photo={true}
      />

      <FaceOverlay />

      <View style={styles.cameraInstructions}>
        <Text style={styles.title}>Align your face</Text>
        <Text style={styles.subtitle}>
          Make sure your face is centered within the frame
        </Text>
      </View>

      <View style={styles.captureWrapper}>
        <CaptureButton onPress={takeSelfie} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    color: "#000",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  faceIcon: {
    width: 120,
    height: 120,
    tintColor: COLORS.primary,
  },
  infoTitle: {
    fontSize: 20,
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  infoSubtitle: {
    fontSize: 15,
    fontFamily: getFontFamily("400"),
    color: "#4b4b4bff",
    textAlign: "center",
    lineHeight: 20,
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
    fontSize: 16,
    fontFamily: getFontFamily("700"),
  },
  loader: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraInstructions: {
    position: "absolute",
    bottom: 140,
    width: "100%",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontFamily: getFontFamily("700"),
    marginBottom: 6,
  },
  subtitle: {
    color: "#d1d1d1",
    fontSize: 13,
    fontFamily: getFontFamily("400"),
    textAlign: "center",
  },
  captureWrapper: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },
});
