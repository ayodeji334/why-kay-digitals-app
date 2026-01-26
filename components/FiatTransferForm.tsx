import React, { useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Controller } from "react-hook-form";
import { normalize, getFontFamily } from "../constants/settings";
import { SelectInput } from "./SelectInputField";
import TextInputField from "./TextInputField";
import { formatWithCommas, parseToNumber } from "../screens/SwapCryptoScreen";
import { useWalletStore } from "../stores/walletSlice";

export default function TransferForm({
  control,
  type,
}: {
  control: any;
  type: "fiat" | "crypto";
}) {
  const [displayAmount, setDisplayAmount] = useState("");
  const availableAssets = useWalletStore(state => state.wallets);

  const userWallets = useMemo(
    () =>
      availableAssets.map(asset => ({
        ...asset,
        label: asset?.asset_name ?? asset?.name ?? "",
        value: asset?.asset_id ?? asset?.uuid ?? "",
        symbol: asset?.symbol ?? "",
        logo_url: asset?.logo ?? "",
      })),
    [availableAssets],
  );

  console.log(userWallets);

  return (
    <View style={styles.form}>
      <TextInputField
        label="Username"
        control={control}
        name="username"
        placeholder="Enter receipient username"
      />

      {type === "crypto" && (
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
          Amount in {type === "fiat" ? "Naira (₦)" : "Dollars (USD)"}
        </Text>
        <Controller
          control={control}
          name="amount"
          render={({ field: { onBlur, onChange } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.dollarSign}>
                {type === "fiat" ? "₦" : "$"}
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

      {type === "fiat" && (
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
  );
}

const styles = StyleSheet.create({
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
});
