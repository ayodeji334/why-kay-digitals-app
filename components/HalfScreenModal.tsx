import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import { X } from "lucide-react-native";
interface HalfScreenModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonText: string;
  actionButton?: () => void;
  secondaryButtonText?: string;
  secondaryAction?: () => void;
  IconComponent?: React.ComponentType<any>;
  iconBackgroundColor?: string;
  iconColor?: string;
  iconSize?: number;
  isDangerous?: boolean;
  showCloseButton?: boolean;
}

const HalfScreenModal = ({
  isVisible,
  onClose,
  title,
  description,
  buttonText,
  actionButton,
  secondaryButtonText,
  secondaryAction,
  IconComponent,
  iconBackgroundColor = "#E0F7FA",
  iconColor = COLORS.primary,
  iconSize = normalize(22),
  isDangerous = false,
  showCloseButton = false,
}: HalfScreenModalProps) => {
  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {showCloseButton && (
            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.7}
              onPress={onClose}
            >
              <X size={20} color={"#000"} />
            </TouchableOpacity>
          )}

          <View style={styles.modalContent}>
            {IconComponent && (
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: iconBackgroundColor },
                ]}
              >
                <IconComponent size={iconSize} color={iconColor} />
              </View>
            )}

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            {/* Primary Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.button,
                {
                  backgroundColor: isDangerous
                    ? COLORS.error
                    : COLORS.secondary,
                },
              ]}
              onPress={actionButton ? actionButton : onClose}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: isDangerous ? "white" : "black" },
                ]}
              >
                {buttonText}
              </Text>
            </TouchableOpacity>

            {secondaryButtonText && secondaryAction && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.button, styles.secondaryButton]}
                onPress={secondaryAction}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  {secondaryButtonText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "white",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 24,
    paddingBottom: 50,
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  modalContent: {
    alignItems: "center",
    width: "100%",
    paddingBottom: 20,
    marginTop: 30,
  },
  iconContainer: {
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
  },
  title: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("900"),
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("400"),
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 100,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
  secondaryButton: {
    backgroundColor: "#F0F0F0",
  },
  secondaryButtonText: {
    color: "#333",
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
});

export default HalfScreenModal;
