import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import ErrorState from "../ErrorState";
import { normalize } from "../../constants/settings";
import { formatAmount } from "../../libs/formatNumber";

const AssetsSection = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Using JSONPlaceholder as a free mock API, simulating crypto assets
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users",
      );

      if (!response.ok) {
        throw new Error("Failed to fetch assets");
      }

      const users = await response.json();

      // Transform users data to simulate crypto assets
      const mockAssets = users.slice(0, 5).map((user: any, index: number) => ({
        id: user.id,
        uuid: `asset-${user.id}`,
        name:
          ["Bitcoin", "Ethereum", "Litecoin", "Cardano", "Polkadot"][index] ||
          "Crypto",
        symbol: ["BTC", "ETH", "LTC", "ADA", "DOT"][index] || "CRYPTO",
        balance: Math.random() * 10000,
        price: Math.random() * 50000,
        change: Math.random() > 0.5 ? "up" : "down",
        changePercentage: (Math.random() * 20 - 10).toFixed(2),
        color:
          ["#F7931A", "#627EEA", "#345D9D", "#0033AD", "#E6007A"][index] ||
          "#666666",
      }));

      setAssets(mockAssets);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sell Rate:</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your assets...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sell Rate:</Text>
        </View>
        <ErrorState
          error={`Failed to load assets: ${error}`}
          handleOnPress={fetchAssets}
        />
      </View>
    );
  }

  // Empty state
  const EmptyAssetsState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Assets Found</Text>
      <Text style={styles.emptyDescription}>
        You don't have any cryptocurrency assets yet. Start by purchasing your
        first crypto.
      </Text>
      <TouchableOpacity style={styles.emptyButton}>
        <Text style={styles.emptyButtonText}>Buy Crypto</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sell Rate:</Text>
        {assets.length > 0 && (
          <TouchableOpacity activeOpacity={0.8} style={styles.sellAllButton}>
            <Text style={styles.sellAllText}>Sell all</Text>
          </TouchableOpacity>
        )}
      </View>

      {assets.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.assetsList}
        >
          {assets.map((asset: any) => (
            <View key={asset.uuid} style={styles.assetCard}>
              <View style={styles.assetHeader}>
                <View
                  style={[styles.assetIcon, { backgroundColor: asset.color }]}
                >
                  <Text style={styles.assetSymbol}>
                    {asset.symbol.charAt(0)}
                  </Text>
                </View>
                <View style={styles.assetInfo}>
                  <View style={styles.assetDetails}>
                    <Text style={styles.assetName}>{asset.name}</Text>
                    <Text style={styles.assetBalance}>
                      {formatAmount(asset.balance, false, "USD")}
                    </Text>
                  </View>
                  <View style={styles.assetStats}>
                    <Text style={styles.assetLabel}>Rate:</Text>
                    <Text style={styles.assetValue}>
                      {formatAmount(asset.balance, false)} /$
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <EmptyAssetsState />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: normalize(15),
    fontWeight: "600",
    color: "#333",
  },
  sellAllButton: {
    borderWidth: 1,
    borderColor: "#f79d17ff",
    borderRadius: 20,
    paddingHorizontal: 19,
    paddingVertical: 7,
  },
  sellAllText: {
    color: "#c47b0eff",
    fontSize: normalize(13),
    fontWeight: "500",
  },
  assetsList: {
    gap: 12,
  },
  assetCard: {
    backgroundColor: "#EFF7EC",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 200,
  },
  assetHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  assetIcon: {
    height: 30,
    width: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  assetSymbol: {
    color: "#fff",
    fontSize: normalize(13),
    fontWeight: "900",
  },
  assetInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  assetDetails: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 3,
  },
  assetName: {
    fontSize: normalize(14),
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  assetBalance: {
    fontSize: normalize(13),
    fontWeight: "400",
    color: "#333",
  },
  assetStats: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  assetLabel: {
    fontSize: normalize(12),
    color: "#666",
    fontWeight: "400",
    marginBottom: 4,
  },
  assetValue: {
    fontSize: normalize(12),
    fontWeight: "600",
    color: "#333",
  },
  assetChange: {
    fontSize: 10,
    fontWeight: "500",
  },
  // Loading State
  loadingContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  // Error State
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "500",
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  // Empty State
  emptyState: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 16,
  },
  emptyButton: {
    backgroundColor: "#FFA726",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default AssetsSection;
