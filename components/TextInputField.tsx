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
import { AppText } from "./AppText";

interface Props {
  control: any;
  name: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  rules?: object;
  label?: string;
  showLabel?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "decimal-pad"
    | "url"
    | "number-pad"
    | "twitter"
    | "web-search";
  placeholderTextColor?: string;
  style?: TextStyle; // allow custom TextInput styling
  containerStyle?: ViewStyle; // allow custom container styling
}

const TextInputField: React.FC<Props> = ({
  control,
  name,
  placeholder,
  rules,
  label,
  showLabel = true,
  autoCapitalize = "none",
  keyboardType = "default",
  placeholderTextColor = "#aeaeaeff",
  style,
  containerStyle,
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
        <View style={[styles.container, containerStyle]}>
          {showLabel && label && (
            <AppText style={styles.label}>{label}</AppText>
          )}
          <TextInput
            style={[styles.input, error && styles.errorBorder, style]}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value?.toString()}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            maxFontSizeMultiplier={1}
            allowFontScaling={false}
          />
          {error && <AppText style={styles.errorText}>{error.message}</AppText>}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    fontFamily: getFontFamily("800"),
    fontSize: normalize(18),
    marginBottom: 2,
    color: "#000",
  },
});

export default TextInputField;
