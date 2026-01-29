import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import Svg, { Ellipse } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily } from "../constants/settings";
import FaceOverlay from "../components/FaceOverlay";
import CaptureButton from "../components/CaptureButton";
import { COLORS } from "../constants/colors";
import { useNavigation } from "@react-navigation/native";
import CustomIcon from "../components/CustomIcon";
import { FaceIdIcon } from "../assets";
import ReactNativeBlobUtil from "react-native-blob-util";
import { Image } from "react-native-compressor";

const MAX_BASE64_SIZE = 900 * 1024; // 900 KB

export async function captureAndCompress(path: string) {
  let quality = 0.8;
  // start at 80% let
  let compressedPath = path;
  // initial read
  let base64String = await ReactNativeBlobUtil.fs.readFile(path, "base64");
  // check size and compress iteratively
  while (base64String.length * 0.75 > MAX_BASE64_SIZE && quality > 0.3) {
    compressedPath = await Image.compress(compressedPath, {
      compressionMethod: "manual",
      quality,
      maxWidth: 800,
      maxHeight: 800,
    });
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
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  // Request permission logic
  const handleVerifyClick = async () => {
    setLoading(true);
    const status = await Camera.requestCameraPermission();

    if (status === "denied") {
      await Linking.openSettings();
    }

    // setCameraPermission(status);
    setLoading(false);

    if (status === "granted") {
      setShowCamera(true);
    }
  };

  const takeSelfie = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto({ flash: "off" });

      const result = await captureAndCompress(photo.path);

      if (result) {
        navigation.replace("SelfieConfirmation", { image: result });
      }
    }
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          position: "absolute",
          top: height * 0.16,
          left: width * 0.18,
          width: width * 0.64,
          height: height * 0.44,
          overflow: "hidden",
          borderRadius: Math.min(width * 0.32, height * 0.22), // rounded crop
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
          stroke="#FF3B30"
          strokeWidth={4}
          fill="transparent"
        />
      </Svg>

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
    fontSize: 19,
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
    fontSize: 14,
    fontFamily: getFontFamily("700"),
  },
  loader: {
    flex: 1,
    backgroundColor: "#fff",
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
    color: "#000",
    fontSize: 13,
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
