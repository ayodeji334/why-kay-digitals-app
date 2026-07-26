import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Modal,
  TextInput,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { CloseIcon } from "../assets";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import { AppText } from "./AppText";
import CustomIcon from "./CustomIcon";
import { ArrowDown2 } from "iconsax-react-nativejs";
import { Country, CountryPickerProps } from "../libs/types";
import { useColors } from "../hooks/useTheme";

const defaultGetCountryName = (country: Country): string => {
  if (!country.name) return country.cca2;
  if (typeof country.name === "string") return country.name;
  return country.name.common ?? country.name.official ?? country.cca2;
};

interface CountryRowProps {
  item: Country;
  getCountryName: (c: Country) => string;
  onPress: (item: Country) => void;
  isSelected: boolean;
}

const CountryRow = React.memo(
  ({ item, getCountryName, onPress, isSelected }: CountryRowProps) => {
    const colors = useColors();
    const styles = makeStyles(colors);

    return (
      <Pressable
        style={[styles.countryRow, isSelected && styles.countryRowSelected]}
        onPress={() => onPress(item)}
        hitSlop={10}
      >
        <View style={styles.countryLeft}>
          {item.flag && (
            <Image
              source={{ uri: item.flag }}
              style={styles.flagImage}
              resizeMode="contain"
            />
          )}
          <AppText
            style={[
              styles.countryName,
              isSelected && styles.countryNameSelected,
            ]}
          >
            {getCountryName(item)}
          </AppText>
        </View>
        <AppText
          style={[styles.countryCode, isSelected && styles.countryCodeSelected]}
        >
          {item.cca2}
        </AppText>
      </Pressable>
    );
  },
);

