import React, { useState } from "react";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { normalize, width } from "../constants/settings";
import HalfScreenModal from "../components/HalfScreenModal";
import { useNavigation } from "@react-navigation/native";
import { UserRemove } from "iconsax-react-nativejs";
import { removeItem } from "../utlis/storage";
import { showError } from "../utlis/toast";
import CustomLoading from "../components/CustomLoading";
import useAxios from "../api/axios";
import { useAuthStore } from "../stores/authSlice";

const deleteReasons = [
  "I no longer need the account",
  "I receive too many emails/notifications",
  "Account was hacked or compromised",
  "I have multiple accounts",
  "I am dissatisfied with customer support",
  "I don't trust the platform",
  "I found a better alternative",
  "I am concerned about data security and privacy",
  "I don't use the account frequently",
  "Other reason",
];

export default function DeleteAccountScreen() {
  const { post } = useAxios();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherReasonText, setOtherReasonText] = useState("");
  const navigation = useNavigation();
  const { setIsAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleDeletePress = () => setModalVisible(true);

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      const reason =
        selectedReason === "Other reason" ? otherReasonText : selectedReason;

      const response = await post("users/delete-user-account", {
        reason,
      });

      if (response.data?.success) {
        setLoading(false);
        removeItem("auth_token");
        removeItem("refresh_token");
        removeItem("user");
        setIsAuthenticated(false);
        navigation.reset({
          index: 0,
          routes: [{ name: "SignIn" as never }],
        });
      } else {
        showError(response.data?.message || "Failed to delete your account");
      }
    } catch (error: any) {
      if (error.response) {
        showError(
          error.response.data?.message ||
            "An error occurred while deleting your account",
        );
      } else if (error.request) {
        showError(
          "No response from server. Please check your internet connection.",
        );
      } else {
        showError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderReason = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.reasonItem,
        selectedReason === item && {
          borderColor: COLORS.primary,
          backgroundColor: "#f0f9ff",
        },
      ]}
      onPress={() => setSelectedReason(item)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.reasonText,
          selectedReason === item && {
            color: COLORS.primary,
            fontWeight: "600",
          },
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={deleteReasons}
        keyExtractor={item => item}
        renderItem={renderReason}
        contentContainerStyle={styles.contentContainer}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.subtitle}>
              Deleting your account will remove all your data permanently. This
              action cannot be undone. Please let us know the reason for leaving
              before proceeding.
            </Text>
          </View>
        }
        ListFooterComponent={
          <>
            {selectedReason === "Other reason" && (
              <TextInput
                style={styles.textArea}
                placeholder="Write your reason..."
                value={otherReasonText}
                onChangeText={setOtherReasonText}
                multiline
                numberOfLines={100}
              />
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.deleteButton,
                !selectedReason ||
                (selectedReason === "Other reason" && !otherReasonText)
                  ? { backgroundColor: COLORS.gray, opacity: 0.6 }
                  : {},
              ]}
              disabled={
                !selectedReason ||
                (selectedReason === "Other reason" && !otherReasonText)
              }
              onPress={handleDeletePress}
            >
              <Text style={styles.deleteButtonText}>Delete My Account</Text>
            </TouchableOpacity>
          </>
        }
      />

      <HalfScreenModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Confirm Deletion"
        description="Are you sure you want to delete your account? This action cannot be undone."
        buttonText="Yes, Delete My Account"
        actionButton={() => {
          setModalVisible(false);
          setTimeout(() => handleConfirmDelete(), 600);
        }}
        secondaryButtonText="Cancel"
        secondaryAction={() => setModalVisible(false)}
        iconBackgroundColor="#FF4D4D1A"
        iconColor={COLORS.error}
        IconComponent={UserRemove}
        iconSize={30}
      />

      <CustomLoading loading={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: normalize(12),
    fontWeight: "700",
    marginBottom: 8,
    color: COLORS.darkBackground,
  },
  subtitle: {
    fontSize: normalize(11),
    fontWeight: "300",
    color: COLORS.dark,
    lineHeight: 20,
  },
  reasonItem: {
    borderWidth: 1,
    borderColor: "#D2D2D2",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F9FAFB",
  },
  reasonText: {
    fontSize: normalize(11),
    color: COLORS.dark,
    fontWeight: "400",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#D2D2D2",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F9FAFB",
    marginTop: 10,
    textAlignVertical: "top",
    fontSize: normalize(11),
    color: COLORS.dark,
    minHeight: 100,
  },
  deleteButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 38,
    alignItems: "center",
    marginTop: 40,
  },
  deleteButtonText: {
    color: "black",
    fontWeight: "600",
    fontSize: normalize(11),
  },
});
