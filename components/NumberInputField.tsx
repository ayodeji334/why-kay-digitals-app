import React, { useState } from "react";
import { Controller } from "react-hook-form";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import { Eye, EyeSlash } from "iconsax-react-nativejs";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";
import { useStyles } from "../hooks/useStyles";

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
  const styles = useStyles(makeStyles);
  // Secure fields (e.g. PINs) start hidden; the eye icon reveals them.
  const [isHidden, setIsHidden] = useState(true);

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
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                secureTextEntry && styles.inputWithToggle,
                error && styles.errorBorder,
                style,
              ]}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              keyboardType="numeric"
              secureTextEntry={secureTextEntry && isHidden}
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
            {secureTextEntry && (
              <TouchableOpacity
                style={styles.toggle}
                hitSlop={10}
                activeOpacity={0.7}
                onPress={() => setIsHidden(hidden => !hidden)}
                accessibilityRole="button"
                accessibilityLabel={
                  isHidden
                    ? `Show ${label ?? "value"}`
                    : `Hide ${label ?? "value"}`
                }
              >
                {isHidden ? (
                  <EyeSlash size={normalize(22)} color={colors.text} />
                ) : (
                  <Eye size={normalize(22)} color={colors.text} />
                )}
              </TouchableOpacity>
            )}
          </View>
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
    inputWrapper: {
      position: "relative",
      justifyContent: "center",
    },
    // Leaves room for the eye icon so digits never run under it.
    inputWithToggle: {
      paddingRight: normalizeSpacing(48),
    },
    toggle: {
      position: "absolute",
      right: normalizeSpacing(14),
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
