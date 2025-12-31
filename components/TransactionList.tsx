import React, { useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { formatAmount } from "../libs/formatNumber";
import { formatDate } from "../libs/formatDate";
import { COLORS } from "../constants/colors";
import { normalize, getFontFamily } from "../constants/settings";
import { EmptyTransactionState } from "../screens/TransactionHistory";

export const groupTransactionsByDate = (transactions: any[]) => {
  const grouped: Record<string, any[]> = {};

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
      return "Today";
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    )
      return "Yesterday";

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  transactions.forEach(tx => {
    const label = formatDateLabel(tx.created_at || tx.occurred_at);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(tx);
  });

  return Object.keys(grouped).map(label => ({
    title: label,
    data: grouped[label],
  }));
};

interface TransactionSectionListProps {
  transactions: any[];
  onRefresh: () => void;
  refreshing: boolean;
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
  ListHeaderComponent?: any;
  contentContainerStyle?: ViewStyle;
}

const TransactionItem = ({ item }: any) => {
  const navigation: any = useNavigation();
  const isCredit = item?.direction === "CREDIT";

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("TransactionDetail", { transaction: item })
      }
      activeOpacity={0.8}
      style={styles.transactionItem}
    >
      <View style={styles.transactionContent}>
        <View style={styles.transactionMain}>
          <Text style={styles.transactionTitle}>
            {item?.description || item?.reference}
          </Text>
          <Text style={styles.transactionAmount}>
            {isCredit
              ? `+ ${
                  item?.medium.toUpperCase() === "CRYPTO"
                    ? item?.amount.toString()
                    : formatAmount(item?.amount, false)
                }`
              : `- ${
                  item?.medium.toUpperCase() === "CRYPTO"
                    ? item?.amount.toString()
                    : formatAmount(item?.amount, false)
                }`}
          </Text>
        </View>
        <View style={styles.transactionMain}>
          <Text style={styles.transactionTime}>
            {item?.occurred_at ? formatDate(item.occurred_at) : ""}
          </Text>
          <Text
            style={{
              color:
                item?.status.toLowerCase() !== "failed" ? "#059669" : "#DC2626",
              fontSize: normalize(17),
              fontFamily: getFontFamily(700),
            }}
          >
            {item?.status?.toUpperCase() === "SUCCESSFUL"
              ? "Successful"
              : item?.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const TransactionSectionList: React.FC<TransactionSectionListProps> = ({
  transactions,
  onRefresh,
  refreshing,
  onLoadMore,
  isFetchingMore,
  ListHeaderComponent,
  contentContainerStyle,
}) => {
  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(transactions),
    [transactions],
  );

  const renderFooter = () =>
    isFetchingMore ? (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    ) : null;

  return (
    <SectionList
      sections={groupedTransactions}
      keyExtractor={item => item.uuid}
      renderItem={({ item }) =>
        groupedTransactions.length === 0 ? (
          <EmptyTransactionState />
        ) : (
          <TransactionItem item={item} />
        )
      }
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
      )}
      ListEmptyComponent={
        <View style={{ paddingVertical: 40 }}>
          <EmptyTransactionState />
        </View>
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.6}
      ListFooterComponent={renderFooter}
      ListHeaderComponent={ListHeaderComponent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }
      stickySectionHeadersEnabled
      contentContainerStyle={contentContainerStyle}
    />
  );
};

export default TransactionSectionList;

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 0,
    paddingVertical: 4,
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#868686",
    marginTop: 10,
    backgroundColor: "white",
  },
  sectionTitle: {
    fontSize: normalize(22),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginVertical: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dfdfdfff",
  },
  transactionContent: { flex: 1 },
  transactionMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  transactionTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
    maxWidth: "70%",
  },
  transactionAmount: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("800"),
  },
  transactionTime: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
    color: "#9CA3AF",
  },
});
