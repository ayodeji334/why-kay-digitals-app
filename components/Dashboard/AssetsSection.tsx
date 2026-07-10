import React, { useMemo } from "react";
import {
  View,
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
import LoadingState from "../LoadingState";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../../hooks/useAxios";
import { AppText } from "../AppText";

// Empty state
const EmptyAssetsState = ({ refetch }: { refetch: () => void }) => (
  <View style={styles.emptyState}>
    <AppText style={styles.emptyTitle}>No Data Found</AppText>
    <AppText style={styles.emptyDescription}>
      There is no asset available at the moment. Please try again later.
    </AppText>
    <TouchableOpacity
      onPress={() => refetch()}
      activeOpacity={0.9}
      style={styles.emptyButton}
    >
      <AppText style={styles.emptyButtonText}>Refresh</AppText>
    </TouchableOpacity>
  </View>
);

const AssetsSection = () => {
  const navigation = useNavigation();
  const { apiGet } = useAxios();

  const {
    data: assets,
    isLoading,
    refetch,
    isError,
    error,
  } = useQuery({
    queryKey: ["asset-rates"],
    queryFn: async () => {
      try {
        const res = await apiGet("/wallets/crypto-assets/sell-rates");
        return res?.data?.data ?? [];
      } catch (error) {
        throw error;
      }
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const filteredAssets = useMemo(() => {
    if (!Array.isArray(assets) || assets.length === 0) {
      return [];
    }

    return [...assets].sort((a, b) => {
      const aPrice = Number(a?.market_current_value) || 0;
      const bPrice = Number(b?.market_current_value) || 0;
      return bPrice - aPrice;
    });
  }, [assets]);

  if (isLoading) {
    return <LoadingState message="Loading assets market rates..." />;
  }

  if (!assets && isError && error) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText style={styles.sectionTitle}>Sell Rate:</AppText>
        </View>
        <ErrorState error={`Failed to load assets`} handleOnPress={refetch} />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionTitle}>Sell Rate:</AppText>
        {assets.length > 0 && (
          <TouchableOpacity
            onPress={() => navigation.navigate("Rates" as never)}
            activeOpacity={0.8}
            hitSlop={4}
            style={styles.sellAllButton}
          >
            <AppText style={styles.sellAllText}>View all</AppText>
          </TouchableOpacity>
        )}
      </View>

      {filteredAssets.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.assetsList}
        >
          {filteredAssets.map((asset: any) => (
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
                    <AppText style={styles.assetName}>{asset.symbol}</AppText>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <AppText style={styles.assetBalance}>
                        {formatAmount(
                          parseFloat(asset.market_current_value || 0),
                          { currency: "USD", decimalPlace: 2 },
                        )}
                      </AppText>
                      {asset?.price_status ? (
                        asset?.price_status === "up" ? (
                          <ArrowUp size={12} color={COLORS.primary} />
                        ) : (
                          <ArrowDown size={12} color={COLORS.error} />
                        )
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.assetStats}>
                    <AppText style={styles.assetLabel}>Rate:</AppText>
                    <AppText style={styles.assetValue}>
                      {formatAmount(asset.sell_rate?.toString(), {
                        currency: "NGN",
                        decimalPlace: 2,
                      })}{" "}
                      /$
                    </AppText>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <EmptyAssetsState refetch={refetch} />
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
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#333",
  },
  sellAllButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 19,
    paddingVertical: 6,
  },
  sellAllText: {
    color: COLORS.primary,
    fontSize: normalize(17),
    fontFamily: getFontFamily("700"),
  },
  assetsList: {
    gap: 12,
  },
  assetCard: {
    backgroundColor: "#EFF7EC",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
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
    fontSize: normalize(18),
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
    fontSize: normalize(18),
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
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000000",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
    color: "rgb(45, 45, 45)",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 16,
  },
  emptyButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 30,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: normalize(16),
    fontFamily: getFontFamily("800"),
  },
});

export default AssetsSection;
