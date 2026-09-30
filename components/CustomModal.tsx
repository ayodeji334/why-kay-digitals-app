import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
  Pressable,
  Platform,
} from "react-native";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { COLORS } from "../constants/colors";
import CustomIcon from "./CustomIcon";
import { CloseIcon } from "../assets";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";
import { useStyles } from "../hooks/useStyles";

interface CustomModalProps {
  visible: boolean;
  onClose: (event?: GestureResponderEvent) => void;
  onDismiss?: () => void;
  title?: string;
  children?: React.ReactNode;
  showCloseButton?: boolean;
  height?: number;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  onDismiss,
  title,
  children,
  showCloseButton = true,
  height = 600,
}) => {
  const styles = useStyles(makeStyles);
  // RN's <Modal onDismiss> only fires on iOS. On Android there's no native
  // presentation queue to wait out, so we call the same callback ourselves
  // right after the visible -> false transition commits.
  const wasVisible = useRef(visible);

  useEffect(() => {
    if (Platform.OS === "android" && wasVisible.current && !visible) {
      onDismiss?.();
    }
    wasVisible.current = visible;
  }, [visible, onDismiss]);

  return (
    <Modal
      onDismiss={Platform.OS === "ios" ? onDismiss : undefined}
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { minHeight: height }]}>
          {showCloseButton && (
            <Pressable style={styles.closeButton} onPress={onClose}>
              <CustomIcon
                source={CloseIcon}
                color={COLORS.primary}
                fill={COLORS.primary}
                overrideColor
                size={18}
              />
            </Pressable>
          )}

          {title && <AppText style={styles.modalTitle}>{title}</AppText>}

          <View style={{ flex: 1 }}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    modalContainer: {
      backgroundColor: colors.inputBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: normalizeSpacing(24),
    },
    modalTitle: {
      fontSize: normalize(19),
      fontFamily: getFontFamily("800"),
      marginBottom: normalizeSpacing(16),
      color: colors.text,
    },
    closeButton: {
      position: "absolute",
      top: 10,
      right: 10,
      zIndex: 10,
      borderRadius: 50,
      paddingVertical: normalizeSpacing(14),
      paddingHorizontal: normalizeSpacing(12),
      marginBottom: normalizeSpacing(20),
    },
    closeButtonText: {
      textAlign: "center",
      color: "#fff",
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
    },
  });

export default CustomModal;
