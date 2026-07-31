import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
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
import { Add, Refresh2 } from "iconsax-react-nativejs";
import useAxios from "../../hooks/useAxios";
import CustomModal from "../CustomModal";
import { showError, showSuccess } from "../../utlis/toast";
import { useAssets } from "../../hooks/useAssets";
import { useWallets } from "../../hooks/useWallet";
import LoadingBalance from "../LoadingState";
import { TradeIntent } from "../../libs/types";
import { AppText } from "../AppText";
import CustomLoading from "../CustomLoading";
import { useColors } from "../../hooks/useTheme";

const CryptoWalletSection = () => {
  const [showAddAssetWalletModal, setShowAddAssetWalletModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const colors = useColors();
  const styles = makeStyles(colors);

  // The asset the user picked, waiting for the modal to finish dismissing.
  // Using a ref (not state) because it shouldn't trigger a re-render.
  const pendingAssetIdRef = useRef<string | null>(null);

  const navigation = useNavigation<any>();
  const { apiGet } = useAxios();
  const { assets } = useAssets();
  const { data, isLoading, refetch, isRefetching } = useWallets();

  // Memoized so it's not a brand-new array on every render
  // (previously this invalidated the filteredWallets memo each time).
  const walletList = useMemo(() => {
    const wallets = Array.isArray(data?.wallets) ? data.wallets : [];

    return wallets
      .filter((w: any) => w.type === "crypto")
      .sort((a: any, b: any) => {
        const aValue = Number(a.value);
        const bValue = Number(b.value);

        if (bValue !== aValue) return bValue - aValue;

        return Number(b.price) - Number(a.price);
      });
  }, [data?.wallets]);

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
        (sum: number, w: any) => sum + (parseFloat(w.value) || 0),
        0,
      ),
    [walletList],
  );

  // Wallet generation
  const handleGenerateWallet = useCallback(
    async (assetId: string) => {
      if (!assetId) return;
      setIsGenerating(true);
      try {
        await apiGet(`wallets/user/${assetId}/generate-wallet`);
        await refetch();
        showSuccess("Wallet created successfully");
      } catch (error) {
        console.error("Generate wallet error:", error);
        showError("Failed to generate wallet");
      } finally {
        setIsGenerating(false);
      }
    },
    [apiGet, refetch],
  );

  // User picked an asset: just close the modal and remember the choice.
  // Generation starts in onModalDismissed, AFTER the native dismiss
  // animation has fully completed — no guessed setTimeout.
  const handleSelectAsset = (assetId: string) => {
    pendingAssetIdRef.current = assetId;
    setShowAddAssetWalletModal(false);
  };

  // Fired by the modal once iOS has truly finished dismissing it.
  // (On Android, RN's Modal fires onDismiss as well when it unmounts.)
  const onModalDismissed = () => {
    const assetId = pendingAssetIdRef.current;
    pendingAssetIdRef.current = null;
    if (assetId) {
      handleGenerateWallet(assetId);
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

  const icons = {
    receive: (
      <CustomIcon source={ReceiveCryptoIcon} size={20} color={COLORS.primary} />
    ),
    send: <CustomIcon source={TagsIcon} size={20} color={COLORS.primary} />,
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
                source={icons.send}
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
              <AppText style={styles.sectionTitle}>Assets</AppText>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <TouchableOpacity
                  onPress={() => refetch()}
                  activeOpacity={0.78}
                  style={styles.generateButton}
                >
                  <Refresh2 color={colors.text} size={12} />
                  <AppText style={styles.generateButtonText}>Refresh</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowAddAssetWalletModal(true)}
                  activeOpacity={0.68}
                  style={styles.generateButton}
                >
                  <Add color={colors.text} size={15} />
                  <AppText style={styles.generateButtonText}>Add</AppText>
                </TouchableOpacity>
              </View>
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
              <AppText style={styles.emptyStateText}>
                No asset wallets found
              </AppText>
              <AppText style={styles.emptyStateSubtext}>
                Your asset wallets will appear here once added
              </AppText>
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
        onDismiss={onModalDismissed}
      >
        {filteredWallets.length > 0 ? (
          <FlatList
            data={filteredWallets}
            keyExtractor={item => item.value}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectAsset(item.value)}
                style={styles.assetOption}
                activeOpacity={0.8}
                hitSlop={1}
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
                    <AppText style={styles.optionName}>
                      {item.name} ({item.symbol})
                    </AppText>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.emptyModalState}>
            <AppText style={styles.emptyStateText}>
              No more assets available to add
            </AppText>
            <AppText style={styles.emptyStateSubtext}>
              You've added all wallets currently supported.
            </AppText>
          </View>
        )}
      </CustomModal>

      {/* Plain absolutely-positioned overlay instead of a second native
          Modal — there is no UIViewController presentation to conflict
          with the select-asset modal's dismissal on iOS. */}
      {/* {isGenerating && ( */}
      <CustomLoading loading={isGenerating} />
      {/* )} */}
    </View>
  );
};

