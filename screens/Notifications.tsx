import React, { useMemo, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import CustomLoading from "../components/CustomLoading";
import CustomModal from "../components/CustomModal";
import { formatDate } from "../libs/formatDate";
import { AppText } from "../components/AppText";
import TabSwitcher from "../components/TabSwitcher";

export default function NotificationsScreen() {
  const { apiGet } = useAxios();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const queryClient = useQueryClient();

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

  const handleNotificationClick = async (notification: any) => {
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
  };

  const renderItem = ({ item }: { item: any }) => {
    const isUnread = !item.is_read;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleNotificationClick(item)}
        style={[styles.notificationCard, isUnread && styles.unreadBackground]}
      >
        <View style={styles.assetLeft}>
          <View style={styles.assetInfo}>
            <AppText style={styles.assetName}>{item.title}</AppText>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 1 }}
            >
              {isUnread && <View style={styles.unreadDot} />}
              <AppText
                style={{
                  fontSize: normalize(16),
                  fontFamily: getFontFamily("800"),
                }}
              >
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
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <ActivityIndicator
        size="small"
        color={COLORS.primary}
        style={{ marginVertical: 12 }}
      />
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={"#fff"} />

      <View style={styles.tabContainer}>
        <TabSwitcher
          activeTab={activeTab}
          tabs={[
            { label: "All", value: "all" },
            { label: "Unread", value: "unread" },
            { label: "Read", value: "read" },
          ]}
          onTabChange={value => setActiveTab(value)}
          containerStyle={{ backgroundColor: "#f3f3f3ff", marginVertical: 10 }}
          activeTabStyle={{ backgroundColor: COLORS.primary }}
          activeTabTextStyle={{ color: "#fff" }}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scrollContainer: { flex: 1, paddingVertical: 20 },
  actionsContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 10,
    margin: "auto",
  },
  notificationCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#BBBBBB",
    backgroundColor: "#fff",
  },
  unreadBackground: {
    backgroundColor: "#EFF7EC",
    borderColor: "#00BD53",
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
    marginRight: 3,
  },
  assetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  assetName: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 4,
  },
  assetSymbol: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
    color: "#4b4a4aff",
    width: "85%",
  },
  assetPrice: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
    color: "#666",
  },
  // Modal Styles
  modalContent: {
    paddingVertical: 20,
  },
  modalTitle: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("400"),
    color: "#333",
    lineHeight: 22,
  },
  tabContainer: {
    paddingHorizontal: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 5,
    alignItems: "center",
  },
  tabText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    width: "auto",
    color: "#000",
    textTransform: "capitalize",
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderRadius: 120,
  },
  activeTabText: {
    color: "#fff",
  },
  actionCard: {
    backgroundColor: "#F8F9FA",
    padding: 7,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    minWidth: 62,
  },
  actionIcon: { marginBottom: 10 },
  actionTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
  },
  assetsSection: { paddingVertical: 30 },
  sectionTitle: {
    fontSize: normalize(22),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 16,
  },
  assetsList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  assetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1ff",
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
  //   assetName: {
  //     fontSize: normalize(20),
  //     fontFamily: getFontFamily("800"),
  //     color: "#000",
  //   },
  //   assetSymbol: { fontSize: normalize(16), color: "#6B7280" },
  assetRight: { alignItems: "flex-end" },
  //   assetPrice: {
  //     fontSize: normalize(18),
  //     fontFamily: getFontFamily("400"),
  //     color: "#000",
  //   },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    flex: 1,
    justifyContent: "center",
  },
  emptyStateText: { fontSize: normalize(20), fontFamily: getFontFamily("800") },
  emptyStateSubtext: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
    color: "#000000",
  },
});
