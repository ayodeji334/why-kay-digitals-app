import React, { useMemo, useState } from "react";
import {
  ScrollView,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigation } from "@react-navigation/native";
import CustomLoading from "../components/CustomLoading";
import SaveAsBeneficiarySwitch from "../components/SaveAsBeneficiarySwitch";
import ConfirmationModal from "../components/ConfirmationModal";
import TabSwitcher, { TabOption } from "../components/TabSwitcher";
import { COLORS } from "../constants/colors";
import { normalize, getFontFamily } from "../constants/settings";
import useAxios from "../hooks/useAxios";
import BalanceCard from "../components/Dashboard/BalanceCard";
import { formatAmount } from "../libs/formatNumber";
import TextInputField from "../components/TextInputField";
import { SelectInput } from "../components/SelectInputField";
import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
import { useWallets } from "../hooks/useWallet";

const fiatSchema = yup.object({
  username: yup.string().required("Username is required"),
  amount: yup
    .number()
    .typeError("Enter a valid amount")
    .min(1000, "Minimum is ₦1,000")
    .max(300000, "Maximum is ₦300,000")
    .required(),
  description: yup.string().optional(),
});

const cryptoSchema = yup.object({
  username: yup.string().required("Username is required"),
  amount: yup
    .number()
    .typeError("Enter a valid amount")
    .min(0.00000001, "Invalid amount")
    .required(),
  asset_id: yup.string().required("Select a cryptocurrency"),
});

