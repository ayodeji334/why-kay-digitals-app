import React, { useState } from "react";
import {
  FlatList,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import HalfScreenModal from "../components/HalfScreenModal";
import { removeItem } from "../utlis/storage";
import { showError } from "../utlis/toast";
import CustomLoading from "../components/CustomLoading";
import { useAuthStore } from "../stores/authSlice";
import CustomIcon from "../components/CustomIcon";
import { AccountDeleteIcon } from "../assets";
import useAxios from "../hooks/useAxios";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";

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
  const { setIsAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const colors = useColors();
  const styles = makeStyles(colors);

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
        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: "SignIn" as never }],
        // });
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

  const renderReason = ({ item }: { item: string }) => {
    return (
      <TouchableOpacity
        style={[
          styles.reasonItem,
          selectedReason === item && {
            borderColor: COLORS.primary,
            backgroundColor: colors.inputBackground,
          },
        ]}
        onPress={() => setSelectedReason(item)}
        activeOpacity={0.7}
      >
        <AppText
          style={[
            styles.reasonText,
            selectedReason === item && {
              color: COLORS.primary,
              fontFamily: getFontFamily("700"),
            },
          ]}
        >
          {item}
        </AppText>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <FlatList
        data={deleteReasons}
        keyExtractor={item => item}
        renderItem={renderReason}
        contentContainerStyle={styles.contentContainer}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={
          <View style={{ marginBottom: 20 }}>
            <AppText style={styles.subtitle}>
              Deleting your account will remove all your data permanently. This
              action cannot be undone. Please let us know the reason for leaving
              before proceeding.
            </AppText>
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
                maxFontSizeMultiplier={1}
                allowFontScaling={false}
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
              <AppText style={styles.deleteButtonText}>
                Delete My Account
              </AppText>
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
        secondaryButtonText="Close"
        secondaryAction={() => setModalVisible(false)}
        iconBackgroundColor="#FF4D4D1A"
        iconColor={COLORS.error}
        IconComponent={
          <CustomIcon source={AccountDeleteIcon} size={24} color="#0a580dff" />
        }
        iconSize={30}
        isDangerous={true}
      />

      <CustomLoading loading={loading} />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    subtitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.text,
      lineHeight: 20,
    },
    reasonItem: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 15,
      backgroundColor: colors.inputBackground,
    },
    reasonText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: colors.text,
    },
    textArea: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      backgroundColor: colors.inputBackground,
      marginTop: 10,
      textAlignVertical: "top",
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: colors.text,
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
      color: "white",
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
    },
  });
