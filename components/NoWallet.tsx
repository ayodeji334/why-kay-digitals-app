import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { COLORS } from "../constants/colors";
import CustomIcon from "./CustomIcon";
import { WalletIcon } from "../assets";
import { AxiosError } from "axios";
import useAxios from "../hooks/useAxios";
import { showError, showSuccess } from "../utlis/toast";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";

interface NoWalletProps {
  selectedAssetUuid: string;
  onSuccess: () => void;
}

const NoWallet: React.FC<NoWalletProps> = ({
  selectedAssetUuid,
  onSuccess,
}) => {
  const colors = useColors();
  const styles = makeStyles(colors);
  const [isGenerating, setIsGenerating] = useState(false);
  const { apiGet } = useAxios();

  const handleGenerateWallet = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      await apiGet(`wallets/user/${selectedAssetUuid}/generate-wallet`);

      showSuccess("Wallet created!");

      onSuccess();
    } catch (err) {
      if (err instanceof AxiosError) {
        showError(
          err.response?.data?.message ??
            "Cannot generate wallet at the moment",
        );
      } else {
        showError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.centerContainer}>
      <View style={styles.section}>
        <View style={styles.walletCircle}>
          <CustomIcon source={WalletIcon} size={30} color={COLORS.primary} />
        </View>

        <AppText style={styles.noWalletTitle}>No Wallet</AppText>

        <AppText style={styles.noWalletText}>
          You need to generate wallet before you can receive assets. This will
          create a unique wallet for this asset.
        </AppText>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          disabled={isGenerating}
          style={[styles.generateButton, isGenerating && { opacity: 0.6 }]}
          activeOpacity={0.89}
          onPress={handleGenerateWallet}
          hitSlop={2}
        >
          <AppText style={styles.generateButtonText}>
            {isGenerating ? "Generating..." : `Generate Wallet`}
          </AppText>
        </TouchableOpacity>

        <AppText style={styles.noteText}>
          Your wallet and addresses will be generated securely and can be used
          to receive cryptocurrency.
        </AppText>
      </View>
    </View>
  );
};

export default NoWallet;

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    centerContainer: {
      alignItems: "center",
      paddingVertical: normalizeSpacing(20),
      paddingHorizontal: normalizeSpacing(18),
      minHeight: "100%",
      justifyContent: "space-between",
      gap: 10,
      backgroundColor: colors.background,
    },
    emptyChainsText: {
      textAlign: "center",
      fontFamily: getFontFamily(400),
      fontSize: 14,
      color: "#B00020",
      marginBottom: normalizeSpacing(20),
      maxWidth: 260,
    },
    section: {
      alignItems: "center",
      paddingTop: normalizeSpacing(20),
      paddingHorizontal: normalizeSpacing(18),
    },
    walletCircle: {
      width: 70,
      height: 70,
      borderRadius: 50,
      backgroundColor: "#D9D9D91A",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: normalizeSpacing(30),
    },
    noWalletTitle: {
      color: colors.text,
      fontFamily: getFontFamily(800),
      fontSize: normalize(22),
      marginBottom: normalizeSpacing(10),
    },
    noWalletText: {
      textAlign: "center",
      fontFamily: getFontFamily(400),
      fontSize: normalize(18),
      color: colors.text,
      marginBottom: normalizeSpacing(30),
      maxWidth: 290,
    },
    label: {
      color: colors.text,
      fontFamily: getFontFamily(900),
      fontSize: normalize(19),
      marginBottom: normalizeSpacing(6),
    },
    chainButton: {
      paddingVertical: normalizeSpacing(14),
      paddingHorizontal: normalizeSpacing(14),
      borderRadius: 20,
      borderWidth: 1,
    },
    generateButton: {
      width: "100%",
      minWidth: "100%",
      paddingVertical: normalizeSpacing(14),
      borderRadius: 30,
      backgroundColor: COLORS.primary,
      alignItems: "center",
    },
    generateButtonText: {
      color: "white",
      fontFamily: getFontFamily(700),
      fontSize: normalize(18),
    },
    noteText: {
      marginVertical: normalizeSpacing(10),
      color: colors.textMuted,
      fontFamily: getFontFamily(400),
      fontSize: normalize(16),
      textAlign: "center",
    },
  });
