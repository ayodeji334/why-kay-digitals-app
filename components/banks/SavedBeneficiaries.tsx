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
import { AppText } from "../AppText";
import { useColors } from "../../hooks/useTheme";

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
  const colors = useColors();
  const styles = makeStyles(colors);
  // const previewData = useMemo(
  //   () => data?.slice(0, PREVIEW_COUNT) ?? [],
  //   [data],
  // );

  const previewData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const selectedIndex = selectedBeneficiary
      ? data.findIndex(item => item.uuid === selectedBeneficiary)
      : -1;

    // Already visible in the initial preview — no reordering needed
    if (selectedIndex === -1 || selectedIndex < PREVIEW_COUNT) {
      return data.slice(0, PREVIEW_COUNT);
    }

    // Selected item is further down — pull it to the front of the preview
    const selectedItem = data[selectedIndex];
    const rest = data.filter((_, i) => i !== selectedIndex);
    return [selectedItem, ...rest].slice(0, PREVIEW_COUNT);
  }, [data, selectedBeneficiary]);

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
  }) => {
    const isSelected = selectedBeneficiary === item.uuid;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        hitSlop={10}
        style={[styles.item, isSelected && styles.itemSelected]}
        onPress={() => onPress(item)}
      >
        <View style={[styles.row, isSelected && styles.rowSelected]}>
          <View style={styles.info}>
            <AppText style={styles.name}>
              {item?.meta?.account_name ??
                item?.meta?.network ??
                item?.meta?.provider ??
                item?.meta?.provider_name ??
                item?.meta?.service}
            </AppText>
            {item?.meta?.bank_name && (
              <AppText style={styles.details} numberOfLines={1}>
                {item?.meta?.bank_name} • {item?.meta?.account_number}
              </AppText>
            )}
            {item?.meta?.phone_number && (
              <AppText style={styles.details} numberOfLines={1}>
                {item?.meta?.phone_number}
              </AppText>
            )}
            {item?.meta?.cable_tv_number && (
              <AppText style={styles.details} numberOfLines={1}>
                {item?.meta?.cable_tv_number}
              </AppText>
            )}
            {item?.meta?.customer_id && (
              <AppText style={styles.details} numberOfLines={1}>
                {item?.meta?.customer_id}
              </AppText>
            )}
            {item?.meta?.meter_number && (
              <AppText style={styles.details} numberOfLines={1}>
                {item?.meta?.meter_number}
              </AppText>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <View style={styles.header}>
        <AppText style={styles.headerTitle}>Saved Beneficiaries</AppText>
        {hasMore && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setModalVisible(true)}
          >
            <AppText style={styles.viewAllText}>View all</AppText>
          </TouchableOpacity>
        )}
      </View>

      {!data || data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText style={styles.emptyText}>
            No saved beneficiaries yet.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={previewData}
          scrollEnabled={false}
          keyExtractor={item => item.uuid}
          renderItem={({ item }) => renderItem({ item, onPress: handleSelect })}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppText style={styles.emptyText}>
                No beneficiaries found.
              </AppText>
            </View>
          }
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
              <AppText style={styles.modalTitle}>Saved Beneficiaries</AppText>
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
              maxFontSizeMultiplier={1}
              allowFontScaling={false}
            />

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
                  <AppText style={styles.emptyText}>
                    No beneficiaries found.
                  </AppText>
                </View>
              }
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => refetch()}
                disabled={isRefetching}
                hitSlop={10}
                style={[styles.actionButton, { borderColor: "gray" }]}
              >
                <Refresh2 size={10} color={colors.text} />
                <AppText style={[styles.actionText, { color: colors.text }]}>
                  {isRefetching ? "Refreshing..." : "Refresh"}
                </AppText>
              </TouchableOpacity>

              {data?.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleDeleteAll}
                  disabled={deleting}
                  hitSlop={10}
                  style={styles.actionButton}
                >
                  <Trash size={12} color={colors.error} />
                  <AppText style={styles.actionText}>
                    {deleting ? "Deleting..." : "Delete All"}
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.inputBackground,
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
      color: colors.text,
    },
    rowSelected: {
      borderColor: "#16a34a",
      borderWidth: 2,
      backgroundColor: "#f0fdf4",
    },
    search: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
      color: "#374151",
      backgroundColor: colors.inputBackground,
    },
    option: { borderBottomWidth: 0 },
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
      color: colors.text,
    },
    optionPrice: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: colors.text,
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
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    itemSelected: {
      backgroundColor: colors.inputBackground,
    },
    card: {
      width: "100%",
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
    },
    cardDefault: {
      borderColor: "#154bb7",
      backgroundColor: colors.inputBackground,
    },
    cardSelected: {
      borderColor: "#16a34a",
      backgroundColor: colors.inputBackground,
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
      fontSize: normalize(16),
      fontFamily: getFontFamily("900"),
      color: colors.error,
    },
    viewAllText: {
      fontSize: normalize(18),
      color: colors.text,
      fontFamily: getFontFamily("800"),
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
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
      borderColor: colors.error,
      borderRadius: 600,
      paddingVertical: 5,
      paddingHorizontal: 20,
    },
    actionText: {
      fontSize: normalize(16),
      color: colors.error,
      fontFamily: getFontFamily("800"),
    },
    searchInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginBottom: 12,
      fontSize: normalize(18),
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
      fontSize: normalize(17),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    item: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginVertical: 1,
    },
    name: {
      fontSize: normalize(16),
      color: colors.text,
      fontFamily: getFontFamily("900"),
      textTransform: "uppercase",
    },
    details: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      marginTop: 2,
    },
    emptyContainer: {
      padding: normalize(16),
      alignItems: "center",
    },
    emptyText: {
      fontSize: normalize(18),
      color: colors.text,
      fontFamily: getFontFamily("700"),
    },
  });
