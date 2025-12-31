import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Image,
} from "react-native";
import { COLORS } from "../../constants/colors";
import { normalize, getFontFamily } from "../../constants/settings";
import BalanceCard from "../Dashboard/BalanceCard";
import {
  ReceiveCryptoIcon,
  RefreshIcon,
  SellCryptoIcon,
  TagsIcon,
} from "../../assets";
import CustomIcon from "../CustomIcon";
import useAxios from "../../api/axios";
import { useQuery } from "@tanstack/react-query";
import { formatAmount } from "../../libs/formatNumber";
import { useMemo } from "react";

const CryptoWalletSection = ({
  handleSell,
  handleSwap,
  handleDeposit,
  handleBuy,
}: any) => {
  const { apiGet } = useAxios();

  const fetchTransactions = async () => {
    const { data }: any = await apiGet("/wallets/user");
    return data?.data ?? [];
  };

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ["user-wallets"],
    queryFn: fetchTransactions,
    refetchOnWindowFocus: true,
  });

  console.log(data);

  const totalWalletValue: number = useMemo(
    () =>
      Array.isArray(data)
        ? data.reduce((sum: number, d: any) => {
            return sum + (parseFloat(d?.wallet_value) || 0);
          }, 0)
        : 0,
    [data],
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <BalanceCard
        balance={totalWalletValue}
        title="Total Balance"
        showTransactionsButton={false}
        showActionButtons={false}
        currency="USD"
      />

      <View style={styles.actionsContainer}>
        {/* <ActionCard
        title="Send"
        source={
          <CustomIcon
            source={SendCryptoIcon}
            size={20}
            color={COLORS.primary}
          />
        }
        onPress={handleSwap}
      /> */}
        <ActionCard
          title="Receive"
          source={
            <CustomIcon
              source={ReceiveCryptoIcon}
              size={20}
              color={COLORS.primary}
            />
          }
          onPress={handleDeposit}
        />
        <ActionCard
          title="Buy"
          source={
            <CustomIcon source={TagsIcon} size={20} color={COLORS.primary} />
          }
          onPress={handleBuy}
        />
        <ActionCard
          title="Sell"
          source={
            <CustomIcon
              source={SellCryptoIcon}
              size={18}
              color={COLORS.primary}
            />
          }
          onPress={handleSell}
        />
        <ActionCard
          title="Swap"
          source={
            <CustomIcon source={RefreshIcon} size={20} color={COLORS.primary} />
          }
          onPress={handleSwap}
        />
      </View>

      <View style={styles.assetsSection}>
        <Text style={styles.sectionTitle}>Assets</Text>
        <View style={styles.assetsList}>
          {Array.isArray(data) ? (
            data.map((asset: any) => (
              <AssetItem key={asset.asset_id} asset={asset} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No assets found</Text>
              <Text style={styles.emptyStateSubtext}>
                Your assets will appear here once added
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const ActionCard = ({ title, source, onPress }: any) => (
  <TouchableOpacity
    style={styles.actionCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.actionIcon}>{source}</View>
    <Text maxFontSizeMultiplier={0} style={styles.actionTitle}>
      {title}
    </Text>
  </TouchableOpacity>
);

const AssetItem = ({ asset }: any) => (
  <TouchableOpacity style={styles.assetItem} activeOpacity={0.7}>
    <View style={styles.assetLeft}>
      {asset.asset_logo_url && (
        <Image
          key={asset.asset_logo_url}
          source={{ uri: asset.asset_logo_url }}
          resizeMode="contain"
          style={styles.assetIcon}
        />
      )}
      <View style={styles.assetInfo}>
        <Text style={styles.assetName}>
          {asset.asset_name} ({asset.symbol})
        </Text>
        <Text style={styles.assetSymbol}>
          {formatAmount(asset.market_current_value, false, "USD")}
        </Text>
      </View>
    </View>
    <View style={styles.assetRight}>
      <Text style={styles.assetPrice}>{asset.balance}</Text>
    </View>
  </TouchableOpacity>
);

export default CryptoWalletSection;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { flex: 1, padding: 20 },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
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
    marginBottom: 16,
  },
  assetsList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
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
    width: 40,
    height: 40,
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
  assetSymbol: { fontSize: normalize(13), color: "#000000" },
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
    color: "#6B7280",
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
