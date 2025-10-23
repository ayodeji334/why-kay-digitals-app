// import {
//   Alert,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { COLORS } from "../constants/colors";
// import { getFontFamily, normalize, width } from "../constants/settings";
// import BalanceCard from "../components/Dashboard/BalanceCard";
// import {
//   ArrowDown,
//   ArrowSwapVertical,
//   ArrowUp,
//   DollarCircle,
//   Tag,
//   Wallet,
// } from "iconsax-react-nativejs";
// import { useAuthStore } from "../stores/authSlice";
// import { useMemo } from "react";

// // Types
// interface Asset {
//   id: string;
//   name: string;
//   symbol: string;
//   price: string;
//   change: string;
//   changeType: "up" | "down";
//   icon: string;
// }

// interface ActionCardProps {
//   title: string;
//   icon: React.ComponentType<any>;
//   onPress?: () => void;
// }

// // Dummy Data
// // const ASSETS_DATA: Asset[] = [
// //   {
// //     id: "1",
// //     name: "Bitcoin",
// //     symbol: "BTC",
// //     price: "$116,537",
// //     change: "0.12%",
// //     changeType: "up",
// //     icon: "₿",
// //   },
// //   {
// //     id: "2",
// //     name: "Dodge",
// //     symbol: "DOGE",
// //     price: "$116,537",
// //     change: "7.3%",
// //     changeType: "up",
// //     icon: "Ð",
// //   },
// //   {
// //     id: "3",
// //     name: "Solana",
// //     symbol: "SOL",
// //     price: "$112,456",
// //     change: "1.252%",
// //     changeType: "down",
// //     icon: "S",
// //   },
// //   {
// //     id: "4",
// //     name: "Iron",
// //     symbol: "TRX",
// //     price: "$576,537",
// //     change: "3.72%",
// //     changeType: "up",
// //     icon: "T",
// //   },
// //   {
// //     id: "5",
// //     name: "litecoin",
// //     symbol: "LTC",
// //     price: "$46,537",
// //     change: "0.17%",
// //     changeType: "down",
// //     icon: "Ł",
// //   },
// // ];

// const ASSETS_DATA: any = [];

// const AssetItem: React.FC<{ asset: Asset }> = ({ asset }) => (
//   <TouchableOpacity style={styles.assetItem} activeOpacity={0.7}>
//     <View style={styles.assetLeft}>
//       <View style={styles.assetIcon}>
//         <Text style={styles.assetIconText}>{asset.icon}</Text>
//       </View>
//       <View style={styles.assetInfo}>
//         <Text style={styles.assetName}>{asset.name}</Text>
//         <Text style={styles.assetSymbol}>{asset.symbol}</Text>
//       </View>
//     </View>
//     <View style={styles.assetRight}>
//       <Text style={styles.assetPrice}>{asset.price}</Text>
//       <View
//         style={[
//           styles.changeContainer,
//           asset.changeType === "up" ? styles.changeUp : styles.changeDown,
//         ]}
//       >
//         {asset.changeType === "up" ? (
//           <ArrowUp size={16} color="#059669" />
//         ) : (
//           <ArrowDown size={16} color="#DC2626" />
//         )}
//         <Text
//           style={[
//             styles.changeText,
//             asset.changeType === "up"
//               ? styles.changeTextUp
//               : styles.changeTextDown,
//           ]}
//         >
//           {asset.change}
//         </Text>
//       </View>
//     </View>
//   </TouchableOpacity>
// );

// const ActionCard: React.FC<ActionCardProps> = ({
//   title,
//   icon: Icon,
//   onPress,
// }) => {
//   return (
//     <TouchableOpacity
//       style={styles.actionCard}
//       onPress={onPress}
//       activeOpacity={0.7}
//     >
//       <View style={styles.actionIcon}>
//         <Icon size={17} color="#E89E00" variant="Outline" />
//       </View>
//       <Text style={styles.actionTitle}>{title}</Text>
//     </TouchableOpacity>
//   );
// };

