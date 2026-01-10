import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  StyleSheet,
  TextInput,
  Animated,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily } from "../constants/settings";
import useAxios from "../hooks/useAxios";

const AssetSelectionScreen = ({
  onSelect,
}: {
  onSelect: (asset: any) => void;
}) => {
  const { apiGet } = useAxios();
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Animation setup
  const slideAnim = useRef(new Animated.Value(500)).current; // start off-screen to the right

  useEffect(() => {
    // Slide in when mounted
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Slide out when unmounted
    return () => {
      Animated.timing(slideAnim, {
        toValue: -300, // slide out to the left
        duration: 500,
        useNativeDriver: true,
      }).start();
    };
  }, [slideAnim]);

  // Fetch assets
  const fetchAssets = async (): Promise<any[]> => {
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
      };
    });
  };

  const { data: assets = [], isFetching: isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: fetchAssets,
  });

  const renderCryptoItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.cryptoItem}
      onPress={() => onSelect(item)}
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

      {/* ✅ Animated wrapper for the whole screen */}
      <Animated.View
        style={{ flex: 1, transform: [{ translateX: slideAnim }] }}
      >
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Transaction"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading assets...</Text>
          </View>
        ) : (
          <FlatList
            data={assets}
            renderItem={renderCryptoItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

export default AssetSelectionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchContainer: { paddingHorizontal: 16 },
  searchInput: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 100,
    fontSize: 16,
    fontFamily: getFontFamily("700"),
    borderColor: "#E8E8E8",
    borderWidth: 1,
  },
  listContent: { padding: 16 },
  cryptoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#dcdcdc",
  },
  cryptoLeft: { flexDirection: "row", alignItems: "center" },
  assetIcon: { height: 30, width: 40, borderRadius: 20, marginRight: 10 },
  cryptoInfo: { flexDirection: "column" },
  cryptoName: { fontSize: 16, fontFamily: getFontFamily(800) },
  cryptoSymbol: { fontSize: 14, fontFamily: getFontFamily(400), color: "#000" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, color: "#666" },
});
