import React, { useMemo, useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  View,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ServicesSection from "../components/Dashboard/ServicesSection";
import { Notification, Scan } from "iconsax-react-nativejs";
import BalanceCard from "../components/Dashboard/BalanceCard";
import { getFontFamily, normalize } from "../constants/settings";
import { useAuthStore } from "../stores/authSlice";
import useAxios from "../api/axios";
import AssetsSection from "../components/Dashboard/AssetsSection";
import CustomLoading from "../components/CustomLoading";
import { getItem } from "../utlis/storage";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants/colors";
import NewsBanner from "../components/NewBanner";

const HomeScreen = () => {
  const { apiGet } = useAxios();
  const { user: userData, setUser } = useAuthStore(state => state);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const restoreUser = JSON.parse(getItem("user") as string);
  const navigation = useNavigation();

  const userAccounts = useMemo(() => {
    if (Array.isArray(userData?.bank_accounts)) {
      return userData?.bank_accounts;
    }

    return [];
  }, [userData?.bank_accounts]);

  const fetchUserAccounts = async () => {
    try {
      setLoading(true);

      const response = await apiGet("users/user/accounts");

      if (response.data?.success) {
        setUser(restoreUser);
        setUser(response.data.data);
      }
    } catch (err: any) {
      setUser({ bank_accounts: [], wallets: [] });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserAccounts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserAccounts();
  };

  const fiatWallet = useMemo(() => {
    if (userData?.wallets) {
      return userData.wallets.find((wallet: any) => wallet?.type === "fiat");
    }
    return null;
  }, [userData]);

  const needsVerification = useMemo(() => {
    return (
      userData?.tier_level === "TIER_0" ||
      !userAccounts?.bank_accounts?.length ||
      userAccounts?.bank_accounts?.length === 0
    );
  }, [userData, userAccounts]);

  return (
    <SafeAreaView edges={["left", "right", "top"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#df8b0cff"]}
            tintColor="#e28b0aff"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
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
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeBack}>Welcome back</Text>
              <Text style={styles.userName}>
                Hi,{" "}
                {(userData?.username
                  ? userData.username.charAt(0).toUpperCase() +
                    userData.username.slice(1)
                  : "") || "User"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                "Coming Soon!",
                "This feature is not available yet. Kindly check back later",
              )
            }
            style={styles.notificationButton}
          >
            <Notification size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <BalanceCard
          balance={fiatWallet?.balance || 0}
          showTransactionsButton={true}
        />

        <AssetsSection />

        {needsVerification && (
          <View style={styles.verificationBanner}>
            <View style={styles.verificationIcon}>
              <Scan size={normalize(22)} color={COLORS.whiteBackground} />
            </View>
            <View style={styles.verificationText}>
              <Text style={styles.verificationTitle}>
                Kindly verify your identity to unlock all the features of the
                app.
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.83}
              onPress={() => navigation.navigate("Verification" as never)}
              style={{
                backgroundColor: COLORS.whiteBackground,
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 7,
              }}
            >
              <Text
                style={{
                  color: COLORS.secondary,
                  fontSize: normalize(15),
                  fontFamily: getFontFamily("400"),
                }}
              >
                View Identity
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <ServicesSection />
        <NewsBanner />
      </ScrollView>
      <CustomLoading loading={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scrollContainer: { flex: 1, paddingHorizontal: 20, paddingBottom: 30 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  profileImage: {
    width: 43,
    height: 43,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  welcomeText: { justifyContent: "center" },
  welcomeBack: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    marginBottom: 2,
    color: "#353535ff",
  },
  userName: {
    fontSize: normalize(22),
    fontFamily: getFontFamily("800"),
    color: "#333",
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
  },
  cryptoSection: { marginBottom: 30 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("700"),
    color: "#333",
  },
  sellAllButton: {
    borderWidth: 1,
    borderColor: "#FFA726",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sellAllText: {
    color: "#FFA726",
    fontSize: normalize(18),
    fontFamily: getFontFamily(700),
  },
  cryptoList: { gap: 12 },
  cryptoCard: {
    backgroundColor: "#EFF7EC",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 200,
  },
  cryptoHeader: { flexDirection: "row", alignItems: "center" },
  cryptoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cryptoSymbol: {
    color: "#fff",
    fontSize: normalize(16),
    fontFamily: getFontFamily("900"),
  },
  cryptoInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cryptoName: {
    fontSize: normalize(15),
    fontFamily: getFontFamily(700),
    color: "#000",
    marginBottom: 4,
  },
  cryptoBalance: {
    fontSize: normalize(16),
    fontFamily: getFontFamily(700),
    color: "#333",
  },
  cryptoAmount: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  rateSection: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  rateLabel: {
    fontSize: normalize(11),
    color: "#666",
    fontFamily: getFontFamily(400),
  },
  rateValue: {
    fontSize: normalize(11),
    fontFamily: getFontFamily(700),
    color: "#333",
  },
  verificationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    gap: 12,
    marginBottom: 20,
  },
  verificationIcon: {
    borderRadius: 20,
    borderColor: "#fff",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 7,
  },
  verificationText: {
    flex: 1,
    flexDirection: "row",
    gap: 5,
  },
  verificationTitle: {
    color: "#fff",
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
  },
  emptyState: {
    borderRadius: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  emptyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6c757d",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyIconText: {
    color: "#fff",
    fontSize: normalize(20),
    fontFamily: getFontFamily(700),
  },
  emptyTitle: {
    fontSize: normalize(15),
    fontFamily: getFontFamily(700),
    color: "#333",
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: normalize(12),
    fontFamily: getFontFamily(400),
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 16,
  },
  emptyButton: {
    backgroundColor: "#FFA726",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: normalize(12),
    fontFamily: getFontFamily(600),
  },
});

export default HomeScreen;
