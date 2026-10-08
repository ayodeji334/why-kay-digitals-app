import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigation } from "@react-navigation/native";
import { InfoCircle } from "iconsax-react-nativejs";
import NumberInputField from "../NumberInputField";
import CustomLoading from "../CustomLoading";
import InfoCard from "../InfoCard";
import { AppText } from "../AppText";
import { COLORS } from "../../constants/colors";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../../constants/settings";
import useAxios from "../../hooks/useAxios";
import { LONG_REQUEST_TIMEOUT_MS } from "../../api/axios";
import { showError } from "../../utlis/toast";
import { getRequestErrorMessage } from "../../libs/requestError";
import { ID_DOCS, IdDocType, readRequiresSelfie } from "../../libs/kyc";
import { useStyles } from "../../hooks/useStyles";
import { useColors } from "../../hooks/useTheme";

const WHY_COPY: Record<IdDocType, string[]> = {
  bvn: [
    "It confirms you're the rightful account holder and protects your account from unauthorised transactions.",
    "Your BVN is not used to create or generate your crypto wallet address.",
    "Need help? Contact our support team",
  ],
  nin: [
    "It confirms you're the rightful account holder and gives you access to WhyKay's verified services.",
    "Need help? Contact our support team",
  ],
};

/**
 * Collects a BVN or NIN, checks it with the matching usability endpoint, then
 * continues to the selfie only when the backend says one is needed
 * (`requires_selfie`). Otherwise it goes straight to submission.
 */
export default function IdNumberForm({ idType }: { idType: IdDocType }) {
  const doc = ID_DOCS[idType];
  const navigation: any = useNavigation();
  const { post } = useAxios();
  const styles = useStyles(makeStyles);

  const schema = useMemo(
    () =>
      yup.object({
        idNumber: yup
          .string()
          .required(`${doc.label} is required`)
          .matches(/^\d+$/, `${doc.label} must contain only numbers`)
          .length(11, `${doc.label} must be exactly 11 digits`),
      }),
    [doc.label],
  );

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: { idNumber: "" },
  });

  const onSubmit = async ({ idNumber }: { idNumber: string }) => {
    try {
      const res = await post(
        doc.usabilityPath,
        { [idType]: idNumber },
        { timeout: LONG_REQUEST_TIMEOUT_MS },
      );
      const requiresSelfie = readRequiresSelfie(res?.data);
      const params = { idType, idNumber, requiresSelfie };

      // Camera only when the backend asks for it; otherwise submit directly.
      navigation.navigate(
        requiresSelfie ? "SelfieVerification" : "SelfieConfirmation",
        params,
      );
    } catch (err) {
      // e.g. phone not verified, already verified, linked to another account
      showError(
        getRequestErrorMessage(
          err,
          `We couldn't check your ${doc.label} right now. Please try again.`,
        ),
      );
    }
  };

  return (
    <View style={styles.form}>
      <NumberInputField
        control={control}
        name="idNumber"
        label={`${doc.fullName} (${doc.label})`}
        placeholder={`Enter 11-digit ${doc.label}`}
        maxLength={11}
      />

      <AppText style={styles.instruction}>{doc.dialHint}</AppText>

      <InfoCard
        IconComponent={<InfoCircle color={COLORS.primary} size={18} />}
        title={`Why we need your ${doc.label}`}
        description={WHY_COPY[idType]}
      />

      <TouchableOpacity
        disabled={!isValid || isSubmitting}
        activeOpacity={0.8}
        style={[styles.button, (!isValid || isSubmitting) && styles.disabled]}
        onPress={handleSubmit(onSubmit)}
        accessibilityRole="button"
      >
        <AppText style={styles.buttonText}>Continue</AppText>
      </TouchableOpacity>

      <CustomLoading loading={isSubmitting} />
    </View>
  );
}

const makeStyles = (_colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    form: { width: "100%" },
    instruction: {
      color: COLORS.primary,
      fontFamily: getFontFamily("700"),
      fontSize: normalize(16),
      textAlign: "left",
      marginBottom: normalizeSpacing(12),
    },
    button: {
      backgroundColor: COLORS.primary,
      paddingVertical: normalizeSpacing(14),
      borderRadius: 100,
      marginTop: normalizeSpacing(30),
      alignItems: "center",
    },
    disabled: { opacity: 0.6 },
    buttonText: {
      color: "#fff",
      fontFamily: getFontFamily("700"),
      fontSize: normalize(18),
    },
  });
