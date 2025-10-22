import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import NumberInputField from "../NumberInputField";
import CustomLoading from "../CustomLoading";
import { COLORS } from "../../constants/colors";
import { getFontFamily, normalize } from "../../constants/settings";
import useAxios from "../../api/axios";
import { showSuccess } from "../../utlis/toast";
import InfoCard from "../InfoCard";
import { InfoCircle } from "iconsax-react-nativejs";
import { useAuthStore } from "../../stores/authSlice";

const ninSchema = yup.object({
  nin: yup
    .string()
    .required("NIN is required")
    .matches(/^\d+$/, "NIN must contain only numbers")
    .length(11, "NIN must be exactly 11 digits"),
});

const NINVerificationForm = () => {
  const setUser = useAuthStore(state => state.setUser);
  const [loading, setLoading] = useState<boolean>(false);
  const { post } = useAxios();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid, isDirty },
  } = useForm({
    resolver: yupResolver(ninSchema),
    mode: "onChange",
    defaultValues: {
      nin: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      const response = await post("/nin/verify", data);

      setUser(response.data?.data?.user);

      reset();

      showSuccess("NIN verification successful");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <NumberInputField
        control={control}
        name="nin"
        label="NIN (National Identification Number)"
        placeholder="Enter 11-digit NIN"
        maxLength={11}
      />

      <InfoCard
        IconComponent={InfoCircle}
        title="Why NIN Verification is Required?"
        description={[
          "NIN verification helps us comply with national identity regulations and maintain the highest security standards for your account.",
          "It ensures proper identity validation and prevents fraudulent activities on your account.",
          "Verified accounts enjoy enhanced security features and complete access to all platform services.",
        ]}
      />

      <TouchableOpacity
        disabled={!isValid && isDirty}
        activeOpacity={0.6}
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.buttonText}>Verify My Identity</Text>
      </TouchableOpacity>

      <CustomLoading loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
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
    color: "#00",
    fontFamily: getFontFamily(700),
    fontSize: normalize(18),
    textAlign: "center",
  },
  helpLink: {
    marginTop: 12,
    marginBottom: 24,
  },
  helpText: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("400"),
    color: "#007AFF",
    textAlign: "center",
  },
});

export default NINVerificationForm;
