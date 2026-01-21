import React, { useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Controller } from "react-hook-form";
import { getFontFamily, normalize } from "../constants/settings";

interface OtpInputFieldProps {
  control: any;
  name: string;
  boxes?: number;
  isSecuredText?: boolean;
  label?: string;
  showLabel?: boolean;
  containerStyle?: ViewStyle;
  boxStyle?: TextStyle;
}

const OtpInputField: React.FC<OtpInputFieldProps> = ({
  control,
  name,
  boxes = 6,
  isSecuredText = false,
  label,
  showLabel = true,
  containerStyle,
  boxStyle,
}) => {
  const inputs = useRef<TextInput[]>([]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const otpArray = value ? value.split("") : [];

        const handleChange = (text: string, index: number) => {
          if (text.length > 1) {
            const newOtp = text.slice(0, boxes).split("");
            onChange(newOtp.join(""));
            newOtp.forEach((digit, i) => {
              if (inputs.current[i])
                inputs.current[i].setNativeProps({ text: digit });
            });
            inputs.current[newOtp.length - 1]?.focus();
            return;
          }
          otpArray[index] = text;
          onChange(otpArray.join(""));
          if (text && index < boxes - 1) inputs.current[index + 1]?.focus();
        };

        const handleKeyPress = (e: any, index: number) => {
          if (e.nativeEvent.key === "Backspace") {
            if (otpArray[index]) {
              otpArray[index] = "";
              onChange(otpArray.join(""));
            } else if (index > 0) {
              inputs.current[index - 1]?.focus();
              otpArray[index - 1] = "";
              onChange(otpArray.join(""));
            }
          }
        };

        return (
          <View style={[styles.wrapper, containerStyle]}>
            {showLabel && label && <Text style={styles.label}>{label}</Text>}

            <View style={styles.container}>
              {Array.from({ length: boxes }, (_, index) => (
                <TextInput
                  key={index}
                  ref={el => {
                    if (el) inputs.current[index] = el;
                  }}
                  style={[
                    styles.box,
                    boxStyle,
                    error ? styles.errorBorder : null,
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={otpArray[index] || ""}
                  onChangeText={text => handleChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  textContentType="oneTimeCode"
                  secureTextEntry={isSecuredText}
                  selectionColor="transparent"
                  caretHidden={isSecuredText}
                  placeholder={isSecuredText ? "*" : "*"}
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  maxFontSizeMultiplier={0}
                  autoCorrect={false}
                />
              ))}
            </View>

            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 15,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  box: {
    width: 50,
    height: 55,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    fontFamily: getFontFamily(800),
    fontSize: normalize(30),
  },
  label: {
    fontFamily: getFontFamily("700"),
    fontSize: normalize(17),
    marginBottom: 6,
    color: "#000",
  },
  errorBorder: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    marginTop: 6,
    fontFamily: getFontFamily("700"),
    fontSize: normalize(16),
    marginLeft: 4,
  },
});

export default OtpInputField;
