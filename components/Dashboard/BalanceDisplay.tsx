import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { getFontFamily, normalize } from "../../constants/settings";
import { Eye, EyeSlash } from "iconsax-react-nativejs";
import { AppText } from "../AppText";

type BalanceProps = {
  balance: number;
  currency?: string;
};

const BalanceDisplay: React.FC<BalanceProps> = ({
  balance,
  currency = "₦",
}) => {
  const [visible, setVisible] = useState(true);

  return (
    <View style={styles.balanceAmount}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <AppText style={styles.currency}>{currency}</AppText>
        <AppText style={styles.amount}>
          {visible ? balance.toLocaleString() : "******"}
        </AppText>
      </View>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.eyeIcon}
        onPress={() => setVisible(!visible)}
      >
        {visible ? (
          <EyeSlash size={25} variant="Outline" color="white" />
        ) : (
          <Eye size={25} variant="Outline" color="white" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default BalanceDisplay;

const styles = StyleSheet.create({
  balanceAmount: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
    borderRadius: 8,
    gap: 20,
  },
  currency: {
    fontSize: normalize(13),
    fontFamily: getFontFamily("700"),
    color: "#fff",
    marginRight: 4,
  },
  amount: {
    fontSize: normalize(13),
    fontFamily: getFontFamily("800"),
    color: "#fff",
  },
  eyeIcon: {
    paddingHorizontal: 6,
  },
});
