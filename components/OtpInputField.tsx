import React, { useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from "react-native";
import { Controller } from "react-hook-form";
import { getFontFamily, normalize } from "../constants/settings";
import Clipboard from "@react-native-clipboard/clipboard";
import { COLORS } from "../constants/colors";

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
        // single source of truth — always derived from form value
        const otpArray: string[] = value
          ? value.split("").slice(0, boxes)
          : Array(boxes).fill("");

        // ─── Handlers ───────────────────────────────────────────────────────

        const handleChange = (text: string, index: number) => {
          // FIX: handle paste (text.length > 1) — works because maxLength is now `boxes`
          const cleaned = text.replace(/\D/g, "");

          if (cleaned.length > 1) {
            const newOtp = [...otpArray];
            cleaned
              .slice(0, boxes)
              .split("")
              .forEach((char, i) => {
                if (index + i < boxes) newOtp[index + i] = char;
              });
            onChange(newOtp.join(""));
            const nextIndex = Math.min(index + cleaned.length, boxes - 1);
            inputs.current[nextIndex]?.focus();
            return;
          }

          // single character typed
          const newOtp = [...otpArray];
          newOtp[index] = cleaned;
          onChange(newOtp.join(""));
          if (cleaned && index < boxes - 1) {
            inputs.current[index + 1]?.focus();
          }
        };

        const handleKeyPress = (e: any, index: number) => {
          if (e.nativeEvent.key === "Backspace") {
            const newOtp = [...otpArray];
            if (newOtp[index]) {
              newOtp[index] = "";
              onChange(newOtp.join(""));
            } else if (index > 0) {
              newOtp[index - 1] = "";
              onChange(newOtp.join(""));
              inputs.current[index - 1]?.focus();
            }
          }
        };

        const handlePaste = async (index: number) => {
          try {
            const text = await Clipboard.getString();
            if (!text) return;
            const cleaned = text.replace(/\D/g, "").slice(0, boxes);
            if (!cleaned) return;

            const newOtp = [...otpArray];
            cleaned.split("").forEach((char, i) => {
              if (index + i < boxes) newOtp[index + i] = char;
            });

            onChange(newOtp.join(""));
            const nextIndex = Math.min(index + cleaned.length, boxes - 1);
            inputs.current[nextIndex]?.focus();
          } catch {}
        };

        return (
          <View style={[styles.wrapper, containerStyle]}>
            {showLabel && label && <Text style={styles.label}>{label}</Text>}

            <View style={styles.container}>
              {Array.from({ length: boxes }, (_, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={1}
                  onLongPress={() => handlePaste(index)}
                  onPress={() => inputs.current[index]?.focus()}
                  style={[
                    styles.box,
                    boxStyle,
                    error ? styles.errorBorder : null,
                  ]}
                >
                  {/* <TextInput
                    ref={el => {
                      if (el) inputs.current[index] = el;
                    }}
                    style={styles.hiddenInput}
                    keyboardType="number-pad"
                    maxLength={boxes}
                    value={otpArray[index] || ""}
                    onChangeText={text => handleChange(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    textContentType="oneTimeCode"
                    secureTextEntry={false}
                    selectionColor={COLORS.primary}
                    caretHidden={false}
                    autoCapitalize="none"
                    maxFontSizeMultiplier={0}
                    autoCorrect={false}
                    contextMenuHidden={false}
                    selection={
                      otpArray[index]
                        ? { start: 1, end: 1 }
                        : { start: 0, end: 0 }
                    }
                  /> */}
                  <TextInput
                    ref={el => {
                      if (el) inputs.current[index] = el;
                    }}
                    style={styles.hiddenInput}
                    keyboardType="number-pad"
                    maxLength={boxes}
                    value={otpArray[index] || ""}
                    onChangeText={text => handleChange(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    textContentType="oneTimeCode"
                    secureTextEntry={false}
                    selectionColor={COLORS.primary}
                    caretHidden={true}
                    autoCapitalize="none"
                    maxFontSizeMultiplier={0}
                    autoCorrect={false}
                    contextMenuHidden={false}
                  />

                  <Text style={styles.boxText} pointerEvents="none">
                    {otpArray[index] ? (
                      isSecuredText ? (
                        "●"
                      ) : (
                        otpArray[index]
                      )
                    ) : (
                      <Text style={styles.placeholder}>●</Text>
                    )}
                  </Text>
                </TouchableOpacity>
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
    gap: 10,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  box: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    alignSelf: "center",
    backgroundColor: "white",
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    color: "transparent",
    backgroundColor: "transparent",
    position: "absolute",
    width: "100%",
    height: "100%",
    textAlign: "center",
    textAlignVertical: "center",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0,
    lineHeight: 40,
  },
  boxText: {
    position: "absolute",
    fontSize: 26,
    fontFamily: getFontFamily("800"),
    color: "black",
    textAlign: "center",
    textAlignVertical: "center",
    zIndex: 0,
    pointerEvents: "none",
  },
  placeholder: {
    fontSize: 26,
    color: "#ccc",
    fontFamily: getFontFamily("800"),
    alignContent: "center",
  },
  label: {
    fontFamily: getFontFamily("800"),
    fontSize: normalize(18),
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
