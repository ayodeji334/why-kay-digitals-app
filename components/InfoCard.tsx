import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  DimensionValue,
  StyleProp,
  ViewStyle,
} from "react-native";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { AppText } from "./AppText";

interface InfoCardProps {
  title: string;
  description: string | string[];
  buttonText?: string;
  onButtonPress?: () => void;
  IconComponent?: React.JSX.Element;
  iconColor?: string;
  iconSize?: number;
  buttonWidth?: DimensionValue;
  style?: StyleProp<ViewStyle>;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  buttonText,
  onButtonPress,
  IconComponent,
  // iconColor = "#0a611fff",
  // iconSize = 18,
  buttonWidth = "40%",
  style,
}) => {
  return (
    <View
      style={[
        {
          marginVertical: normalize(20),
          backgroundColor: "#5AB2431A",
          borderRadius: 10,
          padding: 15,
          height: "auto",
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 9,
        }}
      >
        {IconComponent}
        <View style={{ flex: 1, gap: 4 }}>
          <AppText style={[styles.title]}>{title}</AppText>
          {typeof description === "string" ? (
            <AppText style={styles.description}>{description}</AppText>
          ) : Array.isArray(description) ? (
            <View style={styles.listContainer}>
              {description.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <AppText style={styles.listText}>{item}</AppText>
                </View>
              ))}
            </View>
          ) : null}
          {buttonText && onButtonPress && (
            <View
              style={{
                maxWidth: buttonWidth,
                width: "auto",
                marginTop: 8,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.editButton}
                onPress={onButtonPress}
              >
                <AppText style={styles.editButtonText}>{buttonText}</AppText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default InfoCard;

const styles = StyleSheet.create({
  title: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
  },
  description: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
    color: "#000",
    lineHeight: 15,
  },
  listText: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
    color: "#000",
    flexShrink: 1,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  listContainer: {
    marginTop: 1,
    gap: 3,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 2,
  },
  editButtonText: {
    color: "#fff",
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    textAlign: "center",
  },
});
