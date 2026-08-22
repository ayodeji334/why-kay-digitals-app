import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
} from "react-native";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";
import { Calendar } from "iconsax-react-nativejs";

interface DatePickerFieldProps {
  label: string;
  value?: string;
  onChange: (date: any) => void;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DatePicker: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
}) => {
  const today = new Date();
  const [visible, setVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(
    value
      ? (() => {
          const [dd, mm, yyyy] = value.split("-").map(Number);
          return new Date(yyyy, mm - 1, dd);
        })()
      : today,
  );
  const colors = useColors();
  const styles = makeStyles(colors);

  const toggle = () => setVisible(!visible);

  const handleConfirm = () => {
    const display = `${String(tempDate.getDate()).padStart(2, "0")}-${String(
      tempDate.getMonth() + 1,
    ).padStart(2, "0")}-${tempDate.getFullYear()}`;

    const iso = tempDate.toISOString().split("T")[0];

    onChange({ display, iso });
    toggle();
  };

  const displayText = useMemo(
    () =>
      value
        ? value
        : `${String(today.getDate()).padStart(2, "0")}-${String(
            today.getMonth() + 1,
          ).padStart(2, "0")}-${today.getFullYear()}`,
    [value],
  );

  return (
    <View style={{ marginVertical: normalize(8) }}>
      <AppText style={styles.label}>{label}</AppText>
      <TouchableOpacity
        style={styles.dateField}
        onPress={toggle}
        activeOpacity={0.8}
      >
        <AppText style={styles.dateText}>{displayText}</AppText>
        <Calendar size={15} color={colors.text} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={{ paddingBottom: 20 }}>
              <AppText style={styles.modalTitle}>Select {label}</AppText>
              <AppText
                style={{ color: colors.text, fontFamily: getFontFamily(400) }}
              >
                Kindly scroll the date
              </AppText>
            </View>
            <View style={styles.scrollPickerRow}>
              <View style={styles.highlightBar} />

              <FlatList
                data={[...Array(31).keys()].map(i => i + 1)}
                keyExtractor={item => item.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                snapToInterval={40}
                decelerationRate="fast"
                initialScrollIndex={tempDate.getDate() - 1}
                getItemLayout={(data, index) => ({
                  length: 40,
                  offset: 40 * index,
                  index,
                })}
                onMomentumScrollEnd={e => {
                  const index = Math.round(e.nativeEvent.contentOffset.y / 40);
                  const newDate = new Date(tempDate);
                  newDate.setDate(index + 1);
                  setTempDate(newDate);
                }}
                renderItem={({ item }) => (
                  <View style={styles.scrollItem}>
                    <AppText
                      style={[
                        styles.scrollText,
                        item === tempDate.getDate() && styles.selectedText,
                      ]}
                    >
                      {item}
                    </AppText>
                  </View>
                )}
              />

              {/* Month Picker */}
              <FlatList
                data={months}
                keyExtractor={item => item}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                snapToInterval={40}
                decelerationRate="fast"
                initialScrollIndex={tempDate.getMonth()}
                getItemLayout={(data, index) => ({
                  length: 40,
                  offset: 40 * index,
                  index,
                })}
                onMomentumScrollEnd={e => {
                  const index = Math.round(e.nativeEvent.contentOffset.y / 40);
                  const newDate = new Date(tempDate);
                  newDate.setMonth(index);
                  setTempDate(newDate);
                }}
                renderItem={({ item, index }) => (
                  <View style={styles.scrollItem}>
                    <AppText
                      style={[
                        styles.scrollText,
                        index === tempDate.getMonth() && styles.selectedText,
                      ]}
                    >
                      {item.slice(0, 3)}
                    </AppText>
                  </View>
                )}
              />

              <FlatList
                data={Array.from({ length: 100 }, (_, i) => 1970 + i)}
                keyExtractor={item => item.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                snapToInterval={40}
                decelerationRate="fast"
                initialScrollIndex={tempDate.getFullYear() - 1970}
                getItemLayout={(data, index) => ({
                  length: 40,
                  offset: 40 * index,
                  index,
                })}
                onMomentumScrollEnd={e => {
                  const index = Math.round(e.nativeEvent.contentOffset.y / 40);
                  const newDate = new Date(tempDate);
                  newDate.setFullYear(1970 + index);
                  setTempDate(newDate);
                }}
                renderItem={({ item }) => (
                  <View style={styles.scrollItem}>
                    <AppText
                      style={[
                        styles.scrollText,
                        item === tempDate.getFullYear() && styles.selectedText,
                      ]}
                    >
                      {item}
                    </AppText>
                  </View>
                )}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={toggle}>
                <AppText style={[styles.btnText, { color: colors.background }]}>
                  Cancel
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
              >
                <AppText style={styles.btnText}>Confirm</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    label: {
      fontFamily: getFontFamily("800"),
      fontSize: normalize(18),
      color: colors.text,
      marginTop: 6,
    },
    highlightBar: {
      position: "absolute",
      top: "50%",
      left: 0,
      right: 0,
      height: 50,
      marginTop: -25,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      pointerEvents: "none",
    },
    dateField: {
      backgroundColor: "inherit",
      paddingVertical: normalize(14),
      paddingHorizontal: normalize(14),
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    dateText: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      color: colors.text,
    },
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    modal: {
      backgroundColor: colors.inputBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
    },
    modalTitle: {
      fontSize: normalize(20),
      fontFamily: getFontFamily("800"),
      textAlign: "left",
      color: colors.text,
    },
    scrollPickerRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      marginBottom: 16,
      height: 120,
    },
    scrollContent: {
      paddingVertical: 40,
    },
    scrollItem: {
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    scrollText: {
      fontSize: normalize(16),
      fontFamily: getFontFamily("700"),
      color: colors.textMuted,
    },
    selectedText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 10,
    },
    cancelBtn: {
      flex: 1,
      backgroundColor: colors.text,
      paddingVertical: 10,
      borderRadius: 48,
    },
    confirmBtn: {
      flex: 1,
      backgroundColor: COLORS.primary,
      paddingVertical: 10,
      borderRadius: 48,
    },
    btnText: {
      textAlign: "center",
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
      color: "white",
    },
  });

export default DatePicker;
