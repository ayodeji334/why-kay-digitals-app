import React, { useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import CryptoWalletSection from "../components/wallet/CryptoWalletSection";
import FiatWalletSection from "../components/wallet/FiatWalletSection";

export default function WalletScreen() {
  const [activeTab, setActiveTab] = useState<"crypto" | "fiat">("crypto");

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
          <CryptoWalletSection />
        ) : (
          <FiatWalletSection />
        )}
      </View>
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
    borderRadius: 1200,
    marginHorizontal: 20,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 1200,
  },
  tabText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000",
  },
  activeTab: {
    backgroundColor: COLORS.primary,
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
