import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants/colors";
import InfoCard from "../components/InfoCard";
import { ArrowDown2, ArrowUp2, InfoCircle } from "iconsax-react-nativejs";
import { useAuthStore } from "../stores/authSlice";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AccountLimitsScreen = () => {
  const user = useAuthStore(state => state.user);
  const navigation = useNavigation();
  const [expandedTiers, setExpandedTiers] = useState([1]);
  const accountTiers = [
    {
      id: 11,
      name: "Tier 0 Account",
      status: user.tier_level === "TIER_0",
      limits: [
        {
          category: "Withdrawals & Transfers",
          items: [
            { name: "Single Transaction Limit", value: "₦0.00" },
            { name: "Daily Transfer Limit", value: "₦0.00" },
          ],
        },
        {
          category: "Bill Payment",
          items: [{ name: "Bill Payment Limit", value: "₦0.00" }],
        },
      ],
    },
    {
      id: 1,
      name: "Tier 1 Account",
      status: user.tier_level === "TIER_1",
      limits: [
        {
          category: "Withdrawals & Transfers",
          items: [
            { name: "Single Transaction Limit", value: "₦9,000.00" },
            { name: "Daily Transfer Limit", value: "₦100,000.00" },
          ],
        },
        {
          category: "Bill Payment",
          items: [{ name: "Bill Payment Limit", value: "To be defined" }],
        },
      ],
    },
    {
      id: 2,
      name: "Tier 2 Account",
      status: user.tier_level === "TIER_2",
      limits: [
        {
          category: "Withdrawals & Transfers",
          items: [
            {
              name: "Single Transaction Limit",
              value: "₦1,000,000.00 (Varies)",
            },
            { name: "Daily Transfer Limit", value: "Unlimited" },
          ],
        },
        {
          category: "Bill Payment",
          items: [{ name: "Bill Payment Limit", value: "To be defined" }],
        },
      ],
    },
    {
      id: 3,
      name: "Tier 3 Account",
      status: user.tier_level === "TIER_3",
      limits: [
        {
          category: "Withdrawals & Transfers",
          items: [
            { name: "Single Transaction Limit", value: "₦1,000,000.00" },
            { name: "Daily Transfer Limit", value: "₦10,000,000.00" },
          ],
        },
        {
          category: "Bill Payment",
          items: [{ name: "Bill Payment Limit", value: "₦1,000,000.00" }],
        },
      ],
    },
  ];

  const toggleTier = (tierId: number | string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setExpandedTiers((prev: any) => {
      if (prev.includes(tierId)) {
        return prev.filter((id: any) => id !== tierId);
      } else {
        return [...prev, tierId];
      }
    });
  };

  const isTierExpanded = (tierId: any) => expandedTiers.includes(tierId);

  const renderLimitItem = (item: any, index: number) => (
    <View key={index} style={styles.limitItem}>
      <Text style={styles.limitName}>{item.name}</Text>
      <Text style={styles.limitValue}>{item.value}</Text>
    </View>
  );

  const renderLimitGroup = (group: any, groupIndex: number) => (
    <View key={groupIndex} style={styles.limitGroup}>
      <Text style={styles.limitCategory}>{group.category}</Text>
      {group.items.map(renderLimitItem)}
    </View>
  );

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={"white"} />

      <ScrollView style={styles.content}>
        <View style={styles.accordionContainer}>
          {accountTiers.map(tier => (
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
                  <Text
                    style={[
                      styles.accordionTitle,
                      isTierExpanded(tier.id) && styles.accordionTitleExpanded,
                    ]}
                  >
                    {tier.name}
                  </Text>

                  {/* Accordion Icon */}
                  <View style={styles.accordionIcon}>
                    {tier.status && (
                      <Text style={styles.currentBadge}>Current</Text>
                    )}
                    <Text style={styles.accordionIconText}>
                      {isTierExpanded(tier.id) ? (
                        <ArrowDown2 size={12} />
                      ) : (
                        <ArrowUp2 size={12} />
                      )}
                    </Text>
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
          IconComponent={InfoCircle}
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
          <Text style={styles.upgradeButtonText}>Upgrade Limit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    paddingBottom: 20,
  },
  content: {
    flex: 1,
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
    backgroundColor: "#f3f3f3ff",
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
  },
  accordionContent: {
    borderRadius: 0,
  },
  accordionHeaderExpanded: {
    backgroundColor: "#e8e8e8ff",
  },
  accordionHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  accordionTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#333",
    marginRight: 12,
  },
  accordionTitleExpanded: {
    color: "#000000ff",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
  },
  tierSelection: {
    backgroundColor: "#fff",
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
    fontFamily: getFontFamily("700"),
    color: "black",
    backgroundColor: "#d1efdaff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upgradeButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 120,
    alignItems: "center",
    marginBottom: 24,
  },
  upgradeButtonText: {
    color: "black",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
  },
  limitsContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 0,
    paddingTop: 20,
    paddingHorizontal: 20,
    elevation: 2,
  },
  limitGroup: {
    marginBottom: 24,
  },
  limitCategory: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#333",
    marginBottom: 16,
  },
  limitItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  limitName: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: "#666",
    flex: 1,
  },
  limitValue: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#333",
  },
  infoSection: {
    backgroundColor: "#e6f2ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    fontSize: normalize(12),
    fontFamily: getFontFamily("700"),
    color: "#007AFF",
    marginBottom: 8,
  },
});

export default AccountLimitsScreen;
