import { Dimensions, PixelRatio, Platform } from "react-native";

export const { width, height } = Dimensions.get("window");
const guidelineBaseWidth = 375;
const PHONE_MAX_SCALE = 0.89;
const TABLET_SCALE = 1.19;
const TABLET_BREAKPOINT = 600;

const ANDROID_FONT_CORRECTION = 0.92;

const getScale = () =>
  width >= TABLET_BREAKPOINT
    ? TABLET_SCALE
    : Math.min(width / guidelineBaseWidth, PHONE_MAX_SCALE);

export const normalize = (size: number) => {
  const scale = getScale();

  const normalized = scale * size;
  const corrected =
    Platform.OS === "android"
      ? normalized * ANDROID_FONT_CORRECTION
      : normalized;

  return PixelRatio.roundToNearestPixel(corrected);
};

export const normalizeSpacing = (size: number) =>
  PixelRatio.roundToNearestPixel(getScale() * size);

export const getFontFamily = (weight: string | number) => {
  const fontWeights: any = {
    "100": "Zain-Thin",
    "200": "Zain-ExtraLight",
    "300": "Zain-Light",
    "400": "Zain-Regular",
    "500": "Zain-Medium",
    "600": "Zain-SemiBold",
    "700": "Zain-Bold",
    "800": "Zain-ExtraBold",
    "900": "Zain-Black",
  };

  const weightMap: any = {
    100: "100",
    200: "200",
    300: "300",
    400: "400",
    500: "500",
    600: "600",
    700: "700",
    800: "800",
    900: "900",

    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    regular: "400",
    medium: "500",
    semibold: "600",
    demibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
    heavy: "900",
  };

  let normalizedWeight = "400";

  if (weight !== undefined && weight !== null) {
    if (typeof weight === "number") {
      normalizedWeight = weight.toString();
    } else if (typeof weight === "string") {
      normalizedWeight = weightMap[weight.toLowerCase()] || weight;
    }
  }

  return fontWeights[normalizedWeight] || fontWeights["400"];
};
