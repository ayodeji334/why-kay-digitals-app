import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../stores/authSlice";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import { InfoCircle } from "iconsax-react-nativejs";
import InfoCard from "../components/InfoCard";
import { formatAmount } from "../libs/formatNumber";

const DepositScreen = () => {
  const navigation: any = useNavigation();
  const user = useAuthStore(state => state.user);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");

  const transactionLimits: any = {
    TIER_0: { max: 0, description: "Verify BVN to unlock limits" },
    TIER_1: { max: 100000, description: "Max: ₦100,000 per transaction" },
    TIER_2: { max: 500000, description: "Max: ₦500,000 per transaction" },
    TIER_3: { max: 1000000, description: "Max: ₦1,000,000 per transaction" },
  };

  const currentTierLimit = transactionLimits[user?.tier_level || "TIER_0"];
  const maxAmount = currentTierLimit.max;

  const validateAmount = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");

    if (numericValue && maxAmount > 0) {
      const amountNum = parseFloat(numericValue);
      if (amountNum > maxAmount) {
        setAmountError(
          `Maximum deposit amount is ₦${maxAmount.toLocaleString()}`,
        );
      } else {
        setAmountError("");
      }
    } else {
      setAmountError("");
    }

    return numericValue;
  };

  const handleAmountChange = (text: string) => {
    const numericValue = validateAmount(text);
    setAmount(numericValue);
  };

  const handleContinue = () => {
    const amountNum = parseFloat(amount);
    if (amountNum > maxAmount) {
      Alert.alert(
        "Amount Exceeds Limit",
        `Your current tier allows maximum deposits of ₦${maxAmount.toLocaleString()} per transaction.`,
        [{ text: "OK" }],
      );
      return;
    }

    if (amountNum <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid deposit amount.", [
        { text: "OK" },
      ]);
      return;
    }

    navigation.navigate("BankTransfer" as never, { amount, currency: "NGN" });
  };

  console.log(user);

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.container}>
      <>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              How much would you like to deposit?
            </Text>

            <TextInput
              style={[
                styles.amountInput,
                amountError && styles.amountInputError,
              ]}
              placeholder={`Enter amount up to ₦${maxAmount.toLocaleString()}`}
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={amount}
              onChangeText={handleAmountChange}
            />

            {amountError ? (
              <Text style={styles.errorText}>{amountError}</Text>
            ) : (
              amount && (
                <Text style={styles.amountDisplay}>
                  {formatAmount(parseFloat(amount), { currency: "USD" })}
                </Text>
              )
            )}

            {amount && maxAmount > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          (parseFloat(amount) / maxAmount) * 100,
                          100,
                        )}%`,
                        backgroundColor:
                          parseFloat(amount) > maxAmount
                            ? "#EF4444"
                            : "#22C55E",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.min(
                    (parseFloat(amount) / maxAmount) * 100,
                    100,
                  ).toFixed(0)}
                  % of your limit
                </Text>
              </View>
            )}

            {(user?.tier_level === "TIER_1" ||
              user?.tier_level === "TIER_2") && (
              <InfoCard
                IconComponent={<InfoCircle />}
                title="Want higher limits?"
                description="Complete additional verification to increase your transaction limits up to ₦1,000,000"
              />
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomButtonWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.continueButton,
              (!amount || amountError) && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!amount || !!amountError}
          >
            <Text style={styles.continueButtonText}>Continue to Deposit</Text>
          </TouchableOpacity>
        </View>
      </>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 10 },
  scrollCentered: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  section: { marginTop: 0 },
  sectionTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
    marginBottom: 16,
  },
  errorText: {
    color: "red",
    paddingVertical: 10,
    fontSize: normalize(10),
  },
  amountInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: normalize(16),
    color: "#000",
    backgroundColor: "#F8F9FA",
  },
  amountInputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  amountDisplay: {
    fontSize: normalize(28),
    fontFamily: getFontFamily("700"),
    color: COLORS.primary,
    marginVertical: 20,
    textAlign: "center",
  },
  progressContainer: { marginTop: 12 },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#3c3c3c",
    textAlign: "center",
  },
  bottomButtonWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: "#fff",
  },
  continueButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 89,
    alignItems: "center",
  },
  continueButtonDisabled: { backgroundColor: "#ccc" },
  continueButtonText: {
    color: "#fff",
    fontSize: normalize(17),
    fontFamily: getFontFamily("700"),
  },
  emptyState: {
    backgroundColor: "#EFF7EC",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 16,
  },
  emptyButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 110,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
});

export default DepositScreen;
