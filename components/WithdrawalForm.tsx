import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
// import NumberInputField from "./NumberInputField";
import { getFontFamily, normalize } from "../constants/settings";
import { formatWithCommas } from "../screens/SwapCryptoScreen";
import { AppText } from "./AppText";

export default function WithdrawalForm({ setValue }: any) {
  const [amount, setAmount] = useState("");

  return (
    <View style={styles.amountBox}>
      <View style={{ marginBottom: 2, marginTop: 10 }}>
        <AppText style={styles.label}>Amount</AppText>
        <View style={styles.inputContainer}>
          <AppText style={styles.dollarSign}>₦</AppText>
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
            maxFontSizeMultiplier={1}
            allowFontScaling={false}
          />
        </View>
      </View>

      <AppText style={styles.amountNote}>
        Minimum of ₦1,000 and Maximum of ₦300,000
      </AppText>
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
