import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import ErrorState from "../ErrorState";
import { getFontFamily, normalize } from "../../constants/settings";
import { formatAmount } from "../../libs/formatNumber";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../../api/axios";

interface Asset {
  id: number;
  uuid: string;
  name: string;
  symbol: string;
  logo_url: string;
  balance: number;
  rate: number;
  change: "up" | "down";
  changePercentage: string;
  color: string;
}

const AssetsSection = () => {
  const { apiGet } = useAxios();
  const fetchAssets = async (): Promise<Asset[]> => {
    try {
      const response = await apiGet("/crypto-assets/");
      return response.data?.data?.assets.map((asset: any) => {
        const sellRate = asset.rates.find((r: any) => r.type === "sell");
        return {
          id: asset.id,
          uuid: asset.uuid,
          name: asset.name,
          symbol: asset.symbol,
          logo_url: asset.logo_url,
          balance: asset.market_current_value ?? 0,
          rate: parseFloat(sellRate?.default_value ?? 0),
          change: Math.random() > 0.5 ? "up" : "down",
          changePercentage: (Math.random() * 20 - 10).toFixed(2),
        };
      });
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      throw error;
    }
  };

  const {
    data: assets = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["assets"],
    queryFn: fetchAssets,
  });

  if (isLoading) {
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

  if (isError && error) {
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
                {asset.logo_url && (
                  <Image
                    key={asset.logo_url}
                    source={{ uri: asset.logo_url }}
                    resizeMode="contain"
                    style={styles.assetIcon}
                  />
                )}
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
                      {formatAmount(asset.rate, false, "NGN", 2)} /$
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
    fontSize: normalize(22),
    fontFamily: getFontFamily("800"),
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
    fontSize: normalize(19),
    fontFamily: getFontFamily("700"),
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
    fontFamily: getFontFamily("800"),
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
    fontSize: normalize(20),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 4,
  },
  assetBalance: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#333",
  },
  assetStats: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  assetLabel: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("700"),
    color: "#666",
    marginBottom: 4,
  },
  assetValue: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#333",
  },
  assetChange: {
    fontSize: normalize(10),
    fontFamily: getFontFamily("400"),
  },
  // Loading State
  loadingContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    fontSize: normalize(14),
    color: "#666",
    fontFamily: getFontFamily("400"),
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
    fontSize: normalize(14),
    color: "#dc2626",
    fontFamily: getFontFamily("400"),
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
    fontSize: normalize(12),
    fontFamily: getFontFamily("600"),
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
    fontSize: normalize(16),
    fontFamily: getFontFamily("600"),
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: normalize(12),
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
    fontSize: normalize(12),
    fontFamily: getFontFamily("600"),
  },
});

export default AssetsSection;
