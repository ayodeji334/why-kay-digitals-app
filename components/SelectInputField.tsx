// // import React, { useState } from "react";
// // import { Controller, Control } from "react-hook-form";
// // import {
// //   Modal,
// //   View,
// //   Text,
// //   Pressable,
// //   FlatList,
// //   StyleSheet,
// //   TextInput,
// // } from "react-native";
// // import { getFontFamily, normalize } from "../constants/settings";

// // interface Option {
// //   label: string;
// //   value: string;
// // }

// // interface SelectInputProps {
// //   name: string;
// //   control: Control<any>;
// //   label?: string;
// //   options: Option[];
// //   placeholder?: string;
// //   rules?: object;
// // }

// // export function SelectInput({
// //   name,
// //   control,
// //   label,
// //   options,
// //   placeholder = "Select an option...",
// //   rules,
// // }: SelectInputProps) {
// //   const [visible, setVisible] = useState(false);
// //   const [search, setSearch] = useState("");

// //   return (
// //     <Controller
// //       name={name}
// //       control={control}
// //       rules={rules}
// //       render={({ field: { value, onChange }, fieldState: { error } }) => (
// //         <>
// //           {label && <Text style={styles.label}>{label}</Text>}

// //           <View style={{ marginBottom: 18 }}>
// //             <Pressable
// //               style={[styles.input, error && styles.errorBorder]}
// //               onPress={() => setVisible(true)}
// //             >
// //               <Text
// //                 style={{
// //                   color: value ? "#000" : "#999",
// //                   fontFamily: getFontFamily("700"),
// //                   fontSize: normalize(17),
// //                 }}
// //               >
// //                 {value
// //                   ? options.find(opt => opt.value === value)?.label
// //                   : placeholder}
// //               </Text>
// //             </Pressable>

// //             {error && <Text style={styles.error}>{error.message}</Text>}
// //           </View>

// //           {/* Modal for Selection */}
// //           <Modal visible={visible} animationType="slide" transparent={true}>
// //             <View style={styles.modalOverlay}>
// //               <View style={styles.modalContent}>
// //                 <View style={{ marginBottom: 10 }}>
// //                   <Text
// //                     style={[
// //                       styles.label,
// //                       {
// //                         fontFamily: getFontFamily(900),
// //                         fontSize: normalize(19),
// //                       },
// //                     ]}
// //                   >
// //                     Select an options
// //                   </Text>
// //                   <TextInput
// //                     placeholder="Search..."
// //                     style={styles.search}
// //                     value={search}
// //                     placeholderTextColor={"#b3b3b3ff"}
// //                     onChangeText={setSearch}
// //                   />
// //                 </View>
// //                 <FlatList
// //                   data={options.filter(opt =>
// //                     opt.label.toLowerCase().includes(search.toLowerCase()),
// //                   )}
// //                   keyExtractor={item => item.value}
// //                   renderItem={({ item }) => (
// //                     <Pressable
// //                       style={styles.option}
// //                       onPress={() => {
// //                         onChange(item.value);
// //                         setVisible(false);
// //                         setSearch("");
// //                       }}
// //                     >
// //                       <Text
// //                         style={{
// //                           fontSize: normalize(19),
// //                           fontFamily: getFontFamily("700"),
// //                         }}
// //                       >
// //                         {item.label}
// //                       </Text>
// //                     </Pressable>
// //                   )}
// //                 />
// //                 <Pressable
// //                   style={styles.closeBtn}
// //                   onPress={() => setVisible(false)}
// //                 >
// //                   <Text
// //                     style={{
// //                       color: "white",
// //                       fontSize: normalize(15),
// //                       fontFamily: getFontFamily("700"),
// //                     }}
// //                   >
// //                     Close
// //                   </Text>
// //                 </Pressable>
// //               </View>
// //             </View>
// //           </Modal>
// //         </>
// //       )}
// //     />
// //   );
// // }

