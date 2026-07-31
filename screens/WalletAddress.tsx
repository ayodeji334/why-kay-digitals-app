// import React, { useState, useMemo } from "react";
// import {
//   View,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Share as RNShare,
// } from "react-native";
// import { getFontFamily, normalize } from "../constants/settings";
// import { COLORS } from "../constants/colors";
// import { Copy } from "iconsax-react-nativejs";
// import QRCode from "react-native-qrcode-svg";
// import { SelectInput } from "../components/SelectInputField";
// import { formatAmount } from "../libs/formatNumber";
// import Clipboard from "@react-native-clipboard/clipboard";
// import { showError, showSuccess } from "../utlis/toast";
// import { useNavigation } from "@react-navigation/native";
// import CustomIcon from "../components/CustomIcon";
// import { WalletIcon } from "../assets";
// import useAxios from "../hooks/useAxios";
// import { AxiosError } from "axios";
// import { AppText } from "../components/AppText";

// interface Wallet {
//   id: string;
//   name: string;
//   symbol: string;
//   logo: string;
//   balance: string;
//   price: string;
//   value: string;
//   buy_rate: string;
//   sell_rate: string;
//   chains: any;
//   addresses: any[];
//   asset_id: string;
// }

// interface WalletDetailsProps {
//   wallet: Wallet;
//   onNetworkChange?: (network: string) => Promise<void>;
//   refetchWallets?: () => void;
// }

// const WalletDetails: React.FC<WalletDetailsProps> = ({
//   wallet,
//   onNetworkChange,
//   refetchWallets,
// }) => {
//   const [isGenerating, setIsGenerating] = useState(false);
//   const { apiGet } = useAxios();
//   const navigation: any = useNavigation();
//   const [selectedNetwork, setSelectedNetwork] = useState<string>(
//     wallet?.chains?.[0]?.chain ?? "",
//   );

//   const handleGenerateWallet = async () => {
//     setIsGenerating(true);
//     try {
//       await apiGet(
//         `wallets/user/${wallet?.asset_id}/generate-wallet-address?network=${selectedNetwork}`,
//       );

