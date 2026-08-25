// import React, { useState } from "react";
// import { View, StyleSheet, TouchableOpacity } from "react-native";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import NumberInputField from "../NumberInputField";
// import CustomLoading from "../CustomLoading";
// import { COLORS } from "../../constants/colors";
// import { getFontFamily, normalize } from "../../constants/settings";
// import { showError, showSuccess } from "../../utlis/toast";
// import InfoCard from "../InfoCard";
// import { InfoCircle } from "iconsax-react-nativejs";
// import { useAuthStore } from "../../stores/authSlice";
// import useAxios from "../../hooks/useAxios";
// import { useNavigation } from "@react-navigation/native";
// import { AppText } from "../AppText";
// import { AxiosError } from "axios";
// import OtpInputField from "../OtpInputField";

// const NIGERIA_MOBILE_PREFIXES = [
//   "0701",
//   "0702",
//   "0703",
//   "0704",
//   "0705",
//   "0706",
//   "0707",
//   "0708",
//   "0709",
//   "0802",
//   "0803",
//   "0804",
//   "0805",
//   "0806",
//   "0807",
//   "0808",
//   "0809",
//   "0810",
//   "0811",
//   "0812",
//   "0813",
//   "0814",
//   "0815",
//   "0816",
//   "0817",
//   "0818",
//   "0819",
//   "0901",
//   "0902",
//   "0903",
//   "0904",
//   "0905",
//   "0906",
//   "0907",
//   "0908",
//   "0909",
// ];

// const phoneSchema = yup.object({
//   phoneNumber: yup
//     .string()
//     .required("Phone number is required")
//     .matches(/^0\d{10}$/, "Phone number must be 11 digits starting with 0")
//     .test(
//       "valid-ng-prefix",
//       "Enter a valid Nigerian mobile number (e.g. 0803..., 0810..., 0901...)",
//       value =>
//         !!value && NIGERIA_MOBILE_PREFIXES.some(p => value.startsWith(p)),
//     ),
// });

// const otpSchema = yup.object({
//   otp: yup
//     .string()
//     .required("Enter the code sent to your phone")
//     .matches(/^\d+$/, "Code must contain only numbers")
//     .length(6, "Code must be 6 digits"),
// });

// const PhoneNumberForm = () => {
//   const navigation: any = useNavigation();
//   const setUser = useAuthStore(state => state.setUser);
//   const { post } = useAxios();
//   const [step, setStep] = useState<"phone" | "otp">("phone");
//   const [phoneNumber, setPhoneNumber] = useState("");

//   const phoneForm = useForm({
//     resolver: yupResolver(phoneSchema),
//     mode: "onChange",
//     defaultValues: { phoneNumber: "" },
//   });

//   const otpForm = useForm({
//     resolver: yupResolver(otpSchema),
//     mode: "onChange",
//     defaultValues: { otp: "" },
//   });

//   const onSubmitPhone = async (data: any) => {
//     try {
//       await post("/auth/phone-otp/send", { phone: data.phoneNumber });
//       setPhoneNumber(data.phoneNumber);
//       setStep("otp");
//       showSuccess("A verification code has been sent to your phone");
//     } catch (err: any) {
//       if (err instanceof AxiosError) {
//         const errorMessage =
//           err.response?.data?.message ??
//           "Unable to send verification code at the moment";
//         showError(errorMessage);
//       } else {
//         showError("An unexpected error occurred. Please try again.");
//       }
//     }
//   };

//   const onSubmitOtp = async (data: any) => {
//     try {
//       const response = await post("/auth/phone-otp/verify", {
//         phone: phoneNumber,
//         otp: data.otp,
//       });
//       setUser(response.data?.data?.user);

//       otpForm.reset();
//       phoneForm.reset();

//       showSuccess("Phone number verified successfully");
//       navigation.goBack();
//     } catch (err: any) {
//       if (err instanceof AxiosError) {
//         const errorMessage =
//           err.response?.data?.message ??
//           "Cannot verify your phone number at the moment";
//         showError(errorMessage);
//       } else {
//         showError("An unexpected error occurred. Please try again.");
//       }
//     }
//   };

