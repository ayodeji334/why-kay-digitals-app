import React, { useState } from "react";
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { AppText } from "./AppText";
import { getFontFamily, normalize } from "../constants/settings";
import { useColors } from "../hooks/useTheme";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EmailPromptModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const colors = useColors();
  const styles = makeStyles(colors);

  const handleSubmit = () => {
    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    onSubmit(email.trim());
    setEmail("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <AppText style={styles.title}>What's your email?</AppText>
          <AppText style={styles.subtitle}>
            We'll use this to follow up with you if the chat gets disconnected.
          </AppText>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.text}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          {!!error && <AppText style={styles.error}>{error}</AppText>}

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <AppText style={styles.cancelText}>Cancel</AppText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
              <AppText style={styles.submitText}>Start Chat</AppText>
            </TouchableOpacity>
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
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    card: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 20,
    },
    title: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.text,
      marginBottom: 16,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: normalize(18),
      color: colors.text,
      fontFamily: getFontFamily("400"),
    },
    error: {
      color: colors.error,
      fontSize: normalize(16),
      fontFamily: getFontFamily("700"),
      marginTop: 6,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 18,
      gap: 12,
    },
    cancelBtn: {
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 14,
      backgroundColor: colors.inputBackground,
    },
    cancelText: {
      color: colors.text,
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
    },
    submitBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 10,
    },
    submitText: {
      color: "#fff",
      fontSize: normalize(17),
      fontFamily: getFontFamily("800"),
    },
  });

export default EmailPromptModal;
