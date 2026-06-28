import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import CustomIcon from "./CustomIcon";
import { CloseIcon } from "../assets";
import { AppText } from "./AppText";

interface HalfScreenModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonText: string;
  actionButton?: () => void;
  secondaryButtonText?: string;
  secondaryAction?: () => void;
  IconComponent?: React.JSX.Element;
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
  // iconColor = COLORS.primary,
  // iconSize = normalize(22),
  isDangerous = false,
  showCloseButton = false,
}: HalfScreenModalProps) => {
  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {showCloseButton && (
            <Pressable
              style={styles.closeButton}
              hitSlop={100}
              onPress={onClose}
            >
              <CustomIcon
                source={CloseIcon}
                color={COLORS.primary}
                fill={COLORS.primary}
                overrideColor
                size={18}
              />
            </Pressable>
          )}

          <View style={styles.modalContent}>
            {IconComponent && (
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: iconBackgroundColor },
                ]}
              >
                {IconComponent}
              </View>
            )}

            <AppText style={styles.title}>{title}</AppText>
            {description && (
              <AppText style={styles.description}>{description}</AppText>
            )}

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
              <AppText
                style={[
                  styles.buttonText,
                  { color: isDangerous ? "white" : "white" },
                ]}
              >
                {buttonText}
              </AppText>
            </TouchableOpacity>

            {secondaryButtonText && secondaryAction && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.button, styles.secondaryButton]}
                onPress={secondaryAction}
              >
                <AppText
                  style={[styles.buttonText, styles.secondaryButtonText]}
                >
                  {secondaryButtonText}
                </AppText>
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
    paddingBottom: 18,
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
    fontFamily: getFontFamily("800"),
    color: COLORS.whiteBackground,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.darkBackground,
  },
  secondaryButtonText: {
    color: COLORS.dark,
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
  },
});

export default HalfScreenModal;
