// import React, { useState, useCallback, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
// } from "react-native";
// import { useForm, useWatch } from "react-hook-form";
// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// import TextInputField from "../TextInputField";
// import PasswordInputField from "../PasswordInputField";
// import { COLORS } from "../../constants/colors";
// import { useNavigation } from "@react-navigation/native";
// import CustomLoading from "../CustomLoading";
// import { useToastHelpers } from "../../utlis/toast";
// import { AxiosError } from "axios";
// import { getFontFamily, normalize } from "../../constants/settings";
// import { SelectInput } from "../SelectInputField";
// import useAxios from "../../hooks/useAxios";
// import parsePhoneNumberFromString from "libphonenumber-js";
// import PhoneNumberInputField from "../PhoneNumberInputField";
// import EmailInputField from "../EmailInputField";
// import { OneSignal } from "react-native-onesignal";
// import { AppText } from "../AppText";

// const registerSchema = yup.object().shape({
//   username: yup
//     .string()
//     .min(5, "Your username is too short")
//     .max(30, "Your username is too long")
//     .required("Username is required"),
//   email: yup.string().email("Invalid email").required("Email is required"),
//   phone_number: yup
//     .string()
//     .required("Phone number is required")
//     .test(
//       "is-valid-phone",
//       "Please provide a valid phone number",
//       function (value) {
//         if (!value) return false;

//         try {
//           // Remove any non-digit characters except + at the beginning
//           const cleanedValue = value.replace(/(?!^\+)[^\d]/g, "");

//           // Parse the phone number with Nigeria as default country
//           const phoneNumber = parsePhoneNumberFromString(cleanedValue, "NG");

//           // Return true if valid, false if invalid
//           return phoneNumber ? phoneNumber.isValid() : false;
//         } catch (error) {
//           // console.log("Phone number parsing error:", error);
//           return false;
//         }
//       },
//     ),
//   password: yup
//     .string()
//     .min(6, "Password must be at least 6 characters")
//     .required("Password is required"),
//   password_confirmation: yup
//     .string()
//     .oneOf([yup.ref("password")], "Passwords must match")
//     .required("Confirm password is required"),
//   how_do_heard_about_us: yup.string().required("Please select an option"),
// });

// function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = useState(value);
//   useEffect(() => {
//     const handler = setTimeout(() => setDebouncedValue(value), delay);
//     return () => clearTimeout(handler);
//   }, [value, delay]);
//   return debouncedValue;
// }

// const RegisterForm: React.FC = () => {
//   const { apiGet, post } = useAxios();
//   const { showSuccess, showError } = useToastHelpers();
//   const navigation: any = useNavigation();
//   const [loading, setLoading] = useState(false);
//   // const [checkingUsername, setCheckingUsername] = useState(false);
//   // const [usernameStatus, setUsernameStatus] = useState<{
//   //   available?: boolean;
//   //   message?: string;
//   // }>({});
//   const [checkingUsername, setCheckingUsername] = useState(false);
//   const [usernameStatus, setUsernameStatus] = useState<{
//     available?: boolean;
//     message?: string;
//   }>({});

//   const { control, handleSubmit, setError, setValue, clearErrors } =
//     useForm<any>({
//       resolver: yupResolver(registerSchema),
//       mode: "onChange",
//     });

//   const username = useWatch({ control, name: "username" });
//   const debouncedUsername = useDebounce(username?.trim() ?? "", 500);

//   useEffect(() => {
//     setUsernameStatus({});
//   }, [username]);

//   useEffect(() => {
//     if (!debouncedUsername || debouncedUsername.length < 5) {
//       setUsernameStatus({});
//       clearErrors("username");
//       setCheckingUsername(false);
//       return;
//     }

//     let cancelled = false;
//     const controller = new AbortController();

//     setCheckingUsername(true);

//     apiGet(
//       `/auth/check-username?username=${encodeURIComponent(debouncedUsername)}`,
//       {
//         signal: controller.signal,
//       },
//     )
//       .then(res => {
//         if (cancelled) return; // a newer keystroke has superseded this

//         const available = res.data.available;
//         setUsernameStatus({ available, message: res.data.message });