//   const handleResend = async () => {
//     try {
//       await post("auth/phone-otp/send", { phone: phoneNumber });
//       showSuccess("A new code has been sent to your phone");
//     } catch (err: any) {
//       if (err instanceof AxiosError) {
//         const errorMessage =
//           err.response?.data?.message ?? "Unable to resend code at the moment";
//         showError(errorMessage);
//       } else {
//         showError("An unexpected error occurred. Please try again.");
//       }
//     }
//   };

//   if (step === "otp") {
//     return (
//       <View style={styles.form}>
//         <OtpInputField control={otpForm.control} name="otp" boxes={6} />

//         <AppText style={styles.instruction}>
//           We sent a code to {phoneNumber}.{" "}
//           <AppText style={styles.resendLink} onPress={handleResend}>
//             Resend code
//           </AppText>
//         </AppText>

//         <InfoCard
//           IconComponent={<InfoCircle size={17} />}
//           title="Didn't get the code?"
//           description={[
//             "Make sure your phone has signal and try again in a minute.",
//             "Codes expire after a few minutes — request a new one if yours has expired.",
//             "Contact our support team if you keep having issues.",
//           ]}
//         />

//         <TouchableOpacity
//           disabled={
//             (!otpForm.formState.isValid && otpForm.formState.isDirty) ||
//             otpForm.formState.isSubmitting
//           }
//           activeOpacity={0.8}
//           style={styles.button}
//           onPress={otpForm.handleSubmit(onSubmitOtp)}
//         >
//           <AppText style={styles.buttonText}>Verify Code</AppText>
//         </TouchableOpacity>

//         <TouchableOpacity
//           activeOpacity={0.8}
//           style={styles.changeNumberLink}
//           onPress={() => {
//             setStep("phone");
//             otpForm.reset();
//           }}
//         >
//           <AppText style={styles.changeNumberText}>Change phone number</AppText>
//         </TouchableOpacity>

//         <CustomLoading loading={otpForm.formState.isSubmitting} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.form}>
//       <NumberInputField
//         control={phoneForm.control}
//         name="phoneNumber"
//         label="Phone Number"
//         placeholder="Enter your phone number"
//         maxLength={11}
//       />

//       <InfoCard
//         IconComponent={<InfoCircle size={17} />}
//         title="Why is this needed?"
//         description={[
//           "Phone verification helps keep your account secure and confirms it's really you.",
//           "You'll need a verified phone number to make deposits, withdrawals, and use other services.",
//           "Note: Contact our support team if you have issues with the verification",
//         ]}
//       />

//       <TouchableOpacity
//         disabled={
//           (!phoneForm.formState.isValid && phoneForm.formState.isDirty) ||
//           phoneForm.formState.isSubmitting
//         }
//         activeOpacity={0.8}
//         style={styles.button}
//         onPress={phoneForm.handleSubmit(onSubmitPhone)}
//       >
//         <AppText style={styles.buttonText}>Continue</AppText>
//       </TouchableOpacity>

//       <CustomLoading loading={phoneForm.formState.isSubmitting} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   form: {
//     width: "100%",
//   },
//   button: {
//     backgroundColor: COLORS.secondary,
//     paddingVertical: 14,
//     borderRadius: 100,
//     marginTop: 30,
//     justifyContent: "center",
//     alignContent: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(18),
//     textAlign: "center",
//   },
//   instruction: {
//     color: COLORS.primary,
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(16),
//     textAlign: "left",
//   },
//   resendLink: {
//     color: "#007AFF",
//     fontFamily: getFontFamily("700"),
//     fontSize: normalize(16),
//   },
//   changeNumberLink: {
//     marginTop: 16,
//     alignItems: "center",
//   },
//   changeNumberText: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("700"),
//     color: COLORS.primary,
//   },
//   helpLink: {
//     marginTop: 12,
//     marginBottom: 24,
//   },
//   helpText: {
//     fontSize: normalize(17),
//     fontFamily: getFontFamily("400"),
//     color: "#007AFF",
//     textAlign: "center",
//   },
// });

