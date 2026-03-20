import React, { useMemo, useState } from "react";
import { StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { useRoute } from "@react-navigation/native";
import WalletDetails from "./WalletAddress";
import { useWallets } from "../hooks/useWallet";

const CryptoWalletDepositScreen = () => {
  const route: any = useRoute();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: { wallets },
    refetch,
  } = useWallets();

  const selectedAssetUuid = route.params?.crypto
    ? route.params?.crypto?.uuid
    : null;

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
        contentContainerStyle={{ flex: 1 }}
      >
        <WalletDetails
          wallet={selectedWallet}
          refetchWallets={refreshWallets}
        />
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
});
