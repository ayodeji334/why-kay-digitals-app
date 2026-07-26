// import React, { useState } from "react";
// import {
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { getFontFamily, normalize } from "../constants/settings";
// import { COLORS } from "../constants/colors";
// import CryptoWalletSection from "../components/wallet/CryptoWalletSection";
// import FiatWalletSection from "../components/wallet/FiatWalletSection";
// import TabSwitcher, { TabOption } from "../components/TabSwitcher";

// const tabOptions: TabOption[] = [
//   { value: "crypto", label: "Crypto" },
//   { value: "fiat", label: "Fiat" },
// ];

// export default function WalletScreen() {
//   const [activeTab, setActiveTab] = useState<"crypto" | "fiat">("crypto");

//   const handleTabChange = (tab: string) => {
//     const nextTab = tab as any;
//     setActiveTab(nextTab);
//   };

//   return (
//     <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
//       <StatusBar barStyle="dark-content" />
//       {/* <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[styles.tabButton, activeTab === "crypto" && styles.activeTab]}
//           onPress={() => setActiveTab("crypto")}
//         >
//           <AppText
//             style={[
//               styles.tabText,
//               activeTab === "crypto" && styles.activeTabText,
//             ]}
//           >
//             Crypto Wallet
//           </AppText>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tabButton, activeTab === "fiat" && styles.activeTab]}
//           onPress={() => setActiveTab("fiat")}
//         >
//           <AppText
//             style={[
//               styles.tabText,
//               activeTab === "fiat" && styles.activeTabText,
//             ]}
//           >
//             Fiat Wallet
//           </AppText>
//         </TouchableOpacity>
//       </View> */}

//       <View style={styles.tabContainer}>
//         <TabSwitcher
//           tabs={tabOptions}
//           activeTab={activeTab}
//           onTabChange={handleTabChange}
//           containerStyle={{ backgroundColor: "#f3f3f3ff", marginVertical: 10 }}
//           activeTabStyle={{ backgroundColor: COLORS.primary }}
//           activeTabTextStyle={{ color: "#fff" }}
//         />
//       </View>

//       <View style={styles.scrollContainer}>
//         {activeTab === "crypto" ? (
//           <CryptoWalletSection />
//         ) : (
//           <FiatWalletSection />
//         )}
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "white" },
//   scrollContainer: { paddingHorizontal: 20, paddingTop: 20 },
//   actionsContainer: {
//     flexWrap: "wrap",
//     flexDirection: "row",
//     gap: 10,
//     margin: "auto",
//   },
//   tabContainer: {
//     // flexDirection: "row",
//     // justifyContent: "center",
//     // backgroundColor: "#F5F5F5",
//     // borderRadius: 1200,
//     // marginHorizontal: 20,
//     paddingHorizontal: 20,
//   },
//   tabButton: {
//     flex: 1,
//     paddingVertical: 9,
//     alignItems: "center",
//     borderRadius: 1200,
//   },
//   tabText: {
//     fontSize: normalize(16),
//     fontFamily: getFontFamily("800"),
//     color: "#000",
//   },
//   activeTab: {
//     backgroundColor: COLORS.primary,
//   },
//   activeTabText: {
//     color: "#fff",
//   },
//   actionCard: {
//     backgroundColor: "#F8F9FA",
//     padding: 7,
//     borderRadius: 10,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#F3F4F6",
//     minWidth: 62,
//   },
//   actionIcon: { marginBottom: 10 },
//   actionTitle: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("700"),
//     color: "#000",
//   },
//   assetsSection: { paddingVertical: 30 },
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
//   assetLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
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
//   assetInfo: { flex: 1 },
//   assetName: {
//     fontSize: normalize(16),
//     fontFamily: getFontFamily("400"),
//     color: "#000",
//   },
//   assetSymbol: { fontSize: normalize(11), color: "#6B7280" },
//   assetRight: { alignItems: "flex-end" },
//   assetPrice: {
//     fontSize: normalize(13),
//     fontFamily: getFontFamily("400"),
//     color: "#000",
//   },
//   emptyState: { alignItems: "center", paddingVertical: 40 },
//   emptyStateText: { fontSize: normalize(22), fontFamily: getFontFamily("800") },
//   emptyStateSubtext: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("400"),
//     color: "#6B7280",
//   },
// });
import React, { useState } from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import CryptoWalletSection from "../components/wallet/CryptoWalletSection";
import FiatWalletSection from "../components/wallet/FiatWalletSection";
import TabSwitcher, { TabOption } from "../components/TabSwitcher";
import { useColors, useResolvedTheme } from "../hooks/useTheme";
import { normalize } from "../constants/settings";

type WalletTab = "crypto" | "fiat";

const tabOptions: TabOption[] = [
  { value: "crypto", label: "Crypto" },
  { value: "fiat", label: "Fiat" },
];

export default function WalletScreen() {
  const [activeTab, setActiveTab] = useState<WalletTab>("crypto");
  const colors = useColors();
  const resolvedTheme = useResolvedTheme();
  const styles = makeStyles(colors);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as WalletTab);
  };

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View style={styles.tabContainer}>
        <TabSwitcher
          tabs={tabOptions}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          containerStyle={styles.tabSwitcher}
          activeTabStyle={styles.activeTab}
          activeTabTextStyle={styles.activeTabText}
        />
      </View>

      <View style={styles.scrollContainer}>
        {activeTab === "crypto" ? (
          <CryptoWalletSection />
        ) : (
          <FiatWalletSection />
        )}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    tabContainer: {
      paddingHorizontal: normalize(20),
    },
    tabSwitcher: {
      backgroundColor: colors.inputBackground,
      marginVertical: 10,
    },
    activeTab: {
      backgroundColor: COLORS.primary,
      color: colors.text,
    },
    activeTabText: {
      color: "white",
    },
    scrollContainer: {
      paddingHorizontal: normalize(20),
      paddingTop: 20,
    },
  });
