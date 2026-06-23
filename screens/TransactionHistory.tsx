import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Filter, DocumentDownload } from "iconsax-react-nativejs";
import TransactionSectionList from "../components/TransactionList";
import CustomLoading from "../components/CustomLoading";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import CustomIcon from "../components/CustomIcon";
import { NoResultIcon } from "../assets";
import { SelectInput } from "../components/SelectInputField";
import CustomModal from "../components/CustomModal";
import DatePicker from "../components/DatePicker";
import { showError, showSuccess } from "../utlis/toast";
import useAxios from "../hooks/useAxios";
import { AxiosError } from "axios";
import { useNavigation } from "@react-navigation/native";
import { AppText } from "../components/AppText";

export const EmptyTransactionState: React.FC = () => (
  <View style={styles.emptyState}>
    <CustomIcon source={NoResultIcon} size={normalize(70)} color="#000" />
    <AppText style={styles.emptyTitle}>No Transactions Yet!</AppText>
    <AppText style={styles.emptyDescription}>
      Any transactions you make will appear here. {"\n"}Let's trade!
    </AppText>
  </View>
);

type FilterType = {
  startDate: { display: string; iso: string };
  endDate: { display: string; iso: string };
  status: string;
  category: string;
};

const defaultFilter: FilterType = {
  startDate: { display: "", iso: "" },
  endDate: { display: "", iso: "" },
  status: "",
  category: "",
};