//         if (available === false) {
//           setError("username", {
//             type: "manual",
//             message: "Username is already taken",
//           });
//         } else {
//           clearErrors("username");
//         }
//       })
//       .catch(err => {
//         if (
//           cancelled ||
//           err.name === "CanceledError" ||
//           err.name === "AbortError"
//         )
//           return;
//         setUsernameStatus({
//           available: false,
//           message: "Couldn't check that username",
//         });
//       })
//       .finally(() => {
//         if (!cancelled) setCheckingUsername(false);
//       });

//     return () => {
//       cancelled = true;
//       controller.abort(); // kill the in-flight request
//     };
//   }, [debouncedUsername, apiGet, setError, clearErrors]);

//   // useEffect(() => {
//   //   const checkUsernameAvailability = async (usernameValue: string) => {
//   //     if (!usernameValue || usernameValue.length < 5) {
//   //       setUsernameStatus({});
//   //       clearErrors("username");
//   //       return;
//   //     }

//   //     setCheckingUsername(true);
//   //     try {
//   //       const res = await apiGet(
//   //         `/auth/check-username?username=${usernameValue}`,
//   //       );
//   //       setUsernameStatus({
//   //         available: res.data.available,
//   //         message: res.data.message,
//   //       });

//   //       if (res.data.available === false) {
//   //         setError("username", {
//   //           type: "manual",
//   //           message: "Username is already taken",
//   //         });
//   //       } else {
//   //         clearErrors("username");
//   //       }

//   //       setValue("username", usernameValue.trim());
//   //     } catch {
//   //       setUsernameStatus({
//   //         available: false,
//   //         message: "Error checking username",
//   //       });
//   //     } finally {
//   //       setCheckingUsername(false);
//   //     }
//   //   };

//   //   if (debouncedUsername) {
//   //     checkUsernameAvailability(debouncedUsername);
//   //   }
//   // }, [debouncedUsername, apiGet, setError, clearErrors, setValue]);

//   const handleRegister = async (values: any) => {
//     const userOneSignalID = await OneSignal.User.getOnesignalId();
//     try {
//       setLoading(true);
//       await post("/auth/register", { ...values, device_id: userOneSignalID });
//       showSuccess("Registration successful! Please verify your email.");
//       navigation.navigate(
//         "VerifyCode" as never,
//         { email: values.email } as never,
//       );
//     } catch (err: unknown) {
//       if (err instanceof AxiosError) {
//         const errorMessage =
//           err.response?.data?.message || "Registration failed. Try again.";
//         showError(errorMessage);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const disableSubmit =
//     loading || checkingUsername || usernameStatus.available === false;

//   return (
//     <View style={styles.container}>
//       <TextInputField
//         label="Create Username"
//         control={control}
//         name="username"
//         placeholder="Choose a username"
//       />
//       {checkingUsername && (
//         <AppText style={styles.checkingText}>Checking availability...</AppText>
//       )}
//       {!checkingUsername && usernameStatus.message && (
//         <AppText
//           style={[
//             styles.checkingText,
//             usernameStatus.available ? styles.available : styles.taken,
//           ]}
//         >
//           {usernameStatus.message}
//         </AppText>
//       )}

//       <EmailInputField
//         label="Email"
//         control={control}
//         name="email"
//         placeholder="Enter your email address"
//       />

//       <PhoneNumberInputField
//         label="Phone Number"
//         control={control}
//         name="phone_number"
//         placeholder="Enter phone number"
//       />
//       <PasswordInputField
//         label="Password"
//         control={control}
//         showHints
//         name="password"
//         placeholder="Enter your password"
//       />

//       <PasswordInputField
//         label="Confirm Password"
//         control={control}
//         name="password_confirmation"
//         placeholder="Confirm your password"
//       />

//       <TextInputField
//         label="Referral Code (Optional)"
//         control={control}
//         name="referral_code"
//         placeholder="Enter referral code"
//       />

//       <SelectInput
//         options={[{ label: "Social Media", value: "Social" }]}
//         label="How did you hear about us?"
//         control={control}
//         name="how_do_heard_about_us"
//         placeholder="Select option"
//       />

