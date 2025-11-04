import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Pressable,
  TextInputProps,
} from "react-native";
import { Controller, Control, UseFormTrigger } from "react-hook-form";
import { getFontFamily, normalize } from "../constants/settings";
import { CountryCode, parsePhoneNumberFromString } from "libphonenumber-js";
import {
  getAllCountries,
  Country,
  CountryCode as CountryCodeR,
  FlagType,
  TranslationLanguageCodeMap,
} from "react-native-country-picker-modal";
import CustomIcon from "./CustomIcon";
import { CloseIcon } from "../assets";
import { COLORS } from "../constants/colors";

interface Props {
  control: Control<any>;
  name: string;
  trigger?: UseFormTrigger<any>;
  placeholder?: string;
  rules?: object;
  label?: string;
  showLabel?: boolean;
  maxLength?: number;
  style?: TextInputProps["style"];
  containerStyle?: TextInputProps["style"];
  placeholderTextColor?: string;
  value?: string;
  onChangeText?: (val: string) => void;
  defaultCountryCode?: CountryCodeR;
}

const PhoneNumberInputField: React.FC<Props> = ({
  control,
  name,
  trigger,
  placeholder,
  rules,
  label,
  showLabel = true,
  maxLength,
  style,
  containerStyle,
  placeholderTextColor = "#999",
  onChangeText,
  defaultCountryCode = "NG",
}) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const getCountryName = (country: Country): string => {
    if (typeof country.name === "string") return country.name;
    const nameMap = country.name as TranslationLanguageCodeMap;
    return (
      (nameMap.common as string) || Object.values(nameMap)[0] || country.cca2
    );
  };

  useEffect(() => {
    const loadCountries = async () => {
      const allCountries = await getAllCountries(FlagType.FLAT);
      setCountries(allCountries);
      const defaultCountry = allCountries.find(
        c => c.cca2 === defaultCountryCode,
      );
      if (defaultCountry) setSelectedCountry(defaultCountry);
    };
    loadCountries();
  }, [defaultCountryCode]);

  const filteredCountries = useMemo(() => {
    return countries.filter(
      c =>
        getCountryName(c).toLowerCase().includes(searchText.toLowerCase()) ||
        c.cca2.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [searchText, countries]);

  const isValidPhoneNumber = (number: string, countryCode: CountryCode) => {
    try {
      const parsed = parsePhoneNumberFromString(number, countryCode);
      return parsed ? parsed.isValid() : false;
    } catch {
      return false;
    }
  };

  const renderInput = (
    onChange: (val: string) => void,
    onBlur?: () => void,
    val?: string,
    error?: any,
  ) => (
    <View style={[styles.container, containerStyle]}>
      {showLabel && label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.countryBox, error && styles.errorBorder]}
          onPress={() => setModalVisible(true)}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            {selectedCountry?.flag && (
              <Image
                source={{ uri: selectedCountry.flag }}
                style={{ width: 25, height: 16, resizeMode: "contain" }}
              />
            )}
            <Text style={styles.countryCode}>
              {selectedCountry
                ? `+${selectedCountry.callingCode[0] ?? ""}`
                : "+234"}
            </Text>
          </View>
        </TouchableOpacity>

        <TextInput
          style={[styles.input, error && styles.errorBorder, style]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          keyboardType="numeric"
          maxLength={maxLength}
          onBlur={() => {
            onBlur?.();
            trigger?.(name); // trigger validation on blur
          }}
          onChangeText={text => {
            const numericValue = text.replace(/[^0-9]/g, "");
            const fullNumber = selectedCountry
              ? `${selectedCountry.callingCode[0]}${numericValue}`
              : numericValue;
            onChange(fullNumber);
            onChangeText?.(fullNumber);
          }}
          // Display the number without the country calling code
          value={
            val
              ? val.replace(
                  new RegExp(`^${selectedCountry?.callingCode?.[0] ?? ""}`),
                  "",
                )
              : ""
          }
        />
      </View>

      {error && <Text style={styles.errorText}>{error.message}</Text>}

      {/* Country picker modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <Pressable onPress={() => setModalVisible(false)}>
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
              style={styles.searchInput}
              placeholder="Search country..."
              placeholderTextColor="#989898ff"
              value={searchText}
              onChangeText={setSearchText}
            />

            {/* <FlatList
              data={filteredCountries}
              keyExtractor={item => item.cca2}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryRow}
                  onPress={() => {
                    setSelectedCountry(item);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.countryLeft}>
                    {item.flag && (
                      <Image
                        source={{ uri: item.flag }}
                        style={{
                          width: 30,
                          height: 20,
                          resizeMode: "contain",
                        }}
                      />
                    )}
                    <Text style={styles.countryName}>
                      {getCountryName(item)} ({item.cca2})
                    </Text>
                  </View>
                  <Text style={styles.callingCode}>+{item.callingCode[0]}</Text>
                </TouchableOpacity>
              )}
            /> */}
            <FlatList
              data={filteredCountries}
              keyExtractor={item => item.cca2}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryRow}
                  onPress={() => {
                    if (selectedCountry) {
                      const currentVal = val ?? "";
                      const oldCode = selectedCountry.callingCode[0] ?? "";
                      let newVal = currentVal;
                      if (currentVal.startsWith(oldCode)) {
                        newVal = currentVal.slice(oldCode.length);
                      }
                      const updatedVal = `${
                        item.callingCode[0] ?? ""
                      }${newVal}`;
                      onChange(updatedVal);
                      onChangeText?.(updatedVal);
                    }

                    setSelectedCountry(item);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.countryLeft}>
                    {item.flag && (
                      <Image
                        source={{ uri: item.flag }}
                        style={{ width: 30, height: 20, resizeMode: "contain" }}
                      />
                    )}
                    <Text style={styles.countryName}>
                      {getCountryName(item)} ({item.cca2})
                    </Text>
                  </View>
                  <Text style={styles.callingCode}>+{item.callingCode[0]}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: "Phone number is required",
        validate: val => {
          if (!selectedCountry) return "Select a country";
          const valid = isValidPhoneNumber(
            val,
            selectedCountry.cca2 as CountryCode,
          );
          return valid || "Invalid phone number";
        },
        ...rules,
      }}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) =>
        renderInput(onChange, onBlur, value, error)
      }
    />
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  countryBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  countryCode: {
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    color: "#000",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#1A1A1A",
    fontFamily: getFontFamily("400"),
    fontSize: normalize(18),
    backgroundColor: "#FFFFFF",
  },
  errorBorder: { borderColor: "#FF3B30", borderWidth: 1.5 },
  errorText: {
    color: "#FF3B30",
    marginTop: 6,
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    marginLeft: 4,
  },
  label: {
    fontFamily: getFontFamily("700"),
    fontSize: normalize(16),
    marginBottom: 6,
    color: "#000",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 26,
    paddingHorizontal: 18,
    marginTop: 40,
    maxHeight: "80%",
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
  },
  modalHeader: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: getFontFamily("900"),
    fontSize: normalize(20),
    color: "#374151",
  },
  searchInput: {
    fontFamily: getFontFamily("400"),
    fontSize: normalize(16),
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  countryRow: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e5e5ff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  countryLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  countryName: {
    fontFamily: getFontFamily("700"),
    fontSize: normalize(15),
  },
  callingCode: {
    fontFamily: getFontFamily("400"),
    fontSize: normalize(15),
    color: "#666",
  },
});

export default PhoneNumberInputField;
