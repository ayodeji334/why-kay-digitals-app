import React from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { COLORS } from "../constants/colors";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import CustomIcon from "./CustomIcon";
import { CloseIcon } from "../assets";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";

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
  isDangerous = false,
  showCloseButton = false,
}: HalfScreenModalProps) => {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
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

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      width: "100%",
      backgroundColor: colors.inputBackground,
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
      padding: normalizeSpacing(24),
      paddingBottom: normalizeSpacing(50),
      alignItems: "center",
      position: "relative",
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
    modalContent: {
      alignItems: "center",
      width: "100%",
      paddingBottom: normalizeSpacing(20),
      marginTop: normalizeSpacing(30),
    },
    iconContainer: {
      borderRadius: 45,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: normalizeSpacing(20),
      padding: normalizeSpacing(10),
    },
    title: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("900"),
      color: colors.text,
      paddingBottom: normalizeSpacing(18),
      textAlign: "center",
    },
    description: {
      fontSize: normalize(19),
      fontFamily: getFontFamily("400"),
      color: colors.text,
      textAlign: "center",
      marginBottom: normalizeSpacing(24),
    },
    button: {
      paddingVertical: normalizeSpacing(14),
      paddingHorizontal: normalizeSpacing(30),
      borderRadius: 100,
      width: "100%",
      alignItems: "center",
      marginTop: normalizeSpacing(10),
    },
    buttonText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: COLORS.whiteBackground,
    },
    secondaryButton: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.text,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
    },
  });

export default HalfScreenModal;
