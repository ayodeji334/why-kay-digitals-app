import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
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
import useAxios from "../api/axios";
import { useQuery } from "@tanstack/react-query";
import { getFontFamily } from "../constants/settings";

const CryptoWalletScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigation: any = useNavigation();
  const { apiGet } = useAxios();
  const fetchAssets = async (): Promise<any> => {
    try {
      const response = await apiGet("/crypto-assets");
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
    isFetching: isLoading,
    // isError,
    // error,
    // refetch,
  } = useQuery({
    queryKey: ["assets"],
    queryFn: fetchAssets,
  });

  const renderCryptoItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.79}
      style={styles.cryptoItem}
      onPress={() =>
        navigation.navigate("CryptoWalletDeposit", { crypto: item })
      }
    >
      <View style={styles.cryptoLeft}>
        {item.logo_url && (
          <Image
            key={item.logo_url}
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

  if (isLoading) {
    return (
      <View style={styles.section}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading assets...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Transaction"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <FlatList
        data={assets}
        renderItem={renderCryptoItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

export default CryptoWalletScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  section: {
    marginBottom: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
  },
  assetIcon: {
    height: 30,
    width: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 100,
    fontSize: 16,
    fontFamily: getFontFamily("700"),
    borderColor: "#E8E8E8",
    borderWidth: 1,
  },
  listContent: {
    padding: 16,
  },
  cryptoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#dcdcdcff",
  },
  cryptoLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cryptoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
    fontFamily: "bold",
  },
  cryptoInfo: {
    flexDirection: "column",
  },
  cryptoName: {
    fontSize: 16,
    fontFamily: getFontFamily(800),
  },
  cryptoSymbol: {
    fontSize: 14,
    fontFamily: getFontFamily(400),
    color: "#000000ff",
  },
  cryptoRight: {
    alignItems: "flex-end",
  },
  cryptoPrice: {
    fontSize: 16,
    fontFamily: getFontFamily(700),
  },
  cryptoChange: {
    fontSize: 14,
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1a1a1a",
  },
  backButton: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "bold",
  },
  walletHeaderTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "bold",
  },
  placeholder: {
    width: 20,
  },
  walletContainer: {
    flex: 1,
    padding: 20,
  },
  qrCodeContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  qrCodeText: {
    color: "#666",
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: getFontFamily(700),
    marginBottom: 10,
    color: "#333",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  copyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#007AFF",
    borderRadius: 6,
  },
  copyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: getFontFamily(700),
  },
  priceInfo: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 16,
    color: "#666",
  },
  priceValue: {
    fontSize: 16,
    fontFamily: getFontFamily(700),
    color: "#333",
  },
  changeValue: {
    fontSize: 16,
    fontFamily: getFontFamily(700),
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  secondaryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: getFontFamily(700),
    color: "#333",
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyIconText: {
    fontSize: 30,
    fontFamily: "bold",
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  generateButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
});
