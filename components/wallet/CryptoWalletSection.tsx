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
import { useNavigation } from "@react-navigation/native";
import { normalize, getFontFamily } from "../../constants/settings";
import { TradeIntent } from "../../screens/Rates";
import { Add } from "iconsax-react-nativejs";
import useAxios from "../../hooks/useAxios";
import CustomModal from "../CustomModal";
import { showError, showSuccess } from "../../utlis/toast";
import CustomLoading from "../CustomLoading";
import { useAssets } from "../../hooks/useAssets";
import { useWallets } from "../../hooks/useWallet";
import LoadingBalance from "../LoadingState";

const CryptoWalletSection = () => {
  const [showAddAssetWalletModal, setShowAddAssetWalletModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigation = useNavigation<any>();
  const { apiGet } = useAxios();
  const { assets } = useAssets();
  const { data, isLoading, refetch, isRefetching } = useWallets();
  const wallets = Array.isArray(data?.wallets) ? data.wallets : [];
  const walletList = wallets
    .filter((w: any) => w.type === "crypto")
    .sort((a: any, b: any) => {
      const aValue = Number(a.value);
      const bValue = Number(b.value);
      const aPrice = Number(a.price);
      const bPrice = Number(b.price);

      if (bValue !== aValue) return bValue - aValue;

      return bPrice - aPrice;
    });

  // Assets not yet added as wallets
  const filteredWallets = useMemo(() => {
    if (!assets.length) return [];

    const existingAssetIds = new Set(walletList.map((w: any) => w.asset_id));

    return assets
      .filter(asset => !existingAssetIds.has(asset.id))
      .map(asset => ({
        ...asset,
        label: `${asset.name} (${asset.symbol})`,
        value: asset.id,
      }));
  }, [assets, walletList]);

  // Total balance
  const totalValueInUsd = useMemo(
    () =>
      walletList.reduce(
        (sum: any, w: any) => sum + (parseFloat(w.value) || 0),
        0,
      ),
    [walletList],
  );

  // Wallet generation
  const handleGenerateWallet = async (assetId: string) => {
    if (!assetId) return;
    setIsGenerating(true);
    try {
      await apiGet(`wallets/user/${assetId}/generate-wallet`);
      refetch();
      showSuccess("Wallet created successfully");
    } catch (error) {
      console.error("Generate wallet error:", error);
      showError("Failed to generate wallet");
    } finally {
      setIsGenerating(false);
    }
  };

  // Navigation helpers
  const navigateTrade = (action: TradeIntent["action"]) => {
    navigation.navigate("SelectAsset", {
      action,
      source: "home",
      amount: "0",
    } as TradeIntent);
  };

  const handleNavigateWallet = (item: any) => {
    navigation.navigate("CryptoWalletDeposit", {
      crypto: { ...item, uuid: item.asset_id },
    });
  };

  // Icons
  const icons = {
    receive: (
      <CustomIcon source={ReceiveCryptoIcon} size={20} color={COLORS.primary} />
    ),
    buy: <CustomIcon source={TagsIcon} size={20} color={COLORS.primary} />,
    sell: (
      <CustomIcon source={SellCryptoIcon} size={18} color={COLORS.primary} />
    ),
    swap: <CustomIcon source={RefreshIcon} size={20} color={COLORS.primary} />,
  };

  return (
    <View style={styles.container}>
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[COLORS.primary]}
          />
        }
        data={walletList}
        keyExtractor={item => item.asset_id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <>
            <BalanceCard
              balance={totalValueInUsd}
              title="Total Balance"
              showTransactionsButton={false}
              showActionButtons={false}
              currency="USD"
            />

            <View style={styles.actionsContainer}>
              <ActionCard
                title="Send"
                source={icons.buy}
                onPress={() => navigateTrade("withdraw")}
              />
              <ActionCard
                title="Receive"
                source={icons.receive}
                onPress={() => navigateTrade("deposit")}
              />

              <ActionCard
                title="Buy"
                source={icons.buy}
                onPress={() => navigateTrade("buy")}
              />

              <ActionCard
                title="Sell"
                source={icons.sell}
                onPress={() => navigateTrade("sell")}
              />

              <ActionCard
                title="Swap"
                source={icons.swap}
                onPress={() => navigation.navigate("SwapCrypto")}
              />
            </View>

            {/* Assets header */}
            <View style={styles.assetsHeader}>
              <Text style={styles.sectionTitle}>Assets</Text>
              <TouchableOpacity
                onPress={() => setShowAddAssetWalletModal(true)}
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
          <AssetItem asset={item} onPress={() => handleNavigateWallet(item)} />
        )}
        ListEmptyComponent={
          isLoading ? (
            <LoadingBalance />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No asset wallets found</Text>
              <Text style={styles.emptyStateSubtext}>
                Your asset wallets will appear here once added
              </Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <CustomModal
        height={250}
        title="Select an Asset"
        visible={showAddAssetWalletModal}
        onClose={() => setShowAddAssetWalletModal(false)}
      >
        {filteredWallets.length > 0 ? (
          <FlatList
            data={filteredWallets}
            keyExtractor={item => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setShowAddAssetWalletModal(false);
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
            <Text style={styles.emptyStateText}>
              No more assets available to add
            </Text>
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
          {formatAmount(asset.price, { currency: "USD" })}
        </Text>
      </View>
    </View>
    <View style={styles.assetRight}>
      <Text style={styles.assetPrice}>{asset.balance}</Text>
      <Text style={[styles.assetPrice, { fontSize: 17 }]}>
        {formatAmount(asset.balance * asset.price, { currency: "USD" })}
      </Text>
    </View>
  </TouchableOpacity>
));

export default CryptoWalletSection;

const styles = StyleSheet.create({
  container: { backgroundColor: "white" },
  scrollContainer: { flex: 1, paddingBottom: 20 },
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
  emptyStateText: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("800"),
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: "#474748ff",
    textAlign: "center",
  },
  emptyButton: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 160,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
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
