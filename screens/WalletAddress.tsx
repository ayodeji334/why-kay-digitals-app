import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { getFontFamily } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { Copy, Share } from "iconsax-react-nativejs";
import QRCode from "react-native-qrcode-svg";
import CustomIcon from "../components/CustomIcon";
import { LogoIcon } from "../assets";

interface WalletDetailsProps {
  walletAddress: any;
  priceChange?: number;
  onShare: () => void;
  onViewRates: () => void;
  onCopyAddress: (address: string) => void;
}

const WalletQRCode = ({ address }: { address: string }) => {
  if (!address) return null;

  return (
    <View style={styles.qrContainer}>
      <View style={styles.qrBox}>
        <QRCode value={address} size={230} backgroundColor="white" />
      </View>

      <View style={styles.qrIconWrapper}>
        <CustomIcon source={LogoIcon} size={30} color={COLORS.primary} />
      </View>
    </View>
  );
};

const WalletDetails: React.FC<WalletDetailsProps> = ({
  walletAddress,
  priceChange,
  onShare,
  onViewRates,
  onCopyAddress,
}) => {
  const isPriceDown = priceChange && priceChange < 0;

  return (
    <View style={styles.container}>
      <WalletQRCode address={walletAddress?.address} />

      <View style={styles.sectionBox}>
        <Text style={styles.label}>Receiving Address</Text>
        <View style={styles.addressRow}>
          <Text numberOfLines={1} style={styles.addressText}>
            {walletAddress?.address}
          </Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => onCopyAddress(walletAddress?.address)}
          >
            <Copy size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <View style={styles.priceBox}>
          <Text style={styles.label}>Chain Type</Text>
          <Text style={styles.priceValue}>
            {walletAddress?.chain_type ?? "Not Provided"}
          </Text>
        </View>

        <View style={styles.priceBox}>
          <Text style={styles.label}>Chain</Text>
          <View style={styles.priceRow}>
            <Text
              style={[
                styles.priceChange,
                { color: isPriceDown ? "#FF5252" : "#000000" },
              ]}
            >
              {walletAddress?.chain ?? "Not Provided"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          activeOpacity={0.89}
          style={styles.shareButton}
          onPress={onShare}
        >
          <Share size={20} color="white" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.89}
          style={styles.viewRatesButton}
          onPress={onViewRates}
        >
          <Text style={[styles.actionButtonText, { color: "black" }]}>
            View Rates
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WalletDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 19,
    alignItems: "center",
    gap: 10,
  },
  sectionBox: {
    width: "100%",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    borderColor: "#022b0aff",
    borderWidth: 1,
  },
  label: {
    color: "black",
    fontFamily: getFontFamily(900),
    fontSize: 19,
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressText: {
    color: "black",
    fontFamily: getFontFamily(700),
    fontSize: 19,
    maxWidth: "80%",
  },
  copyButton: {
    padding: 10,
    backgroundColor: "rgba(0,200,83,0.2)",
    borderRadius: 8,
  },
  priceContainer: {
    width: "100%",
    flexDirection: "row",
    borderColor: "#022b0aff",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  priceBox: {
    width: "50%",
    padding: 14,
    borderRightWidth: 1,
    borderColor: "#c5c5c5ff",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceValue: {
    color: "black",
    fontFamily: getFontFamily(800),
    fontSize: 20,
  },
  priceChange: {
    fontFamily: getFontFamily(800),
    fontSize: 20,
    marginRight: 6,
  },
  actionsContainer: {
    width: "100%",
    marginTop: 30,
  },
  shareButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  viewRatesButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#555",
    backgroundColor: "transparent",
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    marginLeft: 6,
    fontFamily: getFontFamily(700),
    fontSize: 16,
  },

  qrContainer: {
    width: 250,
    height: 250,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#470505ff",
    borderWidth: 1,
    borderRadius: 12,
  },
  qrBox: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  qrText: {
    fontFamily: getFontFamily(700),
    fontSize: 16,
    color: "#0a0a2a",
  },
  qrIconWrapper: {
    position: "absolute",
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#01013dff",
    borderWidth: 4,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
