import React from "react";
import {
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getItem, removeItem } from "../utlis/storage";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AppContext";
import Entypo from "@react-native-vector-icons/entypo";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const { setIsAuthenticated } = useAuth();
  const user = getItem("user");
  const userData = JSON.parse(user as string);
  const navigation = useNavigation();

  const handleLogout = async () => {
    removeItem("auth_token");
    removeItem("refresh_token");
    setIsAuthenticated(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "SignIn" as never }],
    });
  };

  const cryptoData = [
    {
      id: 1,
      name: "Bitcoin",
      symbol: "BTC",
      amount: "$119k",
      rate: "₦1,515.00/$",
      icon: "₿",
      color: "#F7931A",
      change: "up",
    },
    {
      id: 2,
      name: "Ethereum",
      symbol: "ETH",
      amount: "$4.30k",
      rate: "₦1,515.00/$",
      icon: "♦",
      color: "#627EEA",
      change: "up",
    },
    {
      id: 3,
      name: "Litecoin",
      symbol: "LTC",
      amount: "$120k",
      rate: "₦145.00/$",
      icon: "Ł",
      color: "#345D9D",
      change: "up",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
              }}
              style={styles.profileImage}
            />
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeBack}>Welcome back</Text>
              <Text style={styles.userName}>Hi, {userData?.fullName}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Entypo name="bell" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.availableBalance}>Available balance</Text>
            <TouchableOpacity activeOpacity={0.9} style={styles.seeTransaction}>
              <Text style={styles.seeTransactionText}>See Transaction</Text>
              <Entypo name="chevron-right" size={16} color="#FFA726" />
            </TouchableOpacity>
          </View>

          <View style={styles.balanceAmount}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.currency}>₦</Text>
              <Text style={styles.amount}>5,886.32</Text>
            </View>
            <TouchableOpacity activeOpacity={0.8} style={styles.eyeIcon}>
              <Entypo name="eye" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity activeOpacity={0.89} style={styles.depositButton}>
              <Entypo name="plus" size={20} color="#000" />
              <Text style={styles.depositText}>Deposit</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} style={styles.withdrawButton}>
              <Entypo name="arrow-down" size={20} color="#333" />
              <Text style={styles.withdrawText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sell Rate Section */}
        <View style={styles.sellRateSection}>
          <View style={styles.sellRateHeader}>
            <Text style={styles.sellRateTitle}>Sell Rate:</Text>
            <TouchableOpacity style={styles.sellAllButton}>
              <Text style={styles.sellAllText}>Sell all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cryptoList}
          >
            {cryptoData.map(crypto => (
              <View key={crypto.id} style={styles.cryptoCard}>
                <View style={styles.cryptoHeader}>
                  <View
                    style={[
                      styles.cryptoIcon,
                      { backgroundColor: crypto.color },
                    ]}
                  >
                    <Text style={styles.cryptoSymbol}>{crypto.icon}</Text>
                  </View>
                  <View style={styles.cryptoInfo}>
                    <View style={styles.cryptoAmount}>
                      <Text style={styles.cryptoName}>{crypto.name}</Text>
                      <Text style={[styles.rateValue, { fontWeight: "400" }]}>
                        {crypto.amount}
                      </Text>
                    </View>

                    {crypto.rate && (
                      <View style={styles.rateSection}>
                        <Text style={styles.rateLabel}>Rate:</Text>
                        <Text style={styles.rateValue}>{crypto.rate}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity activeOpacity={0.9} style={styles.verificationBanner}>
          <View style={styles.verificationIcon}>
            <Entypo name="user" size={19} color="#22C55E" />
          </View>
          <View style={styles.verificationText}>
            <Text style={styles.verificationTitle}>
              Kindly verify your identity to unlock all the features of the app.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout & return to login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "green",
  },
  welcomeText: {
    justifyContent: "center",
  },
  welcomeBack: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  userName: {
    fontSize: width * 0.048,
    fontWeight: "600",
    color: "#333",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    overflow: "hidden",
    backgroundColor: "green",
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  availableBalance: {
    color: "#fff",
    fontSize: width * 0.0342,
  },
  seeTransaction: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeTransactionText: {
    color: "#FFA726",
    fontSize: 14,
    marginRight: 4,
  },
  balanceAmount: {
    flexDirection: "row",
    gap: 29,
    // alignItems: "baseline",
    marginBottom: 20,
  },
  currency: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    marginRight: 5,
  },
  amount: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  eyeIcon: {
    marginLeft: 0,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  depositButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 25,
    paddingVertical: 12,
    gap: 8,
  },
  depositText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
  },
  withdrawButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFA726",
    borderRadius: 25,
    paddingVertical: 12,
    gap: 8,
  },
  withdrawText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  sellRateSection: {
    marginBottom: 30,
  },
  sellRateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sellRateTitle: {
    fontSize: 18,
    fontWeight: "600",
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
    fontSize: 14,
    fontWeight: "500",
  },
  cryptoList: {
    gap: 12,
  },
  cryptoCard: {
    backgroundColor: "#EFF7EC",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
  },
  cryptoHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
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
    fontSize: 16,
    fontWeight: "bold",
  },
  cryptoInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 49,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  cryptoAmount: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    fontSize: 40,
  },
  rateSection: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  rateLabel: {
    fontSize: width * 0.033,
    color: "#666",
  },
  rateValue: {
    fontSize: width * 0.039,
    fontWeight: "700",
    color: "#333",
  },
  verificationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  verificationIcon: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  verificationText: {
    flex: 1,
  },
  verificationTitle: {
    color: "#fff",
    fontSize: width * 0.035,
    fontWeight: "500",
    marginBottom: 2,
  },
  verificationSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
  },
  // Debug styles - remove in production
  logoutButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#ff4444",
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "500",
  },
});

export default HomeScreen;
