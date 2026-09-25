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
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";

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
  secureTextEntry?: boolean;
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
  placeholderTextColor = "#aeaeaeff",
  secureTextEntry = false,
}) => {
  const colors = useColors();
  const styles = makeStyles(colors);

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
          {showLabel && label && (
            <AppText style={styles.label}>{label}</AppText>
          )}
          <TextInput
            style={[styles.input, error && styles.errorBorder, , style]}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            keyboardType="numeric"
            secureTextEntry={secureTextEntry}
            onBlur={onBlur}
            maxFontSizeMultiplier={1}
            allowFontScaling={false}
            maxLength={maxLength}
            onChangeText={text => {
              const numericValue = text.replace(/[^0-9]/g, "");
              onChange(numericValue);
            }}
            value={value ? String(value) : ""}
          />
          {error && <AppText style={styles.errorText}>{error.message}</AppText>}
        </View>
      )}
    />
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      marginBottom: normalizeSpacing(15),
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: normalizeSpacing(16),
      paddingVertical: normalizeSpacing(16),
      color: colors.text,
      fontFamily: getFontFamily("400"),
      fontSize: normalize(18),
      backgroundColor: colors.background,
    },
    errorBorder: {
      borderColor: colors.error,
      borderWidth: 1,
    },
    errorText: {
      color: colors.error,
      marginTop: normalizeSpacing(6),
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
      marginLeft: normalizeSpacing(4),
    },
    label: {
      fontFamily: getFontFamily("800"),
      fontSize: normalize(17),
      marginBottom: normalizeSpacing(1),
      color: colors.text,
    },
  });

export default NumberInputField;