// const CryptoWalletSection = () => {
//   const [showAddAssetWalletModal, setShowAddAssetWalletModal] = useState(false);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const navigation = useNavigation<any>();
//   const { apiGet } = useAxios();
//   const { assets } = useAssets();
//   const { data, isLoading, refetch, isRefetching } = useWallets();

//   const wallets = Array.isArray(data?.wallets) ? data.wallets : [];

//   const walletList = wallets
//     .filter((w: any) => w.type === "crypto")
//     .sort((a: any, b: any) => {
//       const aValue = Number(a.value);
//       const bValue = Number(b.value);
//       const aPrice = Number(a.price);
//       const bPrice = Number(b.price);

//       if (bValue !== aValue) return bValue - aValue;

//       return bPrice - aPrice;
//     });

//   // Assets not yet added as wallets
//   const filteredWallets = useMemo(() => {
//     if (!assets.length) return [];

//     const existingAssetIds = new Set(walletList.map((w: any) => w.asset_id));

//     return assets
//       .filter(asset => !existingAssetIds.has(asset.id))
//       .map(asset => ({
//         ...asset,
//         label: `${asset.name} (${asset.symbol})`,
//         value: asset.id,
//       }));
//   }, [assets, walletList]);

//   // Total balance
//   const totalValueInUsd = useMemo(
//     () =>
//       walletList.reduce(
//         (sum: any, w: any) => sum + (parseFloat(w.value) || 0),
//         0,
//       ),
//     [walletList],
//   );

//   // Wallet generation
//   const handleGenerateWallet = async (assetId: string) => {
//     if (!assetId) return;
//     try {
//       setTimeout(() => setIsGenerating(true), 400);
//       await apiGet(`wallets/user/${assetId}/generate-wallet`);
//       refetch();
//       showSuccess("Wallet created successfully");
//     } catch (error) {
//       console.error("Generate wallet error:", error);
//       showError("Failed to generate wallet");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   // Navigation helpers
//   const navigateTrade = (action: TradeIntent["action"]) => {
//     navigation.navigate("SelectAsset", {
//       action,
//       source: "home",
//       amount: "0",
//     } as TradeIntent);
//   };

//   const handleNavigateWallet = (item: any) => {
//     navigation.navigate("CryptoWalletDeposit", {
//       crypto: { ...item, uuid: item.asset_id },
//     });
//   };

//   // Icons
//   const icons = {
//     receive: (
//       <CustomIcon source={ReceiveCryptoIcon} size={20} color={COLORS.primary} />
//     ),
//     buy: <CustomIcon source={TagsIcon} size={20} color={COLORS.primary} />,
//     sell: (
//       <CustomIcon source={SellCryptoIcon} size={18} color={COLORS.primary} />
//     ),
//     swap: <CustomIcon source={RefreshIcon} size={20} color={COLORS.primary} />,
//   };

//   console.log("Renderer");

//   useEffect(() => {
//     refetch();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <FlatList
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefetching}
//             onRefresh={refetch}
//             colors={[COLORS.primary]}
//           />
//         }
//         data={walletList}
//         keyExtractor={item => item.asset_id}
//         showsVerticalScrollIndicator={false}
//         ItemSeparatorComponent={() => <View style={styles.separator} />}
//         ListHeaderComponent={
//           <>
//             <BalanceCard
//               balance={totalValueInUsd}
//               title="Total Balance"
//               showTransactionsButton={false}
//               showActionButtons={false}
//               currency="USD"
//             />

//             <View style={styles.actionsContainer}>
//               <ActionCard
//                 title="Send"
//                 source={icons.buy}
//                 onPress={() => navigateTrade("withdraw")}
//               />
//               <ActionCard
//                 title="Receive"
//                 source={icons.receive}
//                 onPress={() => navigateTrade("deposit")}
//               />

//               <ActionCard
//                 title="Buy"
//                 source={icons.buy}
//                 onPress={() => navigateTrade("buy")}
//               />

//               <ActionCard
//                 title="Sell"
//                 source={icons.sell}
//                 onPress={() => navigateTrade("sell")}
//               />

//               <ActionCard
//                 title="Swap"
//                 source={icons.swap}
//                 onPress={() => navigation.navigate("SwapCrypto")}
//               />
//             </View>

//             {/* Assets header */}
//             <View style={styles.assetsHeader}>
//               <AppText style={styles.sectionTitle}>Assets</AppText>
//               <View
//                 style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
//               >
//                 <TouchableOpacity
//                   onPress={() => refetch()}
//                   activeOpacity={0.68}
//                   style={styles.generateButton}
//                 >
//                   <Refresh2 color="black" size={12} />
//                   <AppText style={styles.generateButtonText}>Refresh</AppText>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   onPress={() => setShowAddAssetWalletModal(true)}
//                   activeOpacity={0.68}
//                   style={styles.generateButton}
//                 >
//                   <Add color="black" size={15} />
//                   <AppText style={styles.generateButtonText}>Add</AppText>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </>
//         }
//         renderItem={({ item }) => (
//           <AssetItem asset={item} onPress={() => handleNavigateWallet(item)} />
//         )}
//         ListEmptyComponent={
//           isLoading ? (
//             <LoadingBalance />
//           ) : (
//             <View style={styles.emptyState}>
//               <AppText style={styles.emptyStateText}>
//                 No asset wallets found
//               </AppText>
//               <AppText style={styles.emptyStateSubtext}>
//                 Your asset wallets will appear here once added
//               </AppText>
//             </View>
//           )
//         }
//         contentContainerStyle={{ paddingBottom: 40 }}
//       />

