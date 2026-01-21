import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StatusBar,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { getFontFamily } from "../constants/settings";
import useAxios from "../hooks/useAxios";
import CustomLoading from "../components/CustomLoading";
import { TradeIntent } from "./Rates";

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
  const { apiGet } = useAxios();

  // Fetch assets
  const fetchAssets = async (): Promise<any[]> => {
    try {
      const response = await apiGet("/crypto-assets/available");
      return (
        response.data?.data?.map((asset: any) => {
          return {
            id: asset.asset_id,
            uuid: asset.asset_id,
            name: asset.asset_name,
            symbol: asset.symbol,
            logo_url: asset.logo_url,
            balance: asset.market_price ?? 0,
            rate: parseFloat(asset?.sell_rate ?? 0),
            change: Math.random() > 0.5 ? "up" : "down",
            changePercentage: (Math.random() * 20 - 10).toFixed(2),
          };
        }) ?? []
      );
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      throw error;
    }
  };

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: fetchAssets,
  });

  // Filter by search query
  const filteredAssets = useMemo(() => {
    if (!searchQuery) return assets;
    return assets.filter(
      asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [assets, searchQuery]);

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
    }
  };

  const renderCryptoItem = ({ item }: any) => (
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
          <Text style={styles.cryptoName}>{item.name}</Text>
          <Text style={styles.cryptoSymbol}>{item.symbol}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Asset"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <FlatList
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
    padding: 15,
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#dcdcdcff",
  },
  cryptoLeft: { flexDirection: "row", alignItems: "center" },
  assetIcon: { width: 30, height: 30, borderRadius: 20, marginRight: 12 },
  cryptoInfo: { flexDirection: "column" },
  cryptoName: { fontSize: 15, fontFamily: getFontFamily(800) },
  cryptoSymbol: { fontSize: 12, fontFamily: getFontFamily(700), color: "#000" },
});
