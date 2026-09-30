import React, { useCallback, useMemo, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { COLORS } from "../constants/colors";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import CustomLoading from "../components/CustomLoading";
import CustomModal from "../components/CustomModal";
import { formatDate } from "../libs/formatDate";
import { AppText } from "../components/AppText";
import TabSwitcher from "../components/TabSwitcher";
import { showError } from "../utlis/toast";
import { useColors } from "../hooks/useTheme";
import { useStyles } from "../hooks/useStyles";

/** One notification. Memoised so paging in more doesn't re-render every row. */
const NotificationRow = React.memo(
  ({
    item,
    onPress,
    styles,
  }: {
    item: any;
    onPress: (item: any) => void;
    styles: ReturnType<typeof makeStyles>;
  }) => {
    const isUnread = !item.is_read;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress(item)}
        style={[styles.notificationCard, isUnread && styles.unreadBackground]}
        accessibilityRole="button"
        accessibilityLabel={`${isUnread ? "Unread: " : ""}${item.title}`}
      >
        <View style={styles.assetLeft}>
          <View style={styles.assetInfo}>
            <AppText style={styles.assetName}>{item.title}</AppText>
            <View style={styles.metaRow}>
              {isUnread && <View style={styles.unreadDot} />}
              <AppText style={styles.timeText}>
                {formatDate(item?.created_at, { dateFormat: "relative" })}
              </AppText>
            </View>
          </View>
          <AppText style={styles.assetSymbol} numberOfLines={1}>
            {item.message}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  },
);

