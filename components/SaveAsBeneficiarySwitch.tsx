import React from "react";
import { View, Switch, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";

interface SaveAsBeneficiarySwitchProps {
  label?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const SaveAsBeneficiarySwitch: React.FC<SaveAsBeneficiarySwitchProps> = ({
  label = "Save as beneficiary",
  value,
  onValueChange,
  disabled = false,
}) => {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <View style={styles.switchContainer}>
      <AppText style={styles.switchLabel}>{label}</AppText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D1D5DB", true: COLORS.secondary }}
        thumbColor="#fff"
        disabled={disabled}
        style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
      />
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    switchContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 15,
      marginBottom: 20,
      paddingHorizontal: 4,
      paddingVertical: 5,
    },
    switchLabel: {
      fontSize: normalize(18),
      color: colors.text,
      fontFamily: getFontFamily("800"),
      marginBottom: 6,
    },
  });

export default SaveAsBeneficiarySwitch;
