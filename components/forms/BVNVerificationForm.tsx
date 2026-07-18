import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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

const bvnSchema = yup.object({
  bvn: yup
    .string()
    .required("BVN is required")
    .matches(/^\d+$/, "BVN must contain only numbers")
    .length(11, "BVN must be exactly 11 digits"),
});

const BVNForm = () => {
  const navigation: any = useNavigation();
  const setUser = useAuthStore(state => state.setUser);
  const { post } = useAxios();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid, isDirty, isSubmitting },
  } = useForm({
    resolver: yupResolver(bvnSchema),
    mode: "onChange",
    defaultValues: {
      bvn: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await post("/kyc/verify-bvn", data);
      navigation.goBack();
      setUser(response.data?.data?.user);

      reset();

      showSuccess("BVN Verified successful");
    } catch (err: any) {
      console.log(err);
      // showError(err?.message ?? "Cannot verify your BVN at the moment");
      // console.log(error?.response);
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
          "For security reasons and to comply with CBN policy, your BVN is required to complete your KYC proces",
          "It ensures that only you have access to your account and prevents unauthorized transactions.",
          "Note: Contact our support team if you have issues with the verification",
        ]}
      />

      <TouchableOpacity
        disabled={(!isValid && isDirty) || isSubmitting}
        activeOpacity={0.8}
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        <AppText style={styles.buttonText}>Verify BVN</AppText>
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
    color: COLORS.primary,
    fontFamily: getFontFamily("700"),
    fontSize: normalize(18),
    textAlign: "left",
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

export default BVNForm;
