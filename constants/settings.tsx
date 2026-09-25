import { Dimensions, PixelRatio, Platform } from "react-native";

export const { width, height } = Dimensions.get("window");
const guidelineBaseWidth = 375;
const PHONE_MAX_SCALE = 0.89; // largest phones (e.g. Pro Max models)
const TABLET_SCALE = 1.19; // fixed multiplier for iPad-class widths
const TABLET_BREAKPOINT = 600; // widely-used phone/tablet cutoff

// Virtually every modern phone (iOS or Android) reports a window width at
// or above TABLET_BREAKPOINT's phone-side threshold, so the width-based
// `scale` above almost always clamps to the same PHONE_MAX_SCALE on both
// platforms — it isn't actually why the iPhone 14 Pro Max and Tecno Camon
// 20 render differently. The real cause: Android's text engine derives a
// taller default line-height/leading from a font's metrics than iOS does
// for the same nominal fontSize, especially for a custom typeface (Zain)
// whose metrics read as iOS-tuned — so identical `normalize()` output
// still renders visibly bigger, and layouts built around that size shift,
// on Android specifically. Correct for it with a small Android-only
// factor rather than changing anything for iOS.
const ANDROID_FONT_CORRECTION = 0.92;

const getScale = () =>
  width >= TABLET_BREAKPOINT
    ? TABLET_SCALE
    : Math.min(width / guidelineBaseWidth, PHONE_MAX_SCALE);

export const normalize = (size: number) => {
  const scale = getScale();

  const normalized = scale * (size - 1);
  const corrected =
    Platform.OS === "android"
      ? normalized * ANDROID_FONT_CORRECTION
      : normalized;

  return PixelRatio.roundToNearestPixel(corrected);
};

// For padding/margin/gap — deliberately NOT built on normalize(): its
// `size - 2` offset is a font-metric calibration that would turn
// `padding: 0` into a small negative value and shrink small spacing values
// far more (proportionally) than large ones. This scales spacing by the
// same width-based ratio without that offset, and skips the Android
// text-rendering correction (irrelevant to raw layout spacing) so 0 stays
// 0 and the scaling stays linear across every value.
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

  // Normalize the weight input
  let normalizedWeight = "400"; // default

  if (weight !== undefined && weight !== null) {
    if (typeof weight === "number") {
      normalizedWeight = weight.toString();
    } else if (typeof weight === "string") {
      normalizedWeight = weightMap[weight.toLowerCase()] || weight;
    }
  }

  return fontWeights[normalizedWeight] || fontWeights["400"];
};
