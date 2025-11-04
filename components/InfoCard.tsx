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

interface InfoCardProps {
  title: string;
  description: string | string[];
  buttonText?: string;
  onButtonPress?: () => void;
  IconComponent: React.JSX.Element;
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
          flex: 1,
          marginVertical: 20,
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
          flex: 1,
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 9,
        }}
      >
        {IconComponent}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.title]}>{title}</Text>
          {typeof description === "string" ? (
            <Text style={styles.description}>{description}</Text>
          ) : Array.isArray(description) ? (
            <View style={styles.listContainer}>
              {description.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listText}>{item}</Text>
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
                <Text style={styles.editButtonText}>{buttonText}</Text>
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
    marginTop: 4,
    gap: 3,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 2,
  },
  editButtonText: {
    color: "#fff",
    fontSize: normalize(15),
    fontFamily: getFontFamily("700"),
    textAlign: "center",
  },
});
