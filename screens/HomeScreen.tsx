import {
  StyleSheet,
  ScrollView,
  StatusBar,
  View,
  Image,
  RefreshControl,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ServicesSection from "../components/Dashboard/ServicesSection";
import { ArrowRight2, Scan } from "iconsax-react-nativejs";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { useAuthStore, useUser } from "../stores/authSlice";
// import AssetsSection from "../components/Dashboard/AssetsSection";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants/colors";
import AdvertsBanner from "../components/AdvertsBanner";
import NotificationBell from "../components/Dashboard/NotificationBell";
import FiatWalletBalanceCard from "../components/wallet/FiatWalletBalanceCard";
import { useCallback, useMemo } from "react";
import { useFiatBalance } from "../hooks/useFiatBalance";
import { useQueryClient } from "@tanstack/react-query";
import { AppText } from "../components/AppText";
import { DEFAULT_IMAGE } from "./SettingsScreen";
import { useColors, useResolvedTheme } from "../hooks/useTheme";

const HomeScreen = () => {
  const colors = useColors();
  const user = useUser();
  const navigation = useNavigation();
  const { refetch, isRefetching } = useFiatBalance();
  const queryClient = useQueryClient();
  const refreshUser = useAuthStore(state => state.refreshUser);
  const styles = makeStyles(colors);
  const resolvedTheme = useResolvedTheme();

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

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const raw = user?.username || user?.first_name || "";
  const displayName = raw
    ? raw.charAt(0).toUpperCase() + raw.slice(1)
    : "there";

  useFocusEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["rates"] });
  });

  // Picks up an admin un-suspending (or suspending) the account without
  // requiring the user to log out and back in.
  const handleRefresh = useCallback(() => {
    refetch();
    refreshUser();
  }, [refetch, refreshUser]);

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              style={styles.imageWrapper}
              onPress={() => navigation.navigate("Profile" as never)}
            >
              <Image
                source={
                  user?.selfie_url
                    ? {
                        uri: `data:image/png;base64,${user?.selfie_url}`,
                      }
                    : DEFAULT_IMAGE
                }
                style={styles.profileImage}
                resizeMode="cover"
              />
            </Pressable>
            <View style={styles.welcomeText}>
              <AppText style={styles.welcomeBack}>{greeting}</AppText>
              <AppText style={styles.userName}>{displayName}</AppText>
            </View>
          </View>
          <NotificationBell />
        </View>

        <FiatWalletBalanceCard />

        <AdvertsBanner />

        {/* <AssetsSection /> */}

        {!hasCompleteVerification && (
          <Pressable
            style={styles.verificationBanner}
            onPress={() => navigation.navigate("Verification" as never)}
          >
            <View style={styles.verificationIcon}>
              <Scan size={normalize(20)} color={COLORS.whiteBackground} />
            </View>
            <View style={styles.verificationText}>
              <AppText style={styles.verificationTitle}>
                Kindly complete all KYC verification to unlock all the services
              </AppText>
            </View>
            {/* <TouchableOpacity
              activeOpacity={0.83}
              onPress={() => navigation.navigate("Verification" as never)}
              style={{
                backgroundColor: COLORS.whiteBackground,
                borderRadius: 20,
                paddingHorizontal: normalizeSpacing(18),
                paddingVertical: normalizeSpacing(7),
              }}
            > */}
            <ArrowRight2 size={normalize(20)} color="white" />
          </Pressable>
        )}

        <ServicesSection />
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: normalizeSpacing(20),
      paddingBottom: normalizeSpacing(30),
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: normalizeSpacing(20),
    },
    headerLeft: { flexDirection: "row", alignItems: "center" },
    imageWrapper: {
      width: 40,
      height: 40,
      borderRadius: 25,
      marginRight: normalizeSpacing(12),
      overflow: "hidden",
      backgroundColor: colors.inputBackground,
    },
    profileImage: {
      width: "100%",
      height: "100%",
    },
    welcomeText: { justifyContent: "center" },
    welcomeBack: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.text,
    },
    userName: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    cryptoSection: { marginBottom: normalizeSpacing(30) },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: normalizeSpacing(30),
    },
    sectionTitle: {
      fontSize: normalize(19),
      fontFamily: getFontFamily("700"),
      color: "#333",
    },
    verificationBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.primary,
      borderRadius: 16,
      padding: normalizeSpacing(18),
      gap: 12,
      marginBottom: normalizeSpacing(20),
    },
    verificationIcon: {
      borderRadius: 20,
      borderColor: "#fff",
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: normalizeSpacing(4),
    },
    verificationText: {
      flex: 1,
      flexDirection: "row",
      gap: 5,
    },
    verificationTitle: {
      color: "#fff",
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
    },
    emptyState: {
      borderRadius: 12,
      paddingHorizontal: normalizeSpacing(24),
      alignItems: "center",
    },
    emptyIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: "#6c757d",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: normalizeSpacing(12),
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
      marginBottom: normalizeSpacing(16),
      // lineHeight: 16,
    },
    emptyButton: {
      backgroundColor: "#FFA726",
      paddingHorizontal: normalizeSpacing(20),
      paddingVertical: normalizeSpacing(14),
      borderRadius: 20,
    },
    emptyButtonText: {
      color: "#fff",
      fontSize: normalize(12),
      fontFamily: getFontFamily(600),
    },
  });

export default HomeScreen;
