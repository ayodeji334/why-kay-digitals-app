// import React, { useEffect, useState } from "react";
// import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import OtpInputField from "../OtpInputField";
// import { COLORS } from "../../constants/colors";
// import { useCountdown } from "../../hooks/useCountdown";
// import { useNavigation } from "@react-navigation/native";
// import { getFontFamily, normalize } from "../../constants/settings";
// import CustomLoading from "../CustomLoading";
// import { showError, showSuccess } from "../../utlis/toast";
// import { AxiosError } from "axios";
// import useAxios from "../../hooks/useAxios";
// import { useQueryClient } from "@tanstack/react-query";
// import { AppText } from "../AppText";
// import { useColors } from "../../hooks/useTheme";

// const otpSchema = yup.object().shape({
//   otp: yup
//     .string()
//     .required("OTP is required")
//     .length(6, "OTP must be exactly 6 digits"),
// });

// type FormData = {
//   otp: string;
// };

// const VerificationForm = ({
//   email,
//   phoneNumber
// }: {
//   email?: string;
//   phoneNumber?: string;
// }) => {
//   const navigation: any = useNavigation();
//   const { post } = useAxios();
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const { control, handleSubmit, watch } = useForm<FormData>({
//     resolver: yupResolver(otpSchema),
//     defaultValues: { otp: "" },
//   });
//   const queryClient = useQueryClient();
//   const { countdown, reset, isActive } = useCountdown(20);
//   const otp = watch("otp");
//   const colors = useColors();
//   const styles = makeStyles(colors);

//   const handleVerify = async (values: FormData) => {
//     try {
//       setIsLoading(true);

//       const response = await post("/auth/verify-email", {
//         token: values?.otp,
//         email,
//       });

//       showSuccess("Token verified!");

//       const authData = response.data?.data?.auth;
//       const user = response.data?.data?.user;
//       const token = authData?.accessToken;
//       const refreshToken = authData?.refreshToken;

//       queryClient.prefetchQuery({ queryKey: ["assets"] });

//       navigation.navigate("CreatePin" as never, { user, token, refreshToken });
//     } catch (err: unknown) {
//       if (err instanceof AxiosError) {
//         const errorMessage =
//           err.response?.data?.message || "Verification failed. Try again.";
//         showError(errorMessage);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     try {
//       setIsLoading(true);

//       await post("/auth/resend-verify-email", {
//         email,
//       });

//       showSuccess("Token Sent! Check your mail");
//     } catch (err: unknown) {
//       if (err instanceof AxiosError) {
//         const errorMessage =
//           err.response?.data?.message || "Verification failed. Try again.";
//         showError(errorMessage);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!isActive && otp.length == 0) {
//       reset();
//     }
//   }, [otp.length]);

//   return (
//     <View style={styles.container}>
//       <OtpInputField control={control} name="otp" boxes={6} />

//       {/* {otp.length === 0 && ( */}
//       <View style={styles.resendWrapper}>
//         <AppText style={styles.infoText}>Didn’t get the code? </AppText>
//         <TouchableOpacity disabled={countdown > 0} onPress={handleResend}>
//           <AppText
//             style={[styles.resendText, countdown > 0 && styles.disabledResend]}
//           >
//             {countdown > 0
//               ? `Resend in 00:${countdown.toString().padStart(2, "0")}s`
//               : "Resend"}
//           </AppText>
//         </TouchableOpacity>
//       </View>
//       {/* )} */}

//       <TouchableOpacity
//         style={styles.button}
//         onPress={handleSubmit(handleVerify)}
//       >
//         <AppText style={styles.buttonText}>Continue</AppText>
//       </TouchableOpacity>

//       <CustomLoading loading={isLoading} />
//     </View>
//   );
// };

// export default VerificationForm;

// const makeStyles = (colors: ReturnType<typeof useColors>) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       justifyContent: "center",
//       paddingVertical: 20,
//     },
//     resendWrapper: {
//       flexDirection: "row",
//       justifyContent: "center",
//       marginVertical: 10,
//       paddingVertical: 30,
//     },
//     infoText: {
//       fontFamily: getFontFamily(700),
//       fontSize: normalize(19),
//       marginTop: 2,
//       marginLeft: 1,
//       color: colors.text,
//     },
//     resendText: {
//       fontFamily: getFontFamily(700),
//       fontSize: normalize(19),
//       marginTop: 2,
//       marginLeft: 1,
//       color: colors.primary,
//     },
//     disabledResend: {
//       color: "#999",
//     },
//     button: {
//       backgroundColor: COLORS.secondary,
//       padding: 14,
//       borderRadius: 80,
//       marginTop: 40,
//       alignItems: "center",
//     },
//     buttonText: {
//       color: COLORS.whiteBackground,
//       fontSize: normalize(18),
//       fontFamily: getFontFamily(700),
//     },
//   });
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import OtpInputField from "../OtpInputField";
import { COLORS } from "../../constants/colors";
import { useCountdown } from "../../hooks/useCountdown";
import { useNavigation } from "@react-navigation/native";
import { getFontFamily, normalize } from "../../constants/settings";
import CustomLoading from "../CustomLoading";
import { showError, showSuccess } from "../../utlis/toast";
import { AxiosError } from "axios";
import useAxios from "../../hooks/useAxios";
import { useQueryClient } from "@tanstack/react-query";
import { AppText } from "../AppText";
import { useColors } from "../../hooks/useTheme";
import { normalizeNigerianPhoneNumber } from "../../utils/phoneNumber";

const otpSchema = yup.object().shape({
  otp: yup
    .string()
    .required("OTP is required")
    .length(6, "OTP must be exactly 6 digits"),
});

type FormData = {
  otp: string;
};

type VerifiedResult = {
  user: any;
  token: string;
  refreshToken: string;
};

const VerificationForm = ({
  email,
  phoneNumber,
  onVerified,
}: {
  email?: string;
  phoneNumber?: string;
  // Optional: called instead of the default navigation once verification
  // succeeds. Needed for the phone flow, since "navigate to CreatePin" is
  // specific to email signup and almost certainly isn't the right next
  // step after verifying a phone number for BVN — confirm the real
  // destination and either pass this in from the caller, or replace the
  // fallback branch below once that's known.
  onVerified?: (result: VerifiedResult) => void;
}) => {
  const navigation: any = useNavigation();
  const { post } = useAxios();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { control, handleSubmit, watch } = useForm<FormData>({
    resolver: yupResolver(otpSchema),
    defaultValues: { otp: "" },
  });
  const queryClient = useQueryClient();
  const { countdown, reset, isActive } = useCountdown(20);
  const otp = watch("otp");
  const colors = useColors();
  const styles = makeStyles(colors);

  const isPhoneFlow = !!phoneNumber;

  /**
   * Re-validates/normalizes phoneNumber right before it's sent, rather
   * than trusting it was already normalized upstream. Returns null (and
   * shows an error) if it isn't a valid Nigerian number, so callers can
   * bail out instead of sending a malformed value to the backend.
   */
  const resolvePhonePayload = (): string | null => {
    if (!phoneNumber) return null;

    const normalized = normalizeNigerianPhoneNumber(phoneNumber);
    if (!normalized) {
      showError(
        "This phone number isn't a valid Nigerian number. Please go back and re-enter it.",
      );
      return null;
    }
    return normalized;
  };

  const handleVerify = async (values: FormData) => {
    try {
      setIsLoading(true);

      let response;

      if (isPhoneFlow) {
        const normalizedPhoneNumber = resolvePhonePayload();
        if (!normalizedPhoneNumber) return;

        // NOTE: endpoint path assumed to mirror /auth/verify-email —
        // confirm the real phone-verification route against swagger.
        response = await post("/auth/verify-phone", {
          token: values?.otp,
          phoneNumber: normalizedPhoneNumber,
        });
      } else {
        response = await post("/auth/verify-email", {
          token: values?.otp,
          email,
        });
      }

      showSuccess(isPhoneFlow ? "Phone number verified!" : "Token verified!");

      const authData = response.data?.data?.auth;
      const user = response.data?.data?.user;
      const token = authData?.accessToken;
      const refreshToken = authData?.refreshToken;

      queryClient.prefetchQuery({ queryKey: ["assets"] });

      if (onVerified) {
        onVerified({ user, token, refreshToken });
      } else {
        // Default destination, unchanged from the original email flow.
        // See the onVerified comment above re: the phone flow.
        navigation.navigate("CreatePin" as never, {
          user,
          token,
          refreshToken,
        });
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message || "Verification failed. Try again.";
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setIsLoading(true);

      if (isPhoneFlow) {
        const normalizedPhoneNumber = resolvePhonePayload();
        if (!normalizedPhoneNumber) return;

        // NOTE: endpoint path assumed to mirror /auth/resend-verify-email —
        // confirm the real route against swagger.
        await post("/auth/resend-verify-phone", {
          phoneNumber: normalizedPhoneNumber,
        });

        showSuccess("Code sent! Check your phone");
      } else {
        await post("/auth/resend-verify-email", {
          email,
        });

        showSuccess("Token Sent! Check your mail");
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message || "Verification failed. Try again.";
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isActive && otp.length == 0) {
      reset();
    }
  }, [otp.length]);

  return (
    <View style={styles.container}>
      <OtpInputField control={control} name="otp" boxes={6} />

      {/* {otp.length === 0 && ( */}
      <View style={styles.resendWrapper}>
        <AppText style={styles.infoText}>Didn’t get the code? </AppText>
        <TouchableOpacity disabled={countdown > 0} onPress={handleResend}>
          <AppText
            style={[styles.resendText, countdown > 0 && styles.disabledResend]}
          >
            {countdown > 0
              ? `Resend in 00:${countdown.toString().padStart(2, "0")}s`
              : "Resend"}
          </AppText>
        </TouchableOpacity>
      </View>
      {/* )} */}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(handleVerify)}
      >
        <AppText style={styles.buttonText}>Continue</AppText>
      </TouchableOpacity>

      <CustomLoading loading={isLoading} />
    </View>
  );
};

export default VerificationForm;

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      paddingVertical: 20,
    },
    resendWrapper: {
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: 10,
      paddingVertical: 30,
    },
    infoText: {
      fontFamily: getFontFamily(700),
      fontSize: normalize(19),
      marginTop: 2,
      marginLeft: 1,
      color: colors.text,
    },
    resendText: {
      fontFamily: getFontFamily(700),
      fontSize: normalize(19),
      marginTop: 2,
      marginLeft: 1,
      color: colors.primary,
    },
    disabledResend: {
      color: "#999",
    },
    button: {
      backgroundColor: COLORS.secondary,
      padding: 14,
      borderRadius: 80,
      marginTop: 40,
      alignItems: "center",
    },
    buttonText: {
      color: COLORS.whiteBackground,
      fontSize: normalize(18),
      fontFamily: getFontFamily(700),
    },
  });