const CountryPicker: React.FC<CountryPickerProps> = ({
  value,
  onChange,
  countries,
  getCountryName = defaultGetCountryName,
  defaultCountry,
  label,
  placeholder = "Select country",
  error,
  modalTitle = "Select Country",
  searchPlaceholder = "Search country...",
  disabled = false,
  loading = false,
  loadingText = "Loading countries...",
  emptyText = "No countries found",
  showCode = true,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const colors = useColors();
  const styles = makeStyles(colors);

  const selectedCountry = value ?? defaultCountry;

  const filteredCountries = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(c => {
      const name = getCountryName(c).toLowerCase();
      const code = c.cca2.toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [searchText, countries, getCountryName]);

  const openModal = useCallback(() => {
    if (!disabled && !loading) setModalVisible(true);
  }, [disabled, loading]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSearchText("");
  }, []);

  const handleSelect = useCallback(
    (item: Country) => {
      onChange(item);
      closeModal();
    },
    [onChange, closeModal],
  );

  return (
    <View style={styles.container}>
      {label && <AppText style={styles.label}>{label}</AppText>}

      {/* Selector box */}
      {/* <Pressable
        hitSlop={100}
        style={[
          styles.selectorBox,
          error && styles.errorBorder,
          disabled && styles.disabled,
        ]}
        onPress={openModal}
      >
        {selectedCountry ? (
          <View style={styles.selectorContent}>
            {selectedCountry.flag && (
              <Image
                source={{ uri: selectedCountry.flag }}
                style={styles.flagImage}
                resizeMode="contain"
              />
            )}
            <AppText style={styles.selectorText}>
              {getCountryName(selectedCountry)}
              {showCode ? `  (${selectedCountry.cca2})` : ""}
            </AppText>
          </View>
        ) : (
          <AppText style={styles.placeholderText}>{placeholder}</AppText>
        )}
        <ArrowDown2 size={20} color="#374151" />
      </Pressable> */}
      <Pressable
        hitSlop={100}
        style={[
          styles.selectorBox,
          error && styles.errorBorder,
          (disabled || loading) && styles.disabled,
        ]}
        onPress={openModal}
      >
        {loading ? (
          <AppText style={styles.placeholderText}>{loadingText}</AppText>
        ) : selectedCountry ? (
          <View style={styles.selectorContent}>
            {selectedCountry.flag && (
              <Image
                source={{ uri: selectedCountry.flag }}
                style={styles.flagImage}
                resizeMode="contain"
              />
            )}
            <AppText style={styles.selectorText}>
              {getCountryName(selectedCountry)}
              {showCode ? `  (${selectedCountry.cca2})` : ""}
            </AppText>
          </View>
        ) : (
          <AppText style={styles.placeholderText}>{placeholder}</AppText>
        )}

        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <ArrowDown2 size={20} color="#374151" />
        )}
      </Pressable>

      {error && <AppText style={styles.errorText}>{error}</AppText>}

      {/* Country Picker Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.overlay}
        >
          <Pressable style={styles.backdropTap} onPress={closeModal} />

          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>{modalTitle}</AppText>
              <Pressable onPress={closeModal} hitSlop={8}>
                <CustomIcon
                  source={CloseIcon}
                  color={COLORS.primary}
                  fill={COLORS.primary}
                  overrideColor
                  size={18}
                />
              </Pressable>
            </View>

            {/* Search */}
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor="#989898"
              value={searchText}
              onChangeText={setSearchText}
              maxFontSizeMultiplier={1}
              allowFontScaling={false}
              autoCorrect={false}
            />

            {/* List */}
            {/* <FlatList
              data={filteredCountries}
              keyExtractor={item => item.cca2}
              renderItem={({ item }) => (
                <CountryRow
                  item={item}
                  getCountryName={getCountryName}
                  onPress={handleSelect}
                  isSelected={selectedCountry?.cca2 === item.cca2}
                />
              )}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              initialNumToRender={20}
              maxToRenderPerBatch={30}
              windowSize={10}
              getItemLayout={(_, index) => ({
                length: 53,
                offset: 53 * index,
                index,
              })}
            /> */}

            <FlatList
              data={loading ? [] : filteredCountries}
              keyExtractor={item => item.cca2}
              renderItem={({ item }) => (
                <CountryRow
                  item={item}
                  getCountryName={getCountryName}
                  onPress={handleSelect}
                  isSelected={selectedCountry?.cca2 === item.cca2}
                />
              )}
              ListEmptyComponent={
                <View style={styles.listState}>
                  {loading ? (
                    <>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                      <AppText style={styles.listStateText}>
                        {loadingText}
                      </AppText>
                    </>
                  ) : (
                    <AppText style={styles.listStateText}>
                      {searchText.trim()
                        ? "No match for your search"
                        : emptyText}
                    </AppText>
                  )}
                </View>
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              initialNumToRender={20}
              maxToRenderPerBatch={30}
              windowSize={10}
              getItemLayout={(_, index) => ({
                length: 53,
                offset: 53 * index,
                index,
              })}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default CountryPicker;

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { marginBottom: 10 },
    label: {
      fontFamily: getFontFamily("800"),
      fontSize: normalize(18),
      marginBottom: 6,
      color: colors.text,
    },
    listState: {
      paddingVertical: normalize(32),
      alignItems: "center",
      justifyContent: "center",
    },
    listStateText: {
      marginTop: 8,
      color: colors.textMuted,
      fontSize: normalize(18),
    },
    selectorBox: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.background,
      minHeight: 45,
    },
    selectorContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    selectorText: {
      fontFamily: getFontFamily("800"),
      fontSize: normalize(18),
      color: colors.text,
      flex: 1,
      textTransform: "uppercase",
    },
    placeholderText: {
      fontFamily: getFontFamily("400"),
      fontSize: normalize(18),
      color: colors.textMuted,
      flex: 1,
    },

    flagImage: { width: 30, height: 20 },
    disabled: { opacity: 0.5 },
    errorBorder: { borderColor: colors.error, borderWidth: 1.5 },
    errorText: {
      color: colors.error,
      marginTop: 6,
      fontFamily: getFontFamily("700"),
      fontSize: normalize(14),
      marginLeft: 4,
    },

    // Modal
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    backdropTap: { flex: 1 },
    modalContainer: {
      backgroundColor: colors.inputBackground,
      paddingVertical: 26,
      paddingHorizontal: 18,
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
      color: colors.text,
    },
    searchInput: {
      fontFamily: getFontFamily("400"),
      fontSize: normalize(17),
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
      borderRadius: 8,
      marginBottom: 20,
    },
    countryRow: {
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    countryRowSelected: {
      backgroundColor: `${COLORS.primary}30`,
    },
    countryLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    countryName: {
      fontFamily: getFontFamily("800"),
      fontSize: normalize(19),
      color: colors.text,
      textTransform: "uppercase",
    },
    countryNameSelected: {
      color: "white",
    },
    countryCode: {
      fontFamily: getFontFamily("700"),
      fontSize: normalize(19),
      color: colors.textMuted,
    },
    countryCodeSelected: {
      color: COLORS.primary,
    },
  });
