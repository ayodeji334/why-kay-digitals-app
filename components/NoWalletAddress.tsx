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
import { SelectInput } from "./SelectInputField";
import { AppText } from "./AppText";

interface NoWalletAddressProps {
  selectedAssetUuid: string;
  networks: Array<any>;
  onSuccess: () => void;
  selectedNetwork: any;
  handleNetworkChange: (value: any) => void;
}

const NoWalletAddress: React.FC<NoWalletAddressProps> = ({
  selectedAssetUuid,
  onSuccess,
  networks,
  selectedNetwork,
  handleNetworkChange,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { apiGet } = useAxios();

  const handleGenerateWallet = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      await apiGet(`wallets/user/${selectedAssetUuid}/generate-wallet-address`);
      showSuccess("Wallet Address created!");
      onSuccess();
    } catch (err) {
      if (err instanceof AxiosError) {
        showError(
          err.response?.data?.message ??
            "Cannot generate wallet address at the moment",
        );
      } else {
        showError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.walletCircle}>
          <CustomIcon source={WalletIcon} size={32} color={COLORS.primary} />
        </View>
        <AppText style={styles.title}>No Wallet Address</AppText>
        <AppText style={styles.subtitle}>
          You need to generate a wallet address before you can receive assets.
          This will create unique addresses for all supported networks.
        </AppText>
      </View>

      {/* Network Selection */}
      <View style={styles.section}>
        <AppText style={styles.label}>Select Network</AppText>
        <SelectInput
          options={networks.map(chain => ({
            label: chain.toUpperCase(),
            value: chain,
          }))}
          placeholder="Choose a network"
          title="Asset Networks"
          value={selectedNetwork}
          showSearchBox={false}
          onSelect={option => handleNetworkChange(option.value)}
        />
      </View>

      {/* Generate Button */}
      <View style={styles.section}>
        <TouchableOpacity
          disabled={isGenerating}
          style={[styles.generateButton, isGenerating && { opacity: 0.6 }]}
          activeOpacity={0.9}
          onPress={handleGenerateWallet}
        >
          <AppText style={styles.generateButtonText}>
            {isGenerating ? "Generating..." : "Generate Wallet Address"}
          </AppText>
        </TouchableOpacity>
        <AppText style={styles.note}>
          Your wallet addresses will be generated securely and can be used to
          receive cryptocurrency.
        </AppText>
      </View>
    </View>
  );
};

export default NoWalletAddress;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: normalizeSpacing(20),
    backgroundColor: "white",
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginBottom: normalizeSpacing(20),
  },
  walletCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: normalizeSpacing(15),
  },
  title: {
    fontSize: 20,
    fontFamily: getFontFamily(800),
    color: "black",
    marginBottom: normalizeSpacing(8),
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: getFontFamily(400),
    color: "#4B5563",
    maxWidth: 260,
  },
  section: {
    marginVertical: normalizeSpacing(15),
  },
  label: {
    fontSize: 16,
    fontFamily: getFontFamily(700),
    color: "black",
    marginBottom: normalizeSpacing(8),
  },
  generateButton: {
    width: "100%",
    paddingVertical: normalizeSpacing(14),
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  generateButtonText: {
    color: "white",
    fontFamily: getFontFamily(700),
    fontSize: 15,
  },
  note: {
    marginTop: normalizeSpacing(10),
    textAlign: "center",
    fontSize: 13,
    fontFamily: getFontFamily(400),
    color: "#6B7280",
  },
});
