import React from "react";
import { SvgProps } from "react-native-svg";
import { COLORS } from "../constants/colors";

interface CustomIconProps extends SvgProps {
  source: React.FC<SvgProps>;
  size?: number;
  color?: string;
  fill?: string;
  /**
   * If true, overrides any existing fill/stroke in the SVG.
   * Defaults to true.
   */
  overrideColor?: boolean;
}

const CustomIcon: React.FC<CustomIconProps> = ({
  source: Source,
  size = 24,
  color = COLORS.primary,
  fill = "currentColor",
  overrideColor = false,
  ...rest
}) => {
  const extraProps: Partial<SvgProps> = {
    width: size,
    height: size,
    preserveAspectRatio: "xMidYMid meet",
  };

  if (overrideColor && color) {
    // extraProps.fill = fill;
    extraProps.stroke = color;
  }

  return <Source {...extraProps} {...rest} />;
};

export default CustomIcon;
