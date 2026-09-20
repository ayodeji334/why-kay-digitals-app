import React, { useState } from "react";
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import { AppText } from "../components/AppText";
import CustomModal from "../components/CustomModal";
import HalfScreenModal from "../components/HalfScreenModal";
import CustomIcon from "../components/CustomIcon";
import { BuyCryptoIcon, SellCryptoIcon, NoResultIcon } from "../assets";
import { COLORS } from "../constants/colors";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { formatAmount } from "../libs/formatNumber";
import useAxios from "../hooks/useAxios";
import { useColors } from "../hooks/useTheme";
import { usePhoneVerification } from "../hooks/usePhoneVerification";
import { TradeIntent } from "../libs/types";
import { useAuthStore } from "../stores/authSlice";

export default function RateMarketScreen() {
  const { apiGet } = useAxios();
  const colors = useColors();
  const styles = makeStyles(colors);
  const navigation: any = useNavigation();
  const { isPhoneVerified } = usePhoneVerification();
  const refreshUser = useAuthStore(state => state.refreshUser);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const { data, isLoading, isRefetching, refetch, isError, error } = useQuery({
    queryKey: ["rates"],
    queryFn: async () => {
      const res = await apiGet("/crypto-assets/available/rates");
      return res?.data?.data ?? [];
    },
  });

  const onRefresh = () => {
    refetch();
    refreshUser();
  };

  const assets = Array.isArray(data) ? data : [];

  // Viewing rates is available to everyone — only actually trading (buy/sell)
  // requires a verified phone number, checked in handleTradeAction instead.
  const handleAssetPress = (asset: any) => {
    setSelectedAsset(asset);
  };

  const handleVerifyNow = () => {
    setShowPhoneModal(false);
    navigation.navigate("PhoneNumberVerification" as never);
  };

  const handleTradeAction = (action: "buy" | "sell") => {
    if (!selectedAsset) return;

    if (!isPhoneVerified) {
      setSelectedAsset(null);
      setShowPhoneModal(true);
      return;
    }

    const intent: TradeIntent = {
      assetId: selectedAsset.uuid,
      symbol: selectedAsset.symbol,
      action,
      source: "rates",
    };

    setSelectedAsset(null);
    navigation.navigate(action === "buy" ? "BuyCrypto" : "SellCrypto", {
      intent,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["right", "left"]} style={styles.container}>
        <LoadingState message="Loading market rates..." />
      </SafeAreaView>
    );
  }

  if (!assets.length && isError && error) {
    return (
      <SafeAreaView edges={["right", "left"]} style={styles.container}>
        <ErrorState
          error="Failed to load market rates"
          handleOnPress={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <View>
        {/* <AppText style={styles.note}>
          Rates are quoted in Nigerian Naira (₦) per $1 USD equivalent.
        </AppText> */}

        <AppText style={styles.note}>
          Rates are shown as $1 USD to its Naira (₦) equivalent.
        </AppText>

        {assets.length > 0 && (
          <View style={styles.tableHeaderRow}>
            <AppText
              style={[
                { marginLeft: 30 },
                styles.tableHeaderText,
                styles.assetColumn,
              ]}
            >
              ASSET
            </AppText>
            <AppText
              style={[
                { marginLeft: 20 },
                styles.tableHeaderText,
                styles.rateColumn,
              ]}
            >
              WE BUY
            </AppText>
            <AppText
              style={[
                { marginRight: 10 },
                styles.tableHeaderText,
                styles.rateColumn,
              ]}
            >
              WE SELL
            </AppText>
          </View>
        )}
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {assets.map((asset: any) => (
          <TouchableOpacity
            key={asset.uuid}
            hitSlop={10}
            activeOpacity={0.8}
            onPress={() => handleAssetPress(asset)}
            style={styles.row}
          >
            <View style={[styles.assetColumn, styles.assetInfo]}>
              {asset.logo_url ? (
                <Image
                  source={{ uri: asset.logo_url }}
                  resizeMode="contain"
                  style={styles.logo}
                />
              ) : (
                <View style={[styles.logo, styles.logoFallback]}>
                  <AppText style={styles.logoFallbackText}>
                    {asset.symbol?.charAt(0)}
                  </AppText>
                </View>
              )}

              <View style={styles.assetTextGroup}>
                <AppText style={styles.symbol}>{asset.symbol}</AppText>
                <AppText style={styles.name}>{asset.name}</AppText>
                {/* <AppText style={styles.name} numberOfLines={1}></AppText> */}
                {/* <View style={styles.marketValueRow}>
                  <AppText style={styles.marketValue}>
                    {formatAmount(parseFloat(asset.market_current_value || 0), {
                      currency: "USD",
                    })}
                  </AppText>
                  {asset?.price_status ? (
                    asset.price_status === "up" ? (
                      <ArrowUp size={11} color={COLORS.primary} />
                    ) : (
                      <ArrowDown size={11} color={COLORS.error} />
                    )
                  ) : null}
                </View> */}
              </View>
            </View>

            <View>
              <AppText style={[styles.rateTitle]}>Buy</AppText>
              <AppText
                style={[
                  styles.rateValue,
                  styles.rateColumn,
                  { color: "#07b015" },
                ]}
              >
                {formatAmount(Number(asset.buy_rate ?? 0), {
                  currency: "NGN",
                  maxDecimalPlace: 2,
                })}
              </AppText>
            </View>

            <View>
              <AppText style={[styles.rateTitle]}>Sell</AppText>

              <AppText
                style={[
                  styles.rateValue,
                  styles.rateColumn,
                  { color: "#f00b0b" },
                ]}
              >
                {formatAmount(Number(asset.sell_rate ?? 0), {
                  currency: "NGN",
                  maxDecimalPlace: 2,
                })}
              </AppText>
            </View>
          </TouchableOpacity>
        ))}

        {!assets.length && (
          <View style={styles.emptyState}>
            <CustomIcon
              source={NoResultIcon}
              size={normalize(70)}
              color={colors.textMuted}
            />
            <AppText style={styles.emptyTitle}>No Market Rates Yet</AppText>
            <AppText style={styles.emptyDescription}>
              We couldn't find any asset rates to show right now. Please check
              back shortly.
            </AppText>
            <TouchableOpacity
              onPress={() => refetch()}
              activeOpacity={0.8}
              style={styles.emptyButton}
            >
              <AppText style={styles.emptyButtonText}>Refresh</AppText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CustomModal
        visible={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        title="What do you want?"
        height={220}
      >
        <View style={styles.optionRow}>
          <Pressable
            hitSlop={12}
            style={styles.optionCard}
            onPress={() => handleTradeAction("buy")}
          >
            <View style={[styles.optionIconContainer]}>
              <CustomIcon
                source={BuyCryptoIcon}
                size={22}
                color={colors.primary}
              />
            </View>
            <AppText style={styles.optionTitle}>
              Buy {selectedAsset?.symbol}
            </AppText>
            <AppText style={styles.optionDescription}>
              Buy the asset instantly at the best rate.
            </AppText>
          </Pressable>

          <Pressable
            hitSlop={12}
            style={styles.optionCard}
            onPress={() => handleTradeAction("sell")}
          >
            <View style={[styles.optionIconContainer]}>
              <CustomIcon
                source={SellCryptoIcon}
                size={18}
                color={colors.primary}
              />
            </View>
            <AppText style={styles.optionTitle}>
              Sell {selectedAsset?.symbol}
            </AppText>
            <AppText style={styles.optionDescription}>
              Sell the asset instantly and get paid fast.
            </AppText>
          </Pressable>
        </View>
      </CustomModal>

      <HalfScreenModal
        isVisible={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        title="Verify your phone number"
        description="You need to verify your phone number before you can continue."
        buttonText="Verify Now"
        actionButton={handleVerifyNow}
        secondaryButtonText="Maybe later"
        secondaryAction={() => setShowPhoneModal(false)}
        showCloseButton
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
      paddingHorizontal: normalizeSpacing(16),
      paddingBottom: normalizeSpacing(24),
    },
    note: {
      fontSize: normalize(16),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      marginBottom: normalizeSpacing(30),
      textAlign: "center",
    },
    tableHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: normalizeSpacing(14),
      marginBottom: normalizeSpacing(12),
    },
    tableHeaderText: {
      fontSize: normalize(16),
      fontFamily: getFontFamily("800"),
      color: colors.textMuted,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      paddingVertical: normalizeSpacing(14),
      paddingHorizontal: normalizeSpacing(14),
      marginBottom: normalizeSpacing(10),
      gap: 40,
    },
    assetColumn: {
      flex: 1.5,
    },
    rateColumn: {
      flex: 1,
      textAlign: "right",
    },
    assetInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    logo: {
      height: 28,
      width: 28,
      borderRadius: 17,
      marginRight: normalizeSpacing(10),
    },
    logoFallback: {
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
    logoFallbackText: {
      fontSize: normalize(14),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    assetTextGroup: {
      flexShrink: 1,
    },
    symbol: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    name: {
      fontSize: normalize(16),
      fontFamily: getFontFamily("400"),
      color: colors.text,
      marginTop: normalizeSpacing(1),
    },
    marketValueRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      marginTop: normalizeSpacing(3),
    },
    marketValue: {
      fontSize: normalize(15),
      fontFamily: getFontFamily("700"),
      color: colors.textSecondary,
    },
    rateValue: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    rateTitle: {
      fontSize: normalize(15),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      textAlign: "center",
    },
    optionRow: {
      flexDirection: "row",
      gap: normalizeSpacing(19),
      width: "100%",
    },
    optionCard: {
      flex: 1,
      backgroundColor: colors.infoCardBackgroundColor,
      borderRadius: 16,
      paddingVertical: normalizeSpacing(18),
      paddingHorizontal: normalizeSpacing(12),
      alignItems: "flex-start",
    },
    optionIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: normalizeSpacing(12),
      backgroundColor: colors.infoCardBackgroundColor,
    },
    optionTitle: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalizeSpacing(6),
      textAlign: "center",
    },
    optionDescription: {
      fontSize: normalize(15),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
      textAlign: "left",
      lineHeight: 15,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: normalizeSpacing(60),
      paddingHorizontal: normalizeSpacing(24),
    },
    emptyTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginTop: normalizeSpacing(16),
      marginBottom: normalizeSpacing(8),
      textAlign: "center",
    },
    emptyDescription: {
      fontSize: normalize(15),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
      textAlign: "center",
      marginBottom: normalizeSpacing(20),
    },
    emptyButton: {
      backgroundColor: COLORS.secondary,
      paddingHorizontal: normalizeSpacing(30),
      paddingVertical: normalizeSpacing(14),
      borderRadius: 100,
    },
    emptyButtonText: {
      color: "#fff",
      fontSize: normalize(16),
      fontFamily: getFontFamily("800"),
    },
  });
