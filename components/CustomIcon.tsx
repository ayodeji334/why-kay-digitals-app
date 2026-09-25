import React from "react";
import { SvgProps } from "react-native-svg";
import { COLORS } from "../constants/colors";

interface CustomIconProps extends SvgProps {
  source: React.FC<SvgProps>;
  size?: number;
  color?: string;
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
  overrideColor = false,
  ...rest
}) => {
  const extraProps: Partial<SvgProps> = {
    width: size,
    height: size,
    preserveAspectRatio: "xMidYMid meet",
  };

  if (overrideColor && color) {
    extraProps.fill = color;
    extraProps.stroke = color;
  }

  return <Source {...rest} {...extraProps} />;
};

export default CustomIcon;