// export default PhoneNumberForm;
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import NumberInputField from "../NumberInputField";
import CustomLoading from "../CustomLoading";
import { COLORS } from "../../constants/colors";
import { getFontFamily, normalize } from "../../constants/settings";
import { showError, showSuccess } from "../../utlis/toast";
import InfoCard from "../InfoCard";
import { InfoCircle } from "iconsax-react-nativejs";
import { useAuthStore } from "../../stores/authSlice";
import useAxios from "../../hooks/useAxios";
import { useNavigation } from "@react-navigation/native";
import { AppText } from "../AppText";
import { AxiosError } from "axios";
import OtpInputField from "../OtpInputField";
import PhoneNumberInputField from "../PhoneNumberInputField";
import parsePhoneNumberFromString from "libphonenumber-js";
import { useColors } from "../../hooks/useTheme";

const NIGERIA_MOBILE_PREFIXES = [
  "0701",
  "0702",
  "0703",
  "0704",
  "0705",
  "0706",
  "0707",
  "0708",
  "0709",
  "0802",
  "0803",
  "0804",
  "0805",
  "0806",
  "0807",
  "0808",
  "0809",
  "0810",
  "0811",
  "0812",
  "0813",
  "0814",
  "0815",
  "0816",
  "0817",
  "0818",
  "0819",
  "0901",
  "0902",
  "0903",
  "0904",
  "0905",
  "0906",
  "0907",
  "0908",
  "0909",
];

const phoneSchema = yup.object({
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .test("valid-phone", "Enter a valid phone number", value => {
      if (!value) return false;
      try {
        // value is calling-code + national number with no leading '+',
        // e.g. "2348031234567" — prepend '+' so libphonenumber can parse it.
        const parsed = parsePhoneNumberFromString(`+${value}`);
        return parsed ? parsed.isValid() : false;
      } catch {
        return false;
      }
    }),
});

const otpSchema = yup.object({
  otp: yup
    .string()
    .required("Enter the code sent to your phone")
    .matches(/^\d+$/, "Code must contain only numbers")
    .length(6, "Code must be 6 digits"),
});

const RESEND_COOLDOWN_SECONDS = 30;

type VerificationStep = "phone" | "otp";

interface PhoneNumberFormProps {
  onStepChange?: (step: VerificationStep) => void;
}

