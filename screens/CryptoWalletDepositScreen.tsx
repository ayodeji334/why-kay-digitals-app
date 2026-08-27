import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import WalletDetails from "./WalletAddress";
import { useWallets } from "../hooks/useWallet";
import { ArrowDown, ArrowUp, Send } from "iconsax-react-nativejs";
import CustomIcon from "../components/CustomIcon";
import { RefreshIcon } from "../assets";
import { AxiosError } from "axios";
import { showError } from "../utlis/toast";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";

const CryptoWalletDepositScreen = () => {
  const route: any = useRoute();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const colors = useColors();
  const styles = makeStyles(colors);

  const {
    data: { wallets },
    refetch,
  } = useWallets();

  const selectedAssetUuid = route.params?.crypto
    ? route.params?.crypto?.uuid
    : null;

  const refreshWallets = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } catch (err) {
      console.error("Failed to refresh wallets:", err);
      if (err instanceof AxiosError) {
        showError(
          err.response?.data?.message || "Something went wrong. Try again.",
        );
      }
    } finally {
      setRefreshing(false);
    }
  };

  const selectedWallet = useMemo(() => {
    if (!selectedAssetUuid) return null;
    return wallets.find((wallet: any) => wallet.asset_id === selectedAssetUuid);
  }, [wallets, selectedAssetUuid]);

  const asset = selectedWallet
    ? { uuid: selectedWallet.asset_id, symbol: selectedWallet.symbol }
    : null;

  const actions = [
    {
      label: "Buy",
      icon: <ArrowDown size={16} color={COLORS.primary} />,
      onPress: () =>
        asset &&
        navigation.navigate("BuyCrypto", {
          intent: {
            assetId: asset.uuid,
            symbol: asset.symbol,
            action: "buy",
            source: "wallets",
            amount: 0,
          },
        }),
    },
    {
      label: "Sell",
      icon: <ArrowUp size={16} color={COLORS.primary} />,
      onPress: () =>
        asset &&
        navigation.navigate("SellCrypto", {
          intent: {
            assetId: asset.uuid,
            symbol: asset.symbol,
            action: "sell",
            source: "wallets",
            amount: 0,
          },
        }),
    },
    {
      label: "Withdraw",
      icon: <Send size={16} color={COLORS.primary} />,
      onPress: () =>
        asset &&
        navigation.navigate("WithdrawalCrypto", {
          intent: {
            assetId: asset.uuid,
            symbol: asset.symbol,
            action: "withdraw",
            source: "wallets",
            amount: 0,
          },
        }),
    },
    {
      label: "Swap",
      icon: (
        <CustomIcon source={RefreshIcon} size={10} color={COLORS.primary} />
      ),
      onPress: () => asset && navigation.navigate("SwapCrypto"),
    },
  ];

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.screen}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshWallets}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <WalletDetails
          wallet={selectedWallet}
          refetchWallets={refreshWallets}
        />
      </ScrollView>

      <View style={styles.actionsRow}>
        {actions.map(({ label, onPress }) => (
          <TouchableOpacity
            key={label}
            style={styles.actionButton}
            onPress={onPress}
            disabled={!asset}
            activeOpacity={0.8}
            hitSlop={10}
          >
            <AppText style={styles.actionLabel}>{label}</AppText>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default CryptoWalletDepositScreen;

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    actionsRow: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 30,
      backgroundColor: colors.background,
      columnGap: 17,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionButton: {
      alignItems: "center",
      backgroundColor: COLORS.primary,
      gap: 6,
      opacity: 1,
      paddingHorizontal: normalize(14),
      paddingVertical: normalize(12),
      borderRadius: 340,
      flex: 1,
    },
    actionIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: COLORS.fadePrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    actionLabel: {
      fontSize: normalize(16),
      fontFamily: getFontFamily(800),
      color: COLORS.whiteBackground,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 18,
      borderBottomWidth: 1,
      borderColor: "#d6d6db",
    },
    centerContainer: {
      alignItems: "center",
      paddingVertical: 20,
      paddingHorizontal: 18,
      minHeight: "100%",
      justifyContent: "space-between",
      gap: 10,
    },
    section: {
      alignItems: "center",
      paddingTop: 20,
      paddingHorizontal: 18,
    },
    qrContainer: {
      width: 250,
      height: 250,
      marginBottom: 20,
      justifyContent: "center",
      alignItems: "center",
      borderColor: "#470505ff",
      borderWidth: 1,
      borderRadius: 12,
    },
    qrBox: {
      width: "100%",
      height: "100%",
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    qrText: {
      fontFamily: getFontFamily(700),
      fontSize: 16,
      color: "#0a0a2a",
    },
  });
