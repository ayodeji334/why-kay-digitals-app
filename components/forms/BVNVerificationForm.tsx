import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import NumberInputField from "../NumberInputField";
import CustomLoading from "../CustomLoading";
import { COLORS } from "../../constants/colors";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../../constants/settings";
import { showError } from "../../utlis/toast";
import InfoCard from "../InfoCard";
import { InfoCircle } from "iconsax-react-nativejs";
import useAxios from "../../hooks/useAxios";
import { useNavigation } from "@react-navigation/native";
import { AppText } from "../AppText";
import { AxiosError } from "axios";

const bvnSchema = yup.object({
  bvn: yup
    .string()
    .required("BVN is required")
    .matches(/^\d+$/, "BVN must contain only numbers")
    .length(11, "BVN must be exactly 11 digits"),
});

const BVNForm = () => {
  const navigation: any = useNavigation();
  const { post } = useAxios();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(bvnSchema),
    mode: "onChange",
    defaultValues: {
      bvn: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await post("/kyc/check-bvn-usability", data);

      // reset();

      navigation.navigate(
        "SelfieVerification" as never,
        { bvn: data?.bvn } as never,
      );
    } catch (err: any) {
      console.log(err);
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message ?? "Cannot verify your BVN at the moment";
        showError(errorMessage);
      } else {
        showError("An unexpected error occurred. Please try again.");
      }
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

      <AppText style={styles.instruction}>Dial *565*0# to get your BVN</AppText>

      <InfoCard
        IconComponent={<InfoCircle size={17} />}
        title="Why BVN Verification is Required?"
        description={[
          "It ensures that only you have access to your account and prevents unauthorized transactions.",
          "Your BVN is not used to create or generate your crypto wallet address.",
          // "Note: Contact our support team if you have issues with the verification",
          "Need help? Contact our support team",
        ]}
      />

      <TouchableOpacity
        disabled={!isValid}
        activeOpacity={0.8}
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        <AppText style={styles.buttonText}>Continue</AppText>
      </TouchableOpacity>

      <CustomLoading loading={isSubmitting} />
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    width: "100%",
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: normalizeSpacing(14),
    borderRadius: 100,
    marginTop: normalizeSpacing(30),
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
    color: COLORS.primary,
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    textAlign: "left",
  },
  helpLink: {
    marginTop: normalizeSpacing(12),
    marginBottom: normalizeSpacing(24),
  },
  helpText: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
    color: "#007AFF",
    textAlign: "center",
  },
});

export default BVNForm;