// export default function WalletScreen() {
//   const userData = useAuthStore(state => state.user);
//   const fiatWallet = useMemo(() => {
//     if (Array.isArray(userData?.wallets)) {
//       return userData?.wallets.find((wallet: any) => wallet?.type === "fiat");
//     }
//   }, [userData]);

//   const handleSell = () => {
//     Alert.alert(
//       "Coming soon",
//       "The feature is not available. Kindly check back later",
//     );
//   };

//   const handleSwap = () => {
//     Alert.alert(
//       "Coming soon",
//       "The feature is not available. Kindly check back later",
//     );
//   };

//   return (
//     <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
//       <StatusBar barStyle="dark-content" />
//       <ScrollView style={styles.scrollContainer}>
//         <BalanceCard
//           balance={fiatWallet?.balance ?? 0}
//           onDeposit={() => console.log("Deposit tapped")}
//           onWithdraw={() => console.log("Withdraw tapped")}
//           onSeeTransactions={() => console.log("Transactions tapped")}
//           showTransactionsButton={false}
//         />

//         <View style={styles.actionsContainer}>
//           <ActionCard title="Send" icon={ArrowUp} onPress={handleSwap} />
//           <ActionCard title="Receive" icon={ArrowDown} onPress={handleSwap} />
//           <ActionCard title="Buy" icon={Tag} onPress={handleSwap} />
//           <ActionCard title="Sell" icon={DollarCircle} onPress={handleSell} />
//           <ActionCard
//             title="Swap"
//             icon={ArrowSwapVertical}
//             onPress={handleSwap}
//           />
//         </View>

//         {/* Assets List */}
//         <View style={styles.assetsSection}>
//           <Text style={styles.sectionTitle}>Assets</Text>
//           <View style={styles.assetsList}>
//             {ASSETS_DATA.length > 0 ? (
//               ASSETS_DATA.map((asset: any) => (
//                 <AssetItem key={asset.id} asset={asset} />
//               ))
//             ) : (
//               <View style={styles.emptyState}>
//                 <Text style={styles.emptyStateText}>No assets found</Text>
//                 <Text style={styles.emptyStateSubtext}>
//                   Your assets will appear here once added
//                 </Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "white",
//   },
//   emptyState: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 40,
//     paddingHorizontal: 20,
//   },
//   emptyIcon: {
//     width: 64,
//     height: 64,
//     marginBottom: 16,
//     opacity: 0.5,
//   },
//   emptyStateTitle: {
//     fontSize: 16,
//     fontFamily: getFontFamily("800"),
//     color: "#6C757D",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   emptyStateText: {
//     fontSize: normalize(19),
//     textAlign: "center",
//     marginBottom: 4,
//     lineHeight: 20,
//     fontFamily: getFontFamily("800"),
//   },
//   emptyStateSubtext: {
//     fontSize: normalize(20),
//     textAlign: "center",
//     marginBottom: 16,
//     fontFamily: getFontFamily("400"),
//   },
//   scrollContainer: {
//     flex: 1,
//     padding: 20,
//   },
//   header: {
//     marginBottom: 23,
//   },
//   title: {
//     fontSize: width * 0.0644,
//     fontFamily: getFontFamily("700"),
//   },
//   highlight: {
//     color: COLORS.primary,
//   },
//   headerTitle: {
//     fontSize: normalize(13),
//     fontFamily: getFontFamily("400"),
//     color: "#000",
//     textAlign: "center",
//   },
//   content: {
//     flex: 1,
//   },
//   actionsContainer: {
//     flexWrap: "wrap",
//     flexDirection: "row",
//     gap: 10,
//   },
//   actionCard: {
//     backgroundColor: "#F8F9FA",
//     padding: 7,
//     borderRadius: 10,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#F3F4F6",
//     minWidth: 70,
//   },
//   actionIcon: {
//     marginBottom: 10,
//   },
//   actionTitle: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("700"),
//     color: "#000",
//   },
//   actionAmount: {
//     fontSize: normalize(19),
//     fontFamily: getFontFamily("700"),
//     color: "#E89E00",
//   },
//   assetsSection: {
//     paddingVertical: 30,
//   },
//   sectionTitle: {
//     fontSize: normalize(22),
//     fontFamily: getFontFamily("800"),
//     color: "#000",
//     marginBottom: 16,
//   },
//   assetsList: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   assetItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e1e1e1ff",
//   },
//   assetLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   assetIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#F3F4F6",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   assetIconText: {
//     fontSize: normalize(13),
//     fontFamily: getFontFamily("400"),
//     color: "#374151",
//   },
//   assetInfo: {
//     flex: 1,
//   },
//   assetName: {
//     fontSize: normalize(16),
//     fontFamily: getFontFamily("400"),
//     color: "#000",
//     marginBottom: 2,
//     textTransform: "capitalize",
//   },
//   assetSymbol: {
//     fontSize: normalize(11),
//     color: "#6B7280",
//     textTransform: "uppercase",
//   },
//   assetRight: {
//     alignItems: "flex-end",
//   },
//   assetPrice: {
//     fontSize: normalize(13),
//     fontFamily: getFontFamily("400"),
//     color: "#000",
//     marginBottom: 4,
//   },
//   changeContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },
//   changeUp: {
//     // Styles for positive change
//   },
//   changeDown: {
//     // Styles for negative change
//   },
//   changeText: {
//     fontSize: normalize(11),
//     fontFamily: getFontFamily("500"),
//   },
//   changeTextUp: {
//     color: "#059669",
//   },
//   changeTextDown: {
//     color: "#DC2626",
//   },
// });
import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import BalanceCard from "../components/Dashboard/BalanceCard";
import {
  ArrowDown,
  ArrowSwapVertical,
  ArrowUp,
  DollarCircle,
  Tag,
} from "iconsax-react-nativejs";
import { useAuthStore } from "../stores/authSlice";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";
import useAxios from "../api/axios";
import CustomLoading from "../components/CustomLoading";

