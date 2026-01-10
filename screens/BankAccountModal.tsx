import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native";
import { ArrowLeft2 } from "iconsax-react-nativejs";
import { SelectInput } from "../components/SelectInputField";
import { COLORS } from "../constants/colors";
import { normalize, getFontFamily } from "../constants/settings";
import useAxios from "../hooks/useAxios";

export default function BankAccountModal({
  visible,
  onClose,
  bankOptions,
  setAccountDetails,
  setValue,
}: any) {
  const { post } = useAxios();
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const validateAccount = async () => {
    if (!selectedBank || accountNumber.length !== 10) return;
    setValidating(true);
    try {
      const response = await post("/banks/validate-account", {
        bank_code: selectedBank.value,
        account_number: accountNumber,
      });

      if (!response.data?.success) {
        setError("Account validation failed. Check details and try again.");
        setSuccess("");
        setAccountDetails(null);
        return;
      }

      setSuccess("Account verified. Saved the account to continue");
      setError("");
      setAccountDetails({
        accountName: response.data.data.accountName,
        accountNumber,
        bankName: selectedBank.label,
      });
    } catch (err) {
      setError("Unable to validate account. Try again later.");
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      const timer = setTimeout(() => validateAccount(), 500);
      return () => clearTimeout(timer);
    }
  }, [accountNumber, selectedBank]);

  const handleSave = () => {
    if (!selectedBank || accountNumber.length !== 10) return;
    setValue("bank_code", selectedBank.value);
    setValue("account_number", accountNumber);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <ArrowLeft2 size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Bank Account</Text>
        </View>

        <ScrollView style={{ paddingHorizontal: 16 }}>
          <SelectInput
            label="Select Bank"
            value={selectedBank?.value}
            options={bankOptions}
            onSelect={option => setSelectedBank(option)}
            placeholder="Select Beneficiary Bank"
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="Enter 10-digit account number"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          {!validating && error ? (
            <Text style={[styles.text, { color: "red" }]}>{error}</Text>
          ) : null}
          {!validating && success ? (
            <Text style={[styles.text, { color: "green" }]}>{success}</Text>
          ) : null}

          {validating ? (
            <Text style={[styles.text, { color: "green" }]}>
              Kindly wait while the system validate your the details
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.button,
              (!selectedBank ||
                accountNumber.length !== 10 ||
                validating ||
                !!error) && {
                backgroundColor: "#ccc",
              },
            ]}
            onPress={handleSave}
            disabled={
              !selectedBank ||
              accountNumber.length !== 10 ||
              validating ||
              !!error
            }
          >
            <Text style={styles.buttonText}>Save Recipient</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
    marginRight: 24,
  },
  inputContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 14,
    fontSize: normalize(16),
    fontFamily: getFontFamily("400"),
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 100,
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
  text: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("700"),
    marginTop: 5,
  },
});
