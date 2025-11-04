import React, { useMemo } from "react";
import { CloseCircle } from "iconsax-react-nativejs";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
  // Share as ShareLib,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import { useNavigation, useRoute } from "@react-navigation/native";
import { formatDate } from "../libs/formatDate";
import { formatAmount } from "../libs/formatNumber";
import { COLORS } from "../constants/colors";
import CustomIcon from "../components/CustomIcon";
import { ShareIcon } from "../assets";

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

  const isSuccess = useMemo(
    () => transaction.status?.toLowerCase() === "successful",
    [transaction.status],
  );

  const StatusIcon = () =>
    isSuccess ? (
      <Image
        source={require("../assets/success.png")}
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
    } catch (error) {}
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

        <View style={{ marginBottom: 20, gap: 0 }}>
          <Text
            allowFontScaling={false}
            maxFontSizeMultiplier={0}
            style={styles.amount}
          >
            {formatAmount(transaction.amount, false, "NGN", 2)}
          </Text>
          <Text
            style={{
              fontSize: normalize(18),
              fontFamily: getFontFamily("400"),
              textAlign: "center",
            }}
          >
            {isSuccess
              ? transaction?.category === "CABLETV"
                ? "Your TV bill payment was successful"
                : transaction?.category === "MOBILEDATA"
                ? "Your data purchase was successful"
                : transaction?.category === "AIRTIME"
                ? "Your airtime purchase was successful"
                : transaction?.category === "REFERRAL_BONUS"
                ? "You’ve received a referral bonus"
                : transaction?.category === "BANK_TRANSFER"
                ? "Your deposit was successful"
                : "Transaction completed successfully"
              : "Transaction failed"}
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
        </View>

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Coming soon",
                "The feature is not available. Kindly check back later ",
              )
            }
            style={styles.headerButton}
          >
            <CustomIcon source={ShareIcon} size={18} color={COLORS.primary} />
            <Text maxFontSizeMultiplier={0} style={styles.headerTitle}>
              Share Receipt
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGoBack} style={styles.goBackButton}>
            <Text
              maxFontSizeMultiplier={0}
              style={[styles.headerTitle, { color: "white" }]}
            >
              Done
            </Text>
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
    width: 50,
    height: 50,
    margin: "auto",
  },
  header: {
    justifyContent: "space-between",
    padding: 16,
    gap: 10,
  },
  networkLogo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
  headerButton: {
    borderColor: COLORS.secondary,
    borderWidth: 1,
    padding: 11,
    flex: 1,
    gap: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  goBackButton: {
    backgroundColor: COLORS.secondary,
    padding: 11,
    flex: 1,
    gap: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: COLORS.primary,
  },
  amount: {
    textAlign: "center",
    marginTop: 4,
    fontSize: normalize(23),
    fontFamily: getFontFamily("800"),
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
  label: { fontSize: normalize(16), fontFamily: getFontFamily("400") },
  value: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("800"),
    flexShrink: 1,
    textAlign: "right",
  },
});

export default TransactionDetailScreen;
