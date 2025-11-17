// import React, { useCallback, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   TouchableOpacity,
//   Pressable,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useInfiniteQuery } from "@tanstack/react-query";
// import { Filter, DocumentDownload } from "iconsax-react-nativejs";
// import useAxios from "../api/axios";
// import TransactionSectionList from "../components/TransactionList";
// import CustomLoading from "../components/CustomLoading";
// import { COLORS } from "../constants/colors";
// import { getFontFamily, normalize } from "../constants/settings";
// import CustomIcon from "../components/CustomIcon";
// import { NoResultIcon } from "../assets";
// import { SelectInput } from "../components/SelectInputField";
// import CustomModal from "../components/CustomModal";
// import DatePicker from "../components/DatePicker";
// import { showSuccess } from "../utlis/toast";

// export const EmptyTransactionState: React.FC = () => (
//   <View style={styles.emptyState}>
//     <CustomIcon source={NoResultIcon} size={normalize(70)} color="#000" />
//     <Text style={styles.emptyTitle}>No Transactions Yet!</Text>
//     <Text style={styles.emptyDescription}>
//       Any transactions you make will appear here. {"\n"}Let's trade!
//     </Text>
//   </View>
// );

// const TransactionHistoryScreen: React.FC = () => {
//   const { apiGet } = useAxios();
//   const [isFilterVisible, setIsFilterVisible] = useState(false);
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [filterQuery, setFiltersQuery] = useState<{
//     startDate: {
//       display: string;
//       iso: string;
//     };
//     endDate: {
//       display: string;
//       iso: string;
//     };
//     status: string;
//     category: string;
//   }>({
//     startDate: { display: "", iso: "" },
//     endDate: { display: "", iso: "" },
//     status: "",
//     category: "",
//   });
//   const [filters, setFilters] = useState<{
//     startDate: {
//       display: string;
//       iso: string;
//     };
//     endDate: {
//       display: string;
//       iso: string;
//     };
//     status: string;
//     category: string;
//   }>({
//     startDate: { display: "", iso: "" },
//     endDate: { display: "", iso: "" },
//     status: "",
//     category: "",
//   });

//   const stableFilter = useMemo(() => filterQuery, [filterQuery]);

//   const toggleFilterModal = () => {
//     setIsFilterVisible(!isFilterVisible);
//   };

//   const fetchTransactions = async ({ pageParam = 1 }) => {
//     const params: any = {
//       page: pageParam,
//       start_date: stableFilter.startDate.iso,
//       end_date: stableFilter.endDate.iso,
//       status: stableFilter.status,
//       category: stableFilter.category,
//     };

//     const { data }: any = await apiGet("/transactions/user/transactions", {
//       params,
//     });

//     return { data: data?.data.transactions, meta: data?.data?.pagination };
//   };

//   const {
//     data,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//     isLoading,
//     refetch,
//     isRefetching,
//   } = useInfiniteQuery({
//     queryKey: ["transactions", stableFilter],
//     queryFn: fetchTransactions,
//     initialPageParam: 1,
//     getNextPageParam: lastPage =>
//       lastPage.meta?.current_page < lastPage.meta?.last_page
//         ? lastPage.meta.current_page + 1
//         : undefined,
//   });

//   const transactions = useMemo(
//     () => data?.pages.flatMap(page => page.data) ?? [],
//     [data?.pages],
//   );

//   const downloadAccountStatement = async () => {
//     try {
//       setIsDownloading(true);
//       await apiGet("/transactions/user/account-statement");
//       showSuccess("Account Statement sent to your email");
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   const handleApplyFilter = () => {
//     toggleFilterModal();
//     refetch({ refetchPage: (_page, index) => index === 0 });

//     setFiltersQuery(filters);
//   };

//   const handleClearFilter = () => {
//     toggleFilterModal();
//     setFilters({
//       startDate: { display: "", iso: "" },
//       endDate: { display: "", iso: "" },
//       status: "",
//       category: "",
//     });
//     setFiltersQuery({
//       startDate: { display: "", iso: "" },
//       endDate: { display: "", iso: "" },
//       status: "",
//       category: "",
//     });
//   };

//   return (
//     <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />

//       <View style={styles.topRow}>
//         <TouchableOpacity
//           activeOpacity={0.8}
//           style={styles.iconButton}
//           onPress={toggleFilterModal}
//         >
//           <Filter size={15} color="#fff" variant="Linear" />
//           <Text style={[styles.closeButtonText]}>Filter</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           activeOpacity={0.8}
//           style={styles.iconButton}
//           onPress={downloadAccountStatement}
//         >
//           <DocumentDownload size={15} color="#fff" variant="Linear" />
//           <Text style={[styles.closeButtonText]}>Download Statement</Text>
//         </TouchableOpacity>
//       </View>

//       {transactions.length === 0 && !isLoading ? (
//         <View style={styles.emptyContainer}>
//           <EmptyTransactionState />
//         </View>
//       ) : (
//         <React.Fragment>
//           <View style={{ paddingHorizontal: 17 }}>
//             <TransactionSectionList
//               transactions={transactions}
//               refreshing={isRefetching}
//               onRefresh={refetch}
//               onLoadMore={() =>
//                 hasNextPage && !isFetchingNextPage && fetchNextPage()
//               }
//               isFetchingMore={isFetchingNextPage}
//             />
//           </View>
//         </React.Fragment>
//       )}

//       <CustomLoading loading={isLoading || isRefetching || isDownloading} />

//       <CustomModal
//         visible={isFilterVisible}
//         title={"Filter Transactions"}
//         showCloseButton={true}
//         onClose={toggleFilterModal}
//       >
//         <View style={{ marginVertical: 4 }}>
//           <Text style={styles.modalLabel}>Category</Text>
//           <SelectInput
//             onSelect={option =>
//               setFilters(prev => ({
//                 ...prev,
//                 category: option.value,
//               }))
//             }
//             options={[
//               { label: "WITHDRAWAL", value: "WITHDRAWAL" },
//               { label: "FIAT WALLET FUNDING", value: "BANK_TRANSFER" },
//               { label: "AIRTIME", value: "AIRTIME" },
//               { label: "CRYPTO", value: "CRYPTO" },
//               { label: "CABLETV", value: "CABLETV" },
//               { label: "DATA", value: "DATA" },
//               { label: "ELECTRICITY BILL", value: "ELECTRICITY_BILL" },
//             ]}
//           />
//         </View>
//         <View style={{ marginVertical: 4 }}>
//           <Text style={styles.modalLabel}>Status</Text>
//           <SelectInput
//             options={[
//               { label: "SUCCESSFUL", value: "successful" },
//               { label: "FAILED", value: "failed" },
//               { label: "PROCESSING", value: "processing" },
//               { label: "PENDING", value: "pending" },
//             ]}
//             onSelect={option =>
//               setFilters(prev => ({
//                 ...prev,
//                 status: option.value,
//               }))
//             }
//           />
//         </View>
//         <View style={{ marginBottom: 7 }}>
//           <DatePicker
//             label="Start Date"
//             value={filters.startDate.display}
//             onChange={dateObj =>
//               setFilters(prev => ({
//                 ...prev,
//                 startDate: dateObj,
//               }))
//             }
//           />
//         </View>
//         <View style={{ marginVertical: 6 }}>
//           <DatePicker
//             label="End Date"
//             value={filters.endDate.display}
//             onChange={dateObj =>
//               setFilters(prev => ({
//                 ...prev,
//                 endDate: dateObj,
//               }))
//             }
//           />
//         </View>

//         <TouchableOpacity
//           style={styles.closeButton}
//           onPress={handleApplyFilter}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.closeButtonText}>Apply Filter</Text>
//         </TouchableOpacity>
//         <Pressable
//           style={[styles.closeButton, { backgroundColor: "#e7e7e7" }]}
//           onPress={handleClearFilter}
//         >
//           <Text style={[styles.closeButtonText, { color: "#000" }]}>
//             Clear Filter
//           </Text>
//         </Pressable>
//       </CustomModal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   topRow: {
//     paddingHorizontal: 20,
//     marginTop: 7,
//     marginBottom: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },
//   // searchInput: {
//   //   flex: 1,
//   //   flexDirection: "row",
//   //   alignItems: "center",
//   //   backgroundColor: "#F9FAFB",
//   //   paddingHorizontal: 16,
//   //   paddingVertical: 12,
//   //   borderRadius: 9,
//   //   borderWidth: 1,
//   //   borderColor: "#E5E7EB",
//   // },
//   // searchTextInput: {
//   //   flex: 1,
//   //   marginLeft: 8,
//   //   fontSize: normalize(15),
//   //   fontFamily: getFontFamily(400),
//   //   color: "#000",
//   // },
//   iconButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 20,
//     borderRadius: 100,
//     borderWidth: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     borderColor: "#D2D2D2",
//     backgroundColor: COLORS.primary,
//     gap: 5,
//     flex: 1,
//   },
//   overlay: {
//     flex: 1,
//     justifyContent: "flex-end",
//     backgroundColor: "rgba(0, 0, 0, 0.4)",
//   },
//   modalContainer: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 24,
//   },
//   modalTitle: {
//     fontSize: normalize(20),
//     fontFamily: getFontFamily("800"),
//     marginBottom: 16,
//   },
//   modalLabel: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("700"),
//     color: "#383838ff",
//     marginBottom: 6,
//   },
//   filterOption: {
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E7EB",
//   },
//   closeButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 12,
//     borderRadius: 48,
//     marginTop: 15,
//   },
//   closeButtonText: {
//     textAlign: "center",
//     color: "#fff",
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("700"),
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   emptyState: { alignItems: "center" },
//   emptyTitle: {
//     fontSize: normalize(22),
//     fontFamily: getFontFamily("700"),
//     color: "#000",
//     marginVertical: 12,
//   },
//   emptyDescription: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("400"),
//     color: "#6B7280",
//     textAlign: "center",
//   },
// });

// export default TransactionHistoryScreen;
import React, { useMemo, useState } from "react";
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
import useAxios from "../api/axios";
import TransactionSectionList from "../components/TransactionList";
import CustomLoading from "../components/CustomLoading";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import CustomIcon from "../components/CustomIcon";
import { NoResultIcon } from "../assets";
import { SelectInput } from "../components/SelectInputField";
import CustomModal from "../components/CustomModal";
import DatePicker from "../components/DatePicker";
import { showSuccess } from "../utlis/toast";

export const EmptyTransactionState: React.FC = () => (
  <View style={styles.emptyState}>
    <CustomIcon source={NoResultIcon} size={normalize(70)} color="#000" />
    <Text style={styles.emptyTitle}>No Transactions Yet!</Text>
    <Text style={styles.emptyDescription}>
      Any transactions you make will appear here. {"\n"}Let's trade!
    </Text>
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

  // Serialize filters for stable query key
  const serializedFilters = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchTransactions = async ({ pageParam = 1 }) => {
    console.log("fetching....");
    const params: any = {
      page: pageParam,
      start_date: filters.startDate.iso,
      end_date: filters.endDate.iso,
      status: filters.status,
      category: filters.category,
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
    queryKey: ["transactions", serializedFilters],
    queryFn: fetchTransactions,
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.meta?.current_page < lastPage.meta?.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });

  const transactions = useMemo(
    () => data?.pages.flatMap(page => page.data) ?? [],
    [data?.pages],
  );

  const toggleFilterModal = () => {
    setIsFilterVisible(prev => !prev);
    // setFilterQuery(defaultFilter);
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
      showSuccess("Account Statement sent to your email");
    } catch (err) {
      console.error(err);
    }
  };

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
          <Filter size={15} color="#fff" variant="Linear" />
          <Text style={[styles.closeButtonText]}>Filter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.iconButton}
          onPress={downloadAccountStatement}
        >
          <DocumentDownload size={15} color="#fff" variant="Linear" />
          <Text style={[styles.closeButtonText]}>Download Statement</Text>
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
      <CustomLoading loading={isLoading || isRefetching} />

      {/* Filter Modal */}
      <CustomModal
        visible={isFilterVisible}
        title="Filter Transactions"
        showCloseButton
        onClose={toggleFilterModal}
      >
        <View style={{ marginVertical: 4 }}>
          <Text style={styles.modalLabel}>Category</Text>
          <SelectInput
            onSelect={option =>
              setFilterQuery(prev => ({ ...prev, category: option.value }))
            }
            options={[
              { label: "WITHDRAWAL", value: "WITHDRAWAL" },
              { label: "FIAT WALLET FUNDING", value: "BANK_TRANSFER" },
              { label: "AIRTIME", value: "AIRTIME" },
              { label: "CRYPTO", value: "CRYPTO" },
              { label: "CABLETV", value: "CABLETV" },
              { label: "DATA", value: "DATA" },
              { label: "ELECTRICITY BILL", value: "ELECTRICITY_BILL" },
            ]}
            value={filterQuery.category}
          />
        </View>

        <View style={{ marginVertical: 4 }}>
          <Text style={styles.modalLabel}>Status</Text>
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
          <Text style={styles.closeButtonText}>Apply Filter</Text>
        </TouchableOpacity>

        <Pressable
          style={[styles.closeButton, { backgroundColor: "#e7e7e7" }]}
          onPress={handleClearFilter}
        >
          <Text style={[styles.closeButtonText, { color: "#000" }]}>
            Clear Filter
          </Text>
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
    fontSize: normalize(18),
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
