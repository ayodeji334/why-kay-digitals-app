import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StatusBar,
  StyleSheet,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily } from "../constants/settings";
import CustomLoading from "../components/CustomLoading";
import { COLORS } from "../constants/colors";
import { useAssets } from "../hooks/useAssets";
import { formatAmount, formatNumber } from "../libs/formatNumber";
import { useWallets } from "../hooks/useWallet";
import { TradeIntent } from "../libs/types";
import { AppText } from "../components/AppText";

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

  // const mergedList = useMemo(() => {
  //   const walletAssetIds = new Set((wallets ?? []).map((w: any) => w.asset_id));

  //   const walletsWithBalance = (wallets ?? []).map((w: any) => ({
  //     ...w,
  //     uuid: w.asset_id,
  //     logo_url: w.logo,
  //     hasWallet: true,
  //   }));

  //   const assetsWithoutWallet = (assets ?? [])
  //     .filter((a: any) => !walletAssetIds.has(a.uuid))
  //     .map((a: any) => ({
  //       ...a,
  //       balance: "0.00000000",
  //       value: "0.00000000",
  //       price: a.market_current_value ?? "0",
  //       hasWallet: false,
  //     }));

  //   return [...walletsWithBalance, ...assetsWithoutWallet];
  // }, [wallets, assets]);

  const refetchData = () => {
    refetch();
    refetchWallets();
  };

  // Filter + sort
  // const filteredAssets = useMemo(() => {
  //   const filtered = !searchQuery
  //     ? mergedList
  //     : mergedList.filter(
  //         (item: any) =>
  //           item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //           item.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  //       );

  //   return [...filtered].sort((a: any, b: any) => {
  //     const aValue = Number(a.value ?? 0);
  //     const bValue = Number(b.value ?? 0);

  //     if (aValue !== bValue) return bValue - aValue;

  //     const aBalance = Number(a.balance ?? 0);
  //     const bBalance = Number(b.balance ?? 0);

  //     return bBalance - aBalance;
  //   });
  // }, [mergedList, searchQuery]);

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
              {formatAmount(balanceInUsd, { currency: "USD" })}
            </AppText>
          </View>
        ) : (
          <></>
        )}
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    refetchData();
  }, []);

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
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
      </View>

      <FlatList
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
      />

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
};

export default CryptoWalletScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    paddingHorizontal: 14,
    borderRadius: 100,
    fontSize: 14,
    fontFamily: getFontFamily("700"),
    borderColor: "#E8E8E8",
    borderWidth: 1,
  },
  listContent: { paddingHorizontal: 16 },
  cryptoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#dcdcdcff",
  },
  cryptoLeft: { flexDirection: "row", alignItems: "center" },
  assetIcon: { width: 30, height: 30, borderRadius: 20, marginRight: 12 },
  cryptoInfo: { flexDirection: "column" },
  cryptoName: { fontSize: 13, fontFamily: getFontFamily(800) },
  cryptoSymbol: { fontSize: 12, fontFamily: getFontFamily(700), color: "#000" },
  cryptoRight: {
    alignItems: "flex-end",
    gap: 3,
  },
  cryptoBalance: {
    fontSize: 13,
    fontFamily: getFontFamily(900),
    fontWeight: "600",
    color: "#000",
  },
  cryptoValue: {
    fontFamily: getFontFamily(900),
    fontSize: 13,
    color: "#000",
  },
});