export default function WalletScreen() {
  const { setUser, user } = useAuthStore();
  const { apiGet } = useAxios();
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserAccounts = async () => {
    const response = await apiGet("users/user/accounts");
    if (!response.data?.success) {
      setRefreshing(false);

      throw new Error(
        response.data?.message || "Failed to fetch user accounts",
      );
    }
    return response.data.data;
  };

  // Use React Query to fetch wallet info
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["userWallet"],
    queryFn: fetchUserAccounts,
  });

  // Refetch when screen regains focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Update global auth store when query succeeds
  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data, setUser]);

  const fiatWallet = useMemo(() => {
    if (Array.isArray(user?.wallets)) {
      return user.wallets.find((wallet: any) => wallet.type === "fiat");
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserAccounts();
  };

  const handleSell = () =>
    Alert.alert("Coming soon", "The feature is not available yet");

  const handleSwap = () =>
    Alert.alert("Coming soon", "The feature is not available yet");

  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#df8b0cff"]}
            tintColor="#e28b0aff"
          />
        }
      >
        <BalanceCard
          balance={fiatWallet?.balance ?? 0}
          onDeposit={() => console.log("Deposit tapped")}
          onWithdraw={() => console.log("Withdraw tapped")}
          onSeeTransactions={() => console.log("Transactions tapped")}
          showTransactionsButton={false}
        />

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <ActionCard title="Send" icon={ArrowUp} onPress={handleSwap} />
          <ActionCard title="Receive" icon={ArrowDown} onPress={handleSwap} />
          <ActionCard title="Buy" icon={Tag} onPress={handleSwap} />
          <ActionCard title="Sell" icon={DollarCircle} onPress={handleSell} />
          <ActionCard
            title="Swap"
            icon={ArrowSwapVertical}
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
      </ScrollView>

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
}

const ActionCard = ({ title, icon: Icon, onPress }: any) => (
  <TouchableOpacity
    style={styles.actionCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.actionIcon}>
      <Icon size={17} color="#E89E00" variant="Outline" />
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
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

// ✅ (Reuse your existing styles)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scrollContainer: { flex: 1, padding: 20 },
  actionsContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 10,
  },
  actionCard: {
    backgroundColor: "#F8F9FA",
    padding: 7,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    minWidth: 70,
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
});
