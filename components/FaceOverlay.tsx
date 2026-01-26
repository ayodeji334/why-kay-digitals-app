import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Rect, Ellipse, Mask } from "react-native-svg";

const { width, height } = Dimensions.get("window");

export default function FaceOverlay() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height}>
        <Mask id="mask">
          <Rect width={width} height={height} fill="white" />
          <Ellipse
            cx={width / 2}
            cy={height * 0.38}
            rx={width * 0.32}
            ry={height * 0.22}
            fill="black"
          />
        </Mask>

        <Rect
          width={width}
          height={height}
          fill="rgba(255, 255, 255, 1)"
          mask="url(#mask)"
        />

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
    </View>
  );
}
