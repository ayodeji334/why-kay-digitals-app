import React, { useMemo, useState } from "react";
import { StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { useRoute } from "@react-navigation/native";
import WalletDetails from "./WalletAddress";
import NoWalletAddress from "../components/NoWalletAddress";
import { useWallets } from "../hooks/useWallet";

const CryptoWalletDepositScreen = () => {
  const route: any = useRoute();
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: { wallets },
    refetch,
  } = useWallets();

  const selectedAssetUuid = useMemo(
    () => route.params?.crypto?.uuid,
    [route.params?.crypto?.uuid],
  );

  const refreshWallets = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } catch (error) {
      console.error("Failed to refresh wallets:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const selectedWallet = useMemo(() => {
    if (!selectedAssetUuid) return null;
    return wallets.find((wallet: any) => wallet.asset_id === selectedAssetUuid);
  }, [wallets, selectedAssetUuid]);

  const walletAddresses = useMemo(() => {
    return Array.isArray(selectedWallet?.addresses)
      ? selectedWallet.addresses
      : [];
  }, [selectedWallet]);

  const wallet = useMemo(() => {
    if (walletAddresses.length === 0) return null;
    return (
      walletAddresses.find((addr: any) => addr.is_default) || walletAddresses[0]
    );
  }, [walletAddresses]);

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.screen}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshWallets}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {wallet ? (
          <WalletDetails wallet={selectedWallet} />
        ) : (
          <NoWalletAddress
            selectedAssetUuid={selectedAssetUuid}
            onSuccess={() => {
              refreshWallets();
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CryptoWalletDepositScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
    borderBottomWidth: 1,
    borderColor: "#d6d6db",
  },
  centerContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 18,
    minHeight: "100%",
    justifyContent: "space-between",
    gap: 10,
  },
  section: {
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 18,
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
    fontSize: 23,
    marginBottom: 10,
  },
  noWalletText: {
    textAlign: "center",
    fontFamily: getFontFamily(400),
    fontSize: normalize(19),
    marginBottom: 30,
    maxWidth: 230,
    lineHeight: 18,
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
    fontSize: normalize(16),
  },
  noteText: {
    marginVertical: 10,
    color: "#3a3a3aff",
    fontFamily: getFontFamily(400),
    fontSize: 15,
    textAlign: "center",
    lineHeight: 15,
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
    fontSize: normalize(19),
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
  // Buttons
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
  toggleButton: {
    position: "absolute",
    top: 100,
    right: 15,
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 8,
  },
});
