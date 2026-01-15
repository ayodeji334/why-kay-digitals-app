// import React, { useMemo, useState } from "react";
// import {
//   StyleSheet,
//   ScrollView,
//   Share as RNShare,
//   RefreshControl,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { getFontFamily, normalize } from "../constants/settings";
// import { COLORS } from "../constants/colors";
// import Clipboard from "@react-native-clipboard/clipboard";
// import { showError } from "../utlis/toast";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { useQuery } from "@tanstack/react-query";
// import CustomLoading from "../components/CustomLoading";
// import useAxios from "../hooks/useAxios";
// import WalletDetails from "./WalletAddress";
// import NoWalletAddress from "../components/NoWalletAddress";
// import { useWalletStore } from "../stores/walletSlice";

// const CryptoWalletDepositScreen = () => {
//   const route: any = useRoute();
//   const navigation: any = useNavigation();
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [selectedChain, setSelectedChain] = useState<any | null>(null);
//   const { apiGet, post } = useAxios();

//   const selectedAssetUuid = useMemo(
//     () => route.params?.crypto?.uuid,
//     [route.params?.crypto?.uuid],
//   );

//   // const availableChains = useMemo(() => {
//   //   return Array.isArray(data?.availableChains) ? data.availableChains : [];
//   // }, [data]);

//   // const wallet = useMemo(() => {
//   //   if (!Array.isArray(data?.addresses) || data.addresses.length === 0)
//   //     return null;

//   //   return data.addresses[0];
//   // }, [data?.addresses]);

//   // Get wallets from Zustand store
//   const wallets = useWalletStore(state => state.wallets);
//   console.log(wallets);

//   // Find the selected wallet from the wallets array
//   const selectedWallet = useMemo(() => {
//     if (!selectedAssetUuid) return null;
//     return wallets.find((wallet: any) => wallet.id === selectedAssetUuid);
//   }, [wallets, selectedAssetUuid]);

//   // Get addresses from the selected wallet
//   const walletAddresses = useMemo(() => {
//     return selectedWallet?.addresses || [];
//   }, [selectedWallet]);

//   // Get the first/default address
//   const wallet = useMemo(() => {
//     if (!Array.isArray(walletAddresses) || walletAddresses.length === 0) {
//       return null;
//     }

//     // Find default address or use first one
//     const defaultAddress = walletAddresses.find(addr => addr.is_default);
//     return defaultAddress || walletAddresses[0];
//   }, [walletAddresses]);

//   // Get available chains from wallet data
//   const availableChains = useMemo(() => {
//     return Array.isArray(selectedWallet?.chains) ? selectedWallet.chains : [];
//   }, [selectedWallet]);

//   console.log(wallet);

//   const { isFetching, isLoading, refetch } = useQuery({
//     queryKey: ["walletAddress", selectedAssetUuid],
//     queryFn: async () => {
//       try {
//         const response = await apiGet(
//           `/wallets/user/${selectedAssetUuid}/check-address`,
//         );

//         if (response.data) {
//           return response.data?.data;
//         }
//       } catch (error) {
//         throw error;
//       }
//     },
//     enabled: selectedAssetUuid !== undefined && selectedAssetUuid !== null,
//   });

//   const handleGenerateWallet = async () => {
//     if (!selectedChain) return;

//     setIsGenerating(true);

//     try {
//       await post(`wallets/user/${selectedAssetUuid}/generate-wallet`, {
//         chainType: selectedChain.chain,
//       });

//       setSelectedChain(null);
//       refetch();
//     } catch (error) {
//       showError("Failed to generate wallet address");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const handleShare = async () => {
//     try {
//       await RNShare.share({
//         message: `Crypto Deposit Address
//         Address:
//         ${wallet?.address}

//         Important:
//         • Send only the supported cryptocurrency to this address
//         • Sending the wrong asset or network may result in permanent loss
//         • This address is unique to your wallet

//         If you have any questions, please contact support.`,
//       });
//     } catch (e) {}
//   };

//   const copyToClipboard = async (text: string) => {
//     try {
//       Clipboard.setString(text);
//     } catch (error) {
//       showError("Failed to copy");
//     }
//   };

//   return (
//     <SafeAreaView edges={["bottom", "left", "right"]} style={styles.screen}>
//       <ScrollView
//         refreshControl={
//           <RefreshControl
//             refreshing={isFetching || isLoading}
//             onRefresh={refetch}
//             colors={[COLORS.primary]}
//             tintColor={COLORS.primary}
//           />
//         }
//         contentContainerStyle={{ paddingBottom: 120 }}
//       >
//         {wallet ? (
//           <WalletDetails
//             wallet={wallet}
//             onCopyAddress={copyToClipboard}
//             onShare={handleShare}
//             onViewRates={() =>
//               navigation.navigate("Dashboard", { screen: "Rates" })
//             }
//           />
//         ) : (
//           <NoWalletAddress
//             availableChains={availableChains}
//             isGenerating={isGenerating}
//             onGenerateWallet={handleGenerateWallet}
//             onSelectChain={chain => setSelectedChain(chain)}
//             selectedChain={selectedChain}
//           />
//         )}
//       </ScrollView>

//       <CustomLoading loading={isLoading} />
//     </SafeAreaView>
//   );
// };

// export default CryptoWalletDepositScreen;

import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  Share as RNShare,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import Clipboard from "@react-native-clipboard/clipboard";
import { showError } from "../utlis/toast";
import { useNavigation, useRoute } from "@react-navigation/native";
import CustomLoading from "../components/CustomLoading";
import useAxios from "../hooks/useAxios";
import WalletDetails from "./WalletAddress";
import NoWalletAddress from "../components/NoWalletAddress";
import { useWalletStore } from "../stores/walletSlice";

