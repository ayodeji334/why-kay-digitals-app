// screens/ProfileScreen.js
import React from "react";
import {
  View,
  Text,
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
import { Copy, CopySuccess } from "iconsax-react-nativejs";
import { showSuccess } from "../utlis/toast";
import { getFontFamily, normalize } from "../constants/settings";
import { useAuthStore } from "../stores/authSlice";
import CustomIcon from "../components/CustomIcon";
import { CopyIcon, DeleteIcon } from "../assets";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const userData = useAuthStore(state => state.user);

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
            paddingLeft: 10,
          }}
        >
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldValue}>{value || "Not set"}</Text>
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
    <SafeAreaView edges={["right", "bottom", "left"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <Image
            source={
              userData?.profile_picture_url
                ? {
                    uri: userData?.profile_picture_url || undefined,
                  }
                : require("../assets/avatar.png")
            }
            style={styles.profileImage}
            resizeMode="center"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {userData?.username
                ? userData.username.charAt(0).toUpperCase() +
                  userData.username.slice(1)
                : ""}{" "}
            </Text>
            <Text style={styles.userEmail}>{userData?.email}</Text>
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsSection}>
          {/* <ProfileField label="Firstname" value={userData?.first_name} />
          <ProfileField
            label="Lastname (Surname)"
            value={userData?.last_name}
          /> */}
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

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>Delete account</Text>
          <CustomIcon source={DeleteIcon} color={COLORS.error} size={16} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  copyButton: {
    marginLeft: 10,
    padding: 6,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: normalize(13),
    fontFamily: getFontFamily("700"),
    textAlign: "center",
    color: COLORS.dark,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: "center",
    padding: 20,
    marginBottom: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 40,
    marginBottom: 12,
    padding: 4,
    backgroundColor: COLORS.lightGray,
  },
  profileInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: normalize(23),
    fontFamily: getFontFamily("800"),
    color: COLORS.dark,
  },
  userEmail: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
    color: COLORS.dark,
  },
  detailsSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: COLORS.lightGray,
    marginBottom: 20,
  },
  fieldContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    gap: 10,
  },
  fieldLabel: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("400"),
    color: COLORS.dark,
  },
  fieldWithOutSeparator: {
    borderBottomWidth: 0,
    borderBottomColor: COLORS.lightGray,
  },
  fieldValue: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: COLORS.dark,
  },
  editButton: {
    backgroundColor: COLORS.secondary,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 38,
    alignItems: "center",
  },
  editButtonText: {
    color: "white",
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
  deleteButton: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 30,
    paddingVertical: 14,
    borderRadius: 38,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.error,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
});
