import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { TextInput, View, StyleSheet, TouchableOpacity } from "react-native";
import { getFontFamily, normalize } from "../constants/settings";
import { Eye, EyeSlash } from "iconsax-react-nativejs";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";
import { COLORS } from "../constants/colors";

interface Props {
  control: any;
  name: string;
  placeholder?: string;
  rules?: object;
  label?: string;
  showLabel?: boolean;
  showHints?: boolean;
  placeholderTextColor?: string;
}

const PasswordInputField: React.FC<Props> = ({
  control,
  name,
  placeholder,
  rules,
  label,
  showLabel = true,
  showHints = false,
  placeholderTextColor = "#aeaeaeff",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const colors = useColors();
  const styles = makeStyles(colors);

  const passwordValidations = [
    { label: "At least 8 characters", test: (val: string) => val.length >= 8 },
    { label: "One uppercase letter", test: (val: string) => /[A-Z]/.test(val) },
    { label: "One lowercase letter", test: (val: string) => /[a-z]/.test(val) },
    { label: "One number", test: (val: string) => /[0-9]/.test(val) },
    {
      label: "One special character",
      test: (val: string) => /[^A-Za-z0-9]/.test(val),
    },
  ];

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        ...rules,
        pattern: {
          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/,
          message:
            "Password must contain at least 8 characters, one uppercase, one lowercase, and one special character.",
        },
      }}
      render={({
        field: { onChange, onBlur, value = "" },
        fieldState: { error },
      }) => (
        <View style={styles.container}>
          {showLabel && label && (
            <AppText style={styles.label}>{label}</AppText>
          )}

          <View style={[styles.inputWrapper, error && styles.errorBorder]}>
            <TextInput
              style={[styles.input, !value && styles.placeholderStyle]}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              secureTextEntry={!showPassword}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              maxFontSizeMultiplier={1}
              allowFontScaling={false}
            />
            <TouchableOpacity
              style={{ marginRight: 5 }}
              hitSlop={10}
              activeOpacity={1}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Eye size={normalize(22)} color={colors.text} />
              ) : (
                <EyeSlash size={normalize(22)} color={colors.text} />
              )}
            </TouchableOpacity>
          </View>
          {error && <AppText style={styles.errorText}>{error.message}</AppText>}

          {showHints && value !== "" && (
            <View style={styles.hintsWrapper}>
              {passwordValidations.map((rule, idx) => {
                const passed = rule.test(value);
                return (
                  <AppText
                    key={idx}
                    style={[
                      styles.hint,
                      passed ? styles.hintValid : styles.hintInvalid,
                    ]}
                  >
                    {passed ? "✅" : "❌"} {rule.label}
                  </AppText>
                );
              })}
            </View>
          )}
        </View>
      )}
    />
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      marginBottom: 10,
    },
    label: {
      fontFamily: getFontFamily("800"),
      fontSize: normalize(17),
      marginBottom: 2,
      color: colors.text,
    },
    placeholderStyle: {
      color: colors.textMuted,
      fontSize: normalize(18),
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 8,
      backgroundColor: colors.background,
    },
    input: {
      flex: 1,
      paddingHorizontal: 5,
      paddingVertical: normalize(14),
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
      marginVertical: 4,
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
    },
    hintsWrapper: {
      marginTop: 6,
      flexDirection: "row",
      gap: 9,
      flexWrap: "wrap",
    },
    hint: {
      fontFamily: getFontFamily("700"),
      fontSize: normalize(16),
      marginVertical: 2,
      color: colors.text,
    },
    hintValid: {
      color: COLORS.primary,
      fontFamily: getFontFamily("700"),
      fontSize: normalize(16),
    },
    hintInvalid: {
      color: "red",
      fontFamily: getFontFamily("700"),
      fontSize: normalize(16),
    },
  });

export default PasswordInputField;