export default function NotificationsScreen() {
  const { apiGet } = useAxios();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const queryClient = useQueryClient();
  const styles = useStyles(makeStyles);

  const fetchNotifications = async ({ pageParam = 1 }) => {
    const res = await apiGet("/notifications/user", {
      params: { page: pageParam },
    });

    return {
      data: res.data?.data?.notifications,
      pagination: res.data?.data?.pagination,
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      return lastPage?.pagination?.current_page <
        lastPage?.pagination?.last_page
        ? lastPage.pagination?.current_page + 1
        : undefined;
    },
  });

  const allNotifications = useMemo(
    () => data?.pages.flatMap(page => page.data) ?? [],
    [data?.pages],
  );

  const filteredNotifications = useMemo(() => {
    return allNotifications.filter(item => {
      if (activeTab === "unread") return !item.is_read;
      if (activeTab === "read") return item.is_read;
      return true;
    });
  }, [allNotifications, activeTab]);

  const handleNotificationClick = useCallback(
    async (notification: any) => {
      setSelectedNotification(notification);

      if (!notification.is_read) {
        try {
          await apiGet(`/notifications/${notification.id}/mark-as-read`);
          refetch();
          queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
        } catch (error) {
          queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
          console.error("Failed to mark as read", error);
        }
      }
    },
    [apiGet, refetch, queryClient],
  );

  const handleMarkAllAsRead = async () => {
    if (isMarkingAllAsRead) return;

    try {
      setIsMarkingAllAsRead(true);
      await apiGet("/notifications/user/mark-all-as-read");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
    } catch (error: any) {
      console.error("Failed to mark all notifications as read", error);
      showError(
        error?.data?.message ?? "Failed to mark all notifications as read",
      );
    } finally {
      setIsMarkingAllAsRead(false);
    }
  };

  const { data: hasReadData } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      const response = await apiGet("/notifications/has-unread");
      return response.data?.data;
    },
  });

  const hasUnread = hasReadData?.has_unread ?? false;

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <NotificationRow
        item={item}
        onPress={handleNotificationClick}
        styles={styles}
      />
    ),
    [handleNotificationClick, styles],
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <ActivityIndicator
        size="small"
        color={COLORS.primary}
        style={{ marginVertical: normalizeSpacing(12) }}
      />
    );
  };

  return (
    <SafeAreaView edges={["bottom", "right", "left"]} style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          hitSlop={10}
          activeOpacity={0.7}
          disabled={!hasUnread || isMarkingAllAsRead}
          onPress={handleMarkAllAsRead}
          style={styles.markAllButton}
        >
          {isMarkingAllAsRead ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <AppText
              style={[
                styles.markAllButtonText,
                !hasUnread && styles.markAllButtonTextDisabled,
              ]}
            >
              ✓ Mark all as read
            </AppText>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TabSwitcher
          activeTab={activeTab}
          tabs={[
            { label: "All", value: "all" },
            { label: "Unread", value: "unread" },
            { label: "Read", value: "read" },
          ]}
          onTabChange={value => setActiveTab(value)}
          containerStyle={styles.tabSwitcher}
          activeTabStyle={styles.activeTab}
          activeTabTextStyle={styles.activeTabText}
        />
      </View>

      <View style={styles.scrollContainer}>
        {!isLoading && filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <AppText style={styles.emptyStateText}>No notifications</AppText>
            <AppText style={styles.emptyStateSubtext}>
              You're all caught up!
            </AppText>
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            refreshing={isRefetching}
            onRefresh={refetch}
            onEndReached={() =>
              hasNextPage && !isFetchingNextPage && fetchNextPage()
            }
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onEndReachedThreshold={0.4}
            ListFooterComponent={renderFooter}
          />
        )}
      </View>

      <CustomModal
        height={300}
        visible={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        title={selectedNotification?.title ?? "Notification Detail"}
      >
        {selectedNotification && (
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>
              {formatDate(selectedNotification?.created_at, {
                timeFormat: "12h",
              })}
            </AppText>
            <AppText style={styles.modalMessage}>
              {selectedNotification?.message}
            </AppText>
          </View>
        )}
      </CustomModal>

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    metaRow: { flexDirection: "row", alignItems: "center", gap: 1 },
    timeText: {
      fontSize: normalize(16),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    container: { flex: 1, backgroundColor: colors.background },
    scrollContainer: { flex: 1, paddingVertical: normalizeSpacing(20) },
    actionsContainer: {
      flexWrap: "wrap",
      flexDirection: "row",
      gap: 10,
      margin: "auto",
    },
    tabSwitcher: {
      backgroundColor: colors.inputBackground,
      marginVertical: normalizeSpacing(10),
    },
    activeTab: {
      backgroundColor: COLORS.primary,
      color: colors.text,
    },
    activeTabText: {
      color: "white",
    },
    headerRow: {
      marginTop: normalizeSpacing(-10),
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingHorizontal: normalizeSpacing(20),
      paddingBottom: normalizeSpacing(4),
    },
    headerTitle: {
      fontSize: normalize(22),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    notificationCard: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: normalizeSpacing(16),
      marginHorizontal: normalizeSpacing(20),
      marginBottom: normalizeSpacing(12),
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    unreadBackground: {
      backgroundColor: colors.infoCardBackgroundColor,
      borderColor: colors.border,
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    unreadDot: {
      width: 6,
      height: 6,
      borderRadius: 4,
      backgroundColor: "#27A15E",
      marginRight: normalizeSpacing(3),
    },
    assetIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#F0F0F0",
      justifyContent: "center",
      alignItems: "center",
      marginRight: normalizeSpacing(12),
    },
    assetName: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalizeSpacing(4),
    },
    assetSymbol: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.text,
      width: "85%",
    },
    assetPrice: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.text,
    },
    modalContent: {
      paddingVertical: normalizeSpacing(20),
    },
    modalTitle: {
      fontSize: normalize(19),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalizeSpacing(8),
    },
    modalMessage: {
      fontSize: normalize(19),
      fontFamily: getFontFamily("400"),
      color: colors.text,
    },
    tabContainer: {
      paddingHorizontal: normalizeSpacing(15),
    },
    tabButton: {
      flex: 1,
      paddingVertical: normalizeSpacing(14),
      alignItems: "center",
    },
    tabText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      width: "auto",
      color: "#000",
      textTransform: "capitalize",
    },
    assetItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: normalizeSpacing(16),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    assetLeft: { flex: 1 },
    assetIconText: {
      fontSize: normalize(13),
      fontFamily: getFontFamily("400"),
      color: "#128b48ff",
    },
    assetInfo: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    assetRight: { alignItems: "flex-end" },
    emptyState: {
      alignItems: "center",
      paddingVertical: normalizeSpacing(40),
      flex: 1,
      justifyContent: "center",
    },
    emptyStateText: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    emptyStateSubtext: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.text,
    },
    markAllButton: {
      paddingVertical: normalizeSpacing(14),
      paddingHorizontal: normalizeSpacing(6),
    },
    markAllButtonText: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    markAllButtonTextDisabled: {
      color: colors.text,
    },
  });
