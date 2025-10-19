import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";

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
  return (
    <View style={styles.switchContainer}>
      <Text style={styles.switchLabel}>{label}</Text>
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

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 30,
    paddingHorizontal: 4,
  },
  switchLabel: {
    fontSize: normalize(18),
    color: "#1A1A1A",
    fontFamily: getFontFamily("700"),
  },
});

export default SaveAsBeneficiarySwitch;
