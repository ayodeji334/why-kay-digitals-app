import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../../constants/colors";
import { normalize, getFontFamily } from "../../constants/settings";
import BalanceCard from "../Dashboard/BalanceCard";
import useAxios from "../../api/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import TransactionSectionList from "../TransactionList";
// import { EmptyTransactionState } from "../../screens/TransactionHistory";

const FiatWalletSection = ({ fiatWallet }: any) => {
  const { apiGet } = useAxios();

  const fetchTransactions = async ({ pageParam = 1 }) => {
    const params: any = {
      page: pageParam,
      medium: "fiat",
    };

    const { data }: any = await apiGet(
      "/transactions/user/transactions?medium=fiat",
      {
        params,
      },
    );

    return { data: data?.data.transactions, meta: data?.data?.pagination };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    // isFetching,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["fiat-transactions", { medium: "fiat" }],
    queryFn: fetchTransactions,
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.meta?.current_page < lastPage.meta?.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
    refetchOnWindowFocus: true,
  });

  const transactions = useMemo(() => {
    return data?.pages.flatMap(page => page.data) ?? [];
  }, [data?.pages]);
  const handleRefresh = () => refetch();

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return (
    <View style={{ marginTop: 10 }}>
      {
        <TransactionSectionList
          transactions={transactions}
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          onLoadMore={handleLoadMore}
          isFetchingMore={isFetchingNextPage}
          ListHeaderComponent={
            <View>
              <BalanceCard
                balance={fiatWallet?.balance ?? 0}
                title="Total Balance"
                showTransactionsButton={false}
                showActionButtons={true}
              />
              <Text style={styles.sectionHeader}>Transaction History</Text>
            </View>
          }
        />
      }
    </View>
  );
};

export default FiatWalletSection;

const styles = StyleSheet.create({
  sectionHeader: {
    paddingVertical: 8,
    fontSize: normalize(20),
    fontFamily: getFontFamily("800"),
    color: "#353348",
  },
  txItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  txText: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("400"),
  },
  txAmount: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
    color: COLORS.primary,
  },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyStateText: { fontSize: normalize(22), fontFamily: getFontFamily("800") },
  groupTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    marginBottom: 8,
  },
});
