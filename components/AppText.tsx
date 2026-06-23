import React from "react";
import { Text, TextProps } from "react-native";

export const AppText: React.FC<TextProps> = ({ style, ...props }) => (
  <Text
    allowFontScaling={false}
    maxFontSizeMultiplier={1}
    {...props}
    style={style}
  />
);
