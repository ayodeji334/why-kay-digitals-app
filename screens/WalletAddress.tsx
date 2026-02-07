import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share as RNShare,
} from "react-native";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { Copy } from "iconsax-react-nativejs";
import QRCode from "react-native-qrcode-svg";
import { SelectInput } from "../components/SelectInputField";
import { formatAmount } from "../libs/formatNumber";
import Clipboard from "@react-native-clipboard/clipboard";
import { showError, showSuccess } from "../utlis/toast";
import { useNavigation } from "@react-navigation/native";

interface WalletAddress {
  id: string;
  address: string;
  chain: string;
  is_default: boolean;
}

interface Wallet {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  balance: string;
  price: string;
  value: string;
  buy_rate: string;
  sell_rate: string;
  chains: string[];
  addresses: WalletAddress[];
}

interface WalletDetailsProps {
  wallet: Wallet;
  onNetworkChange?: (network: string) => Promise<void>;
}

const WalletDetails: React.FC<WalletDetailsProps> = ({
  wallet,
  onNetworkChange,
}) => {
  const navigation: any = useNavigation();
  const [selectedNetwork, setSelectedNetwork] = useState<string>(
    wallet.chains?.[0] ?? "",
  );

  const selectedAddress = useMemo(() => {
    if (!selectedNetwork) return null;

    const networkAddresses = wallet.addresses.filter(
      addr => addr.chain === selectedNetwork,
    );

    if (!networkAddresses.length) return null;

    return (
      networkAddresses.find(addr => addr.is_default) || networkAddresses[0]
    );
  }, [wallet.addresses, selectedNetwork]);

  const formattedNetworkName = useMemo(() => {
    return selectedNetwork ? selectedNetwork.toUpperCase() : "Not Provided";
  }, [selectedNetwork]);

  const handleNetworkChange = async (network: string) => {
    if (network === selectedNetwork) return;

    setSelectedNetwork(network);

    if (onNetworkChange) {
      try {
        await onNetworkChange(network);
      } catch {
        Alert.alert("Error", "Failed to change network");
      }
    }
  };

  const handleNavigation = () => {
    navigation.navigate("Dashboard", { screen: "Rates" });
  };

  const copyToClipboard = (text: string) => {
    try {
      Clipboard.setString(text);
      showSuccess("Address copied");
    } catch {
      showError("Failed to copy");
    }
  };

  const handleShare = async () => {
    if (!selectedAddress?.address) return;

    try {
      await RNShare.share({
        message: `Crypto Deposit Address
              Address:
              ${selectedAddress?.address || ""}
  
              Important:
              • Send only the supported cryptocurrency to this address
              • Sending the wrong asset or network may result in permanent loss
              • This address is unique to your wallet
  
              If you have any questions, please contact support.`,
      });
    } catch {}
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {selectedAddress?.address && (
        <View style={styles.qrContainer}>
          <QRCode value={selectedAddress.address} size={180} />
        </View>
      )}

      <View style={styles.notesSection}>
        <Text style={styles.notesText}>
          Use a crypto wallet to scan the QR code. Double-check that the address
          displayed matches the one provided here. Sending to the wrong address
          may result in permanent loss. Ensure you're sending on the correct
          network ({formattedNetworkName})
        </Text>
      </View>

      {/* Network Selection */}
      <View style={{ marginVertical: 10 }}>
        <Text style={styles.modalLabel}>Asset Networks</Text>
        <SelectInput
          options={wallet.chains.map(chain => ({
            label: chain.toUpperCase(),
            value: chain,
          }))}
          placeholder="Select a network"
          title="Select a network"
          value={selectedNetwork}
          showSearchBox={false}
          onSelect={option => handleNetworkChange(option.value)}
        />
      </View>

      {/* Receiving Address */}
      <View style={styles.sectionBox}>
        <Text style={styles.label}>Receiving Address</Text>
        <View style={styles.addressRow}>
          <Text numberOfLines={1} style={styles.addressText}>
            {selectedAddress?.address ?? "No address available"}
          </Text>

          {selectedAddress?.address && (
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(selectedAddress.address)}
            >
              <Copy size={15} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Wallet Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Network</Text>
          <Text style={styles.infoValue}>{formattedNetworkName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Wallet Balance</Text>
          <Text style={styles.infoValue}>
            {formatAmount(parseFloat(wallet.balance) || 0, { currency: "USD" })}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Market Value</Text>
          <Text style={styles.infoValue}>
            {formatAmount(parseFloat(wallet.price) || 0, { currency: "USD" })}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.actionButtonText}>Share Address</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewRatesButton}
          onPress={handleNavigation}
        >
          <Text style={[styles.actionButtonText, { color: "black" }]}>
            View Rates
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default WalletDetails;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  logo: { width: 40, height: 40, marginRight: 10 },
  title: { fontFamily: getFontFamily(700), fontSize: 18, color: "black" },
  qrContainer: {
    alignSelf: "center",
    marginBottom: 10,
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  networkSection: { marginBottom: 20 },
  sectionLabel: {
    fontFamily: getFontFamily(700),
    fontSize: normalize(16),
    marginBottom: 10,
    color: "black",
  },
  networkButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  networkButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  networkButtonText: {
    fontFamily: getFontFamily(500),
    fontSize: normalize(14),
    color: "#374151",
  },
  networkButtonTextActive: { color: "#FFFFFF" },
  sectionBox: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    borderColor: "#cacacaff",
    borderWidth: 1,
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("900"),
    color: "black",
    marginBottom: 6,
  },
  notesSection: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
  },
  notesText: {
    fontFamily: getFontFamily(400),
    fontSize: 14,
    lineHeight: 18,
    textAlign: "center",
  },
  label: {
    fontFamily: getFontFamily(800),
    fontSize: 15,
    marginBottom: 6,
    color: "black",
  },
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressText: {
    fontFamily: getFontFamily(400),
    fontSize: normalize(20),
    maxWidth: "80%",
    color: "black",
  },
  copyButton: {
    padding: 7,
    backgroundColor: "rgba(0,200,83,0.2)",
    borderRadius: 8,
  },
  infoSection: {
    borderColor: "#cfcfcfff",
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 13,
  },
  infoLabel: { fontFamily: getFontFamily(700), fontSize: 14, color: "#374151" },
  infoValue: { fontFamily: getFontFamily(700), fontSize: 14, color: "black" },
  actionsContainer: { marginTop: 30 },
  shareButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 30,
    marginVertical: 12,
  },
  viewRatesButton: {
    borderWidth: 1,
    borderColor: "#555",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  actionButtonText: {
    fontFamily: getFontFamily(800),
    fontSize: 14,
    marginLeft: 6,
    color: "white",
  },
});
