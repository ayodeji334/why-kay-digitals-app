import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import NumberInputField from "../NumberInputField";
import CustomLoading from "../CustomLoading";
import { COLORS } from "../../constants/colors";
import { normalize } from "../../constants/settings";
import useAxios from "../../api/axios";
import { showSuccess } from "../../utlis/toast";
import InfoCard from "../InfoCard";
import { InfoCircle } from "iconsax-react-nativejs";
import { useAuthStore } from "../../stores/authSlice";

const bvnSchema = yup.object({
  bvn: yup
    .string()
    .required("BVN is required")
    .matches(/^\d+$/, "BVN must contain only numbers")
    .length(11, "BVN must be exactly 11 digits"),
});

const BVNForm = () => {
  const setUser = useAuthStore(state => state.setUser);
  const [loading, setLoading] = useState<boolean>(false);
  const { post } = useAxios();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid, isDirty },
  } = useForm({
    resolver: yupResolver(bvnSchema),
    mode: "onChange",
    defaultValues: {
      bvn: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      const response = await post("/bvn/verify", data);

      setUser(response.data?.data?.user);

      reset();

      showSuccess("BVN Verified successful");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <NumberInputField
        control={control}
        name="bvn"
        label="Bank Verification Number (BVN)"
        placeholder="Enter 11-digit BVN"
        maxLength={11}
      />

      <InfoCard
        IconComponent={InfoCircle}
        title="Why BVN Verification is Required?"
        description={[
          "BVN verification helps us comply with financial regulations and maintain the highest security standards for your account.",
          "It ensures that only you have access to your account and prevents unauthorized transactions.",
          "Verified accounts enjoy higher transaction limits and additional security features.",
        ]}
      />

      <TouchableOpacity
        disabled={!isValid && isDirty}
        activeOpacity={0.6}
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.buttonText}>Verify BVN</Text>
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
    fontWeight: "600",
    fontSize: normalize(10),
    textAlign: "center",
  },
  helpLink: {
    marginTop: 12,
    marginBottom: 24,
  },
  helpText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#007AFF",
    textAlign: "center",
  },
});

export default BVNForm;
