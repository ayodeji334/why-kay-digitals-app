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
import { getFontFamily, normalize, width } from "../constants/settings";

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
  return (
    <View style={{ marginVertical: 8 }}>
      {label && <Text style={styles.label}>{label}</Text>}
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
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: normalize(13),
    fontFamily: getFontFamily("500"),
    marginBottom: 4,
    color: COLORS.darkBackground,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: width * 0.032,
    backgroundColor: "#F9FAFB",
    minHeight: 120,
  },
  errorBorder: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: width * 0.028,
    marginTop: 4,
  },
});

export default TextAreaInput;
