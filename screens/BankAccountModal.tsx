import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { ArrowLeft2 } from "iconsax-react-nativejs";
import { SelectInput } from "../components/SelectInputField";
import { COLORS } from "../constants/colors";
import { normalize, getFontFamily } from "../constants/settings";
import useAxios from "../hooks/useAxios";
import SavedBeneficiaries from "../components/banks/SavedBeneficiaries";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
const STATUS_BAR_PADDING =
  Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0;

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
  const { apiGet, apiDelete } = useAxios();
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string | null>(
    null,
  );

  // Fetch beneficiaries
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["saved-beneficiaries-banks"],
    queryFn: async () => {
      const res = await apiGet("/beneficiaries/type", {
        params: { type: "bank_transfer" },
      });
      return res?.data?.data || [];
    },
    refetchOnWindowFocus: true,
    staleTime: 800000,
  });

  // Delete all beneficiaries
  const { mutate: deleteAll, isPending: deleting } = useMutation({
    mutationFn: async () => {
      return apiDelete("/beneficiaries/type", {
        params: { type: "bank_transfer" },
      });
    },
    onSuccess: () => {
      refetch();
      setSelectedBeneficiary(null);
    },
  });

  const handleSelect = (beneficiary: any) => {
    setSelectedBeneficiary(beneficiary.uuid);
    setAccountDetails({
      accountName: beneficiary?.meta?.account_name,
      accountNumber: beneficiary?.identifier,
      bankName: beneficiary?.meta?.bank_name,
    });
    setValue("bank_code", beneficiary?.meta?.bank_code);
    setValue("account_number", beneficiary?.identifier);
  };

  const validateAccount = async () => {
    if (!selectedBank || accountNumber.length !== 10) return;
    setValidating(true);
    setError("");
    setSuccess("");
    try {
      const response = await post("/banks/validate-account", {
        bank_code: selectedBank.value,
        account_number: accountNumber,
      });

      if (!response.data?.success) {
        setError(
          "Account unavailabe. We cannot verify the receipient's account",
        );
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
      setError("Account unavailabe. We cannot verify the receipient's account");
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
    console.log(selectedBank, accountNumber);
    setValue("bank_code", selectedBank.value);
    setValue("account_number", accountNumber);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <SafeAreaView style={styles.safeArea}>
        <View
          style={[styles.container, { paddingTop: STATUS_BAR_PADDING + 10 }]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <ArrowLeft2 size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Add Bank Account</Text>
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
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
                style={[error && styles.errorBorder, styles.input]}
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
            <View style={{ marginVertical: 10 }}>
              <SavedBeneficiaries
                data={data ?? []}
                isLoading={isLoading || isRefetching}
                isError={isError}
                refetch={refetch}
                onSelect={data => {
                  setAccountDetails(data);
                  handleSelect(data);
                  onClose();
                }}
                selectedBeneficiary={selectedBeneficiary}
                onDeleteAll={deleteAll}
                deleting={deleting}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginRight: 24,
  },
  inputContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("900"),
    marginBottom: 3,
  },
  // input: {
  //   borderWidth: 1,
  //   borderColor: "#e0e0e0",
  //   borderRadius: 8,
  //   padding: 14,
  //   fontSize: normalize(16),
  //   fontFamily: getFontFamily("400"),
  // },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: "#1A1A1A",
    fontFamily: getFontFamily("800"),
    fontSize: normalize(18),
    // backgroundColor: "#FFFFFF",
  },
  errorBorder: {
    borderColor: "#FF3B30",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#FF3B30",
    marginTop: 6,
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    marginLeft: 4,
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
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
