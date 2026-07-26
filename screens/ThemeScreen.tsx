import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useColors,
  useResolvedTheme,
  useSetThemeMode,
  useThemeMode,
} from "../hooks/useTheme";
import { getFontFamily, normalize } from "../constants/settings";

type ThemeMode = "light" | "dark" | "system";

const OPTIONS: {
  label: string;
  value: ThemeMode;
  icon: string;
  description: string;
}[] = [
  {
    label: "Light",
    value: "light",
    icon: "☀️",
    description: "Always use light appearance",
  },
  {
    label: "Dark",
    value: "dark",
    icon: "🌙",
    description: "Always use dark appearance",
  },
  {
    label: "System",
    value: "system",
    icon: "⚙️",
    description: "Match your device settings",
  },
];

export function ThemeScreen() {
  const colors = useColors();
  const resolvedTheme = useResolvedTheme();
  const mode = useThemeMode();
  const setMode = useSetThemeMode();

  const styles = makeStyles(colors);

  return (
    <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <Text style={styles.label}>Change Theme</Text>
      <Text style={styles.sublabel}>
        Change the appearance of the app on your device
      </Text>

      <View style={styles.card}>
        {OPTIONS.map(opt => {
          const active = mode === opt.value;

          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setMode(opt.value)}
              activeOpacity={0.9}
              style={[styles.option]}
            >
              <View style={styles.optionTextWrap}>
                <Text
                  style={[
                    styles.optionLabel,
                    active && styles.optionLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
                <Text style={styles.optionDescription}>{opt.description}</Text>
              </View>

              <View
                style={[styles.radioOuter, active && styles.radioOuterActive]}
              >
                {active && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      padding: 19,
      backgroundColor: colors.background,
      flex: 1,
    },
    label: {
      fontSize: normalize(20),
      fontFamily: getFontFamily(800),
      color: colors.text,
      letterSpacing: 0.4,
      textTransform: "capitalize",
    },
    sublabel: {
      fontSize: normalize(19),
      fontFamily: getFontFamily(700),
      color: colors.text,
      marginTop: 4,
      marginBottom: 20,
    },
    card: {
      borderRadius: 14,
      gap: 10,
      marginTop: 20,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: normalize(14),
      paddingHorizontal: normalize(17),
      gap: 12,
      borderWidth: 1,
      borderRadius: 10,
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
    },
    optionIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    optionIcon: {
      fontSize: normalize(16),
    },
    optionTextWrap: {
      flex: 1,
    },
    optionLabel: {
      fontSize: normalize(20),
      fontFamily: getFontFamily(800),
      color: colors.text,
    },
    optionLabelActive: {
      color: colors.text,
    },
    optionDescription: {
      fontSize: normalize(19),
      fontFamily: getFontFamily(400),
      color: colors.textMuted,
      marginTop: 2,
    },
    radioOuter: {
      width: 17,
      height: 17,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },
    radioOuterActive: {
      borderColor: colors.text,
    },
    radioInner: {
      width: 11,
      height: 11,
      borderRadius: 5.5,
      backgroundColor: colors.text,
    },
  });