//       <TouchableOpacity
//         activeOpacity={0.8}
//         style={[styles.button, disableSubmit && { opacity: 0.6 }]}
//         onPress={handleSubmit(handleRegister)}
//         disabled={disableSubmit}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <AppText style={styles.buttonText}>Continue</AppText>
//         )}
//       </TouchableOpacity>

//       <CustomLoading loading={loading} />
//     </View>
//   );
// };

// // const RegisterForm: React.FC = () => {
// //   const { apiGet, post } = useAxios();
// //   const { showSuccess } = useToastHelpers();
// //   const navigation: any = useNavigation();
// //   const [loading, setLoading] = useState<boolean>(false);
// //   const [checkingUsername, setCheckingUsername] = useState<boolean>(false);
// //   const [usernameStatus, setUsernameStatus] = useState<{
// //     available?: boolean;
// //     message?: string;
// //   }>({});

// //   const { control, handleSubmit, setError, setValue, clearErrors, trigger } =
// //     useForm<any>({
// //       resolver: yupResolver(registerSchema),
// //       mode: "onBlur",
// //     });

// //   const username = useWatch({ control, name: "username" });

// //   const checkUsernameAvailability = useCallback(
// //     debounce(async (usernameValue: string) => {
// //       if (!usernameValue || usernameValue.length < 5) {
// //         setUsernameStatus({});
// //         clearErrors("username");
// //         return;
// //       }

// //       setCheckingUsername(true);
// //       try {
// //         const res = await apiGet(
// //           `/auth/check-username?username=${usernameValue}`,
// //         );

// //         setUsernameStatus({
// //           available: res.data.available,
// //           message: res.data.message,
// //         });

// //         if (res.data.available === false) {
// //           setError("username", {
// //             type: "manual",
// //             message: "Username is already taken",
// //           });
// //         } else {
// //           clearErrors("username");
// //         }

// //         setValue("username", usernameValue.trim());
// //       } catch (err) {
// //         setUsernameStatus({
// //           available: false,
// //           message: "Error checking username",
// //         });
// //       } finally {
// //         setCheckingUsername(false);
// //       }
// //     }, 400),
// //     [],
// //   );

// //   useEffect(() => {
// //     checkUsernameAvailability(username);
// //   }, [username]);

// //   const handleRegister = async (values: any) => {
// //     const userOneSignalID = await OneSignal.User.getOnesignalId();
// //     try {
// //       setLoading(true);
// //       await post("/auth/register", { ...values, device_id: userOneSignalID });
// //       showSuccess("Registration successful! Please verify your email.");
// //       navigation.navigate(
// //         "VerifyCode" as never,
// //         { email: values.email } as never,
// //       );
// //     } catch (err: unknown) {
// //       if (err instanceof AxiosError) {
// //         const errorMessage =
// //           err.response?.data?.message || "Registration failed. Try again.";
// //         showError(errorMessage);
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const disableSubmit =
// //     loading || checkingUsername || usernameStatus.available === false;

// //   return (
// //     <View style={styles.container}>
// //       <TextInputField
// //         label="Create Username"
// //         control={control}
// //         name="username"
// //         placeholder="Choose a username"
// //       />
// //       {checkingUsername && (
// //         <AppText style={styles.checkingText}>Checking availability...</Apptext>
// //       )}
// //       {!checkingUsername && usernameStatus.available && (
// //         <Text
// //           style={[
// //             styles.checkingText,
// //             usernameStatus.available ? styles.available : styles.taken,
// //           ]}
// //         >
// //           {usernameStatus.message}
// //         </Text>
// //       )}

