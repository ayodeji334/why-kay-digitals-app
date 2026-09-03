import ReactNativeBlobUtil from "react-native-blob-util";
import { Image } from "react-native-compressor";

// Shared by SelfieVerificationScreen (permission + entry point) and
// LivenessCheck (which now owns the actual capture) — kept in one place so
// both agree on the same size cap instead of drifting independently.
export const MAX_BASE64_SIZE = 900 * 1024; // 900 KB

export function stripFileScheme(path: string) {
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
