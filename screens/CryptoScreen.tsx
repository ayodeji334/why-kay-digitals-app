import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Image,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import CustomLoading from "../components/CustomLoading";
import { COLORS } from "../constants/colors";
import { useAssets } from "../hooks/useAssets";
import { formatAmount } from "../libs/formatNumber";
import { useWallets } from "../hooks/useWallet";
import { TradeIntent } from "../libs/types";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";
import { useStyles } from "../hooks/useStyles";

type CryptoWalletScreenRoute = {
  CryptoWallets: {
    action: TradeIntent["action"];
  };
};

const CryptoWalletScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigation: any = useNavigation();
  const route = useRoute<RouteProp<CryptoWalletScreenRoute, "CryptoWallets">>();
  const { action: currentAction = "buy" } = route.params ?? {};
  const { assets, isLoading, isRefetching, refetch } = useAssets();
  const { data: { wallets = [] } = {}, refetch: refetchWallets } = useWallets();

  const colors = useColors();
  const styles = useStyles(makeStyles);

  const refetchData = useCallback(() => {
    refetch();
    refetchWallets();
  }, [refetch, refetchWallets]);

  const mergedList = useMemo(() => {
    const walletAssetIds = new Set((wallets ?? []).map((w: any) => w.asset_id));

    const walletsWithBalance = (wallets ?? []).map((w: any) => {
      const matchingAsset = (assets ?? []).find(
        (a: any) => a.uuid === w.asset_id,
      );

      return {
        ...w,
        uuid: w.asset_id,
        logo_url: w.logo,
        hasWallet: true,
        is_buy_enabled: matchingAsset?.is_buy_enabled ?? false,
        is_sell_enabled: matchingAsset?.is_sell_enabled ?? false,
      };
    });

    const assetsWithoutWallet = (assets ?? [])
      .filter((a: any) => !walletAssetIds.has(a.uuid))
      .map((a: any) => ({
        ...a,
        balance: "0.00000000",
        value: "0.00000000",
        price: a.market_current_value ?? "0",
        hasWallet: false,
      }));

    return [...walletsWithBalance, ...assetsWithoutWallet];
  }, [wallets, assets]);

  const filteredAssets = useMemo(() => {
    const filtered = mergedList.filter((item: any) => {
      // Filter by action availability
      if (currentAction === "buy" && !item.is_buy_enabled) return false;
      if (currentAction === "sell" && !item.is_sell_enabled) return false;

      // Filter by search query
      if (searchQuery) {
        return (
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return true;
    });

    return [...filtered].sort((a: any, b: any) => {
      const aValue = Number(a.value ?? 0);
      const bValue = Number(b.value ?? 0);

      if (aValue !== bValue) return bValue - aValue;

      const aBalance = Number(a.balance ?? 0);
      const bBalance = Number(b.balance ?? 0);

      return bBalance - aBalance;
    });
  }, [mergedList, searchQuery, currentAction]);

  // Navigate on asset select
  const handleAssetPress = (asset: any) => {
    if (currentAction === "buy") {
      navigation.navigate("BuyCrypto", {
        intent: {
          assetId: asset.uuid,
          symbol: asset.symbol,
          action: "buy",
          source: "wallets",
          amount: 0,
        },
      });
    } else if (currentAction === "sell") {
      navigation.navigate("SellCrypto", {
        intent: {
          assetId: asset.uuid,
          symbol: asset.symbol,
          action: "sell",
          source: "wallets",
          amount: 0,
        },
      });
    } else if (currentAction === "deposit") {
      navigation.navigate("CryptoWalletDeposit", { crypto: asset });
    } else {
      navigation.navigate("WithdrawalCrypto", {
        intent: {
          assetId: asset.uuid,
          symbol: asset.symbol,
          action: "withdraw",
          source: "wallets",
          amount: 0,
        },
      });
    }
  };

  const renderCryptoItem = ({ item }: any) => {
    const balance = Number(item?.balance ?? 0);
    const balanceInUsd = Number(item?.value ?? 0);
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.cryptoItem}
        onPress={() => handleAssetPress(item)}
      >
        <View style={styles.cryptoLeft}>
          {item.logo_url && (
            <Image
              source={{ uri: item.logo_url }}
              resizeMode="contain"
              style={styles.assetIcon}
            />
          )}
          <View style={styles.cryptoInfo}>
            <AppText style={styles.cryptoName}>{item.symbol}</AppText>
            <AppText style={styles.cryptoSymbol}>{item.name}</AppText>
          </View>
        </View>
        {item?.hasWallet ? (
          <View style={styles.cryptoRight}>
            <AppText style={styles.cryptoBalance}>{balance}</AppText>
            <AppText style={styles.cryptoValue}>
              {formatAmount(balanceInUsd, { currency: "USD", decimalPlace: 2 })}
            </AppText>
          </View>
        ) : (
          <></>
        )}
      </TouchableOpacity>
    );
  };

  // Refresh once on mount (refetchData is stable).
  useEffect(() => {
    refetchData();
  }, [refetchData]);

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/2347018607772");
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <AppText style={styles.emptyTitle}>
        {searchQuery ? "No matching asset found" : "No asset available"}
      </AppText>
      <AppText style={styles.emptySubtitle}>
        {searchQuery
          ? `We couldn't find any asset matching "${searchQuery}".`
          : "Pull down to refresh, or check your connection."}
      </AppText>
    </View>
  );

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search coin"
          value={searchQuery}
          onChangeText={setSearchQuery}
          maxFontSizeMultiplier={1}
          allowFontScaling={false}
          placeholderTextColor="#6b6b6b"
        />
        <Text
          style={{
            fontSize: normalize(18),
            fontFamily: getFontFamily("400"),
            marginVertical: normalizeSpacing(7),
            paddingVertical: normalizeSpacing(5),
            color: colors.text,
            lineHeight: 18,
          }}
        >
          Below are the supported assets. If the asset you want to trade is not
          listed here. Kindly reach out to us through our support channel.
          <Text
            onPress={handleWhatsApp}
            style={{
              color: colors.primaryLight,
              paddingHorizontal: normalizeSpacing(8),
            }}
          >
            {" "}
            Click here
          </Text>
        </Text>
      </View>

      <FlatList
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetchData}
            colors={[COLORS.primary]}
          />
        }
        data={filteredAssets}
        renderItem={renderCryptoItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
};

