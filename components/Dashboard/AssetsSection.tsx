import React, { useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import ErrorState from "../ErrorState";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../../constants/settings";
import { formatAmount } from "../../libs/formatNumber";
import { COLORS } from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { ArrowDown, ArrowUp } from "iconsax-react-nativejs";
import LoadingState from "../LoadingState";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../../hooks/useAxios";
import { AppText } from "../AppText";
import { useColors } from "../../hooks/useTheme";

// Empty state
const EmptyAssetsState = ({ refetch }: { refetch: () => void }) => {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
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
};

const AssetsSection = () => {
  const navigation = useNavigation();
  const { apiGet } = useAxios();
  const colors = useColors();
  const styles = makeStyles(colors);

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
    refetchIntervalInBackground: false,
  });

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

      {assets.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
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
                          { currency: "USD" },
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

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    section: {
      marginBottom: normalizeSpacing(20),
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: normalizeSpacing(20),
    },
    sectionTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    sellAllButton: {
      borderWidth: 1,
      borderColor: colors.primaryLight,
      borderRadius: 200,
      paddingHorizontal: normalizeSpacing(29),
      paddingVertical: normalizeSpacing(8),
    },
    sellAllText: {
      color: colors.primaryLight,
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
    },
    assetsList: {
      gap: 12,
    },
    assetCard: {
      backgroundColor: "#EFF7EC",
      borderRadius: 12,
      paddingHorizontal: normalizeSpacing(16),
      paddingVertical: normalizeSpacing(9),
      marginRight: normalizeSpacing(12),
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
      marginRight: normalizeSpacing(10),
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
      marginBottom: normalizeSpacing(4),
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
      marginBottom: normalizeSpacing(4),
    },
    assetValue: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: "#000",
    },
    assetChange: {
      fontSize: normalize(10),
      fontFamily: getFontFamily("400"),
    },
    loadingContainer: {
      backgroundColor: "#f8f9fa",
      borderRadius: 12,
      padding: normalizeSpacing(24),
      alignItems: "center",
    },
    loadingText: {
      fontSize: normalize(18),
      color: colors.text,
      fontFamily: getFontFamily("400"),
    },
    errorContainer: {
      backgroundColor: "#fef2f2",
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#fecaca",
    },
    errorText: {
      fontSize: normalize(14),
      color: colors.error,
      fontFamily: getFontFamily("400"),
      marginBottom: normalizeSpacing(12),
      textAlign: "center",
    },
    retryButton: {
      backgroundColor: colors.error,
      paddingHorizontal: normalizeSpacing(16),
      paddingVertical: normalizeSpacing(14),
      borderRadius: 20,
    },
    retryButtonText: {
      color: colors.text,
      fontSize: normalize(12),
      fontFamily: getFontFamily("400"),
    },
    // Empty State
    emptyState: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: normalizeSpacing(24),
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#4A9237",
    },
    emptyTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalizeSpacing(8),
      textAlign: "center",
    },
    emptyDescription: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
      textAlign: "center",
      marginBottom: normalizeSpacing(16),
    },
    emptyButton: {
      backgroundColor: COLORS.secondary,
      paddingHorizontal: normalizeSpacing(30),
      paddingVertical: normalizeSpacing(14),
      borderRadius: 20,
    },
    emptyButtonText: {
      color: colors.text,
      fontSize: normalize(16),
      fontFamily: getFontFamily("800"),
    },
  });

export default AssetsSection;
