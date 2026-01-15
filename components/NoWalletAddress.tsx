import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { getFontFamily } from "../constants/settings";
import { COLORS } from "../constants/colors";
import CustomIcon from "./CustomIcon";
import { WalletIcon } from "../assets";

interface NoWalletAddressProps {
  availableChains?: any[];
  selectedChain?: any | null;
  onSelectChain?: (chain: any) => void;
  onGenerateWallet?: () => void;
  isGenerating?: boolean;
}

const NoWalletAddress: React.FC<NoWalletAddressProps> = ({
  availableChains = [],
  selectedChain = null,
  onSelectChain,
  onGenerateWallet,
  isGenerating = false,
}) => {
  return (
    <View style={styles.centerContainer}>
      <View style={styles.section}>
        <View style={styles.walletCircle}>
          <CustomIcon source={WalletIcon} size={30} color={COLORS.primary} />
        </View>

        <Text style={styles.noWalletTitle}>No Wallet Address</Text>

        <Text style={styles.noWalletText}>
          You need to generate a wallet address before you can receive assets.
          This will create a unique address for the selected coin.
        </Text>
      </View>

      {availableChains.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.label}>Select Network</Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {availableChains.map((chain: any) => {
              const isSelected = selectedChain?.chain === chain.chain;

              return (
                <TouchableOpacity
                  key={chain.chain}
                  activeOpacity={0.8}
                  onPress={() => onSelectChain?.(chain)}
                  style={[
                    styles.chainButton,
                    {
                      borderColor: isSelected ? COLORS.primary : "#ccc",
                      backgroundColor: isSelected
                        ? "rgba(0,200,83,0.15)"
                        : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: getFontFamily(700),
                      color: isSelected ? COLORS.primary : "#333",
                    }}
                  >
                    {chain.chainType} ({chain.chain})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && { opacity: 0.5 }]}
          activeOpacity={0.89}
          disabled={availableChains.length === 0 || isGenerating}
          onPress={onGenerateWallet}
        >
          <Text style={styles.generateButtonText}>
            {isGenerating ? "Generating..." : "Generate Wallet Address"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.noteText}>
          Your wallet address will be generated securely and can be used to
          receive cryptocurrency.
        </Text>
      </View>
    </View>
  );
};

export default NoWalletAddress;

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
