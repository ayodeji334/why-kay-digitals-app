import React, { useState } from "react";
import { Controller, Control } from "react-hook-form";
import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  TextInput,
  Image,
} from "react-native";
import { getFontFamily, normalize } from "../constants/settings";
import { formatAmount } from "../libs/formatNumber";
import { ArrowDown2 } from "iconsax-react-nativejs";
import CustomIcon from "./CustomIcon";
import { CloseIcon } from "../assets";
import { COLORS } from "../constants/colors";

interface Option {
  label: string;
  value: string;
  symbol?: string;
  logo_url?: string;
  market_value?: number;
  [key: string]: any;
}

interface SelectInputProps {
  name?: string;
  control?: Control<any>;
  label?: string;
  options: Option[];
  placeholder?: string;
  rules?: object;
  value?: string | null;
  onChange?: (value: string) => void;
  onSelect?: (value: any) => void;
  title?: string;
}

export function SelectInput({
  name,
  control,
  label,
  onSelect,
  options,
  placeholder = "Select an option...",
  rules,
  value: externalValue,
  onChange: externalOnChange,
  title = "Select an option",
}: SelectInputProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [internalValue, setInternalValue] = useState<string | null>(
    externalValue ?? null,
  );

  const handleSelect = (val: string) => {
    setInternalValue(val);
    setVisible(false);
    setSearch("");
    if (externalOnChange) externalOnChange(val);
  };

  const handlePress = () => setVisible(true);

  const renderSelectView = (
    value: string | null,
    onChange?: (val: string) => void,
    errorMessage?: string,
  ) => {
    const selectedOption = options.find(opt => opt.value === value) ?? null;

    return (
      <>
        {label && <Text style={styles.label}>{label}</Text>}

        <Pressable
          style={[styles.input, errorMessage && styles.errorBorder]}
          onPress={handlePress}
        >
          <View style={styles.selectedCryptoContainer}>
            {selectedOption?.logo_url && (
              <Image
                source={{ uri: selectedOption.logo_url }}
                style={styles.cryptoLogo}
              />
            )}
            <View style={styles.selectedCryptoInfo}>
              <Text
                style={[
                  styles.selectedCryptoName,
                  !selectedOption && { color: "#838383" },
                ]}
              >
                {selectedOption
                  ? `${selectedOption.label}${
                      selectedOption.symbol ? ` (${selectedOption.symbol})` : ""
                    }`
                  : placeholder}
              </Text>
            </View>
            <ArrowDown2 size={15} color="#374151" />
          </View>
        </Pressable>
        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

        <Modal visible={visible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View
                style={{
                  marginBottom: 16,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={styles.modalTitle}>{title}</Text>
                <Pressable onPress={() => setVisible(false)}>
                  <CustomIcon
                    source={CloseIcon}
                    color={COLORS.primary}
                    fill={COLORS.primary}
                    overrideColor
                    size={18}
                  />
                </Pressable>
              </View>

              <TextInput
                placeholder="Search..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#9CA3AF"
                style={styles.search}
              />

              <FlatList
                data={options.filter(opt =>
                  opt.label.toLowerCase().includes(search.toLowerCase()),
                )}
                keyExtractor={(item, index) => `${item.value}-${index}`}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.option}
                    onPress={() => {
                      onSelect?.(item);
                      if (onChange) onChange(item.value);
                      handleSelect(item.value);
                    }}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.cryptoRow}>
                        {item.logo_url && (
                          <Image
                            source={{ uri: item.logo_url }}
                            style={styles.optionLogo}
                          />
                        )}
                        <View style={styles.cryptoInfo}>
                          <Text style={styles.optionName}>
                            {item.label}
                            {item.symbol && ` (${item.symbol})`}
                          </Text>
                          {item.market_value && (
                            <Text style={styles.optionPrice}>
                              {formatAmount(item.market_value, false, "USD", 2)}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </Pressable>
                )}
              />
            </View>
          </View>
        </Modal>
      </>
    );
  };

  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { value, onChange }, fieldState: { error } }) =>
          renderSelectView(value ?? internalValue, onChange, error?.message)
        }
      />
    );
  }

  return renderSelectView(internalValue, externalOnChange);
}

const styles = StyleSheet.create({
  label: {
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: "#fff",
    minHeight: 50,
    justifyContent: "center",
    marginBottom: 10,
  },
  selectedCryptoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  selectedCryptoInfo: { flex: 1, marginLeft: 12 },
  selectedCryptoName: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
  cryptoLogo: {
    width: 30,
    height: 30,
    borderRadius: 160,
    backgroundColor: "#F3F4F6",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontFamily: getFontFamily("900"),
    fontSize: normalize(20),
    color: "#374151",
  },
  search: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontFamily: getFontFamily("700"),
    fontSize: normalize(16),
    color: "#374151",
    backgroundColor: "#F9FAFB",
  },
  option: { borderBottomWidth: 2, borderBottomColor: "#ecececff" },
  optionContent: { padding: 10 },
  cryptoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cryptoInfo: { flex: 1 },
  optionName: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#374151",
  },
  optionPrice: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
    color: "#6B7280",
  },
  error: { color: "#FF3B30", marginTop: 4, fontFamily: getFontFamily("700") },
  errorBorder: { borderColor: "#FF3B30", borderWidth: 1.5 },
  optionLogo: {
    width: 40,
    height: 40,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "#cdcdcdff",
    backgroundColor: "#fff",
  },
});