// //       <EmailInputField
// //         label="Email"
// //         control={control}
// //         name="email"
// //         placeholder="Enter your email address"
// //       />
// //       <PhoneNumberInputField
// //         label="Phone Number"
// //         control={control}
// //         trigger={trigger}
// //         name="phone_number"
// //         placeholder="Enter your phone number"
// //       />
// //       <PasswordInputField
// //         label="Password"
// //         control={control}
// //         showHints={true}
// //         name="password"
// //         placeholder="Enter your password"
// //       />
// //       <PasswordInputField
// //         label="Confirm Password"
// //         control={control}
// //         name="password_confirmation"
// //         placeholder="Confirm your password"
// //       />
// //       <TextInputField
// //         label="Referral Code (Optional)"
// //         control={control}
// //         name="referral_code"
// //         placeholder="Enter referral code"
// //       />
// //       <SelectInput
// //         options={[{ label: "Social Media", value: "Social" }]}
// //         label="How did you hear about us?"
// //         control={control}
// //         name="how_do_heard_about_us"
// //         placeholder="Select option"
// //       />

// //       <TouchableOpacity
// //         activeOpacity={0.8}
// //         style={[styles.button, disableSubmit && { opacity: 0.6 }]}
// //         onPress={handleSubmit(handleRegister)}
// //         disabled={disableSubmit}
// //       >
// //         {loading ? (
// //           <ActivityIndicator color="#fff" />
// //         ) : (
// //           <AppText style={styles.buttonText}>Continue</Apptext>
// //         )}
// //       </TouchableOpacity>

// //       <CustomLoading loading={loading} />
// //     </View>
// //   );
// // };

// export default RegisterForm;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingVertical: 20,
//   },
//   checkingText: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("400"),
//     marginTop: -5,
//     marginBottom: 10,
//   },
//   available: {
//     color: "green",
//   },
//   taken: {
//     color: "red",
//   },
//   button: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     borderRadius: 100,
//     marginTop: 30,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontFamily: getFontFamily("800"),
//     fontSize: normalize(18),
//   },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import TextInputField from "../TextInputField";
import PasswordInputField from "../PasswordInputField";
import { COLORS } from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import CustomLoading from "../CustomLoading";
import { useToastHelpers } from "../../utlis/toast";
import { AxiosError } from "axios";
import { getFontFamily, normalize } from "../../constants/settings";
import { SelectInput } from "../SelectInputField";
import useAxios from "../../hooks/useAxios";
// import parsePhoneNumberFromString from "libphonenumber-js";
// import PhoneNumberInputField from "../PhoneNumberInputField";
import EmailInputField from "../EmailInputField";
import { OneSignal } from "react-native-onesignal";
import { AppText } from "../AppText";
import { useColors } from "../../hooks/useTheme";

