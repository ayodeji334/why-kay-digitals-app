import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { Calendar, Filter, SearchNormal, Wallet } from "iconsax-react-nativejs";
import { SafeAreaView } from "react-native-safe-area-context";
import { normalize } from "../constants/settings";
import { useInfiniteQuery } from "@tanstack/react-query";
import useAxios from "../api/axios";
import CustomLoading from "../components/CustomLoading";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDate } from "../libs/formatDate";
import { formatAmount } from "../libs/formatNumber";
import { useNavigation } from "@react-navigation/native";

const TransactionItem: React.FC<{ item: any }> = ({ item }) => {
  const navigation: any = useNavigation();
  const isCredit = item?.direction === "CREDIT";

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("TransactionDetail", { transaction: item })
      }
      activeOpacity={0.4}
      style={styles.transactionItem}
    >
      <View style={styles.transactionContent}>
        <View style={styles.transactionMain}>
          <Text style={styles.transactionTitle}>
            {item?.description || item?.reference}
          </Text>
          <Text style={[styles.transactionAmount]}>
            {isCredit
              ? `+${formatAmount(item?.amount, false)}`
              : `-${formatAmount(item?.amount, false)}`}
          </Text>
        </View>
        <View style={styles.transactionMain}>
          <Text style={styles.transactionTime}>
            {item?.occurred_at ? formatDate(item.occurred_at) : ""}
          </Text>
          <Text
            style={[
              {
                color:
                  item?.status.toLowerCase() !== "failed"
                    ? "#059669"
                    : "#DC2626",
                fontSize: normalize(11),
                fontWeight: 600,
              },
            ]}
          >
            {item?.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const EmptyState: React.FC = () => (
  <View style={styles.emptyState}>
    <Wallet size={40} color="#000" variant="Outline" />
    <Text style={styles.emptyTitle}>No Transactions Yet!</Text>
    <Text style={styles.emptyDescription}>
      Any transactions you make will appear here. {"\n"}Let's trade!
    </Text>
  </View>
);

const TransactionHistoryScreen: React.FC = () => {
  const { apiGet } = useAxios();
  const [searchQuery, setSearchQuery] = useState("");
  const [typedSearch, setTypedSearch] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [dateType, setDateType] = useState<"startDate" | "endDate" | null>(
    null,
  );
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "",
    medium: "",
    direction: "",
  });

  const fetchTransactions = async ({ pageParam = 1 }) => {
    const params: any = {
      page: pageParam,
      search: searchQuery,
      start_date: filters.startDate,
      end_date: filters.endDate,
      type: filters.type,
      medium: filters.medium,
      direction: filters.direction,
    };

    const { data }: any = await apiGet("/transactions/user/transactions", {
      params,
    });

    return { data: data?.data.transactions, meta: data?.data?.pagination };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["transactions", searchQuery, filters],
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

  const handleSearch = () => setSearchQuery(typedSearch);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const handleRefresh = () => refetch();

  const toggleFilterModal = () => setIsFilterVisible(!isFilterVisible);
  const toggleDateRangeModal = () =>
    setIsDatePickerVisible(!isDatePickerVisible);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate && dateType) {
      setFilters(prev => ({
        ...prev,
        [dateType]: selectedDate.toISOString().split("T")[0],
      }));
    }
    setIsDatePickerVisible(false);
  };

  const applyFilter = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    toggleFilterModal();
    refetch();
  };

  const renderFooter = () =>
    isFetchingNextPage ? (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color="#E89E00" />
      </View>
    ) : null;

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <SearchNormal size={14} color="#6B7280" variant="Outline" />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search Transaction"
            placeholderTextColor="#9CA3AF"
            value={typedSearch}
            onChangeText={setTypedSearch}
            onSubmitEditing={handleSearch}
          />
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={toggleFilterModal}
        >
          <Filter size={18} color="#000" variant="Linear" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            setDateType("startDate");
            setIsDatePickerVisible(true);
          }}
        >
          <Calendar size={18} color="#000" variant="Linear" />
        </TouchableOpacity>
      </View> */}

      {transactions.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <EmptyState />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => {
            return item.uuid;
          }}
          renderItem={({ item }) => <TransactionItem item={item} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.6}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              colors={["#E89E00"]}
            />
          }
        />
      )}

      <CustomLoading loading={isLoading} />

      <Modal visible={isFilterVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filter Transactions</Text>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => applyFilter({ type: "CREDIT" })}
            >
              <Text>Credits</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => applyFilter({ type: "DEBIT" })}
            >
              <Text>Debits</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => applyFilter({ medium: "WALLET" })}
            >
              <Text>Wallet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={toggleFilterModal}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isDatePickerVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filter Transactions</Text>

            <DateTimePicker
              value={new Date()}
              mode="date"
              display="calendar"
              onChange={handleDateChange}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={toggleDateRangeModal}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchTextInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: normalize(14),
    color: "#000",
  },
  filterButton: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D2D2D2",
    backgroundColor: "#fff",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dfdfdfff",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionIconText: { fontSize: 16, fontWeight: "600" },
  transactionContent: { flex: 1 },
  transactionMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    alignItems: "flex-start",
    alignContent: "flex-start",
    gap: 20,
  },
  transactionTitle: {
    fontSize: normalize(15),
    fontWeight: "600",
    color: "#000",
    maxWidth: "70%",
  },
  transactionAmount: { fontSize: normalize(14), fontWeight: "500" },
  transactionDescription: { fontSize: normalize(13), color: "#6B7280" },
  transactionTime: { fontSize: normalize(12), color: "#9CA3AF" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyState: { alignItems: "center" },
  emptyTitle: {
    fontSize: normalize(17),
    fontWeight: "600",
    color: "#000",
    marginVertical: 12,
  },
  emptyDescription: {
    fontSize: normalize(14),
    color: "#6B7280",
    textAlign: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: { fontSize: normalize(15), fontWeight: "600", marginBottom: 16 },
  filterOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  closeButton: {
    backgroundColor: "#E89E00",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  closeButtonText: { textAlign: "center", color: "#000", fontWeight: "600" },
});

export default TransactionHistoryScreen;
