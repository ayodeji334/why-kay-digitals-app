import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getFontFamily, normalize } from "../../constants/settings";
import HalfScreenModal from "../HalfScreenModal";
import { COLORS } from "../../constants/colors";
import { formatAmount } from "../../libs/formatNumber";
import CustomIcon from "../CustomIcon";
import {
  ChevronRightIcon,
  PlusCircleIcon,
  ArrowDownLeftIcon,
} from "../../assets";
import { ArrowRight, ArrowRight2, Eye, EyeSlash } from "iconsax-react-nativejs";
import { useAuthStore } from "../../stores/authSlice";

interface BalanceCardProps {
  balance?: number;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onSeeTransactions?: () => void;
  showTransactionsButton?: boolean;
  currency?: "NGN" | "USD";
  title?: string | undefined;
  showActionButtons?: boolean;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  showTransactionsButton = false,
  currency = "NGN",
  title = "Available Balance",
  showActionButtons = true,
}) => {
  const isShowBalance = useAuthStore(state => state.isShowBalance);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [visible, setVisible] = useState(isShowBalance);
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require("../../assets/wallet-banner.png")}
      style={styles.balanceCard}
    >
      <View style={styles.balanceHeader}>
        <Text style={styles.availableBalance}>{title}</Text>
        {showTransactionsButton && (
          <TouchableOpacity
            onPress={() => navigation.navigate("Transactions" as never)}
            activeOpacity={0.9}
            style={styles.seeTransaction}
          >
            <Text style={styles.seeTransactionText}>See Transaction</Text>
            <ArrowRight2 size={12} color="#fff" />
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
            <EyeSlash variant="Linear" size={20} color="#fff" />
          ) : (
            <Eye variant="Linear" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {showActionButtons && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.depositButton}
            onPress={() => setDepositModalVisible(true)}
          >
            <CustomIcon source={PlusCircleIcon} size={20} />
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
            <CustomIcon source={ArrowDownLeftIcon} size={20} color="#333" />
            <Text style={styles.withdrawText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      )}

      <HalfScreenModal
        isVisible={depositModalVisible}
        onClose={() => setDepositModalVisible(false)}
        title="Deposit"
        description="Which wallet do you want to deposit to?"
        actionButton={() => {
          setDepositModalVisible(false);
          setTimeout(() => navigation.navigate("Deposit" as never), 600);
        }}
        buttonText="Deposit Fiat (Naira Wallet)"
        secondaryButtonText="Crypto Deposit"
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    overflow: "hidden",
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
    color: "#fff",
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
    fontSize: normalize(40),
    fontFamily: getFontFamily(800),
  },
  eyeIcon: {
    marginLeft: 0,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 25,
    padding: 5,
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
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 12,
    gap: 8,
  },
  depositText: {
    color: "#fff",
    fontSize: normalize(18),
    fontFamily: getFontFamily(700),
  },
  withdrawButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
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