const CryptoWalletDepositScreen = () => {
  const route: any = useRoute();
  const navigation: any = useNavigation();
  const { post } = useAxios();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedChain, setSelectedChain] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const wallets = useWalletStore(state => state.wallets);
  const fetchWallets = useWalletStore(state => state.fetchWalletsAndAccounts);

  const selectedAssetUuid = useMemo(
    () => route.params?.crypto?.uuid,
    [route.params?.crypto?.uuid],
  );

  const refreshWallets = async () => {
    try {
      setRefreshing(true);
      await fetchWallets(); // Call the Zustand store action to refresh wallets
    } catch (error) {
      console.error("Failed to refresh wallets:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const selectedWallet = useMemo(() => {
    if (!selectedAssetUuid) return null;
    return wallets.find((wallet: any) => wallet.asset_id === selectedAssetUuid);
  }, [wallets, selectedAssetUuid]);

  const walletAddresses = useMemo(() => {
    return Array.isArray(selectedWallet?.addresses)
      ? selectedWallet.addresses
      : [];
  }, [selectedWallet]);

  const wallet = useMemo(() => {
    if (walletAddresses.length === 0) return null;
    return (
      walletAddresses.find((addr: any) => addr.is_default) || walletAddresses[0]
    );
  }, [walletAddresses]);

  const availableChains = useMemo(() => {
    return Array.isArray(selectedWallet?.chains) ? selectedWallet.chains : [];
  }, [selectedWallet]);

  /**
   * Generate wallet address
   */
  const handleGenerateWallet = async () => {
    if (!selectedChain || !selectedAssetUuid) return;

    setIsGenerating(true);

    try {
      await post(`wallets/user/${selectedAssetUuid}/generate-wallet`, {
        chainType: selectedChain.chain,
      });

      setSelectedChain(null);
      refreshWallets();
    } catch (error) {
      showError("Failed to generate wallet address");
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Share address
   */
  const handleShare = async () => {
    if (!wallet?.address) return;

    try {
      await RNShare.share({
        message: `Crypto Deposit Address
Address:
${wallet.address}

Important:
• Send only the supported cryptocurrency to this address
• Sending the wrong asset or network may result in permanent loss
• This address is unique to your wallet

If you have any questions, please contact support.`,
      });
    } catch {
      // silent
    }
  };

  /**
   * Copy address
   */
  const copyToClipboard = (text: string) => {
    try {
      Clipboard.setString(text);
    } catch {
      showError("Failed to copy");
    }
  };

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.screen}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshWallets}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {wallet ? (
          <WalletDetails
            wallet={wallet}
            onCopyAddress={copyToClipboard}
            onShare={handleShare}
            onViewRates={() =>
              navigation.navigate("Dashboard", { screen: "Rates" })
            }
          />
        ) : (
          <NoWalletAddress
            availableChains={availableChains}
            isGenerating={isGenerating}
            onGenerateWallet={handleGenerateWallet}
            onSelectChain={setSelectedChain}
            selectedChain={selectedChain}
          />
        )}
      </ScrollView>

      <CustomLoading loading={isGenerating} />
    </SafeAreaView>
  );
};

export default CryptoWalletDepositScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
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
  qrIconWrapper: {
    position: "absolute",
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#01013dff",
    borderWidth: 4,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  walletCircle: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: "#D9D9D91A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  noWalletTitle: {
    color: "black",
    fontFamily: getFontFamily(800),
    fontSize: 23,
    marginBottom: 10,
  },
  noWalletText: {
    textAlign: "center",
    fontFamily: getFontFamily(400),
    fontSize: normalize(19),
    marginBottom: 30,
    maxWidth: 230,
    lineHeight: 18,
  },
  generateButton: {
    width: "100%",
    minWidth: "100%",
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  generateButtonText: {
    color: "white",
    fontFamily: getFontFamily(700),
    fontSize: normalize(16),
  },
  noteText: {
    marginVertical: 10,
    color: "#3a3a3aff",
    fontFamily: getFontFamily(400),
    fontSize: 15,
    textAlign: "center",
    lineHeight: 15,
  },
  sectionBox: {
    width: "100%",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    borderColor: "#022b0aff",
    borderWidth: 1,
  },
  label: {
    color: "black",
    fontFamily: getFontFamily(900),
    fontSize: normalize(19),
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressText: {
    color: "black",
    fontFamily: getFontFamily(700),
    fontSize: 19,
    maxWidth: "80%",
  },
  copyButton: {
    padding: 10,
    backgroundColor: "rgba(0,200,83,0.2)",
    borderRadius: 8,
  },
  priceContainer: {
    width: "100%",
    flexDirection: "row",
    borderColor: "#022b0aff",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  priceBox: {
    width: "50%",
    padding: 14,
    borderRightWidth: 1,
    borderColor: "#c5c5c5ff",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceValue: {
    color: "black",
    fontFamily: getFontFamily(800),
    fontSize: 20,
  },
  priceChange: {
    fontFamily: getFontFamily(800),
    fontSize: 20,
    marginRight: 6,
  },
  // Buttons
  actionsContainer: {
    width: "100%",
    marginTop: 30,
  },
  shareButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  viewRatesButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#555",
    backgroundColor: "transparent",
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    marginLeft: 6,
    fontFamily: getFontFamily(700),
    fontSize: 16,
  },
  toggleButton: {
    position: "absolute",
    top: 100,
    right: 15,
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 8,
  },
});
