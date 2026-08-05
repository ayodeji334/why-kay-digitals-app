import React, { useState } from "react";
import { Controller } from "react-hook-form";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
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
  placeholderTextColor?: string;
  style?: TextStyle;
  containerStyle?: ViewStyle;
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
  showSuggestions?: boolean;
}

const EmailInputField: React.FC<Props> = ({
  control,
  name,
  placeholder = "Enter your email address",
  rules = {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
  },
  label = "Email Address",
  showLabel = true,
  placeholderTextColor = "#aeaeaeff",
  style,
  containerStyle,
  autoComplete = "email",
  textContentType = "emailAddress",
  showSuggestions = true,
}) => {
  const colors = useColors();
  const styles = makeStyles(colors);
  const [isFocused, setIsFocused] = useState(false);
  const commonDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
  ];

  const getEmailSuggestions = (input: string) => {
    if (!input || !input.includes("@") || !showSuggestions) return [];

    const [localPart, domainPart] = input.split("@");
    if (!domainPart) return [];

    return commonDomains
      .filter(domain => domain.startsWith(domainPart.toLowerCase()))
      .map(domain => `${localPart}@${domain}`)
      .slice(0, 3); // Limit to 3 suggestions
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => {
        const suggestions = getEmailSuggestions(value || "");

        return (
          <View style={[styles.container, containerStyle]}>
            {showLabel && label && (
              <AppText style={styles.label}>{label}</AppText>
            )}
            <TextInput
              style={[
                styles.input,
                error && styles.errorBorder,
                isFocused && styles.focusedBorder,
                style,
              ]}
              maxFontSizeMultiplier={1}
              allowFontScaling={false}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              onBlur={() => {
                onBlur();
                setIsFocused(false);
              }}
              onFocus={() => setIsFocused(true)}
              onChangeText={onChange}
              value={value?.toString()}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete={autoComplete}
              textContentType={textContentType}
              importantForAutofill="yes"
              enterKeyHint="next"
            />

            {/* Email Suggestions */}
            {suggestions.length > 0 && isFocused && (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.89}
                    hitSlop={3}
                    style={styles.suggestionItem}
                    onPress={() => {
                      onChange(suggestion);
                    }}
                  >
                    <AppText style={styles.suggestionText}>
                      {suggestion}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {error && (
              <AppText style={styles.errorText}>{error.message}</AppText>
            )}
          </View>
        );
      }}
    />
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      marginBottom: 10,
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
    focusedBorder: {
      borderColor: "#007AFF",
      borderWidth: 1.5,
      color: colors.text,
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
    suggestionsContainer: {
      marginTop: 4,
      backgroundColor: "#FFFFFF",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#E5E5E5",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    suggestionItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    suggestionText: {
      fontFamily: getFontFamily("400"),
      fontSize: normalize(16),
      color: colors.primary,
    },
  });

export default EmailInputField;
