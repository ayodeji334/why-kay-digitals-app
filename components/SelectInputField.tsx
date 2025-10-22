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
} from "react-native";
import { getFontFamily, normalize } from "../constants/settings";

interface Option {
  label: string;
  value: string;
}

interface SelectInputProps {
  name: string;
  control: Control<any>;
  label?: string;
  options: Option[];
  placeholder?: string;
  rules?: object;
}

export function SelectInput({
  name,
  control,
  label,
  options,
  placeholder = "Select an option...",
  rules,
}: SelectInputProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <>
          {label && <Text style={styles.label}>{label}</Text>}

          <View style={{ marginBottom: 18 }}>
            <Pressable
              style={[styles.input, error && styles.errorBorder]}
              onPress={() => setVisible(true)}
            >
              <Text
                style={{
                  color: value ? "#000" : "#999",
                  fontFamily: getFontFamily("700"),
                  fontSize: normalize(17),
                }}
              >
                {value
                  ? options.find(opt => opt.value === value)?.label
                  : placeholder}
              </Text>
            </Pressable>

            {error && <Text style={styles.error}>{error.message}</Text>}
          </View>

          {/* Modal for Selection */}
          <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={{ marginBottom: 10 }}>
                  <Text
                    style={[
                      styles.label,
                      {
                        fontFamily: getFontFamily(900),
                        fontSize: normalize(19),
                      },
                    ]}
                  >
                    Select an options
                  </Text>
                  <TextInput
                    placeholder="Search..."
                    style={styles.search}
                    value={search}
                    placeholderTextColor={"#b3b3b3ff"}
                    onChangeText={setSearch}
                  />
                </View>
                <FlatList
                  data={options.filter(opt =>
                    opt.label.toLowerCase().includes(search.toLowerCase()),
                  )}
                  keyExtractor={item => item.value}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.option}
                      onPress={() => {
                        onChange(item.value);
                        setVisible(false);
                        setSearch("");
                      }}
                    >
                      <Text
                        style={{
                          fontSize: normalize(19),
                          fontFamily: getFontFamily("700"),
                        }}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  )}
                />
                <Pressable
                  style={styles.closeBtn}
                  onPress={() => setVisible(false)}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: normalize(15),
                      fontFamily: getFontFamily("700"),
                    }}
                  >
                    Close
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </>
      )}
    />
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    marginBottom: 8,
  },
  placeholderStyle: {
    color: "#000000ff",
  },
  errorBorder: {
    borderColor: "#FF3B30",
    borderWidth: 1.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 16,
    borderRadius: 8,
    backgroundColor: "white",
    fontFamily: getFontFamily("900"),
    fontSize: normalize(23),
  },
  error: {
    color: "red",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    width: "100%",
    borderRadius: 12,
    padding: 16,
    maxHeight: "80%",
    paddingBottom: 40,
  },
  search: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    fontFamily: getFontFamily("700"),
    fontSize: normalize(19),
    color: "red",
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(19),
  },
  closeBtn: {
    marginTop: 12,
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
