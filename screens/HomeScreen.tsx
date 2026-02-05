import {
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  View,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ServicesSection from "../components/Dashboard/ServicesSection";
import { Scan } from "iconsax-react-nativejs";
import { getFontFamily, normalize } from "../constants/settings";
import { useUser } from "../stores/authSlice";
import AssetsSection from "../components/Dashboard/AssetsSection";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants/colors";
import AdvertsBanner from "../components/AdvertsBanner";
import NotificationBell from "../components/Dashboard/NotificationBell";
import FiatWalletBalanceCard from "../components/wallet/FiatWalletBalanceCard";
import { useMemo } from "react";
import { useFiatBalance } from "../hooks/useFiatBalance";

const HomeScreen = () => {
  const user = useUser();
  const navigation = useNavigation();
  const { refetch, isRefetching } = useFiatBalance();

  const hasCompleteVerification = useMemo(
    () =>
      user?.nin_verification_status === "VERIFIED" &&
      user?.bvn_verification_status === "VERIFIED" &&
      user?.selfie_verification_status === "VERIFIED",
    [
      user?.nin_verification_status,
      user?.bvn_verification_status,
      user?.selfie_verification_status,
    ],
  );

  return (
    <SafeAreaView edges={["left", "right", "top"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={
                user?.profile_picture_url
                  ? {
                      uri: user?.profile_picture_url || undefined,
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
                {(user?.username
                  ? user.username.charAt(0).toUpperCase() +
                    user.username.slice(1)
                  : "") || "User"}
              </Text>
            </View>
          </View>
          <NotificationBell />
        </View>

        <FiatWalletBalanceCard />

        <AssetsSection />

        {!hasCompleteVerification && (
          <View style={styles.verificationBanner}>
            <View style={styles.verificationIcon}>
              <Scan size={normalize(20)} color={COLORS.whiteBackground} />
            </View>
            <View style={styles.verificationText}>
              <Text style={styles.verificationTitle}>
                Kindly complete all KYC verification to unlock all the services
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.83}
              onPress={() => navigation.navigate("Verification" as never)}
              style={{
                backgroundColor: COLORS.whiteBackground,
                borderRadius: 20,
                paddingHorizontal: 18,
                paddingVertical: 7,
              }}
            >
              <Text
                style={{
                  color: COLORS.secondary,
                  fontSize: normalize(16),
                  fontFamily: getFontFamily("800"),
                }}
              >
                Verify Identity
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <ServicesSection />
        <AdvertsBanner />
      </ScrollView>
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
    width: 36,
    height: 36,
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
    padding: 4,
  },
  verificationText: {
    flex: 1,
    flexDirection: "row",
    gap: 5,
  },
  verificationTitle: {
    color: "#fff",
    fontSize: normalize(17),
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
