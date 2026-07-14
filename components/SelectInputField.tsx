import React, { useEffect, useState } from "react";
import { Controller, Control } from "react-hook-form";
import {
  Modal,
  View,
  Pressable,
  FlatList,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getFontFamily, normalize } from "../constants/settings";
import { formatAmount, formatNumber } from "../libs/formatNumber";
import { ArrowDown2 } from "iconsax-react-nativejs";
import CustomIcon from "./CustomIcon";
import { CloseIcon } from "../assets";
import { COLORS } from "../constants/colors";
import { AppText } from "./AppText";

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
  showSearchBox?: boolean;
  showWalletPrice?: boolean;
  isDisabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
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
  showSearchBox = true,
  showWalletPrice = false,
  isDisabled = false,
  loading = false,
  loadingText = "Loading...",
  emptyText = "No options found",
}: SelectInputProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [internalValue, setInternalValue] = useState<string | null>(
    externalValue ?? null,
  );

  useEffect(() => {
    setInternalValue(externalValue ?? null);
  }, [externalValue]);

  // clear search when modal closes
  useEffect(() => {
    if (!visible) setSearch("");
  }, [visible]);

  const handleSelect = (val: string) => {
    setInternalValue(val);
    setVisible(false);
    setSearch("");
    if (externalOnChange) externalOnChange(val);
  };

  const handlePress = () => {
    if (!isDisabled && !loading) setVisible(true);
  };

  const renderSelectView = (
    value: string | null,
    onChange?: (val: string) => void,
    errorMessage?: string,
  ) => {
    const selectedOption = options.find(opt => opt.value === value) ?? null;

    return (
      <>
        {label && <AppText style={styles.label}>{label}</AppText>}

        <TouchableOpacity
          activeOpacity={0.8}
          hitSlop={10}
          style={[styles.input, errorMessage && styles.errorBorder]}
          onPress={handlePress}
          disabled={isDisabled}
        >
          <View style={styles.selectedCryptoContainer}>
            {selectedOption?.logo_url && (
              <Image
                source={{ uri: selectedOption.logo_url }}
                style={styles.cryptoLogo}
              />
            )}
            <View style={styles.selectedCryptoInfo}>
              <AppText
                style={[
                  styles.selectedCryptoName,
                  (!selectedOption || loading) && { color: "#838383" },
                ]}
              >
                {loading
                  ? loadingText
                  : selectedOption
                  ? selectedOption.label
                  : placeholder}
              </AppText>

              {selectedOption?.network_charges ? (
                <AppText style={styles.optionPrice}>
                  Network fee:{" "}
                  {formatNumber(selectedOption?.network_charges ?? 0, {
                    decimalPlace: 6,
                  })}{" "}
                  {selectedOption?.symbol}{" "}
                  <AppText style={{ paddingLeft: 3 }}>
                    (≈{" "}
                    {formatAmount(selectedOption?.network_charges_in_usd ?? 0, {
                      currency: "USD",
                      decimalPlace: 2,
                    })}
                    )
                  </AppText>
                </AppText>
              ) : undefined}
            </View>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <ArrowDown2 size={normalize(20)} color="#374151" />
            )}
          </View>
        </TouchableOpacity>

        {errorMessage && <AppText style={styles.error}>{errorMessage}</AppText>}

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
                <AppText style={styles.modalTitle}>{title}</AppText>
                <Pressable hitSlop={200} onPress={() => setVisible(false)}>
                  <CustomIcon
                    source={CloseIcon}
                    color={COLORS.primary}
                    fill={COLORS.primary}
                    overrideColor
                    size={18}
                  />
                </Pressable>
              </View>

              {showSearchBox && (
                <TextInput
                  placeholder="Search..."
                  value={search}
                  onChangeText={setSearch}
                  placeholderTextColor="#9CA3AF"
                  style={styles.search}
                  maxFontSizeMultiplier={1}
                  allowFontScaling={false}
                />
              )}

              <FlatList
                // data={options.filter(opt =>
                //   opt.label?.toLowerCase().includes(search?.toLowerCase()),
                // )}
                data={
                  loading
                    ? []
                    : options.filter(opt =>
                        opt.label
                          ?.toLowerCase()
                          .includes(search?.toLowerCase()),
                      )
                }
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => `${item.value}-${index + 0.456}`}
                renderItem={({ item }) => {
                  return (
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
                            <AppText style={styles.optionName}>
                              {`${item.label}`}
                            </AppText>
                            {item?.market_value ? (
                              <AppText style={styles.optionPrice}>
                                {formatAmount(item.market_value, {
                                  currency: "USD",
                                })}
                              </AppText>
                            ) : undefined}
                            {item?.network_charges ? (
                              <AppText style={styles.optionPrice}>
                                Network fee:{" "}
                                {formatNumber(item?.network_charges ?? 0, {
                                  decimalPlace: 6,
                                })}{" "}
                                {item?.symbol}{" "}
                                <AppText style={{ paddingLeft: 3 }}>
                                  (≈{" "}
                                  {formatAmount(
                                    item?.network_charges_in_usd ?? 0,
                                    {
                                      currency: "USD",
                                    },
                                  )}
                                  )
                                </AppText>
                              </AppText>
                            ) : undefined}
                          </View>

                          {showWalletPrice ? (
                            <View
                              style={{
                                flexDirection: "column",
                                alignItems: "flex-end",
                                alignContent: "flex-end",
                              }}
                            >
                              {item?.balance && (
                                <AppText style={styles.optionName}>
                                  {item?.balance}
                                </AppText>
                              )}
                              {item?.total_price ? (
                                <AppText style={styles.optionName}>
                                  {`${formatAmount(item?.total_price, {
                                    currency: "USD",
                                    decimalPlace: 2,
                                  })}`}
                                </AppText>
                              ) : (
                                <AppText style={styles.optionName}>
                                  {`${formatAmount(item?.price, {
                                    currency: "USD",
                                  })}`}
                                </AppText>
                              )}
                            </View>
                          ) : undefined}
                        </View>
                      </View>
                    </Pressable>
                  );
                }}
                ListEmptyComponent={
                  <View style={{ paddingVertical: 20, alignItems: "center" }}>
                    {loading ? (
                      <>
                        <ActivityIndicator
                          size="small"
                          color={COLORS.primary}
                        />
                        <AppText
                          style={{
                            marginTop: 8,
                            fontSize: normalize(14),
                            color: "#838383",
                          }}
                        >
                          {loadingText}
                        </AppText>
                      </>
                    ) : (
                      <AppText
                        style={{
                          fontSize: normalize(18),
                          fontFamily: getFontFamily("700"),
                        }}
                      >
                        {emptyText}
                      </AppText>
                    )}
                  </View>
                }
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
    fontFamily: getFontFamily("800"),
    fontSize: normalize(18),
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(14),
    backgroundColor: "#fff",
    justifyContent: "center",
    marginBottom: 5,
    minHeight: normalize(50),
  },
  selectedCryptoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  selectedCryptoInfo: { flex: 1, marginLeft: 4 },
  selectedCryptoName: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
  cryptoLogo: {
    width: 26,
    height: 26,
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
    paddingBottom: 40,
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
    fontFamily: getFontFamily("400"),
    fontSize: normalize(18),
    color: "#374151",
    backgroundColor: "#F9FAFB",
  },
  option: { borderBottomWidth: 2, borderBottomColor: "#ecececff" },
  optionContent: { padding: 10, width: "100%" },
  cryptoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flex: 1,
  },
  cryptoInfo: { flex: 1 },
  optionName: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("800"),
    color: "#000",
  },
  optionPrice: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("700"),
    color: "#343435",
  },
  error: {
    color: "#FF3B30",
    marginBottom: 9,
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
  },
  errorBorder: { borderColor: "#FF3B30", borderWidth: 1.5 },
  optionLogo: {
    width: 30,
    height: 30,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "#cdcdcdff",
    backgroundColor: "#fff",
  },
});
