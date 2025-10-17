import React, { useState } from "react";
import { Controller } from "react-hook-form";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { normalize } from "../constants/settings";
import { Eye, EyeSlash } from "iconsax-react-nativejs";

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
          {showLabel && label && <Text style={styles.label}>{label}</Text>}

          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                error && styles.errorBorder,
                !value && styles.placeholderStyle,
              ]}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              secureTextEntry={!showPassword}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
            </TouchableOpacity>
          </View>

          {showHints && value !== "" && (
            <View style={styles.hintsWrapper}>
              {passwordValidations.map((rule, idx) => {
                const passed = rule.test(value);
                return (
                  <Text
                    key={idx}
                    style={[
                      styles.hint,
                      passed ? styles.hintValid : styles.hintInvalid,
                    ]}
                  >
                    {passed ? "✅" : "❌"} {rule.label}
                  </Text>
                );
              })}
            </View>
          )}

          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: normalize(13),
    fontWeight: "500",
    marginBottom: 6,
  },
  placeholderStyle: {
    color: "#000000ff",
    fontSize: normalize(11),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 5,
    paddingVertical: 15,
    color: "#000",
  },
  errorBorder: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginTop: 4,
    fontSize: normalize(12),
  },
  hintsWrapper: {
    marginTop: 6,
  },
  hint: {
    fontSize: 12,
    marginVertical: 2,
  },
  hintValid: {
    color: "green",
  },
  hintInvalid: {
    color: "red",
  },
});

export default PasswordInputField;
