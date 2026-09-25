import React from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { AppText } from "../components/AppText";
import { DetailRow } from "./TransactionDetail";
import { useColors } from "../hooks/useTheme";

interface Voucher {
  unit: number;
  zendit_tx_id: string;
  epin?: string;
  voucher_id?: string;
  expires_at?: string;
  redemption_url?: string;
  instructions?: string;
  terms?: string;
  send?: number;
  send_currency?: string;
  status?: string;
  confirmation?: {
    confirmationNumber: string;
    externalReferenceId: string;
    transactionTime: string;
  };
}

const VoucherCard = ({
  voucher,
  index,
  total,
}: {
  voucher: Voucher;
  index: number;
  total: number;
}) => {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {total > 1 ? (
          <AppText style={styles.unitLabel}>
            Card {index + 1} of {total}
          </AppText>
        ) : (
          <AppText style={styles.unitLabel}>Card Detail</AppText>
        )}
      </View>

      {voucher?.status !== "DONE" ? (
        <View style={styles.pendingBlock}>
          <AppText style={styles.pendingText}>
            Your voucher is still being processed. Check back shortly.
          </AppText>
        </View>
      ) : (
        <>
          {voucher?.redemption_url && (
            <DetailRow
              label="Redemption Link"
              value={voucher?.redemption_url || "Not provided"}
              copyable={!!voucher?.redemption_url}
            />
          )}

          {voucher?.epin && (
            <DetailRow
              label="Card PIN"
              value={voucher?.epin || "Not provided"}
              copyable={!!voucher?.epin}
            />
          )}

          {voucher?.voucher_id && (
            <DetailRow
              label="Card Number"
              value={voucher?.voucher_id || "Not provided"}
              copyable={!!voucher?.voucher_id}
            />
          )}

          {voucher?.confirmation?.confirmationNumber && (
            <DetailRow
              label="Confirmation Number"
              value={
                voucher?.confirmation?.confirmationNumber || "Not provided"
              }
              copyable={!!voucher?.confirmation?.confirmationNumber}
            />
          )}

          {voucher?.expires_at && (
            <DetailRow
              label="Expires On"
              value={voucher?.expires_at || "Not provided"}
              copyable={!!voucher?.expires_at}
            />
          )}
        </>
      )}

      {!!voucher.instructions?.trim() && (
        <View style={[styles.infoBlock, { marginTop: normalizeSpacing(10) }]}>
          <AppText style={styles.infoLabel}>How to redeem</AppText>
          <AppText style={styles.infoText}>{voucher.instructions}</AppText>
        </View>
      )}

      {/* Terms */}
      {!!voucher.terms?.trim() && (
        <View style={styles.infoBlock}>
          <AppText style={styles.infoLabel}>Terms</AppText>
          <AppText style={styles.infoText}>{voucher.terms}</AppText>
        </View>
      )}
    </View>
  );
};

export default function GiftCardVouchersScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const colors = useColors();
  const styles = makeStyles(colors);

  const { vouchers } = route.params as {
    vouchers: Voucher[];
    brandName: string;
    totalAmountNgn: string | number;
    txReference: string;
    quantity: number;
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <AppText style={styles.sectionTitle}>
          {vouchers.length > 1
            ? `Your ${vouchers.length} gift cards`
            : "Your gift card"}
        </AppText>
        <AppText style={styles.sectionHint}>
          {vouchers.length > 1
            ? "Each card has a unique code or link. Copy the one you want to use."
            : "Copy the code or link below to redeem your gift card."}
        </AppText>

        {vouchers.map((voucher, index) => (
          <VoucherCard
            key={voucher.zendit_tx_id ?? index}
            voucher={voucher}
            index={index}
            total={vouchers.length}
          />
        ))}
      </ScrollView>

      <View style={{ padding: normalizeSpacing(20) }}>
        <TouchableOpacity
          style={styles.doneButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <AppText style={styles.doneButtonText}>Done</AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: normalizeSpacing(23),
      paddingTop: normalizeSpacing(16),
      paddingBottom: normalizeSpacing(40),
    },
    summaryCard: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      padding: normalizeSpacing(16),
      marginBottom: normalizeSpacing(24),
      gap: 8,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    summaryBrand: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("900"),
      color: "#fff",
    },
    summaryAmount: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("900"),
      color: "#fff",
    },
    summaryMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    sectionTitle: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      marginBottom: normalizeSpacing(4),
    },
    sectionHint: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
      marginBottom: normalizeSpacing(16),
    },
    card: {
      backgroundColor: colors.surface,
      borderWidth: 0.5,
      borderColor: colors.border,
      borderRadius: 12,
      padding: normalizeSpacing(13),
      marginBottom: normalizeSpacing(12),
      gap: 12,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    unitLabel: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("900"),
      color: colors.textMuted,
    },
    faceValue: {
      fontSize: normalize(15),
      fontFamily: getFontFamily("700"),
      color: colors.text,
    },
    valueBlock: {
      borderRadius: 8,
      paddingVertical: normalizeSpacing(12),
      gap: 8,
    },
    valueBlockLabel: {
      fontSize: normalize(16),
      fontFamily: getFontFamily("700"),
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    codeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    codeText: {
      fontSize: normalize(18),
      fontFamily: "monospace",
      color: colors.text,
      letterSpacing: 2,
      flex: 1,
    },
    urlPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderWidth: 0.5,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: normalizeSpacing(10),
      paddingVertical: normalizeSpacing(8),
    },
    urlText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: colors.text,
      flex: 1,
    },
    urlWarning: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
    },

    // Copy button (inline for code, full-width for url)
    copyBtn: {
      borderWidth: 0.5,
      borderColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: normalizeSpacing(12),
      paddingVertical: normalizeSpacing(14),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },
    copyBtnFull: {
      width: "100%",
    },
    copyBtnText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: "#fff",
    },
    copyBtnTextSuccess: {
      color: colors.success,
    },

    // Pending
    pendingBlock: {
      backgroundColor: colors.warningLight,
      borderWidth: 0.5,
      borderColor: colors.warning,
      borderRadius: 8,
      padding: normalizeSpacing(12),
    },
    pendingText: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.warning,
    },

    // Info blocks
    infoBlock: { gap: 4 },
    infoLabel: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    infoText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.text,
    },
    mutedText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.error,
    },
    confirmation: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
      textAlign: "right",
    },

    // Done button
    doneButton: {
      backgroundColor: colors.primary,
      borderRadius: normalize(208),
      paddingVertical: normalizeSpacing(14),
      alignItems: "center",
      marginTop: normalizeSpacing(8),
    },
    doneButtonText: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      color: "#fff",
    },
  });
