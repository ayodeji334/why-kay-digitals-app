import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import CustomIcon from "./CustomIcon";
import { WalletIcon } from "../assets";
import useAxios from "../hooks/useAxios";
import { showSuccess } from "../utlis/toast";
import { SelectInput } from "./SelectInputField";

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
    setIsGenerating(true);
    try {
      await apiGet(`wallets/user/${selectedAssetUuid}/generate-wallet-address`);
      showSuccess("Wallet Address created!");
      onSuccess();
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
        <Text style={styles.title}>No Wallet Address</Text>
        <Text style={styles.subtitle}>
          You need to generate a wallet address before you can receive assets.
          This will create unique addresses for all supported networks.
        </Text>
      </View>

      {/* Network Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Select Network</Text>
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
          <Text style={styles.generateButtonText}>
            {isGenerating ? "Generating..." : "Generate Wallet Address"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.note}>
          Your wallet addresses will be generated securely and can be used to
          receive cryptocurrency.
        </Text>
      </View>
    </View>
  );
};

export default NoWalletAddress;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  walletCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontFamily: getFontFamily(800),
    color: "black",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: getFontFamily(400),
    color: "#4B5563",
    lineHeight: 20,
    maxWidth: 260,
  },
  section: {
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    fontFamily: getFontFamily(700),
    color: "black",
    marginBottom: 8,
  },
  generateButton: {
    width: "100%",
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
  note: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 13,
    fontFamily: getFontFamily(400),
    color: "#6B7280",
    lineHeight: 18,
  },
});

// const styles = StyleSheet.create({
//   centerContainer: {
//     paddingVertical: 20,
//     paddingHorizontal: 18,
//     minHeight: "100%",
//     justifyContent: "space-between",
//     gap: 10,
//     backgroundColor: "white",
//   },
//   emptyChainsText: {
//     textAlign: "center",
//     fontFamily: getFontFamily(400),
//     fontSize: 14,
//     color: "#B00020",
//     marginBottom: 20,
//     maxWidth: 260,
//     lineHeight: 18,
//   },
//   section: {
//     alignItems: "center",
//     paddingTop: 20,
//     paddingHorizontal: 18,
//   },
//   walletCircle: {
//     width: 70,
//     height: 70,
//     borderRadius: 50,
//     backgroundColor: "#D9D9D91A",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 30,
//   },
//   noWalletTitle: {
//     color: "black",
//     fontFamily: getFontFamily(800),
//     fontSize: 20,
//     marginBottom: 10,
//   },
//   modalLabel: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("900"),
//     color: "black",
//     marginBottom: 6,
//   },
//   noWalletText: {
//     textAlign: "center",
//     fontFamily: getFontFamily(400),
//     fontSize: 14,
//     marginBottom: 30,
//     maxWidth: 230,
//     lineHeight: 18,
//   },
//   label: {
//     color: "black",
//     fontFamily: getFontFamily(900),
//     fontSize: 19,
//     marginBottom: 6,
//   },
//   chainButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 20,
//     borderWidth: 1,
//   },
//   generateButton: {
//     width: "100%",
//     minWidth: "100%",
//     paddingVertical: 14,
//     borderRadius: 30,
//     backgroundColor: COLORS.primary,
//     alignItems: "center",
//   },
//   generateButtonText: {
//     color: "white",
//     fontFamily: getFontFamily(700),
//     fontSize: 15,
//   },
//   noteText: {
//     marginVertical: 10,
//     color: "#3a3a3aff",
//     fontFamily: getFontFamily(400),
//     fontSize: 14,
//     textAlign: "center",
//     lineHeight: 15,
//   },
// });
