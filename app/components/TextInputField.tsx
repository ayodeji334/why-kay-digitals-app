import React from "react";
import { Controller } from "react-hook-form";
import { TextInput, View, Text, StyleSheet } from "react-native";
import { width } from "../constants/settings";

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
}

const TextInputField: React.FC<Props> = ({
  control,
  name,
  placeholder,
  secureTextEntry,
  rules,
  label,
  showLabel = true,
  autoCapitalize = "none",
  keyboardType = "default",
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
        <View style={styles.container}>
          {showLabel && label && <Text style={styles.label}>{label}</Text>}
          <TextInput
            style={[styles.input, error && styles.errorBorder]}
            placeholder={placeholder}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize}
          />
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  errorBorder: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginTop: 4,
    fontSize: 12,
  },
  label: {
    fontSize: width * 0.0353,
    fontWeight: "500",
    marginBottom: 9,
    color: "#333",
  },
});

export default TextInputField;
