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
      marginBottom: 15,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: normalize(16),
      paddingVertical: normalize(16),
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
      marginTop: 6,
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
      marginLeft: 4,
    },
    label: {
      fontFamily: getFontFamily("800"),
      fontSize: normalize(17),
      marginBottom: 1,
      color: colors.text,
    },
  });

export default NumberInputField;
