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
import { useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import CustomLoading from "../components/CustomLoading";
import useAxios from "../hooks/useAxios";
import WalletDetails from "./WalletAddress";
import NoWalletAddress from "../components/NoWalletAddress";

const CryptoWalletDepositScreen = () => {
  const route: any = useRoute();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedChain, setSelectedChain] = useState<any | null>(null);
  const { apiGet, post } = useAxios();
  const selectedAssetUuid = useMemo(
    () => route.params?.crypto?.uuid,
    [route.params?.crypto?.uuid],
  );
  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["walletAddress", selectedAssetUuid],
    queryFn: async () => {
      try {
        const response = await apiGet(
          `/wallets/user/${selectedAssetUuid}/check-address`,
        );

        if (response.data) {
          return response.data?.data;
        }
      } catch (error) {
        throw error;
      }
    },
    enabled: selectedAssetUuid !== undefined && selectedAssetUuid !== null,
  });

  const availableChains = useMemo(() => {
    return Array.isArray(data?.availableChains) ? data.availableChains : [];
  }, [data]);

  const walletAddress = useMemo(() => {
    if (!Array.isArray(data?.addresses) || data.addresses.length === 0)
      return null;

    return data.addresses[0];
  }, [data?.addresses]);

  const handleGenerateWallet = async () => {
    if (!selectedChain) return;

    setIsGenerating(true);

    try {
      await post(`wallets/user/${selectedAssetUuid}/generate-wallet`, {
        chainType: selectedChain.chain,
      });

      setSelectedChain(null);
      refetch();
    } catch (error) {
      showError("Failed to generate wallet address");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      await RNShare.share({
        message: `Crypto Deposit Address
        Address:
        ${walletAddress}

        ⚠️ Important:
        • Send only the supported cryptocurrency to this address
        • Sending the wrong asset or network may result in permanent loss
        • This address is unique to your wallet

        If you have any questions, please contact support.`,
      });
    } catch (e) {}
  };

  const copyToClipboard = async (text: string) => {
    try {
      Clipboard.setString(text);
    } catch (error) {
      showError("Failed to copy");
    }
  };

  // const renderNoWalletAddress = () => (
  //   <View style={styles.centerContainer}>
  //     <View style={styles.section}>
  //       <View style={styles.walletCircle}>
  //         <CustomIcon source={WalletIcon} size={30} color={COLORS.primary} />
  //       </View>

  //       <Text style={styles.noWalletTitle}>No Wallet Address</Text>

  //       <Text style={styles.noWalletText}>
  //         You need to generate a wallet address before you can receive assets.
  //         This will create a unique address for your wallet.
  //       </Text>
  //     </View>

  //     {availableChains.length > 0 && (
  //       <View style={{ marginBottom: 20 }}>
  //         <Text style={styles.label}>Select Network</Text>

  //         <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
  //           {availableChains.map((chain: any) => {
  //             const isSelected = selectedChain?.chain === chain.chain;

  //             return (
  //               <TouchableOpacity
  //                 key={chain.chain}
  //                 activeOpacity={0.8}
  //                 onPress={() => setSelectedChain(chain)}
  //                 style={[
  //                   {
  //                     paddingVertical: 8,
  //                     paddingHorizontal: 14,
  //                     borderRadius: 20,
  //                     borderWidth: 1,
  //                     borderColor: isSelected ? COLORS.primary : "#ccc",
  //                     backgroundColor: isSelected
  //                       ? "rgba(0,200,83,0.15)"
  //                       : "transparent",
  //                   },
  //                 ]}
  //               >
  //                 <Text
  //                   style={{
  //                     fontFamily: getFontFamily(700),
  //                     color: isSelected ? COLORS.primary : "#333",
  //                   }}
  //                 >
  //                   {chain.chainType} ({chain?.chain})
  //                 </Text>
  //               </TouchableOpacity>
  //             );
  //           })}
  //         </View>
  //       </View>
  //     )}

  //     <View style={styles.section}>
  //       <TouchableOpacity
  //         style={[styles.generateButton, isGenerating && { opacity: 0.5 }]}
  //         activeOpacity={0.89}
  //         disabled={isGenerating}
  //         onPress={handleGenerateWallet}
  //       >
  //         <Text style={styles.generateButtonText}>
  //           {isGenerating ? "Generating..." : "Generate Wallet Address"}
  //         </Text>
  //       </TouchableOpacity>

  //       <Text style={styles.noteText}>
  //         Your wallet address will be generated securely and can be used to
  //         receive cryptocurrency.
  //       </Text>
  //     </View>
  //   </View>
  // );

  // const renderWalletDetails = () => {
  //   const isPriceDown = data?.priceChange < 0;

  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         paddingHorizontal: 19,
  //         alignItems: "center",
  //         gap: 10,
  //       }}
  //     >
  //       <WalletQRCode address={walletAddress?.address} />

  //       <View style={styles.sectionBox}>
  //         <Text style={styles.label}>Receiving Address</Text>

  //         <View style={styles.addressRow}>
  //           <Text numberOfLines={1} style={styles?.addressText}>
  //             {walletAddress?.address}
  //           </Text>

  //           <TouchableOpacity
  //             style={styles.copyButton}
  //             onPress={() => copyToClipboard(walletAddress?.address)}
  //           >
  //             <Copy size={18} color={COLORS.primary} />
  //           </TouchableOpacity>
  //         </View>
  //       </View>

  //       <View style={styles.priceContainer}>
  //         <View style={styles.priceBox}>
  //           <Text style={styles.label}>Chain Type</Text>
  //           <Text style={styles.priceValue}>
  //             {walletAddress?.chain_type ?? "Not Provided"}
  //             {/* {formatAmount(data?.price ?? 0)} */}
  //           </Text>
  //         </View>

  //         <View style={styles.priceBox}>
  //           <Text style={styles.label}>Chain</Text>
  //           <View style={styles.priceRow}>
  //             <Text
  //               style={[
  //                 styles.priceChange,
  //                 { color: isPriceDown ? "#FF5252" : "#000000" },
  //               ]}
  //             >
  //               {walletAddress?.chain ?? "Not Provided"}
  //               {/* {formatNumber(data?.priceChange ?? 0)}% */}
  //             </Text>

  //             {/* {isPriceDown ? (
  //               <ArrowDown2 size={18} color={COLORS.error} />
  //             ) : (
  //               <ArrowUp2 size={18} color={COLORS.primary} />
  //             )} */}
  //           </View>
  //         </View>
  //       </View>

  //       <View style={styles.actionsContainer}>
  //         <TouchableOpacity
  //           activeOpacity={0.89}
  //           style={styles.shareButton}
  //           onPress={handleShare}
  //         >
  //           <Share size={20} color="white" />
  //           <Text style={styles.actionButtonText}>Share</Text>
  //         </TouchableOpacity>

  //         <TouchableOpacity
  //           activeOpacity={0.89}
  //           onPress={() =>
  //             navigation.navigate("Dashboard", { screen: "Rates" })
  //           }
  //           style={styles.viewRatesButton}
  //         >
  //           <Text style={[styles.actionButtonText, { color: "black" }]}>
  //             View Rates
  //           </Text>
  //         </TouchableOpacity>
  //       </View>
  //     </View>
  //   );
  // };

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.screen}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isFetching || isLoading}
            onRefresh={refetch}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {walletAddress ? (
          <WalletDetails
            walletAddress={walletAddress?.address}
            onCopyAddress={copyToClipboard}
            onShare={handleShare}
            onViewRates={() => {}}
          />
        ) : (
          <NoWalletAddress
            availableChains={availableChains}
            isGenerating={isGenerating}
            onGenerateWallet={handleGenerateWallet}
            onSelectChain={chain => setSelectedChain(chain)}
            selectedChain={selectedChain}
          />
        )}
      </ScrollView>

      <CustomLoading loading={isLoading || isGenerating || isFetching} />
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
