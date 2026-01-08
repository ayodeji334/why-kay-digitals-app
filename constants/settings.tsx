import { PixelRatio, Dimensions } from "react-native";

export const { width, height } = Dimensions.get("window");

const { width: SCREEN_WIDTH, fontScale } = Dimensions.get("window");

const scale = Math.min(Math.max(SCREEN_WIDTH / 375, 0.8), 1.8);

export function normalize(size: number) {
  const newSize = size * scale * fontScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export const getFontFamily = (weight: string | number) => {
  const fontWeights: any = {
    "100": "Onest-Thin",
    "200": "Onest-ExtraLight",
    "300": "Onest-Light",
    "400": "Onest-Regular",
    "500": "Onest-Medium",
    "600": "Onest-SemiBold",
    "700": "Onest-Bold",
    "800": "Onest-ExtraBold",
    "900": "Onest-Black",
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
