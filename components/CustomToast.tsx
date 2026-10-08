import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ToastType } from "../hooks/useToast";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";

// How far above the screen the toast starts before it slides down: far enough
// to be hidden even on devices with a tall notch.
const OFFSCREEN_Y = -200;

export interface CustomToastProps {
  message: string;
  type: ToastType;
  /** Extra vertical offset, used to stack multiple toasts under one another. */
  offset?: number;
  duration?: number;
  onHide: () => void;
}

export default function CustomToast({
  message,
  type,
  offset = 0,
  duration = 3000,
  onHide,
}: CustomToastProps) {
  // Space the toast must leave for the status bar / notch. This is the real
  // inset: the notch height on iOS, and 0 on Android here, because the app
  // isn't edge-to-edge so its window already starts below the status bar
  // (the old StatusBar.currentHeight padding doubled that gap on Android).
  const { top: topInset } = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(OFFSCREEN_Y)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissed = useRef(false);

  const dismiss = () => {
    if (dismissed.current) return;
    dismissed.current = true;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: OFFSCREEN_Y,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onHide();
    });
  };

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 9,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const hideTimer = setTimeout(dismiss, duration);
    return () => clearTimeout(hideTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.wrapper,
          { top: offset, opacity, transform: [{ translateY }] },
        ]}
      >
        <Pressable
          onPress={dismiss}
          style={[
            styles.container,
            {
              paddingTop: topInset + 14,
              backgroundColor: type === ToastType.ERROR ? "#D41111" : "green",
            },
          ]}
        >
          <Text style={styles.text} numberOfLines={3}>
            {message}
          </Text>
        </Pressable>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 20000,
    elevation: 20000,
  },
  // Edge-to-edge banner — the background fills the full width, no side
  // margins and no rounded corners, so the color reads as a solid strip
  // rather than a floating card.
  container: {
    width: "100%",
    paddingHorizontal: normalizeSpacing(20),
    paddingBottom: normalizeSpacing(16),
  },
  text: {
    color: "white",
    fontFamily: getFontFamily(700),
    fontSize: normalize(21),
    textAlign: "left",
  },
});
