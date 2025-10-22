import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { AddCircle, ArrowRight2, Eye, EyeSlash } from "iconsax-react-nativejs";
import Entypo from "@react-native-vector-icons/entypo";
import { useNavigation } from "@react-navigation/native";
import { getFontFamily, normalize } from "../../constants/settings";
import HalfScreenModal from "../HalfScreenModal";
import { COLORS } from "../../constants/colors";
import { formatAmount } from "../../libs/formatNumber";
interface BalanceCardProps {
  balance?: number;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onSeeTransactions?: () => void;
  showTransactionsButton?: boolean;
  currency?: "NGN" | "USD";
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  showTransactionsButton = false,
  currency = "NGN",
}) => {
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <Text style={styles.availableBalance}>Available balance</Text>
        {showTransactionsButton && (
          <TouchableOpacity
            onPress={() => navigation.navigate("Transactions" as never)}
            activeOpacity={0.9}
            style={styles.seeTransaction}
          >
            <Text style={styles.seeTransactionText}>See Transaction</Text>
            <ArrowRight2 size={12} color="#FFB74D" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.balanceAmount}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.amount}>
            {visible
              ? formatAmount(balance ?? 0, false, currency)
              : "**********"}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.eyeIcon}
          onPress={() => setVisible(!visible)}
        >
          {visible ? (
            <EyeSlash size={20} variant="Outline" color="white" />
          ) : (
            <Eye size={20} variant="Outline" color="white" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.depositButton}
          onPress={() => setDepositModalVisible(true)}
        >
          <AddCircle variant="Bold" size={20} color="#000" />
          <Text style={styles.depositText}>Deposit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.withdrawButton}
          onPress={() =>
            Alert.alert(
              "Coming soon",
              "The feature is not available. Kindly check back later",
            )
          }
        >
          <Entypo name="arrow-down" size={20} color="#333" />
          <Text style={styles.withdrawText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      <HalfScreenModal
        isVisible={depositModalVisible}
        onClose={() => setDepositModalVisible(false)}
        title="Deposit"
        description="Which wallet do you want to deposit to?"
        actionButton={() => {
          setDepositModalVisible(false);
          setTimeout(() => navigation.navigate("Deposit" as never), 600);
        }}
        buttonText="Fiat Wallet (Naira Wallet)"
        secondaryButtonText="Crypto Wallet"
        secondaryAction={() => {
          Alert.alert(
            "Coming Soon!",
            "The feature is not available for now. Kindly check back later",
          );
        }}
        showCloseButton={true}
        iconBackgroundColor="#FF4D4D1A"
        iconColor={COLORS.error}
        iconSize={30}
      />

      <HalfScreenModal
        isVisible={withdrawModalVisible}
        onClose={() => setWithdrawModalVisible(false)}
        title="Withdraw"
        description="Which wallet do you want to withdraw from?"
        actionButton={() => {
          setWithdrawModalVisible(false);
        }}
        buttonText="Fiat Wallet (Naira Wallet)"
        secondaryButtonText="Crypto Wallet"
        secondaryAction={() => {
          Alert.alert(
            "Coming Soon!",
            "The feature is not available for now. Kindly check back later",
          );
        }}
        iconBackgroundColor="#FF4D4D1A"
        iconColor={COLORS.error}
        iconSize={30}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    overflow: "hidden",
    backgroundColor: "green",
    gap: 25,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  availableBalance: {
    color: "#fff",
    fontSize: normalize(18),
    fontFamily: getFontFamily(700),
  },
  seeTransaction: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeTransactionText: {
    color: "#FFC954",
    fontSize: normalize(18),
    fontFamily: getFontFamily(700),
    marginRight: 4,
  },
  balanceAmount: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  amount: {
    color: "#fff",
    fontSize: normalize(30),
    fontFamily: getFontFamily(800),
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
    fontSize: normalize(18),
    fontFamily: getFontFamily(700),
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
    fontSize: normalize(18),
    fontFamily: getFontFamily(700),
  },
});

export default BalanceCard;
