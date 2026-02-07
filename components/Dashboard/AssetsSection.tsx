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
import { COLORS } from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { ArrowDown, ArrowUp } from "iconsax-react-nativejs";
import { useAssets } from "../../hooks/useAssets";
import LoadingState from "../LoadingState";

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
  const navigation = useNavigation();
  const { assets, isLoading, isError, error, refetch } = useAssets();

  if (isLoading) {
    return <LoadingState message="Laoding assets market rates..." />;
  }

  if (isError && error) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sell Rate:</Text>
        </View>
        <ErrorState error={`Failed to load assets`} handleOnPress={refetch} />
      </View>
    );
  }

  // Empty state
  const EmptyAssetsState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Data Found</Text>
      <Text style={styles.emptyDescription}>
        There are no asset report available at the moment. Please try again
        later.
      </Text>
      <TouchableOpacity
        onPress={() => refetch()}
        activeOpacity={0.9}
        style={styles.emptyButton}
      >
        <Text style={styles.emptyButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sell Rate:</Text>
        {assets.length > 0 && (
          <TouchableOpacity
            onPress={() => navigation.navigate("Rates" as never)}
            activeOpacity={0.8}
            style={styles.sellAllButton}
          >
            <Text style={styles.sellAllText}>View all</Text>
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
                    <Text style={styles.assetName}>{asset.symbol}</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Text style={styles.assetBalance}>
                        {formatAmount(
                          parseFloat(asset.market_current_value || 0),
                          { currency: "USD", decimalPlace: 2 },
                        )}
                      </Text>
                      {asset.change === "up" ? (
                        <ArrowUp size={12} color={COLORS.primary} />
                      ) : (
                        <ArrowDown size={12} color={COLORS.error} />
                      )}
                    </View>
                  </View>
                  <View style={styles.assetStats}>
                    <Text style={styles.assetLabel}>Rate:</Text>
                    <Text style={styles.assetValue}>
                      {formatAmount(asset.sell_rate?.toString(), {
                        currency: "USD",
                        decimalPlace: 2,
                      })}{" "}
                      /$
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
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("800"),
    color: "#333",
  },
  sellAllButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 19,
    paddingVertical: 7,
  },
  sellAllText: {
    color: COLORS.primary,
    fontSize: normalize(19),
    fontFamily: getFontFamily("700"),
  },
  assetsList: {
    gap: 12,
  },
  assetCard: {
    backgroundColor: "#EFF7EC",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    fontSize: normalize(18),
    color: "#000",
    fontFamily: getFontFamily("400"),
  },
  // Error State
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    // padding: 24,
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
    fontFamily: getFontFamily("400"),
  },
  // Empty State
  emptyState: {
    backgroundColor: "#f4f7f3ff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4A9237",
  },
  emptyTitle: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("700"),
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: "#898989ff",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 16,
  },
  emptyButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
  },
});

export default AssetsSection;
