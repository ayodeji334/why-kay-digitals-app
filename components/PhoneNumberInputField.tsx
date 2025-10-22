import React from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Controller } from "react-hook-form";
import { getFontFamily, normalize } from "../constants/settings";

interface Country {
  name: string;
  code: string;
  flag: any;
}

interface Props {
  control?: any;
  name?: string;
  placeholder?: string;
  rules?: object;
  label?: string;
  showLabel?: boolean;
  maxLength?: number;
  style?: TextStyle;
  containerStyle?: ViewStyle;
  placeholderTextColor?: string;
  value?: string;
  onChangeText?: (val: string) => void;
}

const PhoneNumberInputField: React.FC<Props> = ({
  control,
  name = "phone_number",
  placeholder,
  rules,
  label,
  showLabel = true,
  maxLength,
  style,
  placeholderTextColor = "#999",
  containerStyle,
  value,
  onChangeText,
}) => {
  const selectedCountry: Country = {
    name: "Nigeria",
    code: "+234",
    flag: require("../assets/flags/ng.png"),
  };

  const renderInput = (
    onChange: (val: string) => void,
    onBlur?: () => void,
    val?: string,
    error?: any,
  ) => (
    <View style={[styles.container, containerStyle]}>
      {showLabel && label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {/* Country Code Section */}
        <TouchableOpacity activeOpacity={0.8} style={styles.countryBox}>
          {/* <Image source={selectedCountry.flag} style={styles.flag} /> */}
          <Text style={styles.countryCode}>{selectedCountry.code}</Text>
        </TouchableOpacity>

        {/* Phone Number Input */}
        <TextInput
          style={[styles.input, error && styles.errorBorder, style]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          keyboardType="numeric"
          maxLength={maxLength}
          onBlur={onBlur}
          onChangeText={text => {
            const numericValue = text.replace(/[^0-9]/g, "");
            onChange(numericValue);
            if (onChangeText) onChangeText(numericValue);
          }}
          value={val ?? value ?? ""}
        />
      </View>
      {error && <Text style={styles.errorText}>{error.message}</Text>}
    </View>
  );

  if (control) {
    // Using react-hook-form
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => renderInput(onChange, onBlur, value, error)}
      />
    );
  }

  // Standalone (without form)
  return renderInput(val => onChangeText?.(val));
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  countryBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  flag: {
    width: 24,
    height: 16,
    resizeMode: "cover",
    marginRight: 6,
  },
  countryCode: {
    fontFamily: getFontFamily("600"),
    fontSize: normalize(18),
    color: "#000",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    marginLeft: 4,
  },
  label: {
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    marginBottom: 8,
    color: "#000",
  },
});

export default PhoneNumberInputField;
