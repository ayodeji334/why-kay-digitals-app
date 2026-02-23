import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
// import NumberInputField from "./NumberInputField";
import { getFontFamily, normalize } from "../constants/settings";
import { formatWithCommas } from "../screens/SwapCryptoScreen";

export default function WithdrawalForm({ setValue }: any) {
  const [amount, setAmount] = useState("");

  return (
    <View style={styles.amountBox}>
      <View style={{ marginBottom: 2, marginTop: 10 }}>
        <Text style={styles.label}>Amount</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.dollarSign}>₦</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholderTextColor={"#aeaeaeff"}
            placeholder="0.00"
            value={amount}
            onChangeText={text => {
              const formatted = formatWithCommas(text);
              setValue("amount", parseFloat(text));

              setAmount(formatted);
            }}
          />
        </View>
      </View>

      <Text style={styles.amountNote}>
        Minimum of ₦1,000 and Maximum of ₦300,000
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  amountBox: { marginTop: 24 },
  amountNote: {
    color: "#535353ff",
    fontSize: normalize(15),
    fontFamily: getFontFamily("700"),
    marginBottom: 9,
    marginTop: -10,
  },
  label: {
    marginBottom: 6,
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000000ff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    gap: 5,
  },
  input: {
    flex: 1,
    paddingVertical: normalize(16),
    fontSize: normalize(26),
    fontFamily: getFontFamily("800"),
    color: "#000",
  },
  dollarSign: {
    fontSize: normalize(26),
    fontFamily: getFontFamily("800"),
    color: "#000",
    paddingLeft: 15,
  },
});
