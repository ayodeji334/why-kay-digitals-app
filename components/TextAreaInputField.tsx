import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Controller, Control, FieldValues } from "react-hook-form";
import { COLORS } from "../constants/colors";
import {
  getFontFamily,
  normalize,
  width,
  normalizeSpacing,
} from "../constants/settings";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";
import { useStyles } from "../hooks/useStyles";

interface TextAreaInputProps extends TextInputProps {
  name: string;
  control: Control<FieldValues>;
  label?: string;
  rules?: object;
}

const TextAreaInput = ({
  name,
  control,
  label,
  rules = {},
  placeholder = "",
  ...rest
}: TextAreaInputProps) => {
  const styles = useStyles(makeStyles);

  return (
    <View style={{ marginVertical: normalizeSpacing(8) }}>
      {label && <AppText style={styles.label}>{label}</AppText>}
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <>
            <TextInput
              style={[styles.textArea, error && styles.errorBorder]}
              placeholder={placeholder}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              {...rest}
              maxFontSizeMultiplier={1}
              allowFontScaling={false}
            />
            {error && (
              <AppText style={styles.errorText}>{error.message}</AppText>
            )}
          </>
        )}
      />
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    label: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("800"),
      marginBottom: normalizeSpacing(4),
      color: colors.background,
    },
    textArea: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: normalizeSpacing(16),
      fontSize: width * 0.032,
      backgroundColor: colors.inputBackground,
      minHeight: 120,
    },
    errorBorder: {
      borderColor: COLORS.error,
      borderWidth: 1,
    },
    errorText: {
      color: COLORS.error,
      fontSize: width * 0.028,
      marginTop: normalizeSpacing(4),
    },
  });

export default TextAreaInput;