export default CryptoWalletScreen;

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    searchContainer: {
      paddingHorizontal: normalizeSpacing(16),
      paddingVertical: normalizeSpacing(12),
    },
    searchInput: {
      backgroundColor: colors.inputBackground,
      paddingVertical: normalizeSpacing(12),
      paddingHorizontal: normalizeSpacing(18),
      borderRadius: 100,
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      borderColor: colors.border,
      borderWidth: 1,
    },
    listContent: {
      paddingHorizontal: normalizeSpacing(16),
      flexGrow: 1,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: normalizeSpacing(30),
    },
    emptyTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily(800),
      color: colors.text,
      textAlign: "center",
      marginBottom: normalizeSpacing(8),
    },
    emptySubtitle: {
      fontSize: normalize(16),
      fontFamily: getFontFamily(400),
      color: colors.textMuted ?? colors.text,
      textAlign: "center",
    },
    cryptoItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: normalizeSpacing(16),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    cryptoLeft: { flexDirection: "row", alignItems: "center" },
    assetIcon: {
      width: 30,
      height: 30,
      borderRadius: 20,
      marginRight: normalizeSpacing(12),
    },
    cryptoInfo: { flexDirection: "column" },
    cryptoName: {
      fontSize: normalize(16),
      color: colors.text,
      fontFamily: getFontFamily(800),
    },
    cryptoSymbol: {
      fontSize: normalize(16),
      fontFamily: getFontFamily(400),
      color: colors.text,
    },
    cryptoRight: {
      alignItems: "flex-end",
      gap: 3,
    },
    cryptoBalance: {
      fontSize: normalize(17),
      fontFamily: getFontFamily(900),
      color: colors.text,
    },
    cryptoValue: {
      fontFamily: getFontFamily(900),
      fontSize: normalize(17),
      color: colors.text,
    },
  });
