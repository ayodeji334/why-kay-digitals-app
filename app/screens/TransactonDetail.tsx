import React, { useMemo } from "react";
import { ArrowLeft, CloseCircle, Share, Verify } from "iconsax-react-nativejs";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  // Share as ShareLib,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { normalize } from "../constants/settings";
import { useNavigation, useRoute } from "@react-navigation/native";
import { formatDate } from "../libs/formatDate";
import { formatAmount } from "../libs/formatNumber";
import { COLORS } from "../constants/colors";

const DetailRow: React.FC<{
  label: string;
  value?: string | number;
  color?: string;
}> = ({ label, value, color = "#000" }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, { color }]}>{value ?? "-"}</Text>
  </View>
);

const TransactionDetailScreen = () => {
  const navigation: any = useNavigation();
  const route = useRoute();
  const { transaction }: any = route.params;
  // const viewShotRef = useRef<any>(null);

  const isSuccess = useMemo(
    () => transaction.status?.toLowerCase() === "confirmed",
    [transaction.status],
  );

  const StatusIcon = () =>
    isSuccess ? (
      <Image
        source={require("../assets/success-icon.png")}
        style={styles.networkLogo}
      />
    ) : (
      <CloseCircle size={60} color="#DC2626" variant="Bold" />
    );

  const handleGoBack = async () => {
    try {
      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" as never }],
      });
    } catch (error) {
      console.error("Error sharing transaction:", error);
    }
  };

  const getDirectionColor = () => {
    if (!transaction.direction) return "#000";
    return transaction.direction.toLowerCase() === "debit" ? "#000" : "#000";
  };

  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <StatusIcon />
        </View>

        <View style={{ marginBottom: 24, gap: 4 }}>
          <Text style={styles.statusText}>
            {isSuccess ? "Successful" : "Failed"}
          </Text>
          <Text style={{ fontSize: normalize(12), textAlign: "center" }}>
            {isSuccess
              ? transaction?.service_type == "CABLETV"
                ? "Your TV bill payment was successful"
                : transaction?.service_type == "MOBILEDATA"
                ? "Your data purchase was successful"
                : transaction?.service_type == "AIRTIME"
                ? "Your airtime purchase was successful"
                : "Service delivered successfully"
              : "Service not delivered"}
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <DetailRow
            label="Transaction ID"
            value={transaction.uuid.split("-").join("")}
          />
          <DetailRow
            label="Amount"
            value={formatAmount(transaction.amount, false, "NGN", 2)}
            color={getDirectionColor()}
          />
          <DetailRow
            label="Fee"
            value={formatAmount(transaction.fee, false, "NGN", 2)}
          />
          <DetailRow
            label="Net Amount"
            value={formatAmount(transaction.net_amount, false, "NGN", 2)}
          />
          {/* <DetailRow
            label="Direction"
            value={transaction.direction?.toUpperCase()}
            color={getDirectionColor()}
          /> */}
          <DetailRow label="Wallet" value={transaction.medium?.toUpperCase()} />
          <DetailRow
            label="Status"
            value={isSuccess ? "Successful" : transaction.status}
            color={isSuccess ? "#059669" : "#DC2626"}
          />

          {transaction.status.toUpperCase() !== "FAILED" && (
            <DetailRow label="Description" value={transaction.description} />
          )}
          <DetailRow
            label="Reference"
            value={transaction.reference.split("-").join("")}
          />
          <DetailRow
            label="Occurred At"
            value={formatDate(transaction.occurred_at)}
          />
          {/* <DetailRow
            label="Confirmed At"
            value={formatDate(transaction.confirmed_at)}
          /> */}
        </View>

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <ArrowLeft size={20} color="#000" variant="Bold" />
            <Text style={styles.headerTitle}>Share Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
            <Share size={20} color="#000" />
            <Text>Go back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20 },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    width: 80,
    height: 80,
    margin: "auto",
  },
  header: {
    justifyContent: "space-between",
    padding: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  networkLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerButton: {
    backgroundColor: COLORS.secondary,
    padding: 11,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  headerTitle: { fontSize: normalize(16), fontWeight: "600", color: "#000" },
  statusText: {
    textAlign: "center",
    fontSize: normalize(19),
    fontWeight: "800",
    color: "#000",
  },
  detailsContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  label: { fontSize: normalize(13), fontWeight: "300" },
  value: {
    fontSize: normalize(13),
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },
});

export default TransactionDetailScreen;
