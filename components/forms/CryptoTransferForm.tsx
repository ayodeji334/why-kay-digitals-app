import React, { useMemo } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { Controller } from "react-hook-form";
import TextInputField from "../TextInputField";
import { SelectInput } from "../SelectInputField";
import {
  formatWithCommas,
  parseToNumber,
} from "../../screens/SwapCryptoScreen";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../../constants/settings";
import { AppText } from "../AppText";

type CryptoTransferFormProps = {
  control: any;
  errors: any;
  userWallets: any[];
  displayAmount: string;
  setDisplayAmount: (val: string) => void;
  watch: any;
};

export function CryptoTransferForm({
  control,
  errors,
  userWallets,
  displayAmount,
  setDisplayAmount,
  watch,
}: CryptoTransferFormProps) {
  const amount = watch("amount") || 0;
  const assetId = watch("asset_id");

  const selectedCryptoWallet = useMemo(
    () => userWallets.find(w => w.asset_id === assetId),
    [userWallets, assetId],
  );

  const hasInsufficientBalance = useMemo(() => {
    if (!amount) return false;
    if (!selectedCryptoWallet) return true;

    return amount > Number(selectedCryptoWallet?.price ?? 0);
  }, [amount, selectedCryptoWallet]);

  return (
    <>
      <TextInputField
        label="Username"
        control={control}
        name="username"
        placeholder="Enter recipient username"
      />

      <View style={{ marginVertical: normalizeSpacing(4) }}>
        <SelectInput
          control={control}
          isDisabled={true}
          name="asset_id"
          label="Coin"
          options={userWallets}
          placeholder="Select an asset"
          title="Select an asset"
        />
      </View>

      <View style={{ marginVertical: normalizeSpacing(4) }}>
        <AppText style={styles.label}>Amount</AppText>

        <Controller
          control={control}
          name="amount"
          render={({ field: { onBlur, onChange } }) => (
            <View style={styles.inputContainer}>
              <AppText style={styles.dollarSign}>$</AppText>

              <TextInput
                style={styles.input}
                value={displayAmount}
                maxFontSizeMultiplier={1}
                allowFontScaling={false}
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
          <AppText style={styles.error}>{errors?.amount?.message}</AppText>
        )}
      </View>

      {hasInsufficientBalance && (
        <View style={styles.warningContainer}>
          <AppText style={styles.warningText}>
            You do not have enough balance to complete this transfer.
          </AppText>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontFamily: getFontFamily("800"),
    marginBottom: normalizeSpacing(8),
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: normalizeSpacing(12),
    backgroundColor: "#fff",
  },
  dollarSign: {
    fontSize: normalize(23),
    fontFamily: getFontFamily("800"),
    color: "#333",
    marginRight: normalizeSpacing(8),
  },
  input: {
    flex: 1,
    paddingVertical: normalizeSpacing(16),
    fontSize: normalize(23),
    fontFamily: getFontFamily("800"),
    color: "#000",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: normalizeSpacing(4),
  },
  warningContainer: {
    marginVertical: normalizeSpacing(12),
    padding: normalizeSpacing(10),
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
});
