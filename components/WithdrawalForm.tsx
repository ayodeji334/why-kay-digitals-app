import React from "react";
import { View, Text, StyleSheet } from "react-native";
import NumberInputField from "./NumberInputField";
import { getFontFamily, normalize } from "../constants/settings";

export default function WithdrawalForm({ control }: any) {
  return (
    <View style={styles.amountBox}>
      <NumberInputField
        label="Amount (NGN)"
        name="amount"
        control={control}
        placeholder="₦ 0.00"
      />
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
});
