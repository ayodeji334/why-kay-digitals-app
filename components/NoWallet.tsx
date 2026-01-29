import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { getFontFamily } from "../constants/settings";
import { COLORS } from "../constants/colors";
import CustomIcon from "./CustomIcon";
import { WalletIcon } from "../assets";
import useAxios from "../hooks/useAxios";
import { showSuccess } from "../utlis/toast";

interface NoWalletProps {
  selectedAssetUuid: string;
  onSuccess: () => void;
}

const NoWallet: React.FC<NoWalletProps> = ({
  selectedAssetUuid,
  onSuccess,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { apiGet } = useAxios();

  const handleGenerateWallet = async () => {
    setIsGenerating(true);

    try {
      await apiGet(`wallets/user/${selectedAssetUuid}/generate-wallet`);

      showSuccess("Wallet created!");

      onSuccess();
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

        <Text style={styles.noWalletTitle}>No Wallet</Text>

        <Text style={styles.noWalletText}>
          You need to generate wallet before you can receive assets. This will
          create a unique wallet for this asset.
        </Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          disabled={isGenerating}
          style={[styles.generateButton, isGenerating && { opacity: 0.6 }]}
          activeOpacity={0.89}
          onPress={handleGenerateWallet}
        >
          <Text style={styles.generateButtonText}>
            {isGenerating ? "Generating..." : `Generate Wallet`}
          </Text>
        </TouchableOpacity>

        <Text style={styles.noteText}>
          Your wallet and addresses will be generated securely and can be used
          to receive cryptocurrency.
        </Text>
      </View>
    </View>
  );
};

export default NoWallet;

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 18,
    minHeight: "100%",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: "white",
  },
  emptyChainsText: {
    textAlign: "center",
    fontFamily: getFontFamily(400),
    fontSize: 14,
    color: "#B00020",
    marginBottom: 20,
    maxWidth: 260,
    lineHeight: 18,
  },
  section: {
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 18,
  },
  walletCircle: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: "#D9D9D91A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  noWalletTitle: {
    color: "black",
    fontFamily: getFontFamily(800),
    fontSize: 20,
    marginBottom: 10,
  },
  noWalletText: {
    textAlign: "center",
    fontFamily: getFontFamily(400),
    fontSize: 14,
    marginBottom: 30,
    maxWidth: 230,
    lineHeight: 18,
  },
  label: {
    color: "black",
    fontFamily: getFontFamily(900),
    fontSize: 19,
    marginBottom: 6,
  },
  chainButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  generateButton: {
    width: "100%",
    minWidth: "100%",
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  generateButtonText: {
    color: "white",
    fontFamily: getFontFamily(700),
    fontSize: 15,
  },
  noteText: {
    marginVertical: 10,
    color: "#3a3a3aff",
    fontFamily: getFontFamily(400),
    fontSize: 14,
    textAlign: "center",
    lineHeight: 15,
  },
});
