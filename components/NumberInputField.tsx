import React from "react";
import { Controller } from "react-hook-form";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";
import { getFontFamily, normalize } from "../constants/settings";

interface Props {
  control: any;
  name: string;
  placeholder?: string;
  rules?: object;
  label?: string;
  showLabel?: boolean;
  maxLength?: number;
  style?: TextStyle;
  containerStyle?: ViewStyle;
  placeholderTextColor?: string;
}

const NumberInputField: React.FC<Props> = ({
  control,
  name,
  placeholder,
  rules,
  label,
  showLabel = true,
  maxLength,
  style,
  placeholderTextColor,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View style={styles.container}>
          {showLabel && label && <Text style={styles.label}>{label}</Text>}
          <TextInput
            style={[styles.input, error && styles.errorBorder, style]}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            keyboardType="numeric"
            onBlur={onBlur}
            maxLength={maxLength}
            onChangeText={text => {
              const numericValue = text.replace(/[^0-9]/g, "");
              onChange(numericValue);
            }}
            value={value ? String(value) : ""}
          />
          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "#1A1A1A",
    fontFamily: getFontFamily("400"),
    fontSize: normalize(18),
    backgroundColor: "#FFFFFF",
  },
  errorBorder: {
    borderColor: "#FF3B30",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#FF3B30",
    marginTop: 6,
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    fontWeight: "500",
    marginLeft: 4,
  },
  label: {
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    marginBottom: 8,
    color: "#000",
  },
});

export default NumberInputField;