//       refetchWallets?.();
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const walletDetail = useMemo(() => {
//     if (!selectedNetwork) return null;

//     const networkAddresses = wallet.addresses.filter(
//       addr => addr.chain === selectedNetwork,
//     );

//     if (!networkAddresses.length) return null;

//     return (
//       networkAddresses.find(addr => addr.is_default) || networkAddresses[0]
//     );
//   }, [wallet.addresses, selectedNetwork]);

//   const formattedNetworkName = useMemo(() => {
//     return selectedNetwork ? selectedNetwork.toUpperCase() : "Not Provided";
//   }, [selectedNetwork]);

//   const handleNetworkChange = async (network: string) => {
//     if (network === selectedNetwork) return;

//     setSelectedNetwork(network);

//     if (onNetworkChange) {
//       try {
//         await onNetworkChange(network);
//       } catch (err) {
//         if (err instanceof AxiosError) {
//           showError(
//             err.response?.data?.message || "Something went wrong. Try again.",
//           );
//         }
//       }
//     }
//   };

//   const handleNavigation = () => {
//     navigation.navigate("Dashboard", { screen: "Rates" });
//   };

//   const copyToClipboard = (
//     text: string,
//     message: string = "Address copied",
//   ) => {
//     try {
//       Clipboard.setString(text);
//       showSuccess(message);
//     } catch {
//       showError("Failed to copy");
//     }
//   };

//   const handleShare = async () => {
//     if (!walletDetail?.address) return;

//     try {
//       await RNShare.share({
//         message: `Crypto Deposit Address
//               Address:
//               ${walletDetail?.address || ""}

//               Important:
//               • Send only the supported cryptocurrency to this address
//               • Sending the wrong asset or network may result in permanent loss
//               • This address is unique to your wallet

//               If you have any questions, please contact support.`,
//       });
//     } catch {}
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         style={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 20 }}
//       >
//         <View style={{ paddingTop: 10 }}>
//           {walletDetail?.address ? (
//             <View style={styles.qrContainer}>
//               <QRCode value={walletDetail.address} size={180} />
//             </View>
//           ) : (
//             <View style={styles.header}>
//               <View style={styles.walletCircle}>
//                 <CustomIcon
//                   source={WalletIcon}
//                   size={20}
//                   color={COLORS.primary}
//                 />
//               </View>
//               <AppText style={styles.title}>No Wallet Address</AppText>
//             </View>
//           )}

//           {/* Notes */}
//           <View style={styles.notesSection}>
//             {walletDetail?.address ? (
//               <AppText style={styles.notesText}>
//                 Use a crypto wallet to scan the QR code or copy the address
//                 above. Always confirm that the address matches the one shown
//                 here before sending funds. Sending to an incorrect address may
//                 result in permanent loss of funds. Also ensure you are sending
//                 through the correct network
//                 <AppText style={{ fontFamily: getFontFamily("900") }}>
//                   {" "}
//                   ({formattedNetworkName})
//                 </AppText>
//                 .
//               </AppText>
//             ) : (
//               <AppText style={styles.notesText}>
//                 A receiving address has not been generated yet for{" "}
//                 <AppText style={{ fontFamily: getFontFamily("900") }}>
//                   {wallet?.name} ({selectedNetwork})
//                 </AppText>
//                 . Generate a wallet address to start receiving{" "}
//                 <AppText style={{ fontFamily: getFontFamily("900") }}>
//                   {wallet?.name}
//                 </AppText>{" "}
//                 via the{" "}
//                 <AppText style={{ fontFamily: getFontFamily("900") }}>
//                   {selectedNetwork}
//                 </AppText>{" "}
//                 network.
//               </AppText>
//             )}
//           </View>

//           {/* Network Selection */}
//           <View style={{ marginVertical: 10 }}>
//             <AppText style={styles.modalLabel}>Asset Networks</AppText>
//             <SelectInput
//               options={(Array.isArray(wallet?.chains) ? wallet.chains : [])
//                 .filter((chain: any) => chain.deposit_enabled)
//                 .map((chain: any) => ({
//                   label: `${chain?.chain} (${chain.chain_type?.toUpperCase()})`,
//                   value: chain?.chain,
//                 }))}
//               placeholder="Select a network."
//               title="Select a network"
//               value={selectedNetwork}
//               showSearchBox={false}
//               onSelect={option => handleNetworkChange(option.value)}
//             />
//           </View>

//           {/* Receiving Address */}
//           {walletDetail?.address && (
//             <View style={styles.sectionBox}>
//               <AppText style={styles.label}>Receiving Address</AppText>
//               <View style={styles.addressRow}>
//                 <AppText numberOfLines={1} style={styles.addressText}>
//                   {walletDetail?.address}
//                 </AppText>
//                 <TouchableOpacity
//                   style={styles.copyButton}
//                   onPress={() => copyToClipboard(walletDetail.address)}
//                 >
//                   <Copy size={15} color={COLORS.primary} />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}

//           {walletDetail?.tag && (
//             <View style={styles.sectionBox}>
//               <AppText style={styles.label}>Memo/Tag</AppText>
//               <View style={styles.addressRow}>
//                 <AppText numberOfLines={1} style={styles.addressText}>
//                   {walletDetail?.tag}
//                 </AppText>
//                 <TouchableOpacity
//                   style={styles.copyButton}
//                   onPress={() =>
//                     copyToClipboard(walletDetail.tag, "Tage/Memo Code copied")
//                   }
//                 >
//                   <Copy size={15} color={COLORS.primary} />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}

//           {/* Wallet Info */}
//           <View style={styles.infoSection}>
//             <View style={styles.infoRow}>
//               <AppText style={styles.infoLabel}>Network</AppText>
//               <AppText style={styles.infoValue}>{formattedNetworkName}</AppText>
//             </View>
//             <View style={styles.infoRow}>
//               <AppText style={styles.infoLabel}>Wallet Balance</AppText>
//               <AppText style={styles.infoValue}>{wallet.balance}</AppText>
//             </View>
//             <View style={styles.infoRow}>
//               <AppText style={styles.infoLabel}>Market Value</AppText>
//               <AppText style={styles.infoValue}>
//                 {formatAmount(parseFloat(wallet.price) || 0, {
//                   currency: "USD",
//                 })}
//               </AppText>
//             </View>
//           </View>
//         </View>

//         {walletDetail?.address && (
//           <View style={styles.actionsContainer}>
//             <TouchableOpacity
//               activeOpacity={0.9}
//               style={styles.shareButton}
//               onPress={handleShare}
//             >
//               <AppText style={styles.actionButtonText}>Share Address</AppText>
//             </TouchableOpacity>
//             <TouchableOpacity
//               activeOpacity={0.9}
//               style={styles.viewRatesButton}
//               onPress={handleNavigation}
//             >
//               <AppText
//                 style={[styles.actionButtonText, { color: COLORS.primary }]}
//               >
//                 View Rates
//               </AppText>
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>

//       {!walletDetail?.address && (
//         <View style={styles.bottomActions}>
//           <TouchableOpacity
//             disabled={isGenerating}
//             style={[styles.generateButton, isGenerating && { opacity: 0.6 }]}
//             activeOpacity={0.9}
//             onPress={handleGenerateWallet}
//           >
//             <AppText style={styles.generateButtonText}>
//               {isGenerating
//                 ? "Generating..."
//                 : `Generate ${selectedNetwork.toUpperCase()} Wallet Address`}
//             </AppText>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };

// export default WalletDetails;

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     paddingBottom: 20,
//   },
//   header: { alignItems: "center", marginBottom: 0 },
//   logo: { width: 40, height: 40, marginRight: 10 },
//   title: { fontFamily: getFontFamily(800), fontSize: normalize(19), color: "black" },
//   section: {
//     marginVertical: 15,
//   },
//   label: {
//     fontSize: normalize(16),
//     fontFamily: getFontFamily(700),
//     color: "black",
//     marginBottom: 8,
//   },
//   note: {
//     marginTop: 10,
//     textAlign: "center",
//     fontSize: normalize(13),
//     fontFamily: getFontFamily(400),
//     color: "#363737",
//     lineHeight: 18,
//   },
//   generateButton: {
//     width: "100%",
//     paddingVertical: 14,
//     borderRadius: 30,
//     backgroundColor: COLORS.primary,
//     alignItems: "center",
//   },
//   generateButtonText: {
//     color: "white",
//     fontFamily: getFontFamily(800),
//     fontSize: normalize(18),
//   },
//   qrContainer: {
//     alignSelf: "center",
//     marginBottom: 10,
//     borderColor: COLORS.primary,
//     borderWidth: 1,
//     borderRadius: 12,
//     padding: 10,
//   },
//   walletCircle: {
//     width: 50,
//     height: 50,
//     borderRadius: 35,
//     backgroundColor: "#F3F4F6",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   networkSection: { marginBottom: 20 },
//   sectionLabel: {
//     fontFamily: getFontFamily(700),
//     fontSize: normalize(16),
//     marginBottom: 10,
//     color: "black",
//   },
//   networkButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     marginRight: 10,
//     backgroundColor: "#F3F4F6",
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   networkButtonActive: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },
//   networkButtonText: {
//     fontFamily: getFontFamily(500),
//     fontSize: normalize(18),
//     color: "#374151",
//   },
//   networkButtonTextActive: { color: "#FFFFFF" },
//   sectionBox: {
//     backgroundColor: "white",
//     padding: 14,
//     borderRadius: 10,
//     borderColor: "#cacacaff",
//     borderWidth: 1,
//     marginBottom: 15,
//   },
//   modalLabel: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("900"),
//     color: "black",
//     marginBottom: 6,
//   },
//   notesSection: {
//     width: "100%",
//     padding: 14,
//     borderRadius: 10,
//     marginBottom: 6,
//   },
//   notesText: {
//     fontFamily: getFontFamily(400),
//     fontSize: normalize(18),
//     lineHeight: 18,
//     textAlign: "center",
//   },
//   subtitle: {
//     textAlign: "center",
//     fontSize: normalize(18),
//     fontFamily: getFontFamily(400),
//     color: "#4B5563",
//     lineHeight: 20,
//     maxWidth: 260,
//   },
//   addressRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   addressText: {
//     fontFamily: getFontFamily(400),
//     fontSize: normalize(20),
//     maxWidth: "80%",
//     color: "black",
//   },
//   copyButton: {
//     padding: 7,
//     backgroundColor: "rgba(0,200,83,0.2)",
//     borderRadius: 8,
//   },
//   infoSection: {
//     borderColor: "#cfcfcfff",
//     paddingHorizontal: 14,
//     borderRadius: 10,
//     borderWidth: 1,
//   },
//   infoRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 13,
//   },
//   infoLabel: { fontFamily: getFontFamily(800), fontSize: normalize(18), color: "black" },
//   infoValue: { fontFamily: getFontFamily(800), fontSize: normalize(18), color: "black" },
//   actionsContainer: { marginTop: 30 },
//   shareButton: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     borderRadius: 30,
//     marginVertical: 12,
//   },
//   viewRatesButton: {
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//     paddingVertical: 14,
//     borderRadius: 30,
//     alignItems: "center",
//   },
//   actionButtonText: {
//     fontFamily: getFontFamily(800),
//     fontSize: normalize(18),
//     marginLeft: 6,
//     color: "white",
//   },
//   scrollContent: {
//     flexGrow: 1,
//     paddingHorizontal: 20,
//   },
//   bottomActions: {
//     paddingHorizontal: 20,
//   },
// });
import React, { useState, useMemo, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share as RNShare,
} from "react-native";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { Copy } from "iconsax-react-nativejs";
import QRCode from "react-native-qrcode-svg";
import { SelectInput } from "../components/SelectInputField";
import { formatAmount } from "../libs/formatNumber";
import Clipboard from "@react-native-clipboard/clipboard";
import { showError, showSuccess } from "../utlis/toast";
import { useNavigation } from "@react-navigation/native";
import CustomIcon from "../components/CustomIcon";
import { WalletIcon } from "../assets";
import useAxios from "../hooks/useAxios";
import { AxiosError } from "axios";
import { AppText } from "../components/AppText";
import Svg, { Defs, Pattern, Circle, Rect } from "react-native-svg";
import { captureRef } from "react-native-view-shot";
import ShareLib from "react-native-share";
import { useColors } from "../hooks/useTheme";
import { SafeAreaView } from "react-native-safe-area-context";