const TransactionHistoryScreen: React.FC = () => {
  const { apiGet } = useAxios();
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterType>(defaultFilter);
  const [filterQuery, setFilterQuery] = useState<FilterType>(defaultFilter);

  // Read filters from queryKey so the closure is always fresh
  const fetchTransactions = async ({
    pageParam = 1,
    queryKey,
  }: {
    pageParam: number;
    queryKey: any;
  }) => {
    const [, activeFilters] = queryKey as [string, FilterType]; // destructure from key

    const params = {
      page: pageParam,
      start_date: activeFilters.startDate.iso || undefined,
      end_date: activeFilters.endDate.iso || undefined,
      status: activeFilters.status || undefined,
      category: activeFilters.category || undefined,
    };

    const { data }: any = await apiGet("/transactions/user/transactions", {
      params,
    });

    return { data: data?.data.transactions, meta: data?.data?.pagination };
  };

  // const fetchTransactions = async ({ pageParam = 1 }) => {
  //   const params: any = {
  //     page: pageParam,
  //     start_date: filters.startDate.iso,
  //     end_date: filters.endDate.iso,
  //     status: filters.status,
  //     category: filters.category,
  //   };

  //   const { data }: any = await apiGet("/transactions/user/transactions", {
  //     params,
  //   });

  //   return { data: data?.data.transactions, meta: data?.data?.pagination };
  // };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["transactions", filters], // pass the object, not stringified
    queryFn: fetchTransactions,
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.meta?.current_page < lastPage.meta?.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });

  // const {
  //   data,
  //   fetchNextPage,
  //   hasNextPage,
  //   isFetchingNextPage,
  //   isLoading,
  //   refetch,
  //   isRefetching,
  // } = useInfiniteQuery({
  //   queryKey: ["transactions", JSON.stringify(filters)],
  //   queryFn: fetchTransactions,
  //   initialPageParam: 1,
  //   getNextPageParam: lastPage =>
  //     lastPage.meta?.current_page < lastPage.meta?.last_page
  //       ? lastPage.meta.current_page + 1
  //       : undefined,
  // });

  const transactions = useMemo(
    () => data?.pages.flatMap(page => page.data) ?? [],
    [data?.pages],
  );

  const toggleFilterModal = () => {
    setIsFilterVisible(prev => !prev);
    setFilterQuery(filters); // sync draft to committed filters on every open/close
  };

  const handleApplyFilter = (newFilters: FilterType) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    toggleFilterModal();
  };

  const handleClearFilter = () => {
    setFilters(defaultFilter);
    toggleFilterModal();
  };

  const downloadAccountStatement = async () => {
    try {
      await apiGet("/transactions/user/account-statement");
      showSuccess("Your Account Statement will be sent to your email shortly.");
    } catch (err) {
      if (err instanceof AxiosError) {
        showError(
          err.response?.data?.message || "Something went wrong. Try again.",
        );
      }
      console.error(err);
    }
  };

  const navigation = useNavigation();

  console.log("Loading");

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setFilters(defaultFilter);
      setFilterQuery(defaultFilter);
    });

    return unsubscribe; // cleans up the listener on unmount too
  }, [navigation]);

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Top Buttons */}
      <View style={styles.topRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.iconButton}
          onPress={toggleFilterModal}
        >
          <Filter size={13} color="#fff" variant="Linear" />
          <AppText style={[styles.closeButtonText]}>Filter</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.iconButton}
          onPress={downloadAccountStatement}
        >
          <DocumentDownload size={13} color="#fff" variant="Linear" />
          <AppText style={[styles.closeButtonText]}>Download Statement</AppText>
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      {transactions.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <EmptyTransactionState />
        </View>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 17 }}>
          <TransactionSectionList
            transactions={transactions}
            refreshing={isRefetching}
            onRefresh={refetch}
            onLoadMore={() =>
              hasNextPage && !isFetchingNextPage && fetchNextPage()
            }
            isFetchingMore={isFetchingNextPage}
          />
        </View>
      )}

      {/* Loading Overlay */}
      <CustomLoading loading={isLoading} />

      {/* Filter Modal */}
      <CustomModal
        visible={isFilterVisible}
        title="Filter Transactions"
        showCloseButton
        onClose={toggleFilterModal}
      >
        <View style={{ marginVertical: 4 }}>
          <AppText style={styles.modalLabel}>Category</AppText>
          <SelectInput
            onSelect={option =>
              setFilterQuery(prev => ({ ...prev, category: option.value }))
            }
            options={[
              { label: "Withdrawal", value: "WITHDRAWAL" },
              { label: "Fiat Wallet Funding", value: "BANK_TRANSFER" },
              { label: "Airtime", value: "AIRTIME" },
              { label: "Crypto Withdraw", value: "CRYPTO_WITHDRAW" },
              { label: "Crypto Sell", value: "CRYPTO_SELL" },
              { label: "Crypto Buy", value: "CRYPTO_BUY" },
              { label: "Crypto Convert", value: "CRYPTO_SWAP" },
              { label: "Cable TV", value: "CABLE_BILL" },
              { label: "Data", value: "DATA" },
              { label: "Electricity Bill", value: "ELECTRICITY_BILL" },
              { label: "Betting", value: "BETTING" },
              { label: "Gift Card", value: "GIFT_CARD" },
            ]}
            value={filterQuery.category}
          />
        </View>

        <View style={{ marginVertical: 4 }}>
          <AppText style={styles.modalLabel}>Status</AppText>
          <SelectInput
            options={[
              { label: "SUCCESSFUL", value: "successful" },
              { label: "FAILED", value: "failed" },
              { label: "PROCESSING", value: "processing" },
              { label: "PENDING", value: "pending" },
            ]}
            onSelect={option =>
              setFilterQuery(prev => ({ ...prev, status: option.value }))
            }
            value={filterQuery.status}
          />
        </View>

        <DatePicker
          label="Start Date"
          value={filterQuery.startDate.display}
          onChange={dateObj =>
            setFilterQuery(prev => ({ ...prev, startDate: dateObj }))
          }
        />

        <DatePicker
          label="End Date"
          value={filterQuery.endDate.display}
          onChange={dateObj =>
            setFilterQuery(prev => ({ ...prev, endDate: dateObj }))
          }
        />

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => handleApplyFilter(filterQuery)}
        >
          <AppText style={styles.closeButtonText}>Apply Filter</AppText>
        </TouchableOpacity>

        <Pressable
          style={[styles.closeButton, { backgroundColor: "#e7e7e7" }]}
          onPress={handleClearFilter}
        >
          <AppText style={[styles.closeButtonText, { color: "#000" }]}>
            Clear Filter
          </AppText>
        </Pressable>
      </CustomModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topRow: {
    paddingHorizontal: 20,
    marginTop: 7,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 100,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#D2D2D2",
    backgroundColor: COLORS.primary,
    gap: 5,
    flex: 1,
  },
  modalLabel: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#383838ff",
    marginBottom: 6,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 48,
    marginTop: 15,
  },
  closeButtonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: normalize(17),
    fontFamily: getFontFamily("700"),
  },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyState: { alignItems: "center" },
  emptyTitle: {
    fontSize: normalize(22),
    fontFamily: getFontFamily("700"),
    color: "#000",
    marginVertical: 12,
  },
  emptyDescription: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: "#6B7280",
    textAlign: "center",
  },
});

export default TransactionHistoryScreen;
