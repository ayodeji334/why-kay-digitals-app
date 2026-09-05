import React, { useMemo, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
} from "react-native";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";
import { Calendar } from "iconsax-react-nativejs";
import { SafeAreaView } from "react-native-safe-area-context";

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

// Matches the classic UIDatePicker wheel: ~5 rows tall, with the middle
// row framed by two hairlines and every other row fading toward the edges
// as it scrolls past.
const ITEM_HEIGHT = 40;
const VISIBLE_ROWS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const SIDE_PADDING = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;

type WheelColumnProps = {
  data: string[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  styles: ReturnType<typeof makeStyles>;
};

// One scrollable wheel (day / month / year). Kept as its own component so
// each column owns its own Animated.Value — the opacity/scale fade is
// driven by that column's own scroll position relative to each row.
const WheelColumn: React.FC<WheelColumnProps> = ({
  data,
  selectedIndex,
  onSelectIndex,
  styles,
}) => {
  const scrollY = useRef(
    new Animated.Value(selectedIndex * ITEM_HEIGHT),
  ).current;

  return (
    <Animated.FlatList
      data={data}
      keyExtractor={(item, index) => `${item}-${index}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      initialScrollIndex={selectedIndex}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true },
      )}
      scrollEventThrottle={16}
      onMomentumScrollEnd={e => {
        const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
        onSelectIndex(Math.max(0, Math.min(data.length - 1, index)));
      }}
      renderItem={({ item, index }) => {
        const inputRange = [
          (index - 2) * ITEM_HEIGHT,
          (index - 1) * ITEM_HEIGHT,
          index * ITEM_HEIGHT,
          (index + 1) * ITEM_HEIGHT,
          (index + 2) * ITEM_HEIGHT,
        ];
        const opacity = scrollY.interpolate({
          inputRange,
          outputRange: [0.25, 0.55, 1, 0.55, 0.25],
          extrapolate: "clamp",
        });
        const scale = scrollY.interpolate({
          inputRange,
          outputRange: [0.85, 0.93, 1, 0.93, 0.85],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            style={[styles.scrollItem, { opacity, transform: [{ scale }] }]}
          >
            <AppText
              style={[
                styles.scrollText,
                index === selectedIndex && styles.selectedText,
              ]}
            >
              {item}
            </AppText>
          </Animated.View>
        );
      }}
    />
  );
};

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

  const dayOptions = useMemo(
    () => Array.from({ length: 31 }, (_, i) => String(i + 1)),
    [],
  );
  const monthOptions = useMemo(() => months.map(m => m.slice(0, 3)), []);
  const yearOptions = useMemo(
    () => Array.from({ length: 100 }, (_, i) => String(1970 + i)),
    [],
  );

  return (
    <View style={{ marginVertical: normalizeSpacing(8) }}>
      <AppText style={styles.label}>{label}</AppText>
      <TouchableOpacity
        style={styles.dateField}
        onPress={toggle}
        activeOpacity={0.8}
      >
        <AppText style={styles.dateText}>{displayText}</AppText>
        <Calendar size={15} color={colors.text} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={toggle}
      >
        <View style={styles.overlay}>
          <SafeAreaView edges={["bottom"]} style={styles.modal}>
            <View style={styles.grabberWrap}>
              <View style={styles.grabber} />
            </View>

            <View style={styles.header}>
              <TouchableOpacity onPress={toggle} hitSlop={10}>
                <AppText style={styles.headerCancel}>Cancel</AppText>
              </TouchableOpacity>
              <AppText style={styles.headerTitle}>{label}</AppText>
              <TouchableOpacity onPress={handleConfirm} hitSlop={10}>
                <AppText style={styles.headerDone}>Done</AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.scrollPickerRow}>
              <View style={styles.highlightBar} />

              <WheelColumn
                data={dayOptions}
                selectedIndex={tempDate.getDate() - 1}
                onSelectIndex={index => {
                  const newDate = new Date(tempDate);
                  newDate.setDate(index + 1);
                  setTempDate(newDate);
                }}
                styles={styles}
              />

              <WheelColumn
                data={monthOptions}
                selectedIndex={tempDate.getMonth()}
                onSelectIndex={index => {
                  const newDate = new Date(tempDate);
                  newDate.setMonth(index);
                  setTempDate(newDate);
                }}
                styles={styles}
              />

              <WheelColumn
                data={yearOptions}
                selectedIndex={tempDate.getFullYear() - 1970}
                onSelectIndex={index => {
                  const newDate = new Date(tempDate);
                  newDate.setFullYear(1970 + index);
                  setTempDate(newDate);
                }}
                styles={styles}
              />
            </View>
          </SafeAreaView>
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
      marginTop: normalizeSpacing(6),
    },
    highlightBar: {
      position: "absolute",
      top: "50%",
      left: 0,
      right: 0,
      height: ITEM_HEIGHT,
      marginTop: -ITEM_HEIGHT / 2,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      pointerEvents: "none",
    },
    dateField: {
      backgroundColor: "inherit",
      paddingVertical: normalizeSpacing(14),
      paddingHorizontal: normalizeSpacing(14),
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
      borderTopLeftRadius: 14,
      borderTopRightRadius: 14,
      paddingHorizontal: normalizeSpacing(16),
    },
    grabberWrap: {
      alignItems: "center",
      paddingVertical: normalizeSpacing(8),
    },
    grabber: {
      width: normalizeSpacing(36),
      height: normalizeSpacing(5),
      borderRadius: normalizeSpacing(3),
      backgroundColor: colors.border,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: normalizeSpacing(12),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      marginBottom: normalizeSpacing(4),
    },
    headerCancel: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
    },
    headerTitle: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      color: colors.text,
    },
    headerDone: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      color: colors.primary,
    },
    scrollPickerRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      marginBottom: normalizeSpacing(8),
      height: PICKER_HEIGHT,
    },
    scrollContent: {
      paddingVertical: SIDE_PADDING,
    },
    scrollItem: {
      height: ITEM_HEIGHT,
      justifyContent: "center",
      alignItems: "center",
    },
    scrollText: {
      fontSize: normalize(21),
      fontFamily: getFontFamily("400"),
      color: colors.textMuted,
    },
    selectedText: {
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
  });

export default DatePicker;
