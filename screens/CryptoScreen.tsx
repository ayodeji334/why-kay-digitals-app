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
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily } from "../constants/settings";
import CustomLoading from "../components/CustomLoading";
import { TradeIntent } from "./Rates";
import { COLORS } from "../constants/colors";
import { useAssets } from "../hooks/useAssets";

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

  // Filter by search query
  const filteredAssets = useMemo(() => {
    if (!searchQuery) return assets;
    return assets.filter(
      (asset: any) =>
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
          <Text style={styles.cryptoName}>{item.symbol}</Text>
          <Text style={styles.cryptoSymbol}>{item.name}</Text>
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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
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
