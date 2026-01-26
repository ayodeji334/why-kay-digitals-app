import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { COLORS } from "../../constants/colors";
import BalanceCard from "../Dashboard/BalanceCard";
import {
  ReceiveCryptoIcon,
  RefreshIcon,
  SellCryptoIcon,
  TagsIcon,
} from "../../assets";
import CustomIcon from "../CustomIcon";
import { formatAmount } from "../../libs/formatNumber";
import { useWalletStore } from "../../stores/walletSlice";
import { useNavigation } from "@react-navigation/native";
import { normalize, getFontFamily } from "../../constants/settings";
import { TradeIntent } from "../../screens/Rates";
import { Add } from "iconsax-react-nativejs";
import useAxios from "../../hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import CustomModal from "../CustomModal";
import { showError, showSuccess } from "../../utlis/toast";
import CustomLoading from "../CustomLoading";

const CryptoWalletSection = () => {
  const wallets = useWalletStore(state => state.wallets);
  const loading = useWalletStore(state => state.loading);
  const fetchWallets = useWalletStore(state => state.fetchWalletsAndAccounts);
  const [showAddAssetWalletModal, setAddAssetWalletModal] = useState(false);
  const [selectAssetId, setSelectAssetId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const navigation: any = useNavigation();
  const { apiGet } = useAxios();

  const walletList = useMemo(
    () => wallets.filter((wallet: any) => wallet.type === "crypto"),
    [wallets],
  );

  const fetchAssets = async () => {
    try {
      const response = await apiGet("/crypto-assets/available");
      return response.data?.data.map((asset: any) => ({
        id: asset.asset_id,
        uuid: asset.asset_id,
        name: asset.asset_name,
        symbol: asset.symbol,
        logo_url: asset.logo_url,
        balance: asset.market_price ?? 0,
        rate: parseFloat(asset?.sell_rate ?? 0),
      }));
    } catch (error) {
      console.error("Fetch assets error:", error);
      return [];
    }
  };

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: fetchAssets,
  });

  const filteredWallets = useMemo(() => {
    if (!assets.length) return [];

    const existingAssetIds = new Set(walletList.map((w: any) => w.asset_id));

    return assets
      .filter((asset: any) => !existingAssetIds.has(asset.id))
      .map((asset: any) => ({
        ...asset,
        label: `${asset.name} (${asset.symbol})`,
        value: asset.id,
      }));
  }, [assets, walletList]);

  // Memoize total value
  const totalValueInUsd = useMemo(() => {
    return walletList.reduce(
      (sum: number, w: any) => sum + (parseFloat(w.value) || 0),
      0,
    );
  }, [walletList]);

  const handleGenerateWallet = useCallback(
    async (assetId: string) => {
      if (!assetId) return;

      setIsGenerating(true);

      try {
        await apiGet(`wallets/user/${assetId}/generate-wallet`);
        await fetchWallets();
        showSuccess("Wallet created successfully");
        setSelectAssetId("");
      } catch (error) {
        console.error("Generate wallet error:", error);
        showError("Failed to generate wallet");
      } finally {
        setIsGenerating(false);
      }
    },
    [apiGet, fetchWallets],
  );

  // const handleGenerateWallet = useCallback(async () => {
  //   if (!selectAssetId) return;

  //   setIsGenerating(true);

  //   try {
  //     await apiGet(`wallets/user/${selectAssetId}/generate-wallet`);
  //     await fetchWallets();
  //     showSuccess("Wallet created successfully");
  //     setSelectAssetId("");
  //   } catch (error) {
  //     console.error("Generate wallet error:", error);
  //     showError("Failed to generate wallet");
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // }, [selectAssetId, apiGet, fetchWallets]);

  // Memoize navigation handlers
  const handleBuy = useCallback(() => {
    navigation.navigate("SelectAsset", {
      action: "buy",
      source: "home",
      amount: "0",
    } as TradeIntent);
  }, [navigation]);

  const handleWithdrawal = useCallback(() => {
    navigation.navigate("SelectAsset", {
      action: "withdraw",
      source: "home",
      amount: "0",
    } as TradeIntent);
  }, [navigation]);

  const handleSell = useCallback(() => {
    navigation.navigate("SelectAsset", {
      action: "sell",
      source: "home",
      amount: "0",
    } as TradeIntent);
  }, [navigation]);

  const handleDeposit = useCallback(() => {
    navigation.navigate("SelectAsset", {
      action: "deposit",
      source: "home",
      amount: "0",
    } as TradeIntent);
  }, [navigation]);

  const handleSwap = useCallback(() => {
    navigation.navigate("SwapCrypto");
  }, [navigation]);

  const handleNavigate = (item: any) => {
    navigation.navigate("CryptoWalletDeposit", {
      crypto: { ...item, uuid: item?.asset_id },
    });
  };

  // Memoize icons
  const ReceiveIcon = useMemo(
    () => (
      <CustomIcon source={ReceiveCryptoIcon} size={20} color={COLORS.primary} />
    ),
    [],
  );

  const BuyIcon = useMemo(
    () => <CustomIcon source={TagsIcon} size={20} color={COLORS.primary} />,
    [],
  );

  const SellIcon = useMemo(
    () => (
      <CustomIcon source={SellCryptoIcon} size={18} color={COLORS.primary} />
    ),
    [],
  );

  const SwapIcon = useMemo(
    () => <CustomIcon source={RefreshIcon} size={20} color={COLORS.primary} />,
    [],
  );

  return (
    <View style={styles.container}>
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchWallets}
            colors={[COLORS.primary]}
          />
        }
        data={Array.isArray(walletList) ? walletList : []}
        keyExtractor={(item: any) => item.asset_id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <>
            {/* Balance */}
            <BalanceCard
              balance={totalValueInUsd}
              title="Total Balance"
              showTransactionsButton={false}
              showActionButtons={false}
              currency="USD"
            />

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <ActionCard
                title="Send"
                source={BuyIcon}
                onPress={handleWithdrawal}
              />
              <ActionCard
                title="Receive"
                source={ReceiveIcon}
                onPress={handleDeposit}
              />
              <ActionCard title="Buy" source={BuyIcon} onPress={handleBuy} />
              <ActionCard title="Sell" source={SellIcon} onPress={handleSell} />
              <ActionCard title="Swap" source={SwapIcon} onPress={handleSwap} />
            </View>

            {/* Assets Header */}
            <View style={styles.assetsHeader}>
              <Text style={styles.sectionTitle}>Assets</Text>
              <TouchableOpacity
                onPress={() => setAddAssetWalletModal(true)}
                activeOpacity={0.68}
                style={styles.generateButton}
              >
                <Add color="black" size={15} />
                <Text style={styles.generateButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <AssetItem asset={item} onPress={() => handleNavigate(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No asset wallets found</Text>
            <Text style={styles.emptyStateSubtext}>
              Your asset wallets will appear here once added
            </Text>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      />

      <CustomModal
        height={300}
        title="Select an Asset"
        visible={showAddAssetWalletModal}
        onClose={() => {
          setAddAssetWalletModal(false);
          setSelectAssetId("");
        }}
      >
        {filteredWallets.length > 0 ? (
          <FlatList
            data={filteredWallets}
            keyExtractor={item => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectAssetId(item.value);
                  setAddAssetWalletModal(false);
                  handleGenerateWallet(item.value);
                }}
                style={styles.assetOption}
                activeOpacity={0.7}
              >
                <View style={styles.cryptoRow}>
                  {item.logo_url && (
                    <Image
                      source={{ uri: item.logo_url }}
                      resizeMode="contain"
                      style={styles.assetIcon}
                    />
                  )}
                  <View style={styles.cryptoInfo}>
                    <Text style={styles.optionName}>
                      {item.name} ({item.symbol})
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.emptyModalState}>
            <Text style={styles.emptyStateText}>No assets available</Text>
            <Text style={styles.emptyStateSubtext}>
              You've added all wallets currently supported.
            </Text>
          </View>
        )}
      </CustomModal>

      <CustomLoading loading={isGenerating} />
    </View>
  );
};

