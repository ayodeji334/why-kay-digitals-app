import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
} from "react-native";
import { getFontFamily, normalize } from "../../constants/settings";
import ErrorState from "../ErrorState";
import { COLORS } from "../../constants/colors";
import { Refresh2, Trash } from "iconsax-react-nativejs";
import { CloseIcon } from "../../assets";
import CustomIcon from "../CustomIcon";

const PREVIEW_COUNT = 2;

export default function SavedBeneficiaries({
  data,
  isRefetching,
  isError,
  refetch,
  onSelect,
  onDeleteAll,
  deleting,
  selectedBeneficiary,
}: {
  data: any[];
  isLoading: boolean;
  isRefetching?: boolean;
  isError: boolean;
  refetch: () => void;
  onRefetch?: () => void;
  onSelect: (beneficiary: any) => void;
  onDeleteAll: () => void;
  deleting: boolean;
  selectedBeneficiary: string | null;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  const previewData = useMemo(
    () => data?.slice(0, PREVIEW_COUNT) ?? [],
    [data],
  );
  const hasMore = data?.length > PREVIEW_COUNT;

  const filteredData = useMemo(
    () =>
      data?.filter(item => {
        const haystack = [
          item?.meta?.account_name,
          item?.meta?.network,
          item?.meta?.provider,
          item?.meta?.phone_number,
          item?.meta?.meter_number,
          item?.meta?.cable_tv_number,
          item?.meta?.bank_name,
          item?.meta?.account_number,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(search.toLowerCase());
      }),
    [data, search],
  );

  const handleSelect = useCallback(
    (item: any) => {
      onSelect(item);
      setModalVisible(false);
    },
    [onSelect],
  );

  const handleDeleteAll = useCallback(() => {
    onDeleteAll();
    setModalVisible(false);
  }, [onDeleteAll]);

  if (isError) {
    return (
      <ErrorState
        error="Cannot load saved beneficiaries"
        handleOnPress={refetch}
      />
    );
  }

  const renderItem = ({
    item,
    onPress,
  }: {
    item: any;
    onPress: (item: any) => void;
  }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.item,
        selectedBeneficiary === item.uuid && styles.itemSelected,
      ]}
      onPress={() => onPress(item)}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>
            {item?.meta?.account_name ??
              item?.meta?.network ??
              item?.meta?.provider ??
              item?.meta?.service}
          </Text>
          {item?.meta?.bank_name && (
            <Text style={styles.details} numberOfLines={1}>
              {item?.meta?.bank_name} • {item?.meta?.account_number}
            </Text>
          )}
          {item?.meta?.phone_number && (
            <Text style={styles.details} numberOfLines={1}>
              {item?.meta?.phone_number}
            </Text>
          )}
          {item?.meta?.cable_tv_number && (
            <Text style={styles.details} numberOfLines={1}>
              {item?.meta?.cable_tv_number}
            </Text>
          )}
          {item?.meta?.customer_id && (
            <Text style={styles.details} numberOfLines={1}>
              {item?.meta?.customer_id}
            </Text>
          )}
          {item?.meta?.meter_number && (
            <Text style={styles.details} numberOfLines={1}>
              {item?.meta?.meter_number}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Beneficiaries</Text>
        {hasMore && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* preview list  */}
      {!data || data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No saved beneficiaries yet.</Text>
        </View>
      ) : (
        <FlatList
          data={previewData}
          scrollEnabled={false}
          keyExtractor={item => item.uuid}
          renderItem={({ item }) => renderItem({ item, onPress: onSelect })}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Saved Beneficiaries</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <CustomIcon
                  source={CloseIcon}
                  color={COLORS.primary}
                  fill={COLORS.primary}
                  overrideColor
                  size={18}
                />
              </Pressable>
            </View>

            <TextInput
              placeholder="Search beneficiaries..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />

            {/* full list */}
            <FlatList
              data={filteredData}
              showsVerticalScrollIndicator={false}
              keyExtractor={item => item.uuid}
              renderItem={({ item }) =>
                renderItem({ item, onPress: handleSelect })
              }
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No beneficiaries found.</Text>
                </View>
              }
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => refetch()}
                disabled={isRefetching}
                style={[styles.actionButton, { borderColor: "gray" }]}
              >
                <Refresh2 size={10} color="black" />
                <Text style={[styles.actionText, { color: "black" }]}>
                  {isRefetching ? "Refreshing..." : "Refresh"}
                </Text>
              </TouchableOpacity>

              {data?.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleDeleteAll}
                  disabled={deleting}
                  style={styles.actionButton}
                >
                  <Trash size={12} color="red" />
                  <Text style={styles.actionText}>
                    {deleting ? "Deleting..." : "Delete All"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "80%",
    paddingBottom: 40,
  },
  modalTitle: {
    fontFamily: getFontFamily("900"),
    fontSize: normalize(20),
    color: "#374151",
  },
  search: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    color: "#374151",
    backgroundColor: "#F9FAFB",
  },
  option: { borderBottomWidth: 2, borderBottomColor: "#ecececff" },
  optionContent: { padding: 10, width: "100%" },
  cryptoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flex: 1,
  },
  cryptoInfo: { flex: 1 },
  optionName: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000",
  },
  optionPrice: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#343435",
  },
  list: {
    paddingVertical: 8,
    marginVertical: 10,
    gap: 10,
  },
  header: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 13,
    fontFamily: getFontFamily("800"),
  },
  itemSelected: {
    backgroundColor: "#f0fdf4",
  },
  card: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardDefault: {
    borderColor: "#154bb7", // gray-200
    backgroundColor: "#fff",
  },
  cardSelected: {
    borderColor: "#16a34a", // green-600
    backgroundColor: "#f0fdf4", // green-50
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 1200,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  deleteText: {
    fontSize: 12,
    fontFamily: getFontFamily("900"),
    color: "red",
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: getFontFamily("800"),
  },
  // modalOverlay: {
  //   flex: 1,
  //   backgroundColor: "rgba(0,0,0,0.45)",
  //   justifyContent: "flex-end",
  // },
  // modalContent: {
  //   backgroundColor: "#fff",
  //   borderTopLeftRadius: 20,
  //   borderTopRightRadius: 20,
  //   paddingHorizontal: 16,
  //   paddingTop: 20,
  //   paddingBottom: 34,
  //   maxHeight: "80%",
  // },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  // modalTitle: {
  //   fontSize: 16,
  //   fontFamily: getFontFamily("700"),
  //   color: COLORS.primary,
  // },
  modalActions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 600,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  actionText: {
    fontSize: 12,
    color: "red",
    fontFamily: getFontFamily("800"),
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 14,
    color: "#111",
    fontFamily: getFontFamily("700"),
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dcfce7", // green-100
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  lastUsed: {
    fontSize: 10,
    fontFamily: getFontFamily("800"),
    color: "#9ca3af", // gray-400
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginVertical: 1,
  },
  name: {
    fontSize: 14,
    color: "#000",
    fontFamily: getFontFamily("800"),
    textTransform: "uppercase",
  },
  details: {
    fontSize: 14,
    fontFamily: getFontFamily("700"),
    color: "#555",
    marginTop: 2,
  },
  emptyContainer: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#838383",
    fontFamily: getFontFamily("700"),
  },
});
