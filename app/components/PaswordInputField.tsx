// import Entypo from "@react-native-vector-icons/entypo";
// import React, { useState } from "react";
// import { Controller } from "react-hook-form";
// import {
//   TextInput,
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
// } from "react-native";
// import { width } from "../../App";

// interface Props {
//   control: any;
//   name: string;
//   placeholder?: string;
//   rules?: object;
//   label?: string;
//   showLabel?: boolean;
// }

// const PasswordInputField: React.FC<Props> = ({
//   control,
//   name,
//   placeholder,
//   rules,
//   label,
//   showLabel = true,
// }) => {
//   const [showPassword, setShowPassword] = useState(false);

//   return (
//     <Controller
//       control={control}
//       name={name}
//       rules={rules}
//       render={({
//         field: { onChange, onBlur, value },
//         fieldState: { error },
//       }) => (
//         <View style={styles.container}>
//           {showLabel && label && <Text style={styles.label}>{label}</Text>}

//           <View style={styles.inputWrapper}>
//             <TextInput
//               style={[styles.input, error && styles.errorBorder]}
//               placeholder={placeholder}
//               secureTextEntry={!showPassword}
//               onBlur={onBlur}
//               onChangeText={onChange}
//               value={value}
//             />
//             <TouchableOpacity
//               activeOpacity={0.6}
//               onPress={() => setShowPassword(!showPassword)}
//             >
//               <Text style={styles.toggle}>
//                 {showPassword ? (
//                   <Entypo name="eye" size={30} />
//                 ) : (
//                   <Entypo name="eye-with-line" size={30} />
//                 )}
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {error && <Text style={styles.errorText}>{error.message}</Text>}
//         </View>
//       )}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 15,
//   },
//   label: {
//     fontSize: width * 0.0353,
//     fontWeight: "500",
//     marginBottom: 6,
//     color: "#333",
//   },
//   inputWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     paddingHorizontal: 10,
//   },
//   input: {
//     flex: 1,
//     paddingHorizontal: 5,
//     paddingVertical: 20,
//   },
//   toggle: {
//     color: "blue",
//     fontWeight: "600",
//     marginLeft: 8,
//   },
//   errorBorder: {
//     borderColor: "red",
//   },
//   errorText: {
//     color: "red",
//     marginTop: 4,
//     fontSize: 12,
//   },
// });

// export default PasswordInputField;
import Entypo from "@react-native-vector-icons/entypo";
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { width } from "../constants/settings";

interface Props {
  control: any;
  name: string;
  placeholder?: string;
  rules?: object;
  label?: string;
  showLabel?: boolean;
  showHints?: boolean; // NEW: toggle for hints
}

const PasswordInputField: React.FC<Props> = ({
  control,
  name,
  placeholder,
  rules,
  label,
  showLabel = true,
  showHints = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Password validation rules
  const passwordValidations = [
    { label: "At least 8 characters", test: (val: string) => val.length >= 8 },
    { label: "One uppercase letter", test: (val: string) => /[A-Z]/.test(val) },
    { label: "One lowercase letter", test: (val: string) => /[a-z]/.test(val) },
    { label: "One number", test: (val: string) => /[0-9]/.test(val) },
    {
      label: "One special character",
      test: (val: string) => /[^A-Za-z0-9]/.test(val),
    },
  ];

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        ...rules,
        pattern: {
          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/,
          message:
            "Password must contain at least 8 characters, one uppercase, one lowercase, and one special character.",
        },
      }}
      render={({
        field: { onChange, onBlur, value = "" },
        fieldState: { error },
      }) => (
        <View style={styles.container}>
          {showLabel && label && <Text style={styles.label}>{label}</Text>}

          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, error && styles.errorBorder]}
              placeholder={placeholder}
              secureTextEntry={!showPassword}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Entypo name="eye" size={24} />
              ) : (
                <Entypo name="eye-with-line" size={24} />
              )}
            </TouchableOpacity>
          </View>

          {/* Show validation hints */}
          {showHints && (
            <View style={styles.hintsWrapper}>
              {passwordValidations.map((rule, idx) => {
                const passed = rule.test(value);
                return (
                  <Text
                    key={idx}
                    style={[
                      styles.hint,
                      passed ? styles.hintValid : styles.hintInvalid,
                    ]}
                  >
                    {passed ? "✅" : "❌"} {rule.label}
                  </Text>
                );
              })}
            </View>
          )}

          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: width * 0.0353,
    fontWeight: "500",
    marginBottom: 6,
    color: "#333",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    paddingHorizontal: 5,
    paddingVertical: 15,
  },
  errorBorder: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginTop: 4,
    fontSize: 12,
  },
  hintsWrapper: {
    marginTop: 6,
  },
  hint: {
    fontSize: 12,
    marginVertical: 2,
  },
  hintValid: {
    color: "green",
  },
  hintInvalid: {
    color: "red",
  },
});

export default PasswordInputField;
