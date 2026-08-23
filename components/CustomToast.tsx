import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
} from "react-native";
import { ToastType } from "../hooks/useToast";
import { getFontFamily, normalize } from "../constants/settings";

// ToastHost is mounted at the very root of the app (see App.tsx), outside
// SafeAreaProvider, so useSafeAreaInsets isn't available here — fall back to
// the same StatusBar.currentHeight pattern already used elsewhere in the app
// (e.g. PayCableTVSubscriptionScreen) and a sane constant for iOS, where
// currentHeight is always undefined.
const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight ?? 24 : 54;

// How far above the screen the toast starts before it slides down. Kept
// larger than the status bar so the entrance is visibly "beyond" it.
const OFFSCREEN_Y = -(STATUS_BAR_HEIGHT + 120);

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
            paddingTop: STATUS_BAR_HEIGHT + 14,
            backgroundColor: type === ToastType.ERROR ? "#D41111" : "green",
          },
        ]}
      >
        <Text style={styles.text} numberOfLines={3}>
          {message}
        </Text>
      </Pressable>
    </Animated.View>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.2,
    // shadowRadius: 8,
  },
  text: {
    color: "white",
    fontFamily: getFontFamily(700),
    fontSize: normalize(20),
    textAlign: "left",
  },
});