//       <CustomModal
//         height={250}
//         title="Select an Asset"
//         visible={showAddAssetWalletModal}
//         onClose={() => setShowAddAssetWalletModal(false)}
//         onDismiss={}
//       >
//         {filteredWallets.length > 0 ? (
//           <FlatList
//             data={filteredWallets}
//             keyExtractor={item => item.value}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 onPress={() => {
//                   setShowAddAssetWalletModal(false);
//                   setTimeout(() => handleGenerateWallet(item.value), 800);
//                 }}
//                 style={styles.assetOption}
//                 activeOpacity={0.7}
//               >
//                 <View style={styles.cryptoRow}>
//                   {item.logo_url && (
//                     <Image
//                       source={{ uri: item.logo_url }}
//                       resizeMode="contain"
//                       style={styles.assetIcon}
//                     />
//                   )}
//                   <View style={styles.cryptoInfo}>
//                     <AppText style={styles.optionName}>
//                       {item.name} ({item.symbol})
//                     </AppText>
//                   </View>
//                 </View>
//               </TouchableOpacity>
//             )}
//           />
//         ) : (
//           <View style={styles.emptyModalState}>
//             <AppText style={styles.emptyStateText}>
//               No more assets available to add
//             </AppText>
//             <AppText style={styles.emptyStateSubtext}>
//               You've added all wallets currently supported.
//             </AppText>
//           </View>
//         )}
//       </CustomModal>

//       <CustomLoading loading={isGenerating} />
//     </View>
//   );
// };

const ActionCard = React.memo(({ title, source, onPress }: any) => {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.actionIcon}>{source}</View>
      <AppText style={styles.actionTitle}>{title}</AppText>
    </TouchableOpacity>
  );
});

const AssetItem = React.memo(({ asset, onPress }: any) => {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.assetItem}
      activeOpacity={0.8}
      hitSlop={1}
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
          <AppText style={styles.assetName}>
            {asset.name} ({asset.symbol})
          </AppText>
          <AppText style={styles.assetSymbol}>
            {formatAmount(asset.price, { currency: "USD" })}
          </AppText>
        </View>
      </View>
      <View style={styles.assetRight}>
        <AppText style={styles.assetPrice}>{asset.balance}</AppText>
        <AppText style={[styles.assetPrice, { fontSize: 15 }]}>
          {formatAmount(asset.balance * asset.price, {
            currency: "USD",
            decimalPlace: 2,
          })}
        </AppText>
      </View>
    </TouchableOpacity>
  );
});

export default CryptoWalletSection;

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { backgroundColor: colors.background, paddingBottom: 50 },
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
      backgroundColor: colors.border,
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
      borderBottomColor: colors.border,
      flexDirection: "column",
    },
    cryptoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    cryptoInfo: { flex: 1 },
    optionName: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    assetOptionText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: colors.text,
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
      fontFamily: getFontFamily("800"),
      color: "#000",
    },
    assetsSection: { paddingVertical: 30 },
    sectionTitle: {
      fontSize: normalize(22),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      textAlign: "center",
    },
    assetsList: {
      backgroundColor: "#fff",
      borderRadius: 12,
      overflow: "hidden",
    },
    generateButton: {
      paddingVertical: 6,
      paddingHorizontal: normalize(19),
      borderRadius: 30,
      borderColor: colors.border,
      borderWidth: 1,
      alignItems: "center",
      flexDirection: "row",
      gap: 4,
    },
    generateButtonText: {
      color: colors.text,
      fontFamily: getFontFamily(800),
      fontSize: normalize(17),
    },
    assetItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: normalize(14),
      borderBottomWidth: 0.5,
      borderColor: colors.border,
    },
    assetLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    assetIcon: {
      width: 30,
      height: 30,
      borderRadius: 20,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    assetInfo: { flex: 1 },
    assetName: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    assetSymbol: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.text,
    },
    assetRight: { alignItems: "flex-end" },
    assetPrice: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    emptyState: { alignItems: "center", paddingVertical: 40 },
    emptyStateText: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("800"),
      textAlign: "center",
      color: colors.text,
    },
    emptyStateSubtext: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
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
      color: colors.text,
      fontSize: normalize(16),
      fontFamily: getFontFamily("700"),
    },
    txItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    txText: {
      color: colors.text,
      fontSize: normalize(16),
      fontFamily: getFontFamily("400"),
    },
    txAmount: {
      fontSize: normalize(16),
      fontFamily: getFontFamily("700"),
      color: COLORS.primary,
    },
  });