const registerSchema = yup.object().shape({
  username: yup
    .string()
    .min(5, "Your username is too short")
    .max(30, "Your username is too long")
    .required("Username is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  // phone_number: yup
  //   .string()
  //   .required("Phone number is required")
  //   .test(
  //     "is-valid-phone",
  //     "Please provide a valid phone number",
  //     function (value) {
  //       if (!value) return false;
  //       try {
  //         const cleanedValue = value.replace(/(?!^\+)[^\d]/g, "");
  //         const phoneNumber = parsePhoneNumberFromString(cleanedValue, "NG");
  //         return phoneNumber ? phoneNumber.isValid() : false;
  //       } catch (error) {
  //         return false;
  //       }
  //     },
  //   ),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  how_do_heard_about_us: yup.string().required("Please select an option"),
});

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const RegisterForm: React.FC = () => {
  const { apiGet, post } = useAxios();
  const { showSuccess, showError } = useToastHelpers();
  const navigation: any = useNavigation();
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    available?: boolean;
    message?: string;
  }>({});

  const colors = useColors();
  const styles = makeStyles(colors);

  const { control, handleSubmit, setError, clearErrors } = useForm<any>({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
  });

  const username = useWatch({ control, name: "username" });
  const debouncedUsername = useDebounce(username?.trim() ?? "", 500);

  const {
    data: heardAboutOptions = [],
    isLoading: loadingHeardAboutOptions,
    isError: heardAboutOptionsFailed,
  } = useQuery({
    queryKey: ["how-heard-about-options"],
    queryFn: async ({ signal }) => {
      try {
        const res = await apiGet("/how-heard-about-options", { signal });
        const raw = res.data?.data ?? res.data ?? [];

        return raw.map((item: any) => ({
          label: item.label ?? item.name,
          value: item.uuid ?? item.value,
        }));
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    console.log(heardAboutOptionsFailed);
    if (heardAboutOptionsFailed) {
      showError("Couldn't load 'how did you hear about us' options.");
    }
  }, [heardAboutOptionsFailed, showError]);

  useEffect(() => {
    setUsernameStatus({});
  }, [username]);

  useEffect(() => {
    if (!debouncedUsername || debouncedUsername.length < 5) {
      setUsernameStatus({});
      clearErrors("username");
      setCheckingUsername(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    setCheckingUsername(true);

    apiGet(
      `/auth/check-username?username=${encodeURIComponent(debouncedUsername)}`,
      {
        signal: controller.signal,
      },
    )
      .then(res => {
        if (cancelled) return;

        const available = res.data.available;
        setUsernameStatus({ available, message: res.data.message });

        if (available === false) {
          setError("username", {
            type: "manual",
            message: "Username is already taken",
          });
        } else {
          clearErrors("username");
        }
      })
      .catch(err => {
        if (
          cancelled ||
          err.name === "CanceledError" ||
          err.name === "AbortError"
        )
          return;
        setUsernameStatus({
          available: false,
          message: "Couldn't check that username",
        });
      })
      .finally(() => {
        if (!cancelled) setCheckingUsername(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedUsername, apiGet, setError, clearErrors]);

  const handleRegister = async (values: any) => {
    const userOneSignalID = await OneSignal.User.getOnesignalId();
    try {
      setLoading(true);
      await post("/auth/register", { ...values, device_id: userOneSignalID });
      showSuccess("Registration successful! Please verify your email.");
      navigation.navigate(
        "VerifyCode" as never,
        { email: values.email } as never,
      );
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message || "Registration failed. Try again.";
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const disableSubmit =
    loading || checkingUsername || usernameStatus.available === false;

  return (
    <View style={styles.container}>
      <TextInputField
        label="Create Username"
        control={control}
        name="username"
        placeholder="Choose a username"
      />
      {checkingUsername && (
        <AppText style={styles.checkingText}>Checking availability...</AppText>
      )}
      {!checkingUsername && usernameStatus.message && (
        <AppText
          style={[
            styles.checkingText,
            usernameStatus.available ? styles.available : styles.taken,
          ]}
        >
          {usernameStatus.message}
        </AppText>
      )}

      <EmailInputField
        label="Email"
        control={control}
        name="email"
        placeholder="Enter your email address"
      />

      {/* <PhoneNumberInputField
        label="Phone Number"
        control={control}
        name="phone_number"
        excludedCountryCodes={["US", "GB", "CN"]}
        placeholder="Enter phone number"
      /> */}
      <PasswordInputField
        label="Password"
        control={control}
        showHints
        name="password"
        placeholder="Enter your password"
      />

      <PasswordInputField
        label="Confirm Password"
        control={control}
        name="password_confirmation"
        placeholder="Confirm your password"
      />

      <TextInputField
        label="Referral Code (Optional)"
        control={control}
        name="referral_code"
        placeholder="Enter referral code"
      />

      <SelectInput
        options={heardAboutOptions}
        label="How did you hear about us?"
        control={control}
        name="how_do_heard_about_us"
        placeholder={
          loadingHeardAboutOptions ? "Loading options..." : "Select option"
        }
        loading={loadingHeardAboutOptions}
        isDisabled={loadingHeardAboutOptions}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.button, disableSubmit && { opacity: 0.6 }]}
        onPress={handleSubmit(handleRegister)}
        disabled={disableSubmit}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <AppText style={styles.buttonText}>Continue</AppText>
        )}
      </TouchableOpacity>

      <CustomLoading loading={loading} />
    </View>
  );
};

export default RegisterForm;

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      // flex: 1,
      paddingVertical: 20,
      flexGrow: 1,
    },
    checkingText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      marginTop: -5,
      marginBottom: 10,
    },
    available: {
      color: colors.primaryLight,
    },
    taken: {
      color: "red",
    },
    button: {
      backgroundColor: COLORS.primary,
      paddingVertical: 14,
      borderRadius: 100,
      marginTop: 30,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontFamily: getFontFamily("800"),
      fontSize: normalize(18),
    },
  });
