import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Notification } from "iconsax-react-nativejs";
import useAxios from "../../hooks/useAxios";

const NotificationBell = () => {
  const navigation = useNavigation();
  const { apiGet } = useAxios();

  const { data } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      const response = await apiGet("/notifications/has-unread");
      return response.data?.data;
    },
    staleTime: 2000,
  });

  const hasUnread = data?.has_unread ?? false;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate("Notifications" as never)}
      style={styles.notificationButton}
    >
      <Notification size={20} color="#333" />
      {hasUnread && <View style={styles.redDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  redDot: {
    position: "absolute",
    right: 9,
    top: 6,
    width: 8,
    height: 8,
    borderRadius: 34,
    backgroundColor: "red",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BBBBBB",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
});

export default NotificationBell;
