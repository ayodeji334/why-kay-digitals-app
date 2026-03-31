import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigation, RouteProp, useRoute } from "@react-navigation/native";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomLoading from "../components/CustomLoading";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";
import { formatWithCommas, parseToNumber } from "./SwapCryptoScreen";
import TextInputField from "../components/TextInputField";
import NoWallet from "../components/NoWallet";
import InfoCard from "../components/InfoCard";
import { InfoCircle, ScanBarcode } from "iconsax-react-nativejs";
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from "react-native-vision-camera";
import { formatAmount } from "../libs/formatNumber";
import { SelectInput } from "../components/SelectInputField";
import { TradeIntent } from "../libs/types";

type CryptoSellScreenParams = {
  CryptoSell: {
    intent: TradeIntent;
  };
};

const schema = Yup.object().shape({
  amount: Yup.number()
    .min(6, "Minimum amount is 6 USD")
    .positive("Amount must be greater than 0")
    .typeError("Enter a valid amount")
    .required("Amount is required"),
  wallet_address: Yup.string().required("Wallet address is required"),
  asset_id: Yup.string().required(),
  chain: Yup.string().required("Please select a network"),
});

type FormValues = {
  amount: number;
  wallet_address: string;
  asset_id: string;
  chain: string;
};

export default function SendScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<CryptoSellScreenParams, "CryptoSell">>();
  const { apiGet, post } = useAxios();

  const { intent } = route.params;
  const selectedAssetUuid = intent?.assetId ?? "";
  const scannedValueRef = useRef<string | null>(null);
  const isProcessingRef = useRef(false);
  const [displayAmount, setDisplayAmount] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const device = useCameraDevice("back");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: parseFloat(intent?.amount ?? "0"),
      asset_id: selectedAssetUuid,
      wallet_address: "",
      chain: "",
    },
    mode: "onChange",
  });

  const amount = watch("amount");

  const requestCameraPermission = async () => {
    const status = await Camera.requestCameraPermission();

    if (status === "denied") {
      Alert.alert(
        "Camera Permission Required",
        "Please allow camera access to scan QR codes.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }

    setShowScanner(true);
  };

  const {
    data: assetDetails,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["crypto-detail", selectedAssetUuid],
    queryFn: async () => {
      if (!selectedAssetUuid) return null;
      const res = await apiGet(`/wallets/${selectedAssetUuid}`);
      return res?.data?.data ?? null;
    },
    enabled: !!selectedAssetUuid,
  });

  const balance = Number(assetDetails?.balance ?? 0);
  const marketPrice = Number(assetDetails?.market_current_value ?? 0);
  const symbol = assetDetails?.symbol ?? "";
  const balanceInUsd = balance * marketPrice;

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: codes => {
      const value = codes[0]?.value;
      if (value) {
        setValue("wallet_address", value, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setShowScanner(false);
      }
    },
  });

  useEffect(() => {
    if (!showScanner) return;

    const interval = setInterval(() => {
      if (scannedValueRef.current) {
        setValue("wallet_address", scannedValueRef.current, {
          shouldValidate: true,
          shouldDirty: true,
        });
        scannedValueRef.current = null;
        isProcessingRef.current = false;
        setShowScanner(false);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [showScanner, setValue]);

  const networkOptions = useMemo(() => {
    if (
      !assetDetails?.available_chains ||
      !Array.isArray(assetDetails?.available_chains)
    ) {
      return [];
    }

    const chains = assetDetails?.available_chains ?? [];

    return chains
      .filter((chain: any) => chain.withdraw_enabled)
      .map((chain: any) => ({
        ...chain,
        label: `${chain?.chain} (${chain.chain_type?.toUpperCase()})`,
        value: chain?.chain,
      }));
  }, [assetDetails?.available_chains]);

  const selectedChain = watch("chain");

  const selectedNetwork = useMemo(() => {
    return networkOptions.find((n: any) => n.value === selectedChain) ?? null;
  }, [networkOptions, selectedChain]);

  const feeBreakdown = useMemo(() => {
    if (!selectedNetwork || !amount || amount <= 0 || marketPrice <= 0)
      return null;

    const precision = selectedNetwork.min_accuracy ?? 6;

    // Convert USD input to coin
    const coinAmount = amount / marketPrice;

    // Bybit flat fee in coin
    const bybitFeeCoin = parseFloat(selectedNetwork.withdraw_fee ?? "0");

    // Platform fee: $1 USD converted to coin
    const platformFeeCoin = 1 / marketPrice;

    // Total fee in coin
    const totalFeeCoin = bybitFeeCoin + platformFeeCoin;

    // What recipient actually receives
    const coinAmountAfterFee = coinAmount - totalFeeCoin;

    // What is sent to Bybit (recipient amount + bybit fee so they deduct from it)
    const coinAmountToBybit = coinAmountAfterFee + bybitFeeCoin;

    // USD equivalents
    const bybitFeeUsd = bybitFeeCoin * marketPrice;
    const platformFeeUsd = 1; // always $1
    const totalFeeUsd = totalFeeCoin * marketPrice;
    const usdAmountAfterFee = coinAmountAfterFee * marketPrice;

    const isBelowMinimum =
      coinAmountAfterFee < parseFloat(selectedNetwork.withdraw_min ?? "0");
    const isTooSmall = coinAmountAfterFee <= 0;

    return {
      coinAmount: coinAmount.toFixed(precision),
      bybitFeeCoin: bybitFeeCoin.toFixed(precision),
      platformFeeCoin: platformFeeCoin.toFixed(precision),
      totalFeeCoin: totalFeeCoin.toFixed(precision),
      coinAmountAfterFee: coinAmountAfterFee.toFixed(precision),
      coinAmountToBybit: coinAmountToBybit.toFixed(precision),
      bybitFeeUsd: bybitFeeUsd.toFixed(2),
      platformFeeUsd: platformFeeUsd.toFixed(2),
      totalFeeUsd: totalFeeUsd.toFixed(2),
      usdAmountAfterFee: usdAmountAfterFee.toFixed(2),
      withdrawMin: selectedNetwork.withdraw_min,
      isBelowMinimum,
      isTooSmall,
    };
  }, [selectedNetwork, amount, marketPrice]);

  useEffect(() => {
    if (networkOptions.length === 1) {
      setValue("chain", networkOptions[0].value, { shouldValidate: true });
    }
  }, [networkOptions, setValue]);

  const hasInsufficientBalance = useMemo(() => {
    if (!amount || !assetDetails) return false;
    return amount > balanceInUsd;
  }, [amount, balanceInUsd, assetDetails]);

  const canSubmit = isValid && !hasInsufficientBalance && amount > 0;

  const { mutate: initiateWithdrawal, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await post("/crypto/user/initiate-withdraw", {
        asset_id: values.asset_id,
        wallet_address: values.wallet_address,
        amount: values.amount,
        chain: values.chain,
      });
      return res?.data;
    },
    onSuccess: (_, values) => {
      navigation.navigate("ConfirmCryptoWithdrawTransaction", {
        payload: {
          ...values,
          url: "/crypto/withdraw/confirm",
        },
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ??
        "Something went wrong. Please try again.";
      Alert.alert("Withdrawal Failed", message);
    },
  });

  const onSubmit = (values: FormValues) => {
    initiateWithdrawal(values);
  };

  if (showScanner) {
    if (!device) {
      Alert.alert("Error", "No back camera found on this device.");
      setShowScanner(false);
      return null;
    }

    return (
      <View style={{ flex: 1 }}>
        <Camera
          device={device}
          isActive={showScanner}
          photo={false}
          audio={false}
          video={false}
          codeScanner={codeScanner}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity
          style={styles.closeScannerButton}
          onPress={() => setShowScanner(false)}
        >
          <Text style={styles.closeScannerText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "right", "left"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={() => refetch()} />
        }
      >
        {!assetDetails?.wallet_id ? (
          <NoWallet selectedAssetUuid={selectedAssetUuid} onSuccess={refetch} />
        ) : (
          <View style={styles.container}>
            <View style={{ gap: 10, flex: 1 }}>
              <View>
                <Text style={styles.label}>
                  Enter the amount you want to send
                </Text>

                <Controller
                  control={control}
                  name="amount"
                  render={({ field: { onBlur, onChange } }) => (
                    <View style={styles.inputContainer}>
                      <Text style={styles.dollarSign}>$</Text>
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

                {errors.amount && (
                  <Text style={styles.error}>{errors.amount.message}</Text>
                )}

                {/* FIX: removed stray `{}` */}
                <Text style={styles.walletBalance}>
                  Wallet Balance: {balance} {symbol}
                  {" ≈ "}
                  {formatAmount(balanceInUsd, { currency: "USD" })}
                </Text>
              </View>
              <View style={styles.walletAddressRow}>
                <View style={{ flex: 1 }}>
                  <TextInputField
                    label="Wallet Address"
                    control={control}
                    name="wallet_address"
                    placeholder="Enter destination wallet address"
                  />
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.scanButton}
                  onPress={requestCameraPermission}
                >
                  <ScanBarcode size={22} color="#fff" />
                </TouchableOpacity>
              </View>

              <SelectInput
                control={control}
                name="chain"
                label="Select Network"
                title="Select withdrawal network"
                placeholder={
                  networkOptions.length === 0
                    ? "No networks available"
                    : "Select a network"
                }
                options={networkOptions}
              />

              {feeBreakdown && (
                <View style={styles.feeBreakdownContainer}>
                  <Text style={styles.feeBreakdownTitle}>Fee Breakdown</Text>

                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>You Send</Text>
                    <Text style={styles.feeValue}>
                      {feeBreakdown.coinAmount} {symbol} (≈ $
                      {amount?.toFixed(2)})
                    </Text>
                  </View>

                  <View style={styles.feeDivider} />

                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>
                      Network Fee ({selectedNetwork?.chain})
                    </Text>
                    <Text style={styles.feeValue}>
                      {feeBreakdown.bybitFeeCoin} {symbol} (≈ $
                      {feeBreakdown.bybitFeeUsd})
                    </Text>
                  </View>

                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Operation Fee</Text>
                    <Text style={styles.feeValue}>
                      {feeBreakdown.platformFeeCoin} {symbol} (≈ $1.00)
                    </Text>
                  </View>

                  <View style={styles.feeDivider} />

                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Total Fees</Text>
                    <Text style={[styles.feeValue]}>
                      {feeBreakdown.totalFeeCoin} {symbol} (≈ $
                      {feeBreakdown.totalFeeUsd})
                    </Text>
                  </View>

                  <View style={styles.feeDivider} />

                  <View style={styles.feeRow}>
                    <Text style={[styles.feeLabel]}>Recipient Gets</Text>
                    <Text style={[styles.feeValue]}>
                      {feeBreakdown.coinAmountAfterFee} {symbol} (≈ $
                      {feeBreakdown.usdAmountAfterFee})
                    </Text>
                  </View>
                </View>
              )}

              {/* {feeBreakdown && feeBreakdown.isTooSmall && (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningText}>
                    Amount is too small to cover withdrawal fees.
                  </Text>
                </View>
              )} */}

              {/* {feeBreakdown &&
                !feeBreakdown.isTooSmall &&
                feeBreakdown.isBelowMinimum && (
                  <View style={styles.warningContainer}>
                    <Text style={styles.warningText}>
                      Minimum withdrawal is {feeBreakdown.withdrawMin} {symbol}.
                      Please increase your amount.
                    </Text>
                  </View>
                )} */}

              {hasInsufficientBalance && (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningText}>
                    Insufficient balance! You need{" "}
                    {formatAmount(amount, { currency: "USD" })} but your balance
                    is only {formatAmount(balanceInUsd, { currency: "USD" })} (
                    {balance} {symbol})
                  </Text>
                </View>
              )}

              <InfoCard
                IconComponent={<InfoCircle size={15} color={COLORS.primary} />}
                title="Important Notice!"
                description={[
                  "Double-check the wallet address before confirming.",
                  "Cryptocurrency transactions are irreversible.",
                  "Sending to the wrong address will result in permanent loss of funds.",
                ]}
              />
            </View>

            <TouchableOpacity
              disabled={!canSubmit || isPending}
              style={[
                styles.button,
                {
                  backgroundColor:
                    !canSubmit || isPending
                      ? COLORS.fadePrimary
                      : COLORS.secondary,
                },
              ]}
              onPress={handleSubmit(onSubmit)}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" size={10} />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CustomLoading loading={isFetching} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: normalize(20),
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  label: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    marginBottom: normalize(8),
  },
  error: {
    color: "red",
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    marginBottom: normalize(10),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: normalize(16),
    marginBottom: normalize(10),
    gap: 5,
  },
  feeBreakdownContainer: {
    backgroundColor: "#5AB2431A",
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  feeBreakdownTitle: {
    color: "#000",
    fontFamily: getFontFamily("800"),
    fontSize: 13,
    marginBottom: 4,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feeLabel: {
    color: "#000",
    fontFamily: getFontFamily("700"),
    fontSize: 12,
    flex: 1,
  },
  feeValue: {
    color: "#000",
    fontFamily: getFontFamily("900"),
    fontSize: 12,
    textAlign: "right",
    flex: 1,
  },
  feeDivider: {
    height: 1,
    backgroundColor: "#b1b1b1",
  },
  feeWarning: {
    backgroundColor: "#3a1a1a",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  feeWarningText: {
    color: "#ff6b6b",
    fontFamily: getFontFamily("400"),
    fontSize: 15,
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
    fontFamily: getFontFamily("800"),
    color: "#000",
  },
  approx: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    marginBottom: normalize(6),
    color: COLORS.primary,
  },
  walletBalance: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: normalize(4),
  },
  walletAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scanButton: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
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
    color: "#db0b0b",
    fontSize: normalize(16),
    fontFamily: getFontFamily("800"),
    textAlign: "center",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: normalize(19),
    fontFamily: getFontFamily("700"),
  },
  closeScannerButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
  },
  closeScannerText: {
    color: "#fff",
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
  },
});
