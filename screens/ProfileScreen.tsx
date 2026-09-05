import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useNavigation } from "@react-navigation/native";
import Clipboard from "@react-native-clipboard/clipboard";
import { showSuccess } from "../utlis/toast";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { useAuthStore } from "../stores/authSlice";
import CustomIcon from "../components/CustomIcon";
import { CopyIcon, DeleteIcon } from "../assets";
import { AppText } from "../components/AppText";
import { DEFAULT_IMAGE } from "./SettingsScreen";
import { capitalizeFirst } from "../libs/helpers";
import { useColors } from "../hooks/useTheme";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const userData = useAuthStore(state => state.user);
  const colors = useColors();
  const styles = makeStyles(colors);

  const handleEditProfile = () => {
    navigation.navigate("EditProfile" as unknown as never);
  };

  const handleDeleteAccount = () => {
    navigation.navigate("DeleteAccount" as unknown as never);
  };

  const ProfileField = ({ label, value, isCopy, isLast }: any) => {
    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopy = () => {
      if (value) {
        Clipboard.setString(value);
        showSuccess("Copied to clipboard!");
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1400);
      }
    };

    return (
      <View
        style={[styles.fieldContainer, isLast && styles.fieldWithOutSeparator]}
      >
        <View
          style={{
            gap: 2,
            paddingLeft: normalizeSpacing(10),
          }}
        >
          <AppText style={styles.fieldLabel}>{label}</AppText>
          <AppText style={styles.fieldValue}>{value || "Not set"}</AppText>
        </View>
        {isCopy && value && (
          <TouchableOpacity
            activeOpacity={0.87}
            onPress={handleCopy}
            style={styles.copyButton}
          >
            {isCopied ? (
              <CustomIcon source={CopyIcon} size={16} color="#0a580dff" />
            ) : (
              <CustomIcon source={CopyIcon} size={16} color="#0a580dff" />
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.imageWrapper}>
            <Image
              source={
                userData?.selfie_url
                  ? {
                      uri: `data:image/png;base64,${userData?.selfie_url}`,
                    }
                  : DEFAULT_IMAGE
              }
              style={styles.profileImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.profileInfo}>
            <AppText style={styles.userName}>
              {userData?.username ? capitalizeFirst(userData.username) : ""}
            </AppText>
            <AppText style={styles.userEmail}>{userData?.email}</AppText>
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsSection}>
          <ProfileField label="Firstname" value={userData?.first_name} />
          <ProfileField label="Lastname" value={userData?.last_name} />
          <ProfileField
            label="Username"
            value={userData?.username}
            isCopy={true}
          />
          <ProfileField label="Gender" value={userData?.gender} />
          <ProfileField
            label="Phone number"
            value={userData?.phone_number}
            isCopy={true}
          />
          <ProfileField
            label="Email address"
            value={userData?.email}
            isLast={true}
            isCopy={true}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.89}
          style={styles.editButton}
          onPress={handleEditProfile}
        >
          <AppText style={styles.editButtonText}>Edit Details</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.89}
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <AppText style={styles.deleteButtonText}>Delete account</AppText>
          <CustomIcon
            source={DeleteIcon}
            overrideColor
            color={colors.error}
            size={16}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    copyButton: {
      marginLeft: normalizeSpacing(10),
      padding: normalizeSpacing(6),
    },
    header: {
      paddingHorizontal: normalizeSpacing(20),
      paddingVertical: normalizeSpacing(16),
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    headerTitle: {
      fontSize: normalize(13),
      fontFamily: getFontFamily("700"),
      textAlign: "center",
      color: colors.text,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: normalizeSpacing(20),
    },
    profileHeader: {
      alignItems: "center",
      padding: normalizeSpacing(20),
      marginBottom: normalizeSpacing(20),
    },
    imageWrapper: {
      width: 90,
      height: 90,
      borderRadius: 2500,
      marginRight: normalizeSpacing(12),
      overflow: "hidden",
      backgroundColor: "#f0f0f0",
      marginBottom: normalizeSpacing(6),
    },
    profileImage: {
      width: "100%",
      height: "100%",
    },
    profileInfo: {
      alignItems: "center",
    },
    userName: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    userEmail: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.text,
    },
    detailsSection: {
      backgroundColor: colors.infoCardBackgroundColor,
      borderRadius: 10,
      borderWidth: 0.5,
      borderColor: colors.border,
      marginBottom: normalizeSpacing(20),
    },
    fieldContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: normalizeSpacing(16),
      paddingHorizontal: normalizeSpacing(10),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 10,
    },
    fieldLabel: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.text,
    },
    fieldWithOutSeparator: {
      borderBottomWidth: 0,
      borderBottomColor: COLORS.lightGray,
    },
    fieldValue: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    editButton: {
      backgroundColor: COLORS.secondary,
      marginTop: normalizeSpacing(20),
      paddingVertical: normalizeSpacing(14),
      borderRadius: 38,
      alignItems: "center",
    },
    editButtonText: {
      color: "white",
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
    },
    deleteButton: {
      marginTop: normalizeSpacing(12),
      marginBottom: normalizeSpacing(30),
      paddingVertical: normalizeSpacing(14),
      borderRadius: 38,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.error,
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    deleteButtonText: {
      color: colors.error,
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
    },
  });