// // const styles = StyleSheet.create({
// //   label: {
// //     fontFamily: getFontFamily("700"),
// //     fontSize: normalize(18),
// //     marginBottom: 8,
// //   },
// //   placeholderStyle: {
// //     color: "#000000ff",
// //   },
// //   errorBorder: {
// //     borderColor: "#FF3B30",
// //     borderWidth: 1.5,
// //   },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //     padding: 16,
// //     borderRadius: 8,
// //     backgroundColor: "white",
// //     fontFamily: getFontFamily("900"),
// //     fontSize: normalize(23),
// //   },
// //   error: {
// //     color: "red",
// //     fontFamily: getFontFamily("700"),
// //     fontSize: normalize(18),
// //     marginTop: 8,
// //   },
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: "rgba(0,0,0,0.4)",
// //     justifyContent: "flex-end",
// //     alignItems: "flex-end",
// //   },
// //   modalContent: {
// //     backgroundColor: "white",
// //     width: "100%",
// //     borderRadius: 12,
// //     padding: 16,
// //     maxHeight: "80%",
// //     paddingBottom: 40,
// //   },
// //   search: {
// //     borderWidth: 1,
// //     borderColor: "#ddd",
// //     borderRadius: 8,
// //     padding: 8,
// //     marginBottom: 12,
// //     fontFamily: getFontFamily("700"),
// //     fontSize: normalize(19),
// //     color: "red",
// //   },
// //   option: {
// //     paddingVertical: 12,
// //     borderBottomWidth: 1,
// //     borderBottomColor: "#eee",
// //     fontFamily: getFontFamily("700"),
// //     fontSize: normalize(19),
// //   },
// //   closeBtn: {
// //     marginTop: 12,
// //     backgroundColor: "#333",
// //     padding: 12,
// //     borderRadius: 8,
// //     alignItems: "center",
// //   },
// // });
// import React, { useState } from "react";
// import { Controller, Control } from "react-hook-form";
// import {
//   Modal,
//   View,
//   Text,
//   Pressable,
//   FlatList,
//   StyleSheet,
//   TextInput,
// } from "react-native";
// import { getFontFamily, normalize } from "../constants/settings";

// interface Option {
//   label: string;
//   value: string;
// }

// interface SelectInputProps {
//   name?: string; // optional — so you can use it without react-hook-form
//   control?: Control<any>;
//   label?: string;
//   options: Option[];
//   placeholder?: string;
//   rules?: object;
//   value?: string | null; // for external control
//   onChange?: (value: string) => void; // external change handler
// }

// export function SelectInput({
//   name,
//   control,
//   label,
//   options,
//   placeholder = "Select an option...",
//   rules,
//   value: externalValue,
//   onChange: externalOnChange,
// }: SelectInputProps) {
//   const [visible, setVisible] = useState(false);
//   const [search, setSearch] = useState("");
//   const [internalValue, setInternalValue] = useState<string | null>(
//     externalValue ?? null,
//   );

//   const handleSelect = (val: string) => {
//     if (externalOnChange) {
//       externalOnChange(val);
//     }
//     setInternalValue(val);
//     setVisible(false);
//     setSearch("");
//   };

//   const renderSelectView = (
//     value: string | null,
//     onChange?: (value: string) => void,
//     errorMessage?: string,
//   ) => (
//     <>
//       {label && <Text style={styles.label}>{label}</Text>}

//       <View style={{ marginBottom: 18 }}>
//         <Pressable
//           style={[styles.input, errorMessage && styles.errorBorder]}
//           onPress={() => setVisible(true)}
//         >
//           <Text
//             style={{
//               color: value ? "#000" : "#999",
//               fontFamily: getFontFamily("700"),
//               fontSize: normalize(17),
//             }}
//           >
//             {value
//               ? options.find(opt => opt.value === value)?.label
//               : placeholder}
//           </Text>
//         </Pressable>

//         {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
//       </View>

