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
  isEditable?: boolean;
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
  isEditable = true,
}) => {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      // disabled={isEditable}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View style={[styles.container, containerStyle]}>
          {showLabel && label && (
            <AppText style={styles.label}>{label}</AppText>
          )}
          <TextInput
            style={[
              styles.input,
              error && styles.errorBorder,
              !isEditable && styles.disabled,
              style,
            ]}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value?.toString()}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            maxFontSizeMultiplier={1}
            allowFontScaling={false}
            editable={isEditable}
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
      marginBottom: 10,
    },
    disabled: {
      opacity: 0.6,
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
      marginBottom: 2,
      color: colors.text,
    },
  });

export default TextInputField;
