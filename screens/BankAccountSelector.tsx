import React, { Dispatch, SetStateAction } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { normalize, getFontFamily } from "../constants/settings";
import CustomIcon from "../components/CustomIcon";
import { CheckCircleIcon } from "../assets";
import { AddCircle } from "iconsax-react-nativejs";
import { AppText } from "../components/AppText";

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
      <AppText style={styles.sectionLabel}>Select Bank Account</AppText>
      {bankName && accountName && accountNumber ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setShowBankModal(true)}
        >
          <View style={styles.selectedAccount}>
            <View>
              <AppText style={styles.bankName}>{accountName}</AppText>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignContent: "center",
                }}
              >
                <AppText style={styles.accountNumber}>{bankName}</AppText>
                <AppText
                  style={{
                    marginHorizontal: 2,
                    textAlign: "center",
                    justifyContent: "center",
                  }}
                >
                  •
                </AppText>
                <AppText style={styles.accountNumber}>{accountNumber}</AppText>
              </View>
            </View>
            <CustomIcon size={15} source={CheckCircleIcon} />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.addAccountButton}
          onPress={() => setShowBankModal(true)}
        >
          <AddCircle size={normalize(18)} color="#00863b" />
          <AppText style={styles.addAccountText}>Add Bank Account</AppText>
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
    fontFamily: getFontFamily("800"),
  },
  accountNumber: {
    fontSize: normalize(16),
    gap: 1,
    color: "#000",
    flexDirection: "row",
    fontFamily: getFontFamily("700"),
  },
  changeText: {
    marginTop: 8,
    color: COLORS.secondary,
    fontFamily: getFontFamily("700"),
  },
  addAccountButton: {
    borderWidth: 1,
    borderColor: "green",
    padding: 14,
    borderRadius: 200,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  addAccountText: {
    color: COLORS.primary,
    fontSize: normalize(17),
    fontFamily: getFontFamily("800"),
  },
});
