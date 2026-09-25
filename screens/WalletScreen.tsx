import React, { useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import CryptoWalletSection from "../components/wallet/CryptoWalletSection";
import FiatWalletSection from "../components/wallet/FiatWalletSection";
import TabSwitcher, { TabOption } from "../components/TabSwitcher";
import { useColors, useResolvedTheme } from "../hooks/useTheme";
import { normalizeSpacing } from "../constants/settings";

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
      paddingHorizontal: normalizeSpacing(20),
    },
    tabSwitcher: {
      backgroundColor: colors.inputBackground,
      marginVertical: normalizeSpacing(10),
    },
    activeTab: {
      backgroundColor: COLORS.primary,
      color: colors.text,
    },
    activeTabText: {
      color: "white",
    },
    scrollContainer: {
      paddingHorizontal: normalizeSpacing(20),
      paddingTop: normalizeSpacing(20),
    },
  });
