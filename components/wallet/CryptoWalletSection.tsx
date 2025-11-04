import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import { normalize, getFontFamily } from "../../constants/settings";
import BalanceCard from "../Dashboard/BalanceCard";
import {
  ReceiveCryptoIcon,
  RefreshIcon,
  SellCryptoIcon,
  SendCryptoIcon,
  TagsIcon,
} from "../../assets";
import CustomIcon from "../CustomIcon";

const CryptoWalletSection = ({
  user,
  cryptoWallet,
  handleSell,
  handleSwap,
}: any) => (
  <View>
    <BalanceCard
      balance={cryptoWallet?.balance ?? 0}
      title="Total Balance"
      showTransactionsButton={false}
      showActionButtons={false}
    />

    <View style={styles.actionsContainer}>
      <ActionCard
        title="Send"
        source={
          <CustomIcon
            source={SendCryptoIcon}
            size={20}
            color={COLORS.primary}
          />
        }
        onPress={handleSwap}
      />
      <ActionCard
        title="Receive"
        source={
          <CustomIcon
            source={ReceiveCryptoIcon}
            size={20}
            color={COLORS.primary}
          />
        }
        onPress={handleSwap}
      />
      <ActionCard
        title="Buy"
        source={
          <CustomIcon source={TagsIcon} size={20} color={COLORS.primary} />
        }
        onPress={handleSwap}
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

    {/* Assets */}
    <View style={styles.assetsSection}>
      <Text style={styles.sectionTitle}>Assets</Text>
      <View style={styles.assetsList}>
        {user?.assets?.length ? (
          user.assets.map((asset: any) => (
            <AssetItem key={asset.id} asset={asset} />
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
  </View>
);

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
      <View style={styles.assetIcon}>
        <Text style={styles.assetIconText}>{asset.icon}</Text>
      </View>
      <View style={styles.assetInfo}>
        <Text style={styles.assetName}>{asset.name}</Text>
        <Text style={styles.assetSymbol}>{asset.symbol}</Text>
      </View>
    </View>
    <View style={styles.assetRight}>
      <Text style={styles.assetPrice}>{asset.price}</Text>
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
    fontFamily: getFontFamily("400"),
    color: "#374151",
  },
  assetInfo: { flex: 1 },
  assetName: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("400"),
    color: "#000",
  },
  assetSymbol: { fontSize: normalize(11), color: "#6B7280" },
  assetRight: { alignItems: "flex-end" },
  assetPrice: {
    fontSize: normalize(13),
    fontFamily: getFontFamily("400"),
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
