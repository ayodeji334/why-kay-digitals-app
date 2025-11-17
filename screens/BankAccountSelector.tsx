import React, { Dispatch, SetStateAction } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { normalize, getFontFamily } from "../constants/settings";
import CustomIcon from "../components/CustomIcon";
import { CheckCircleIcon } from "../assets";
import { AddCircle } from "iconsax-react-nativejs";

export default function BankAccountSelector({
  bankName,
  accountName,
  accountNumber,
  setShowBankModal,
}: {
  bankName: string;
  accountName: string;
  accountNumber: string;
  setShowBankModal: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <View style={styles.bankAccountSection}>
      <Text style={styles.sectionLabel}>Select Bank Account</Text>
      {bankName && accountName && accountNumber ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setShowBankModal(true)}
        >
          <View style={styles.selectedAccount}>
            <View>
              <Text style={styles.bankName}>{bankName}</Text>
              <View style={styles.accountNumber}>
                <Text style={styles.accountNumber}>{accountNumber}</Text>
                <Text style={{ marginHorizontal: 2 }}>•</Text>
                <Text style={styles.accountNumber}>{accountName}</Text>
              </View>
            </View>
            <CustomIcon source={CheckCircleIcon} />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.addAccountButton}
          onPress={() => setShowBankModal(true)}
        >
          <AddCircle size={normalize(18)} color="#00863b" />
          <Text style={styles.addAccountText}>Add Bank Account</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bankAccountSection: { marginTop: 14 },
  sectionLabel: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("800"),
    marginBottom: 12,
    color: "#000",
  },
  selectedAccount: {
    backgroundColor: "#5AB2431A",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "green",
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center",
  },
  bankName: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
  },
  accountNumber: {
    fontSize: normalize(15),
    gap: 1,
    color: "#353348",
    flexDirection: "row",
    fontFamily: getFontFamily("400"),
  },
  changeText: {
    marginTop: 8,
    color: COLORS.secondary,
    fontFamily: getFontFamily("700"),
  },
  addAccountButton: {
    borderWidth: 1,
    borderColor: "green",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  addAccountText: {
    color: COLORS.secondary,
    fontSize: normalize(16),
    fontFamily: getFontFamily("800"),
  },
});