//       {/* Modal */}
//       <Modal visible={visible} animationType="slide" transparent={true}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={{ marginBottom: 10 }}>
//               <Text
//                 style={[
//                   styles.label,
//                   {
//                     fontFamily: getFontFamily(900),
//                     fontSize: normalize(19),
//                   },
//                 ]}
//               >
//                 Select an option
//               </Text>
//               <TextInput
//                 placeholder="Search..."
//                 style={styles.search}
//                 value={search}
//                 placeholderTextColor={"#b3b3b3ff"}
//                 onChangeText={setSearch}
//               />
//             </View>
//             <FlatList
//               data={options.filter(opt =>
//                 opt.label.toLowerCase().includes(search.toLowerCase()),
//               )}
//               keyExtractor={item => item.value}
//               renderItem={({ item }) => (
//                 <Pressable
//                   style={styles.option}
//                   onPress={() => {
//                     if (onChange) onChange(item.value);
//                     handleSelect(item.value);
//                   }}
//                 >
//                   <Text
//                     style={{
//                       fontSize: normalize(19),
//                       fontFamily: getFontFamily("700"),
//                     }}
//                   >
//                     {item.label}
//                   </Text>
//                 </Pressable>
//               )}
//             />
//             <Pressable
//               style={styles.closeBtn}
//               onPress={() => setVisible(false)}
//             >
//               <Text
//                 style={{
//                   color: "white",
//                   fontSize: normalize(15),
//                   fontFamily: getFontFamily("700"),
//                 }}
//               >
//                 Close
//               </Text>
//             </Pressable>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );

//   // If react-hook-form is used
//   if (control && name) {
//     return (
//       <Controller
//         name={name}
//         control={control}
//         rules={rules}
//         render={({ field: { value, onChange }, fieldState: { error } }) =>
//           renderSelectView(value ?? null, onChange, error?.message)
//         }
//       />
//     );
//   }

//   // Standalone usage
//   return renderSelectView(internalValue, externalOnChange);
// }

// const styles = StyleSheet.create({
//   label: {
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(18),
//     marginBottom: 8,
//   },
//   errorBorder: {
//     borderColor: "#FF3B30",
//     borderWidth: 1.5,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 16,
//     borderRadius: 8,
//     backgroundColor: "white",
//     fontFamily: getFontFamily("900"),
//     fontSize: normalize(23),
//   },
//   error: {
//     color: "red",
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(18),
//     marginTop: 8,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     justifyContent: "flex-end",
//     alignItems: "flex-end",
//   },
//   modalContent: {
//     backgroundColor: "white",
//     width: "100%",
//     borderRadius: 12,
//     padding: 16,
//     maxHeight: "80%",
//     paddingBottom: 40,
//   },
//   search: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     padding: 8,
//     marginBottom: 12,
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(19),
//     color: "red",
//   },
//   option: {
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(19),
//   },
//   closeBtn: {
//     marginTop: 12,
//     backgroundColor: "#333",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//   },
// });
import React, { useMemo, useState } from "react";
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
import { ChevronDown } from "lucide-react-native";
import { formatAmount } from "../libs/formatNumber";
import { COLORS } from "../constants/colors";
import { SvgUri } from "react-native-svg";

interface Option {
  label: string;
  value: string;
  symbol?: string;
  usdPrice?: number;
  logo_url?: string;
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
  children?: React.ReactNode;
  onPress?: () => void;
  title?: string;
}

