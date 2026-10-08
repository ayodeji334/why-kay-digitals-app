import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Notification } from "iconsax-react-nativejs";
import useAxios from "../../hooks/useAxios";
import { AppText } from "../AppText";
import { getFontFamily, normalize } from "../../constants/settings";

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
      {hasUnread && (
        <View style={styles.redDot}>
          <AppText
            style={{
              fontSize: normalize(14),
              color: "white",
              fontFamily: getFontFamily("800"),
            }}
          >
            {data?.unread_count}
          </AppText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  redDot: {
    position: "absolute",
    right: 5,
    top: 4,
    width: 15,
    height: 15,
    borderRadius: 340,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationButton: {
    width: 39,
    height: 39,
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