export default function TransferScreen() {
  const navigation = useNavigation<any>();
  const { apiGet } = useAxios();
  const [activeTab, setActiveTab] = useState<"fiat" | "crypto">("crypto");
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    data: { wallets, totalAssetValueBalance },
  } = useWallets();
  const [displayAmount, setDisplayAmount] = useState("");

  const userWallets: any[] = useMemo(() => {
    if (!wallets || wallets.length === 0) return [];
    return wallets.map((asset: any) => ({
      ...asset,
      label: asset.asset_name ?? asset.name ?? "",
      value: asset.asset_id ?? asset.uuid ?? "",
      symbol: asset.symbol ?? "",
      logo_url: asset.logo ?? "",
    }));
  }, [wallets]);

  const {
    data: walletSummary,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["wallet-summary"],
    queryFn: async () =>
      (await apiGet("/transactions/user/daily-summary")).data.data,
  });

  const fiatForm = useForm<any>({
    resolver: yupResolver(fiatSchema),
    defaultValues: { username: "", amount: 0, description: "" },
    mode: "onChange",
  });

  const cryptoForm = useForm<any>({
    resolver: yupResolver(cryptoSchema),
    defaultValues: { username: "", amount: 0, asset_id: "" },
    mode: "onChange",
  });

  const form = activeTab === "fiat" ? fiatForm : cryptoForm;

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isValid, isSubmitting },
  } = form;

  const amount = watch("amount") || 0;
  const assetId = watch("asset_id");

  const dailyLimit = walletSummary?.daily_limit ?? 0;

  const exceedsDailyLimit = useMemo(() => {
    if (activeTab !== "fiat") return false;
    if (!amount || !dailyLimit) return false;

    return amount > dailyLimit;
  }, [activeTab, amount, dailyLimit]);

  const fiatBalance = walletSummary?.balance ?? 0;

  const selectedCryptoWallet = useMemo(
    () => userWallets.find(w => w.asset_id === assetId),
    [userWallets, assetId],
  );

  const hasInsufficientBalance = useMemo(() => {
    if (!amount) return false;

    if (activeTab === "fiat") {
      return amount > fiatBalance;
    }

    if (!selectedCryptoWallet) return true;

    return amount > selectedCryptoWallet.balance * selectedCryptoWallet?.price;
  }, [
    amount,
    activeTab,
    fiatBalance,
    selectedCryptoWallet?.balance,
    selectedCryptoWallet?.price,
  ]);

  const progress =
    walletSummary && walletSummary.daily_limit
      ? walletSummary.total_today / walletSummary.daily_limit
      : 0;

  const isDisabled = useMemo(
    () =>
      !isValid ||
      isSubmitting ||
      hasInsufficientBalance ||
      exceedsDailyLimit ||
      amount <= 0,
    [
      isValid,
      isSubmitting,
      hasInsufficientBalance,
      exceedsDailyLimit,
      amount,
      activeTab,
    ],
  );

  const tabOptions: TabOption[] = [
    { value: "crypto", label: "Crypto" },
    { value: "fiat", label: "Fiat" },
  ];

  const onSubmit = (values: any) => {
    let payload: any;

    if (activeTab === "fiat") {
      payload = {
        username: values.username,
        amount: Number(values.amount),
        description: values.description,
        save_as_beneficiary: saveBeneficiary,
        type: "TRANSFER",
        url: "/wallets/user/transfer",
      };

      if (values.amount > 50000) {
        setPendingPayload(payload);
        setShowConfirmModal(true);
        return;
      }
    } else {
      payload = {
        username: values.username,
        amount: Number(values.amount),
        asset_id: values.asset_id,
        type: "CRYPTO_TRANSFER",
        url: "/wallets/user/transfer-crypto",
      };
    }

    navigation.navigate("ConfirmTransaction", { payload });
  };

  const handleProceed = () => {
    setShowConfirmModal(false);
    navigation.navigate("ConfirmTransaction", { payload: pendingPayload });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "fiat" | "crypto");
    reset();
  };

  return (
    <SafeAreaView
      edges={["right", "bottom"]}
      style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <TabSwitcher
        tabs={tabOptions}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        containerStyle={{ backgroundColor: "#f3f3f3ff", marginVertical: 10 }}
        activeTabStyle={{ backgroundColor: COLORS.primary }}
        activeTabTextStyle={{ color: "#fff" }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={async () => {
              setIsRefreshing(true);
              await refetch();
              setIsRefreshing(false);
            }}
            colors={[COLORS.secondary]}
          />
        }
      >
        <BalanceCard
          balance={
            activeTab === "crypto" ? totalAssetValueBalance : fiatBalance
          }
          title="Total Balance"
          showTransactionsButton={false}
          showActionButtons={false}
          currency={activeTab === "crypto" ? "USD" : "NGN"}
        />
        <View style={styles.limitContainer}>
          <View style={styles.limitHeader}>
            <Text style={styles.limitLabel}>
              Daily Limit: ₦
              {walletSummary?.daily_limit?.toLocaleString() || "0"}
            </Text>
            <Text style={styles.upgradeText}>Upgrade Limit</Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(progress * 100, 100)}%` },
              ]}
            />
          </View>

          <View style={styles.limitRange}>
            <Text style={styles.limitValue}>
              {formatAmount(walletSummary?.total_today) || "0"}
            </Text>
            <Text style={styles.limitValue}>
              {formatAmount(walletSummary?.daily_limit) || "0"}
            </Text>
          </View>
        </View>

        <View key={activeTab} style={styles.form}>
          <TextInputField
            key={activeTab}
            label="Username"
            control={control}
            name="username"
            placeholder="Enter receipient username"
          />

          {activeTab === "crypto" && (
            <View style={{ marginVertical: 4 }}>
              <SelectInput
                control={control}
                name="asset_id"
                label="Choose Asset(coin)"
                options={userWallets}
                placeholder="Select an asset(coin)"
                title="Select an asset"
              />
            </View>
          )}

          <View style={{ marginVertical: 4 }}>
            <Text style={styles.label}>
              Amount in {activeTab === "fiat" ? "Naira (₦)" : "Dollars (USD)"}
            </Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onBlur, onChange } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.dollarSign}>
                    {activeTab === "fiat" ? "₦" : "$"}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={displayAmount}
                    placeholder="0.00"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                    onBlur={onBlur}
                    onChangeText={text => {
                      const formatted = formatWithCommas(text);
                      const numeric = parseToNumber(formatted);
                      onChange(numeric);
                      setDisplayAmount(formatted);
                    }}
                  />
                </View>
              )}
            />
          </View>

          {activeTab === "fiat" && (
            <View style={{ marginVertical: 4 }}>
              <TextInputField
                label="Narration"
                control={control}
                name="description"
                placeholder="Enter description"
              />
            </View>
          )}
        </View>
        {activeTab === "crypto" && selectedCryptoWallet?.symbol && (
          <View style={{ flexDirection: "row", gap: 5 }}>
            <Text style={styles.limitValue}>
              Your {selectedCryptoWallet?.symbol} Wallet Balance and USD Value:
            </Text>
            <Text style={{ flexDirection: "row", gap: 10 }}>
              <Text style={styles.limitValue}>
                {selectedCryptoWallet?.balance} {selectedCryptoWallet?.symbol}
              </Text>
              <Text style={styles.limitValue}> = </Text>
              <Text style={styles.limitValue}>
                {formatAmount(
                  selectedCryptoWallet?.balance * selectedCryptoWallet?.price,
                  false,
                  "USD",
                ) || "0"}
              </Text>
            </Text>
          </View>
        )}

        {exceedsDailyLimit && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              This amount exceeds your daily transfer limit of{" "}
              {formatAmount(walletSummary?.daily_limit ?? 0)}. Please reduce the
              amount or upgrade your limit.
            </Text>
          </View>
        )}

        {!exceedsDailyLimit && hasInsufficientBalance && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              You do not have enough balance to complete this transfer.
            </Text>
          </View>
        )}

        {activeTab === "fiat" && (
          <SaveAsBeneficiarySwitch
            value={saveBeneficiary}
            onValueChange={setSaveBeneficiary}
            disabled={isSubmitting}
          />
        )}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSubmit(onSubmit)}
          disabled={isDisabled}
          style={{
            backgroundColor: isDisabled ? COLORS.fadePrimary : COLORS.secondary,
            borderRadius: 100,
            paddingVertical: 16,
            marginVertical: 30,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: normalize(18),
              textAlign: "center",
              fontFamily: getFontFamily("700"),
              opacity: isDisabled ? 0.4 : 1,
            }}
          >
            Continue
          </Text>
        </TouchableOpacity>
        <CustomLoading loading={isFetching} />
      </ScrollView>

      {activeTab === "fiat" && (
        <ConfirmationModal
          data={{ amount }}
          showConfirmModal={showConfirmModal}
          setShowConfirmModal={setShowConfirmModal}
          handleProceed={handleProceed}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  limitContainer: {
    marginVertical: 10,
    backgroundColor: "#EFF7EC",
    padding: 10,
    borderRadius: 10,
  },
  warningContainer: {
    marginVertical: 12,
    padding: 10,
    backgroundColor: "rgba(255, 0, 0, 0.03)",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.3)",
  },
  warningText: {
    color: "#db0b0bff",
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    textAlign: "center",
  },
  form: { marginVertical: 10 },
  label: {
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: normalize(8),
    paddingHorizontal: normalize(16),
    marginBottom: normalize(10),
    gap: 5,
  },
  dollarSign: {
    fontSize: normalize(26),
    fontFamily: getFontFamily("700"),
    color: "#000",
    marginRight: normalize(5),
  },
  input: {
    flex: 1,
    paddingVertical: normalize(16),
    fontSize: normalize(26),
    fontFamily: getFontFamily("700"),
    color: "#000",
  },
  limitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  limitLabel: {
    fontSize: normalize(18),
    color: "#000",
    fontFamily: getFontFamily("700"),
  },
  upgradeText: {
    fontSize: normalize(18),
    color: COLORS.secondary,
    fontFamily: getFontFamily("700"),
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginTop: 18,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 3,
  },
  limitRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  limitValue: {
    fontFamily: getFontFamily("800"),
    fontSize: normalize(18),
  },
});
