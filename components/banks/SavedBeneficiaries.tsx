import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { getFontFamily } from "../../constants/settings";
import CustomLoading from "../CustomLoading";
import ErrorState from "../ErrorState";
import { formatDate } from "../../libs/formatDate";
import { COLORS } from "../../constants/colors";
import { Refresh2, Trash } from "iconsax-react-nativejs";

// type Beneficiary = {
//   uuid: string;
//   identifier: string;
//   meta: any;
//   updated_at: string;
// };

// interface Props {
//   setAccountDetails: (details: any) => void;
//   setValue: (field: string, value: any) => void;
// }

export default function SavedBeneficiaries({
  data,
  isRefetching,
  isError,
  refetch,
  onSelect,
  onRefetch,
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
  if (isError)
    return (
      <ErrorState
        error="Cannot load saved beneficiaries"
        handleOnPress={refetch}
      />
    );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.item,
        selectedBeneficiary === item.uuid && styles.itemSelected,
      ]}
      onPress={() => onSelect(item)}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <View style={styles.rowBetween}>
            <Text style={styles.name}>
              {item?.meta?.account_name ?? item?.meta?.network}
            </Text>
            <Text style={styles.lastUsed}>{formatDate(item?.updated_at)}</Text>
          </View>
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
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Beneficiaries</Text>
        <View style={{ flexDirection: "row", gap: 4 }}>
          {Array.isArray(data) && data?.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onDeleteAll}
              disabled={deleting}
              style={styles.deleteButton}
            >
              <Trash size={12} color="red" />
              <Text style={styles.deleteText}>
                {deleting ? "Deleting..." : "Delete All"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onRefetch}
            disabled={isRefetching}
            style={[styles.deleteButton, { borderColor: "gray" }]}
          >
            <Refresh2 size={12} color="black" />
            <Text style={[styles.deleteText, { color: "black" }]}>
              {deleting ? "Refreshing..." : "Refresh"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {!data || data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No saved beneficiaries yet.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          scrollEnabled={false}
          keyExtractor={item => item.uuid}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    width: "10%",
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