const PhoneNumberForm = ({ onStepChange }: PhoneNumberFormProps) => {
  const navigation: any = useNavigation();
  const setUser = useAuthStore(state => state.setUser);
  const { post } = useAxios();
  const [step, setStepState] = useState<VerificationStep>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setStep = (next: VerificationStep) => {
    setStepState(next);
    onStepChange?.(next);
  };

  const colors = useColors();

  const styles = makeStyles(colors);

  const startResendCooldown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setResendCooldown(RESEND_COOLDOWN_SECONDS);

    intervalRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const phoneForm = useForm({
    resolver: yupResolver(phoneSchema),
    mode: "onChange",
    defaultValues: { phoneNumber: "" },
  });

  const otpForm = useForm({
    resolver: yupResolver(otpSchema),
    mode: "onChange",
    defaultValues: { otp: "" },
  });

  const onSubmitPhone = async (data: any) => {
    try {
      await post("/auth/phone-otp/send", { phone: data.phoneNumber });
      setPhoneNumber(data.phoneNumber);
      setStep("otp");
      startResendCooldown();
      showSuccess("A verification code has been sent to your phone");
    } catch (err: any) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message ??
          "Unable to send verification code at the moment";
        showError(errorMessage);
      } else {
        showError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const onSubmitOtp = async (data: any) => {
    try {
      const response = await post("/auth/phone-otp/verify", {
        phone: phoneNumber,
        otp: data.otp,
      });
      setUser(response.data?.data?.user);

      otpForm.reset();
      phoneForm.reset();

      showSuccess("Phone number verified successfully");
      navigation.goBack();
    } catch (err: any) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message ??
          "Cannot verify your phone number at the moment";
        showError(errorMessage);
      } else {
        showError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      await post("auth/phone-otp/send", { phone: phoneNumber });
      startResendCooldown();
      showSuccess("A new code has been sent to your phone");
    } catch (err: any) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message ?? "Unable to resend code at the moment";
        showError(errorMessage);
      } else {
        showError("An unexpected error occurred. Please try again.");
      }
    }
  };

  if (step === "otp") {
    return (
      <View style={styles.form}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 14,
          }}
        >
          <OtpInputField control={otpForm.control} name="otp" boxes={6} />
        </View>

        <AppText style={styles.instruction}>
          We sent a code to {phoneNumber}.{" "}
          {resendCooldown > 0 ? (
            <AppText style={styles.resendDisabled}>
              Resend code in {resendCooldown}s
            </AppText>
          ) : (
            <AppText style={styles.resendLink} onPress={handleResend}>
              Resend code
            </AppText>
          )}
        </AppText>

        <InfoCard
          IconComponent={<InfoCircle size={17} />}
          title="Didn't get the code?"
          description={[
            "Make sure your phone has signal and try again in a minute.",
            "Codes expire after a few minutes — request a new one if yours has expired.",
            "Contact our support team if you keep having issues.",
          ]}
        />

        <TouchableOpacity
          disabled={
            (!otpForm.formState.isValid && otpForm.formState.isDirty) ||
            otpForm.formState.isSubmitting
          }
          activeOpacity={0.8}
          style={styles.button}
          onPress={otpForm.handleSubmit(onSubmitOtp)}
        >
          <AppText style={styles.buttonText}>Verify Code</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.changeNumberLink}
          onPress={() => {
            setStep("phone");
            otpForm.reset();
          }}
        >
          <AppText style={styles.changeNumberText}>Change phone number</AppText>
        </TouchableOpacity>

        <CustomLoading loading={otpForm.formState.isSubmitting} />
      </View>
    );
  }

  return (
    <View style={styles.form}>
      {/* <NumberInputField
        control={phoneForm.control}
        name="phoneNumber"
        label="Phone Number"
        placeholder="Enter your phone number"
        maxLength={11}
      /> */}

      <PhoneNumberInputField
        label="Phone Number"
        control={phoneForm.control}
        name="phoneNumber"
        // excludedCountryCodes={["US", "GB", "CN"]}
        placeholder="Enter phone number"
        maxLength={11}
      />

      <InfoCard
        IconComponent={<InfoCircle size={17} />}
        title="Why is this needed?"
        description={[
          "Phone verification helps keep your account secure and confirms it's really you.",
          "You'll need a verified phone number to make deposits, withdrawals, and use other services.",
          "Note: Contact our support team if you have issues with the verification",
        ]}
      />

      <TouchableOpacity
        disabled={
          (!phoneForm.formState.isValid && phoneForm.formState.isDirty) ||
          phoneForm.formState.isSubmitting
        }
        activeOpacity={0.8}
        style={styles.button}
        onPress={phoneForm.handleSubmit(onSubmitPhone)}
      >
        <AppText style={styles.buttonText}>Continue</AppText>
      </TouchableOpacity>

      <CustomLoading loading={phoneForm.formState.isSubmitting} />
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    form: {
      width: "100%",
    },
    button: {
      backgroundColor: COLORS.secondary,
      paddingVertical: 14,
      borderRadius: 100,
      marginTop: 30,
      justifyContent: "center",
      alignContent: "center",
    },
    buttonText: {
      color: "#fff",
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
      textAlign: "center",
    },
    instruction: {
      color: colors.text,
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
      textAlign: "center",
    },
    resendLink: {
      color: colors.primaryLight,
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
    },
    resendDisabled: {
      color: "#999",
      fontFamily: getFontFamily("700"),
      fontSize: normalize(17),
    },
    changeNumberLink: {
      marginTop: 16,
      alignItems: "center",
    },
    changeNumberText: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("700"),
      color: colors.primaryLight,
    },
    helpLink: {
      marginTop: 12,
      marginBottom: 24,
    },
    helpText: {
      fontSize: normalize(17),
      fontFamily: getFontFamily("400"),
      color: "#007AFF",
      textAlign: "center",
    },
  });

export default PhoneNumberForm;
