// export default OtpInputField;
import React, { useRef } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Controller } from "react-hook-form";
import { getFontFamily, normalize } from "../constants/settings";

interface OtpInputFieldProps {
  control: any;
  name: string;
  boxes?: number;
  isSecuredText?: boolean;
}

const OtpInputField: React.FC<OtpInputFieldProps> = ({
  control,
  name,
  boxes = 6,
  isSecuredText = false,
}) => {
  // create array of refs
  const inputs = useRef<TextInput[]>([]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const otpArray = value ? value.split("") : [];

        const handleChange = (text: string, index: number) => {
          if (text.length > 1) {
            // handle paste
            const newOtp = text.slice(0, boxes).split("");
            onChange(newOtp.join(""));
            newOtp.forEach((digit, i) => {
              if (inputs.current[i]) {
                inputs.current[i].setNativeProps({ text: digit });
              }
            });
            if (newOtp.length < boxes) {
              inputs.current[newOtp.length]?.focus();
            }
            return;
          }

          otpArray[index] = text;
          onChange(otpArray.join(""));

          if (text && index < boxes - 1) {
            inputs.current[index + 1]?.focus();
          }
        };

        const handleKeyPress = (e: any, index: number) => {
          if (e.nativeEvent.key === "Backspace") {
            if (otpArray[index]) {
              // clear current
              otpArray[index] = "";
              onChange(otpArray.join(""));
            } else if (index > 0) {
              // move back and clear previous
              inputs.current[index - 1]?.focus();
              otpArray[index - 1] = "";
              onChange(otpArray.join(""));
            }
          }
        };

        return (
          <View style={styles.container}>
            {Array.from({ length: boxes }, (_, index) => (
              <TextInput
                key={index}
                ref={el => {
                  if (el) inputs.current[index] = el;
                }}
                secureTextEntry={isSecuredText}
                style={[styles.box, error ? styles.errorBorder : null]}
                keyboardType="number-pad"
                maxLength={1}
                value={otpArray[index] || ""}
                onChangeText={text => handleChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                textContentType="oneTimeCode"
              />
            ))}
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  errorBorder: {
    borderColor: "red",
  },
  box: {
    width: 50,
    height: 55,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    fontFamily: getFontFamily(700),
    fontSize: normalize(19),
  },
});

export default OtpInputField;
