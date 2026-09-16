import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Message } from "iconsax-react-nativejs";
import { normalize, normalizeSpacing } from "../constants/settings";
import { useColors } from "../hooks/useTheme";
import { useLiveChat } from "../context/LiveChatProvider";

type Props = {
  /** Extra spacing to push the button up from the bottom edge, e.g. to clear a tab bar. */
  bottomOffset?: number;
  style?: ViewStyle;
};

/**
 * Floating "Help Center" launcher that can be dropped into any screen
 * (most importantly unauthenticated ones, which don't render CustomHeader's
 * chat button). Renders as a circular button pinned to the bottom-right
 * corner and opens the same live chat widget as CustomHeader's version.
 */
const LiveChatButton: React.FC<Props> = ({ bottomOffset = 0, style }) => {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { openLiveChat } = useLiveChat();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      hitSlop={10}
      onPress={openLiveChat}
      style={[
        styles.button,
        {
          backgroundColor: colors.primary,
          bottom: insets.bottom + normalizeSpacing(20) + bottomOffset,
        },
        style,
      ]}
    >
      <Message size={normalize(24)} color="#fff" variant="Bold" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: normalizeSpacing(20),
    width: normalize(54),
    height: normalize(54),
    borderRadius: normalize(27),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 999,
  },
});

export default LiveChatButton;