export function SelectInput({
  name,
  control,
  label,
  options,
  placeholder = "Select an option...",
  rules,
  value: externalValue,
  onChange: externalOnChange,
  children,
  onPress: externalOnPress,
  title = "Select an option",
}: SelectInputProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [internalValue, setInternalValue] = useState<string | null>(
    externalValue ?? null,
  );

  const handleSelect = (val: string) => {
    if (externalOnChange) {
      externalOnChange(val);
    }
    setInternalValue(val);
    setVisible(false);
    setSearch("");
  };

  const handlePress = () => {
    if (externalOnPress) {
      externalOnPress();
    } else {
      setVisible(true);
    }
  };

  const selectedOption = useMemo(
    () =>
      options.find(
        opt => opt.value === (control && name ? externalValue : internalValue),
      ),
    [internalValue],
  );

  const renderSelectView = (
    value: string | null,
    onChange?: (value: string) => void,
    errorMessage?: string,
  ) => (
    <>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={{ marginBottom: 18 }}>
        <Pressable
          style={[styles.input, errorMessage && styles.errorBorder]}
          onPress={handlePress}
        >
          {children ? (
            children
          ) : (
            <View style={styles.selectedCryptoContainer}>
              {selectedOption?.logo_url && (
                <Image
                  resizeMode="cover"
                  source={{
                    uri: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
                  }}
                  style={styles.cryptoLogo}
                />
              )}
              <View style={styles.selectedCryptoInfo}>
                <Text style={styles.selectedCryptoName}>
                  {selectedOption
                    ? `${selectedOption.label} (${selectedOption.symbol})`
                    : placeholder}
                </Text>
              </View>
              <ChevronDown size={20} color="#374151" />
            </View>
          )}
        </Pressable>

        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      </View>

      {/* Modal */}
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TextInput
                placeholder="Search cryptocurrency..."
                style={styles.search}
                value={search}
                placeholderTextColor={"#9CA3AF"}
                onChangeText={setSearch}
              />
            </View>
            <FlatList
              data={options.filter(opt =>
                opt.label.toLowerCase().includes(search.toLowerCase()),
              )}
              keyExtractor={item => item.value}
              renderItem={({ item }) => {
                return (
                  <Pressable
                    style={styles.option}
                    onPress={() => {
                      if (onChange) onChange(item.value);
                      handleSelect(item.value);
                    }}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.cryptoRow}>
                        {item.logo_url && (
                          <Image
                            source={{
                              uri: item.logo_url,
                              cache: "only-if-cached",
                            }}
                            resizeMode="contain"
                            style={styles.optionLogo}
                          />
                        )}
                        <View style={styles.cryptoInfo}>
                          <Text style={styles.optionName}>
                            {`${item.label} (${item.symbol})`}
                          </Text>
                          {item.market_value && (
                            <Text style={styles.optionPrice}>
                              USD{" "}
                              {formatAmount(item.market_value, false, "USD", 2)}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                    <View style={styles.separator} />
                  </Pressable>
                );
              }}
            />
            <Pressable
              style={styles.closeBtn}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );

  // If react-hook-form is used
  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { value, onChange }, fieldState: { error } }) =>
          renderSelectView(value ?? null, onChange, error?.message)
        }
      />
    );
  }

  // Standalone usage
  return renderSelectView(internalValue, externalOnChange);
}

const styles = StyleSheet.create({
  label: {
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    marginBottom: 8,
    color: "#374151",
  },
  modalTitle: {
    fontFamily: getFontFamily("900"),
    fontSize: normalize(20),
    color: "#374151",
    textAlign: "left",
    marginBottom: 16,
  },
  selectedCryptoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  selectedCryptoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectedCryptoName: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("700"),
    color: "#374151",
    marginBottom: 2,
  },
  selectedCryptoSymbol: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
    color: "#6B7280",
  },
  cryptoLogo: {
    width: 30,
    height: 30,
    borderRadius: 160,
    backgroundColor: "red",
  },
  optionLogo: {
    width: 30,
    height: 30,
    borderRadius: 20,
    marginRight: 12,
  },
  cryptoRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cryptoInfo: {
    flex: 1,
  },
  errorBorder: {
    borderColor: "#FF3B30",
    borderWidth: 1.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: "white",
    minHeight: 30,
    justifyContent: "center",
  },
  error: {
    color: "#FF3B30",
    fontFamily: getFontFamily("700"),
    fontSize: normalize(14),
    marginTop: 4,
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
    paddingBottom: 30,
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
  option: {
    paddingVertical: 16,
  },
  optionContent: {
    paddingHorizontal: 8,
  },
  optionName: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("700"),
    color: "#374151",
    marginBottom: 4,
  },
  optionPrice: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
    color: "#6B7280",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 16,
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 38,
    alignItems: "center",
  },
  closeBtnText: {
    color: "black",
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
  },
});
