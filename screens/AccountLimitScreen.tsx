import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  UIManager,
  LayoutAnimation,
  Animated,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants/colors";
import InfoCard from "../components/InfoCard";
import { ArrowDown2, ArrowUp2, InfoCircle } from "iconsax-react-nativejs";
import { useAuthStore } from "../stores/authSlice";
import { AccountTier, useAccountTiers } from "../hooks/useAccountTiers";
import CustomLoading from "../components/CustomLoading";
import ErrorState from "../components/ErrorState";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const mapTierToDisplay = (
  tier: AccountTier,
  currentTierLevel: string,
) => ({
  id: tier.tier,
  name: tier.tier_name,
  description: tier.description,
  status: currentTierLevel === tier.tier_name,
  limits: [
    {
      category: "Fiat Withdrawals & Transfers",
      items: [
        {
          name: "Single Withdrawal Limit",
          value: tier.limits.fiat.single_withdrawal.formatted,
        },
        {
          name: "Daily Withdrawal Limit",
          value: tier.limits.fiat.daily_withdrawal.formatted,
        },
      ],
    },
    {
      category: "Fiat Deposit",
      items: [
        { name: "Deposit Limit", value: tier.limits.fiat.deposit.formatted },
      ],
    },
    {
      category: "Crypto",
      items: [
        {
          name: "Transfer Limit",
          value: tier.limits.crypto.transfer.formatted,
        },
        { name: "Buy Limit", value: tier.limits.crypto.buy.formatted },
        { name: "Sell", value: tier.limits.crypto.sell.formatted },
      ],
    },
    {
      category: "Bill Payment",
      items: [
        {
          name: "Utility Bills Limit",
          value: tier.limits.utility_bills.formatted,
        },
      ],
    },
  ],
});

const AccountLimitsScreen = () => {
  const user = useAuthStore(state => state.user);
  const navigation = useNavigation();
  const [expandedTiers, setExpandedTiers] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const colors = useColors();
  const styles = makeStyles(colors);

  const { data: rawTiers, isLoading, isError, refetch } = useAccountTiers();

  const accountTiers = useMemo(
    () =>
      (rawTiers ?? []).map(tier => {
        return mapTierToDisplay(tier, user.tier_level);
      }),
    [rawTiers, user.tier_level],
  );

  useEffect(() => {
    if (accountTiers.length > 0) {
      const current = accountTiers.find(t => t.status);
      if (current) setExpandedTiers([current.id]);
    }
  }, [accountTiers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const toggleTier = (tierId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTiers(prev =>
      prev.includes(tierId)
        ? prev.filter(id => id !== tierId)
        : [...prev, tierId],
    );
  };

  const isTierExpanded = (tierId: string) => expandedTiers.includes(tierId);

  const renderLimitItem = (item: any, index: number) => (
    <View key={index} style={styles.limitItem}>
      <AppText style={styles.limitName}>{item.name}</AppText>
      <AppText style={styles.limitValue}>{item.value}</AppText>
    </View>
  );

  const renderLimitGroup = (group: any, groupIndex: number) => (
    <View key={groupIndex} style={styles.limitGroup}>
      <AppText style={styles.limitCategory}>{group.category}</AppText>
      {group.items.map(renderLimitItem)}
    </View>
  );

  if (isLoading) {
    return <CustomLoading loading={isLoading} />;
  }

  if (isError) {
    return (
      <ErrorState
        error="Cannot load account tier data"
        handleOnPress={refetch}
      />
    );
  }

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.accordionContainer}>
          {accountTiers.map((tier, id) => (
            <View key={tier.id} style={styles.accordionItem}>
              <TouchableOpacity
                style={[
                  styles.accordionHeader,
                  isTierExpanded(tier.id) && styles.accordionHeaderExpanded,
                ]}
                onPress={() => toggleTier(tier.id)}
                activeOpacity={0.9}
              >
                <View style={styles.accordionHeaderContent}>
                  <AppText
                    style={[
                      styles.accordionTitle,
                      isTierExpanded(tier.id) && styles.accordionTitleExpanded,
                    ]}
                  >
                    Level {id + 1}
                  </AppText>

                  {/* Accordion Icon */}
                  <View style={styles.accordionIcon}>
                    {tier.status && (
                      <AppText style={styles.currentBadge}>Current</AppText>
                    )}
                    <AppText style={styles.accordionIconText}>
                      {isTierExpanded(tier.id) ? (
                        <ArrowDown2 size={12} color={colors.text} />
                      ) : (
                        <ArrowUp2 size={12} color={colors.text} />
                      )}
                    </AppText>
                  </View>
                </View>
              </TouchableOpacity>

              {isTierExpanded(tier.id) && (
                <Animated.View style={styles.accordionContent}>
                  <View style={styles.limitsContainer}>
                    {tier.limits.map(renderLimitGroup)}
                  </View>
                </Animated.View>
              )}
            </View>
          ))}
        </View>

        <InfoCard
          IconComponent={<InfoCircle size={20} color={COLORS.primary} />}
          title="Important Notice!"
          description={[
            "Limits may vary based on account verification status",
            "Contact support for limit upgrade requests",
            "Some limits reset at midnight daily",
          ]}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Verification" as never)}
          style={styles.upgradeButton}
        >
          <AppText style={styles.upgradeButtonText}>Upgrade Limit</AppText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      padding: 20,
    },
    accordionContainer: {
      borderRadius: 12,
      overflow: "hidden",
      // backgroundColor: "red",
      gap: 20,
    },
    accordionItem: {
      borderRadius: 8,
      overflow: "hidden",
      backgroundColor: colors.inputBackground,
    },
    accordionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    accordionIcon: {
      flexDirection: "row",
      borderRadius: 12,
      gap: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    accordionIconText: {
      fontSize: normalize(12),
      fontFamily: getFontFamily("700"),
      color: colors.text,
    },
    accordionContent: {
      borderRadius: 0,
    },
    accordionHeaderExpanded: {
      backgroundColor: colors.inputBackground,
    },
    accordionHeaderContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flex: 1,
    },
    accordionTitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginRight: 12,
    },
    accordionTitleExpanded: {
      color: colors.text,
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
    },
    tierSelection: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 4,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    tierButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginVertical: 2,
    },
    currentBadge: {
      fontSize: normalize(15),
      fontFamily: getFontFamily("900"),
      color: colors.text,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.infoCardBackgroundColor,
    },
    upgradeButton: {
      backgroundColor: COLORS.secondary,
      paddingVertical: 16,
      borderRadius: 120,
      alignItems: "center",
      marginBottom: 24,
    },
    upgradeButtonText: {
      color: colors.text,
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
    },
    limitsContainer: {
      backgroundColor: colors.inputBackground,
      borderRadius: 0,
      paddingTop: 20,
      paddingHorizontal: 20,
      elevation: 2,
    },
    limitGroup: {
      marginBottom: 24,
    },
    limitCategory: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      color: colors.textMuted,
      marginBottom: 16,
    },
    limitItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    limitName: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.text,
      flex: 1,
    },
    limitValue: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      color: colors.text,
    },
    infoSection: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    infoText: {
      fontSize: normalize(13),
      fontFamily: getFontFamily("700"),
      color: "#007AFF",
      marginBottom: 8,
    },
  });

export default AccountLimitsScreen;