const APP_NAME = "WHYKAY";
const SHARE_CARD_WIDTH = 340;

export const CardPatternBackground = () => (
  <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
    <Defs>
      <Pattern
        id="cardDots"
        x="0"
        y="0"
        width="22"
        height="22"
        patternUnits="userSpaceOnUse"
      >
        <Circle cx="3" cy="3" r="1.5" fill={COLORS.primary} opacity={0.32} />
      </Pattern>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" fill="url(#cardDots)" />
  </Svg>
);

interface Wallet {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  balance: string;
  price: string;
  value: string;
  buy_rate: string;
  sell_rate: string;
  chains: any;
  addresses: any[];
  asset_id: string;
}

interface WalletDetailsProps {
  wallet: Wallet;
  onNetworkChange?: (network: string) => Promise<void>;
  refetchWallets?: () => void;
}

const WalletDetails: React.FC<WalletDetailsProps> = ({
  wallet,
  onNetworkChange,
  refetchWallets,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { apiGet } = useAxios();
  const navigation: any = useNavigation();
  const shareCardRef = useRef<View>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>(
    wallet?.chains?.[0]?.chain ?? "",
  );
  const colors = useColors();
  const styles = makeStyles(colors);

  const handleGenerateWallet = async () => {
    setIsGenerating(true);
    try {
      const res = await apiGet(
        `wallets/user/${wallet?.asset_id}/generate-wallet-address?network=${selectedNetwork}`,
      );

      console.log(res);

      refetchWallets?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message ??
          "Cannot generate wallet address at the moment";
        showError(errorMessage);
      } else {
        console.error("Unexpected login error:", err);
        showError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const walletDetail = useMemo(() => {
    if (!selectedNetwork) return null;

    const networkAddresses = wallet.addresses.filter(
      addr => addr.chain === selectedNetwork,
    );

    if (!networkAddresses.length) return null;

    return (
      networkAddresses.find(addr => addr.is_default) || networkAddresses[0]
    );
  }, [wallet.addresses, selectedNetwork]);

  const formattedNetworkName = useMemo(() => {
    return selectedNetwork ? selectedNetwork.toUpperCase() : "Not Provided";
  }, [selectedNetwork]);

  const handleNetworkChange = async (network: string) => {
    if (network === selectedNetwork) return;

    setSelectedNetwork(network);

    if (onNetworkChange) {
      try {
        await onNetworkChange(network);
      } catch (err) {
        if (err instanceof AxiosError) {
          showError(
            err.response?.data?.message || "Something went wrong. Try again.",
          );
        }
      }
    }
  };

  const handleNavigation = () => {
    navigation.navigate("Dashboard", { screen: "Rates" });
  };

  const copyToClipboard = (
    text: string,
    message: string = "Address copied",
  ) => {
    try {
      Clipboard.setString(text);
      showSuccess(message);
    } catch {
      showError("Failed to copy");
    }
  };

  const buildShareMessage = () => {
    const lines = [
      `${wallet?.name} (${wallet?.symbol}) deposit address — ${APP_NAME}`,
      "",
      `Network: ${formattedNetworkName}`,
      `Address: ${walletDetail?.address ?? ""}`,
      walletDetail?.tag ? `Memo/Tag (required): ${walletDetail.tag}` : null,
    ];
    return lines.filter(line => line !== null).join("\n");
  };

  const handleShare = async () => {
    if (!walletDetail?.address || isSharing) return;

    setIsSharing(true);
    try {
      // Snapshot the (off-screen) branded card as a PNG file.
      const uri = await captureRef(shareCardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      await ShareLib.open({
        url: uri,
        type: "image/png",
        message: buildShareMessage(),
        failOnCancel: false,
        title: `${wallet?.symbol} deposit address`,
      });
    } catch (err) {
      console.error("Image share failed, falling back to text:", err);
      // Fallback: plain-text share via the built-in sheet.
      try {
        await RNShare.share({ message: buildShareMessage() });
      } catch {
        // User dismissed the sheet — stay silent.
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["left"]}>
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={{ paddingTop: 10 }}>
          {walletDetail?.address ? (
            <View style={styles.qrContainer}>
              <QRCode value={walletDetail.address} size={180} quietZone={8} />
            </View>
          ) : (
            <View style={styles.header}>
              <View style={styles.walletCircle}>
                <CustomIcon
                  source={WalletIcon}
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <AppText style={styles.title}>No Wallet Address</AppText>
            </View>
          )}

          {/* Notes */}
          <View style={styles.notesSection}>
            {walletDetail?.address ? (
              <AppText style={styles.notesText}>
                Use a crypto wallet to scan the QR code or copy the address
                above. Always confirm that the address matches the one shown
                here before sending funds. Sending to an incorrect address may
                result in permanent loss of funds. Also ensure you are sending
                through the correct network
                <AppText style={{ fontFamily: getFontFamily("900") }}>
                  {" "}
                  ({formattedNetworkName})
                </AppText>
                .
              </AppText>
            ) : (
              <AppText style={styles.notesText}>
                A receiving address has not been generated yet for{" "}
                <AppText style={{ fontFamily: getFontFamily("900") }}>
                  {wallet?.name} ({selectedNetwork})
                </AppText>
                . Generate a wallet address to start receiving{" "}
                <AppText style={{ fontFamily: getFontFamily("900") }}>
                  {wallet?.name}
                </AppText>{" "}
                via the{" "}
                <AppText style={{ fontFamily: getFontFamily("900") }}>
                  {selectedNetwork}
                </AppText>{" "}
                network.
              </AppText>
            )}
          </View>

          {/* Network Selection */}
          <View style={{ marginVertical: 10 }}>
            <AppText style={styles.modalLabel}>Asset Networks</AppText>
            <SelectInput
              options={(Array.isArray(wallet?.chains) ? wallet.chains : [])
                .filter((chain: any) => chain.deposit_enabled)
                .map((chain: any) => ({
                  label: `${chain?.chain} (${chain.chain_type?.toUpperCase()})`,
                  value: chain?.chain,
                }))}
              placeholder="Select a network."
              title="Select a network"
              value={selectedNetwork}
              showSearchBox={false}
              onSelect={option => handleNetworkChange(option.value)}
            />
          </View>

          {/* Receiving Address */}
          {walletDetail?.address && (
            <View style={styles.sectionBox}>
              <AppText style={styles.label}>Wallet Address</AppText>
              <View style={styles.addressRow}>
                <AppText numberOfLines={1} style={styles.addressText}>
                  {walletDetail?.address}
                </AppText>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(walletDetail.address)}
                >
                  <Copy size={15} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {walletDetail?.tag && (
            <View style={styles.sectionBox}>
              <AppText style={styles.label}>Memo/Tag</AppText>
              <View style={styles.addressRow}>
                <AppText numberOfLines={1} style={styles.addressText}>
                  {walletDetail?.tag}
                </AppText>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() =>
                    copyToClipboard(walletDetail.tag, "Tag/Memo Code copied")
                  }
                >
                  <Copy size={15} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Wallet Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <AppText style={styles.infoLabel}>Network</AppText>
              <AppText style={styles.infoValue}>{formattedNetworkName}</AppText>
            </View>
            <View style={styles.infoRow}>
              <AppText style={styles.infoLabel}>Wallet Balance</AppText>
              <AppText style={styles.infoValue}>{wallet.balance}</AppText>
            </View>
            <View style={styles.infoRow}>
              <AppText style={styles.infoLabel}>Market Value</AppText>
              <AppText style={styles.infoValue}>
                {formatAmount(parseFloat(wallet.price) || 0, {
                  currency: "USD",
                })}
              </AppText>
            </View>
          </View>
        </View>

        {walletDetail?.address && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.shareButton, isSharing && { opacity: 0.6 }]}
              onPress={handleShare}
              disabled={isSharing}
            >
              <AppText style={[styles.actionButtonText, { color: "white" }]}>
                {isSharing ? "Preparing..." : "Share Address"}
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.viewRatesButton}
              onPress={handleNavigation}
            >
              <AppText style={[styles.actionButtonText]}>View Rates</AppText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {!walletDetail?.address && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            disabled={isGenerating}
            style={[styles.generateButton, isGenerating && { opacity: 0.6 }]}
            activeOpacity={0.9}
            onPress={handleGenerateWallet}
          >
            <AppText style={styles.generateButtonText}>
              {isGenerating
                ? "Generating..."
                : `Generate ${selectedNetwork.toUpperCase()} Wallet Address`}
            </AppText>
          </TouchableOpacity>
        </View>
      )}

      {/*
        ============ SHARED IMAGE (off-screen) ============
        Rendered outside the visible area and snapshotted by captureRef
        when the user taps Share. collapsable={false} is REQUIRED on
        Android or the view gets optimized away and capture fails.
      */}
      {walletDetail?.address && (
        <View style={styles.shareCardOffscreen} pointerEvents="none">
          <View ref={shareCardRef} collapsable={false} style={styles.shareCard}>
            <CardPatternBackground />
            <View style={styles.shareHeader}>
              <AppText style={styles.shareAppName}>{APP_NAME}</AppText>
            </View>
            <View style={styles.shareBody}>
              <AppText style={styles.shareAssetName}>
                {wallet?.name?.toUpperCase()} ({wallet?.symbol})
              </AppText>
              <View style={styles.shareNetworkPill}>
                <AppText style={styles.shareNetworkText}>
                  {formattedNetworkName.toUpperCase()} NETWORK
                </AppText>
              </View>

              {/* QR */}
              <View style={styles.shareQrBox}>
                <QRCode
                  value={walletDetail.address}
                  size={168}
                  quietZone={10}
                />
              </View>

              {/* Address */}
              <View style={styles.shareField}>
                <AppText style={styles.shareFieldLabel}>WALLET ADDRESS</AppText>
                <AppText style={styles.shareFieldValue}>
                  {walletDetail.address}
                </AppText>
              </View>

              {/* Memo — only when the asset has one */}
              {!!walletDetail?.tag && (
                <View style={[styles.shareField, styles.shareMemoField]}>
                  <AppText
                    style={[styles.shareFieldLabel, styles.shareMemoLabel]}
                  >
                    MEMO/TAG — REQUIRED
                  </AppText>
                  <AppText style={styles.shareFieldValue}>
                    {walletDetail.tag}
                  </AppText>
                </View>
              )}

              {/* Description */}
              <AppText style={styles.shareDescription}>
                Scan the QR code or copy the address above to send{" "}
                {wallet?.symbol} via the {formattedNetworkName} network only.
                Sending any other asset or using a different network may result
                in permanent loss of funds.
                {walletDetail?.tag
                  ? " Include the memo/tag with your transfer — deposits without it may not be credited."
                  : ""}
              </AppText>
            </View>
            {/* Footer */}
            {/* <View style={styles.shareFooter}>
              <AppText style={styles.shareFooterText}>
                Generated with {APP_NAME}
              </AppText>
            </View> */}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default WalletDetails;

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    container: {
      flex: 1,
      paddingBottom: 20,
      backgroundColor: colors.background,
    },
    header: { alignItems: "center", marginBottom: 0 },
    logo: { width: 40, height: 40, marginRight: 10 },
    title: {
      fontFamily: getFontFamily(800),
      fontSize: normalize(19),
      color: colors.text,
    },
    section: {
      marginVertical: 15,
    },
    label: {
      fontSize: normalize(18),
      fontFamily: getFontFamily(800),
      color: colors.text,
      marginBottom: 8,
    },
    note: {
      marginTop: 10,
      textAlign: "center",
      fontSize: normalize(13),
      fontFamily: getFontFamily(400),
      color: colors.text,
      lineHeight: 18,
    },
    generateButton: {
      width: "100%",
      paddingVertical: 14,
      borderRadius: 30,
      backgroundColor: COLORS.primary,
      alignItems: "center",
    },
    generateButtonText: {
      color: "white",
      fontFamily: getFontFamily(800),
      fontSize: normalize(18),
    },
    qrContainer: {
      alignSelf: "center",
      marginBottom: 10,
      borderColor: COLORS.primary,
      borderWidth: 1,
      borderRadius: 12,
      padding: 10,
    },
    walletCircle: {
      width: 50,
      height: 50,
      borderRadius: 35,
      backgroundColor: "#F3F4F6",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 15,
    },
    networkSection: { marginBottom: 20 },
    sectionLabel: {
      fontFamily: getFontFamily(700),
      fontSize: normalize(16),
      marginBottom: 10,
      color: colors.text,
    },
    networkButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 10,
      backgroundColor: "#F3F4F6",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },
    networkButtonActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    networkButtonText: {
      fontFamily: getFontFamily(500),
      fontSize: normalize(18),
      color: colors.text,
    },
    networkButtonTextActive: { color: colors.text },
    sectionBox: {
      backgroundColor: colors.inputBackground,
      padding: 14,
      borderRadius: 10,
      borderColor: colors.border,
      borderWidth: 1,
      marginBottom: 15,
    },
    modalLabel: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("900"),
      color: "black",
      marginBottom: 6,
    },
    notesSection: {
      width: "100%",
      padding: 14,
      borderRadius: 10,
      marginBottom: 6,
    },
    notesText: {
      fontFamily: getFontFamily(400),
      fontSize: normalize(18),
      lineHeight: 18,
      textAlign: "center",
      color: colors.text,
    },
    subtitle: {
      textAlign: "center",
      fontSize: normalize(18),
      fontFamily: getFontFamily(400),
      color: "#4B5563",
      lineHeight: 20,
      maxWidth: 260,
    },
    addressRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    addressText: {
      fontFamily: getFontFamily(700),
      fontSize: normalize(18),
      maxWidth: "80%",
      color: colors.text,
    },
    copyButton: {
      padding: 7,
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    infoSection: {
      borderColor: colors.border,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      backgroundColor: colors.inputBackground,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 13,
    },
    infoLabel: {
      fontFamily: getFontFamily(800),
      fontSize: normalize(18),
      color: colors.text,
    },
    infoValue: {
      fontFamily: getFontFamily(800),
      fontSize: normalize(18),
      color: colors.text,
    },
    actionsContainer: { marginTop: 30 },
    shareButton: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.primary,
      paddingVertical: 14,
      borderRadius: 30,
      marginVertical: 12,
    },
    viewRatesButton: {
      borderWidth: 1,
      borderColor: colors.text,
      paddingVertical: 14,
      borderRadius: 30,
      alignItems: "center",
    },
    actionButtonText: {
      fontFamily: getFontFamily(800),
      fontSize: normalize(18),
      marginLeft: 6,
      color: colors.text,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
    },
    bottomActions: {
      paddingHorizontal: 20,
    },

    shareCardOffscreen: {
      position: "absolute",
      top: -10000,
      left: 0,
    },
    shareCard: {
      width: SHARE_CARD_WIDTH,
      backgroundColor: "#FFFFFF",
      borderRadius: 0,
      overflow: "hidden",
    },
    shareHeader: {
      backgroundColor: COLORS.primary,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: "center",
    },
    shareAppName: {
      fontFamily: getFontFamily(900),
      fontSize: normalize(18),
      color: "#FFFFFF",
      letterSpacing: 0.5,
    },
    shareHeaderSub: {
      fontFamily: getFontFamily(500),
      fontSize: normalize(12),
      color: "rgba(255,255,255,0.85)",
      marginTop: 2,
    },
    shareBody: {
      paddingVertical: 18,
      paddingHorizontal: 20,
      alignItems: "center",
    },
    shareAssetName: {
      fontFamily: getFontFamily(800),
      fontSize: normalize(18),
      color: "#0A0A2A",
    },
    shareNetworkPill: {
      backgroundColor: "rgba(188, 191, 189, 0.12)",
      borderRadius: 20,
      paddingHorizontal: 19,
      paddingVertical: 3,
      marginTop: 6,
    },
    shareNetworkText: {
      fontFamily: getFontFamily(800),
      fontSize: normalize(14),
      color: "black",
      letterSpacing: 0.5,
    },
    shareQrBox: {
      marginTop: 14,
      marginBottom: 14,
      padding: 6,
      borderWidth: 1,
      borderColor: COLORS.primary,
      borderRadius: 12,
      backgroundColor: "#FFFFFF",
    },
    shareField: {
      width: "100%",
      backgroundColor: "#F7F7F7",
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginBottom: 10,
      textAlign: "center",
    },
    shareMemoField: {
      backgroundColor: "#FFF7E6",
      borderWidth: 1,
      borderColor: "#F0C36D",
    },
    shareFieldLabel: {
      fontFamily: getFontFamily(400),
      fontSize: normalize(14),
      color: "#181819",
      letterSpacing: 0.6,
      marginBottom: 4,
      textAlign: "center",
    },
    shareMemoLabel: {
      color: "#9A6B00",
    },
    shareFieldValue: {
      fontFamily: getFontFamily(800),
      fontSize: normalize(16),
      lineHeight: 18,
      color: "#0A0A2A",
      textAlign: "center",
    },
    shareDescription: {
      fontFamily: getFontFamily(400),
      fontSize: normalize(15),
      lineHeight: 14,
      color: "#000000",
      textAlign: "center",
      marginTop: 2,
    },
    shareFooter: {
      borderTopWidth: 1,
      borderTopColor: "#EFEFEF",
      paddingVertical: 10,
      alignItems: "center",
      backgroundColor: "#FAFAFA",
    },
    shareFooterText: {
      fontFamily: getFontFamily(700),
      fontSize: normalize(15),
      color: "#101318",
    },
  });
