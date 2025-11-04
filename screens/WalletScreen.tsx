import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { useAuthStore } from "../stores/authSlice";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";
import useAxios from "../api/axios";
import CustomLoading from "../components/CustomLoading";
import { COLORS } from "../constants/colors";
import CryptoWalletSection from "../components/wallet/CryptoWalletSection";
import FiatWalletSection from "../components/wallet/FiatWalletSection";

export default function WalletScreen() {
  const { setUser, user } = useAuthStore();
  const { apiGet } = useAxios();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"crypto" | "fiat">("crypto");

  const fetchUserAccounts = async () => {
    const response = await apiGet("users/user/accounts");
    if (!response.data?.success) {
      setRefreshing(false);
      throw new Error(
        response.data?.message || "Failed to fetch user accounts",
      );
    }
    return response.data.data;
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["userWallet"],
    queryFn: fetchUserAccounts,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  const fiatWallet = useMemo(() => {
    if (Array.isArray(user?.wallets)) {
      return user.wallets.find((wallet: any) => wallet.type === "fiat");
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSell = () =>
    Alert.alert(
      "Coming soon",
      "The feature is not yet available. Keep watching!",
    );

  useEffect(() => {
    refetch();
  }, [activeTab, refetch]);

  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "crypto" && styles.activeTab]}
          onPress={() => setActiveTab("crypto")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "crypto" && styles.activeTabText,
            ]}
          >
            Crypto Wallet
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "fiat" && styles.activeTab]}
          onPress={() => setActiveTab("fiat")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "fiat" && styles.activeTabText,
            ]}
          >
            Fiat Wallet
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scrollContainer}>
        {activeTab === "crypto" ? (
          <CryptoWalletSection
            user={user}
            fiatWallet={fiatWallet}
            handleSell={handleSell}
            handleSwap={handleSell}
          />
        ) : (
          <FiatWalletSection fiatWallet={fiatWallet} />
        )}
      </View>

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scrollContainer: { flex: 1, padding: 20 },
  actionsContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 10,
    margin: "auto",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    marginHorizontal: 20,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  activeTabText: {
    color: "#fff",
  },
  actionCard: {
    backgroundColor: "#F8F9FA",
    padding: 7,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    minWidth: 62,
  },
  actionIcon: { marginBottom: 10 },
  actionTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
  },
  assetsSection: { paddingVertical: 30 },
  sectionTitle: {
    fontSize: normalize(22),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 16,
  },
  assetsList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  assetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1ff",
  },
  assetLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  assetIconText: {
    fontSize: normalize(13),
    fontFamily: getFontFamily("400"),
    color: "#374151",
  },
  assetInfo: { flex: 1 },
  assetName: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("400"),
    color: "#000",
  },
  assetSymbol: { fontSize: normalize(11), color: "#6B7280" },
  assetRight: { alignItems: "flex-end" },
  assetPrice: {
    fontSize: normalize(13),
    fontFamily: getFontFamily("400"),
    color: "#000",
  },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyStateText: { fontSize: normalize(22), fontFamily: getFontFamily("800") },
  emptyStateSubtext: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: "#6B7280",
  },
});
