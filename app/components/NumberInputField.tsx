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
import { normalize } from "../constants/settings";

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
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 8,
    fontSize: normalize(11),
  },
  errorBorder: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginTop: 4,
    fontSize: normalize(10),
  },
  label: {
    fontSize: normalize(12),
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
});

export default NumberInputField;
