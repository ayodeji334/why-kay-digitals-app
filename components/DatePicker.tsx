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
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dateField}
        onPress={toggle}
        activeOpacity={0.8}
      >
        <Text style={styles.dateText}>{displayText}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{label}</Text>

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
                    <Text
                      style={[
                        styles.scrollText,
                        item === tempDate.getDate() && styles.selectedText,
                      ]}
                    >
                      {item}
                    </Text>
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
                    <Text
                      style={[
                        styles.scrollText,
                        index === tempDate.getMonth() && styles.selectedText,
                      ]}
                    >
                      {item.slice(0, 3)}
                    </Text>
                  </View>
                )}
              />

              {/* Year Picker */}
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
                    <Text
                      style={[
                        styles.scrollText,
                        item === tempDate.getFullYear() && styles.selectedText,
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                )}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={toggle}>
                <Text style={[styles.btnText, { color: "#000" }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
              >
                <Text style={styles.btnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#000",
    marginTop: 6,
  },
  highlightBar: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 40,
    marginTop: -20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#D1D5DB",
    pointerEvents: "none",
  },
  dateField: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateText: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("700"),
    color: "#111827",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    marginBottom: 16,
    textAlign: "left",
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
    fontFamily: getFontFamily("400"),
    color: "#6B7280",
  },
  selectedText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#111827",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
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
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
    color: "#fff",
  },
});

export default DatePicker;