const ActionCard = React.memo(({ title, source, onPress }: any) => (
  <TouchableOpacity
    style={styles.actionCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.actionIcon}>{source}</View>
    <Text style={styles.actionTitle}>{title}</Text>
  </TouchableOpacity>
));

const AssetItem = React.memo(({ asset, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.assetItem}
    activeOpacity={0.7}
  >
    <View style={styles.assetLeft}>
      {asset.logo && (
        <Image
          source={{ uri: asset.logo }}
          resizeMode="contain"
          style={styles.assetIcon}
        />
      )}
      <View style={styles.assetInfo}>
        <Text style={styles.assetName}>
          {asset.name} ({asset.symbol})
        </Text>
        <Text style={styles.assetSymbol}>
          {formatAmount(asset.price, false, "USD")}
        </Text>
      </View>
    </View>
    <View style={styles.assetRight}>
      <Text style={styles.assetPrice}>{asset.balance}</Text>
    </View>
  </TouchableOpacity>
));

export default CryptoWalletSection;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scrollContainer: { flex: 1, padding: 0 },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  assetsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 26,
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#e1e1e1ff",
  },
  emptyModalState: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    marginBottom: 12,
    color: "#000",
  },
  assetOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "column",
  },
  cryptoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cryptoInfo: { flex: 1 },
  optionName: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#374151",
  },
  optionPrice: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#6B7280",
  },
  assetOptionText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("600"),
    color: "#6B7280",
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  activeTabText: {
    color: "#fff",
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 7,
    justifyContent: "space-between",
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  actionIcon: { marginBottom: 10 },
  actionTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
  },
  assetsSection: { paddingVertical: 30 },
  sectionTitle: {
    fontSize: normalize(22),
    fontFamily: getFontFamily("800"),
    color: "#000",
    textAlign: "center",
  },
  assetsList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  generateButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 30,
    backgroundColor: COLORS.whiteBackground,
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1,
    gap: 4,
  },
  generateButtonText: {
    color: "black",
    fontFamily: getFontFamily(800),
    fontSize: 13,
  },
  assetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1ff",
  },
  assetLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  assetIcon: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  assetIconText: {
    fontSize: normalize(13),
    fontFamily: getFontFamily("700"),
    color: "#374151",
  },
  assetInfo: { flex: 1 },
  assetName: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000000",
  },
  assetSymbol: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("400"),
    color: "#000000",
  },
  assetRight: { alignItems: "flex-end" },
  assetPrice: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("800"),
    color: "#000",
  },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyStateText: { fontSize: normalize(22), fontFamily: getFontFamily("800") },
  emptyStateSubtext: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: "#474748ff",
  },
  txItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  txText: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("400"),
  },
  txAmount: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
    color: COLORS.primary,
  },
});
