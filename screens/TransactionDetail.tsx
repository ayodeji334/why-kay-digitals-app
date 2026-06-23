import React, { useMemo, useState } from "react";
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
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFontFamily, normalize } from "../constants/settings";
import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { formatDate } from "../libs/formatDate";
import { formatAmount } from "../libs/formatNumber";
import { COLORS } from "../constants/colors";
import CustomIcon from "../components/CustomIcon";
import { CopyIcon, ShareIcon } from "../assets";
import Clipboard from "@react-native-clipboard/clipboard";
import useAxios from "../hooks/useAxios";
import { showError } from "../utlis/toast";
import { AppText } from "../components/AppText";

const DetailRow: React.FC<{
  label: string;
  value?: string | number;
  color?: string;
  copyable?: boolean;
}> = ({ label, value, color = "#000", copyable = false }) => {
  const handleCopy = () => {
    if (value) {
      Clipboard.setString(String(value));
    }
  };

  return (
    <View style={styles.row}>
      <AppText style={styles.label}>{label}</AppText>

      <View style={styles.valueContainer}>
        <AppText
          style={[styles.value, { color }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value ?? "-"}
        </AppText>

        {copyable && value ? (
          <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
            <CustomIcon source={CopyIcon} size={12} color="#0a580dff" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const TransactionDetailScreen = () => {
  const navigation: any = useNavigation();
  const route = useRoute();
  const { apiGet } = useAxios();
  const { transaction }: any = route.params;
  const [isDownloading, setIsDownloading] = useState(false);

  const isSuccess = useMemo(
    () => transaction?.status?.toLowerCase() === "successful",
    [transaction?.status],
  );

  const isProcessing = useMemo(
    () =>
      transaction?.status?.toLowerCase() === "processing" ||
      transaction?.status?.toLowerCase() === "pending",
    [transaction?.status],
  );

  const StatusIcon = () =>
    isSuccess ? (
      <Image
        source={require("../assets/success.png")}
        style={styles.networkLogo}
      />
    ) : (
      <CloseCircle
        size={60}
        color={isProcessing ? "#CA8A04" : "#DC2626"}
        variant="Bold"
      />
    );

  // const handleGoBack = () => {
  //   try {
  //     const state = navigation.getState();
  //     const routes = state.routes;
  //     const previousRoute = routes[routes.length - 2];

  //     if (previousRoute) {
  //       navigation.replace(
  //         previousRoute.name as never,
  //         {
  //           // Spread existing params so nothing is lost, then add resetForm
  //           ...((previousRoute.params as object) ?? {}),
  //           resetForm: true,
  //         } as never,
  //       );
  //     } else {
  //       // Fallback — no previous route found, just go back
  //       navigation.goBack();
  //     }
  //   } catch (error) {
  //     navigation.goBack();
  //   }
  // };

  const handleGoBack = () => {
    try {
      const state = navigation.getState();
      const routes = state.routes;
      const previousRoute = routes[routes.length - 2];

      if (previousRoute) {
        navigation.dispatch({
          ...CommonActions.setParams({ resetForm: true }),
          source: previousRoute.key,
        });

        navigation.goBack();
      } else {
        navigation.goBack();
      }
    } catch (error) {
      navigation.goBack();
    }
  };

  const getDirectionColor = () => {
    if (!transaction?.direction) return "#000";
    return transaction?.direction.toLowerCase() === "debit" ? "#000" : "#000";
  };

  const handleShareReceipt = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // 1. Fetch the PDF as base64 directly
      const response = await apiGet(
        `/transactions/${transaction.uuid}/download-receipt`,
        { responseType: "blob" },
      );

      // 2. Convert Blob → base64 via FileReader
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = () => reject(new Error("FileReader failed"));
        reader.readAsDataURL(response.data);
      });

      // 3. Share directly as a base64 data URI — no file system dependency needed
      await Share.share({
        url: `data:application/pdf;base64,${base64}`, // iOS renders PDFs from data URIs
        title: "Transaction Receipt",
        message: "Transaction Receipt", // shown on Android
      });
    } catch (error) {
      console.error("Failed to share receipt:", error);
      showError("Could not generate the receipt. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // const handleShareReceipt = async () => {
  //   if (isDownloading) return;
  //   setIsDownloading(true);

  //   try {
  //     const response = await apiGet(
  //       `/transactions/${transaction.uuid}/download-receipt`,
  //       { responseType: "arraybuffer" },
  //     );

  //     const bytes = new Uint8Array(response.data as ArrayBuffer);
  //     let binary = "";
  //     bytes.forEach(b => (binary += String.fromCharCode(b)));
  //     const base64 = btoa(binary);

  //     const filename = `receipt-${transaction.uuid.replace(/-/g, "")}.pdf`;
  //     const filePath = `${Dirs.CacheDir}/${filename}`;

  //     await FileSystem.writeFile(filePath, base64, "base64");

  //     await Share.share({
  //       url: `file://${filePath}`,
  //       title: "Transaction Receipt",
  //       message: "Transaction Receipt",
  //     });
  //   } catch (error) {
  //     console.error("Failed to share receipt:", error);
  //     showError("Could not generate the receipt. Please try again.");
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };

  // const handleShareReceipt = async () => {
  //   if (isDownloading) return;
  //   setIsDownloading(true);

  //   try {
  //     // 1. Fetch the PDF as an arraybuffer from the backend
  //     const response = await apiGet(
  //       `/transactions/${transaction.uuid}/receipt`,
  //       { responseType: "arraybuffer" },
  //     );

  //     // 2. Convert ArrayBuffer → base64 string
  //     const bytes = new Uint8Array(response.data as ArrayBuffer);
  //     let binary = "";
  //     bytes.forEach(b => (binary += String.fromCharCode(b)));
  //     const base64 = btoa(binary);

  //     // 3. Write the base64 PDF to the device's cache directory
  //     const filename = `receipt-${transaction.uuid.replace(/-/g, "")}.pdf`;
  //     const filePath = `${Dirs.CacheDir}/${filename}`;

  //     await FileSystem.writeFile(filePath, base64, "base64");

  //     // 4. Open the native share sheet with the local file URI
  //     await Share.open({
  //       url: `file://${filePath}`,
  //       type: "application/pdf",
  //       title: "Transaction Receipt",
  //       filename,
  //       failOnCancel: false, // prevents throwing when user dismisses share sheet
  //     });
  //   } catch (error) {
  //     console.error("Failed to share receipt:", error);
  //     Alert.alert("Error", "Could not generate the receipt. Please try again.");
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };

  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <StatusIcon />
        </View>

        <View style={{ marginBottom: 20, gap: 0 }}>
          <AppText style={styles.amount}>
            {transaction?.medium?.toUpperCase() === "CRYPTO"
              ? ["failed", "pending"].includes(
                  transaction.status?.toLowerCase(),
                )
                ? formatAmount(transaction?.meta?.amount_in_usd ?? 0, {
                    currency: transaction?.currency || "USD",
                    decimalPlace: 2,
                  })
                : `${transaction?.meta?.amount || 0} ${
                    transaction?.meta?.asset_symbol ?? ""
                  }`
              : formatAmount(transaction?.amount ?? 0, {
                  currency: transaction?.currency || "NGN",
                  decimalPlace: 2,
                })}
          </AppText>
          <AppText
            style={{
              fontSize: normalize(18),
              fontFamily: getFontFamily("400"),
              textAlign: "center",
            }}
          >
            {isSuccess
              ? transaction?.category === "CRYPTO_DEPOSIT"
                ? `Your ${transaction?.meta?.asset_symbol} deposit was successful`
                : transaction?.category === "CRYPTO_WITHDRAW"
                ? `Your ${transaction?.meta?.asset_symbol} withdrawal was successful`
                : transaction?.category === "CABLETV"
                ? "Your TV bill payment was successful"
                : transaction?.category === "MOBILEDATA"
                ? "Your data purchase was successful"
                : transaction?.category === "AIRTIME"
                ? "Your airtime purchase was successful"
                : transaction?.category === "REFERRAL_BONUS"
                ? "You’ve received a referral bonus"
                : transaction?.category === "BANK_TRANSFER"
                ? "Your deposit was successful"
                : transaction?.category === "WITHDRAWAL"
                ? "Your withdrawal was successful"
                : "Transaction completed successfully"
              : isProcessing
              ? "Transaction is pending the confirmation"
              : "Transaction failed"}
          </AppText>
        </View>

        {transaction?.meta?.data?.recharge_token && (
          <View
            style={{
              backgroundColor: "#F9FAFB",
              paddingHorizontal: 10,
              marginBottom: 20,
            }}
          >
            <DetailRow
              label="Token"
              value={
                transaction?.meta?.data?.recharge_token
                  .match(/.{1,4}/g)
                  ?.join("-") || ""
              }
              copyable
            />
          </View>
        )}

        <View style={styles.detailsContainer}>
          <DetailRow
            label="Transaction ID"
            value={transaction?.uuid?.split("-")?.join("")}
            copyable
          />
          {transaction?.category === "CRYPTO_DEPOSIT" && (
            <DetailRow
              label="Blockchain Trx ID"
              value={transaction?.meta?.tx_reference}
              copyable
            />
          )}
          <DetailRow
            label="Amount"
            value={
              transaction?.medium?.toUpperCase() === "CRYPTO"
                ? formatAmount(transaction?.meta?.amount_in_usd || 0, {
                    currency: "USD",
                    decimalPlace: 2,
                  })
                : formatAmount(transaction?.amount || 0, {
                    currency: "NGN",
                    decimalPlace: 2,
                  })
            }
            color={getDirectionColor()}
          />
          {transaction?.category === "CRYPTO_SELL" ? null : (
            <DetailRow
              label="Fee"
              value={formatAmount(transaction?.fee, {
                currency:
                  transaction?.medium?.toUpperCase() === "CRYPTO"
                    ? "USD"
                    : "NGN",
                decimalPlace:
                  transaction?.medium?.toUpperCase() === "CRYPTO" ? 4 : 2,
              })}
            />
          )}
          <DetailRow
            label="Net Amount"
            value={formatAmount(transaction?.net_amount, {
              currency:
                transaction?.medium?.toUpperCase() === "CRYPTO" ? "USD" : "NGN",
              decimalPlace: 2,
            })}
          />
          {transaction?.meta?.exchange_rate && (
            <DetailRow
              label="Exchange Rate"
              value={
                formatAmount(transaction?.meta?.exchange_rate, {
                  currency: "NGN",
                  decimalPlace: 2,
                }) + "/$"
              }
            />
          )}
          <DetailRow
            label="Category"
            value={transaction?.direction?.toUpperCase()}
            color={getDirectionColor()}
          />
          <DetailRow
            label="Wallet"
            value={transaction?.medium?.toUpperCase()}
          />
          <DetailRow
            label="Status"
            value={isSuccess ? "Successful" : transaction?.status}
            color={isSuccess ? "#059669" : isProcessing ? "#CA8A04" : "#DC2626"}
          />
          {transaction?.status.toUpperCase() !== "FAILED" && (
            <DetailRow label="Description" value={transaction?.description} />
          )}
          <DetailRow
            label="Reference"
            value={transaction?.reference.split("-").join("")}
            copyable
          />
          <DetailRow
            label="Occurred At"
            value={
              transaction?.occurred_at && formatDate(transaction?.occurred_at)
            }
          />
        </View>

        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleShareReceipt}
            style={styles.headerButton}
          >
            <CustomIcon source={ShareIcon} size={18} color={COLORS.primary} />
            <AppText style={styles.headerTitle}>Share Receipt</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGoBack} style={styles.goBackButton}>
            <AppText style={[styles.headerTitle, { color: "white" }]}>
              Done
            </AppText>
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
    padding: 14,
    flex: 1,
    gap: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
  },
  goBackButton: {
    backgroundColor: COLORS.secondary,
    padding: 14,
    flex: 1,
    gap: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
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
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    columnGap: 9,
  },
  label: {
    flex: 1,
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
  },
  valueContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  value: {
    flexShrink: 1,
    minWidth: 0,
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    textAlign: "right",
  },
  copyButton: {
    marginLeft: 6,
    padding: 4,
    flexShrink: 0,
    borderRadius: 1,
  },
  setupLabel: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 2,
  },
  setupValue: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#444",
    flex: 1,
  },
});

export default TransactionDetailScreen;
