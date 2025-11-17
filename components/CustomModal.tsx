import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import CustomIcon from "./CustomIcon";
import { CloseIcon } from "../assets";

interface CustomModalProps {
  visible: boolean;
  onClose: (event?: GestureResponderEvent) => void;
  title?: string;
  children?: React.ReactNode;
  showCloseButton?: boolean;
  height?: number;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  height = 600,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { minHeight: height }]}>
          {showCloseButton && (
            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.7}
              onPress={onClose}
            >
              <CustomIcon
                source={CloseIcon}
                color={COLORS.primary}
                fill={COLORS.primary}
                overrideColor
                size={18}
              />
            </TouchableOpacity>
          )}

          {title && <Text style={styles.modalTitle}>{title}</Text>}

          <View style={{ flex: 1 }}>{children}</View>

          {showCloseButton && (
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.closeButton, { marginTop: 20 }]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("800"),
    marginBottom: 16,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  closeButtonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
});

export default CustomModal;
