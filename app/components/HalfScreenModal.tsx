import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
} from "react-native";
import { COLORS } from "../constants/colors";

const { width } = Dimensions.get("window");

interface Prop {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonText: string;
  iconSource?: ImageSourcePropType | undefined;
}

const HalfScreenModal = ({
  isVisible,
  onClose,
  title = "Password Recovery",
  description = "Return to the login screen to enter the Home Screen",
  buttonText = "Return to Sign In",
  iconSource = require("../assets/splash_logo.png"),
}: Prop) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <Image
                source={iconSource}
                style={styles.successIcon}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.button}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
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
    alignItems: "baseline",
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "white",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 24,
    paddingBottom: 50,
    alignItems: "center",
    shadowColor: "red",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    alignItems: "center",
    width: "100%",
    paddingBottom: 20,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successIcon: {
    width: 50,
    height: 50,
    tintColor: "#4CAF50", // Green color for the icon
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4CAF50", // Green color for success message
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: width * 0.04,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 100,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HalfScreenModal;
