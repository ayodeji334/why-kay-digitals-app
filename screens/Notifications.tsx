import React, { useMemo, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import CustomLoading from "../components/CustomLoading";
import CustomModal from "../components/CustomModal";
import { formatDate } from "../libs/formatDate";

export default function NotificationsScreen() {
  const { apiGet } = useAxios();
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await apiGet("/notifications/user");
      return res.data;
    },
    staleTime: 2000,
  });

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

  const filteredNotifications = useMemo(() => {
    if (!data) return [];

    return data.filter((item: any) => {
      if (activeTab === "unread") return !item.is_read;
      if (activeTab === "read") return item.is_read;
      return true;
    });
  }, [data, activeTab]);

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
            <Text style={styles.assetName}>{item.title}</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 1,
              }}
            >
              {isUnread && <View style={styles.unreadDot} />}
              <Text style={{ fontSize: 12, fontFamily: getFontFamily("800") }}>
                {formatDate(item?.created_at, { dateFormat: "relative" })}
              </Text>
            </View>
          </View>
          <Text style={styles.assetSymbol} numberOfLines={1}>
            {item.message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={"#fff"} />
      <View style={styles.tabContainer}>
        {["all", "unread", "read"].map(title => (
          <TouchableOpacity
            key={title}
            style={[styles.tabButton, activeTab === title && styles.activeTab]}
            onPress={() => setActiveTab(title as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === title && styles.activeTabText,
              ]}
            >
              {title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.scrollContainer}>
        {filteredNotifications?.length ? (
          <FlatList
            data={filteredNotifications}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            refreshing={isFetching}
            onRefresh={refetch}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No notifications</Text>
            <Text style={styles.emptyStateSubtext}>You're all caught up!</Text>
          </View>
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
            <Text style={styles.modalTitle}>
              {formatDate(selectedNotification?.created_at, {
                timeFormat: "12h",
              })}
            </Text>
            <Text style={styles.modalMessage}>
              {selectedNotification?.message}
            </Text>
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
    fontSize: 14,
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 4,
  },
  assetSymbol: {
    fontSize: 13,
    fontFamily: getFontFamily("400"),
    color: "#4b4a4aff",
    width: "85%",
  },
  assetPrice: {
    fontSize: 12,
    fontFamily: getFontFamily("400"),
    color: "#666",
  },
  // Modal Styles
  modalContent: {
    paddingVertical: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 8,
  },
  modalTime: {
    fontSize: 13,
    color: "#999",
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: getFontFamily("400"),
    color: "#333",
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 120,
    marginHorizontal: 20,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
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
  emptyStateText: { fontSize: normalize(22), fontFamily: getFontFamily("800") },
  emptyStateSubtext: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: "#6B7280",
  },
});
