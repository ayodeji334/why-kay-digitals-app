import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { InfoCircle } from "iconsax-react-nativejs";
import { useNavigation } from "@react-navigation/native";
import { AxiosError } from "axios";
import { useAuthStore } from "../stores/authSlice";
import useAxios from "../hooks/useAxios";
import { showError, showSuccess } from "../utlis/toast";
import NumberInputField from "./NumberInputField";
import InfoCard from "./InfoCard";
import { AppText } from "./AppText";
import CustomLoading from "./CustomLoading";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";

const phoneSchema = yup.object({
  phone_number: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^0[789]\d{9}$/,
      "Enter a valid Nigerian phone number starting with 0",
    ),
});

interface BVNOwnershipFormProps {
  bvn?: string;
}

const BVNOwnershipForm = ({ bvn }: BVNOwnershipFormProps) => {
  const navigation: any = useNavigation();
  const setUser = useAuthStore(state => state.setUser);
  const { post } = useAxios();
  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty, isSubmitting },
  } = useForm({
    resolver: yupResolver(phoneSchema),
    mode: "onChange",
    defaultValues: {
      phone_number: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await post("/kyc/verify-bvn-ownership", data);
      setUser(response.data?.data?.user);

      showSuccess("BVN verified successfully");
      //   navigation.goBack();
      navigation.pop(2);
      //   navigation.reset({
      //     index: 0,
      //     routes: [{ name: "Verification" as never }],
      //   });
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
        name="phone_number"
        label="Phone Number"
        placeholder="Enter the phone number linked to this BVN"
        maxLength={11}
      />

      <InfoCard
        IconComponent={<InfoCircle size={17} />}
        title="Why are we asking this?"
        description={[
          "This confirms you're the rightful owner of the BVN, not just someone who knows the number.",
          "Your BVN details will only be linked to your account once this is confirmed.",
          "Note: Contact our support team if you have issues with the verification",
        ]}
      />

      <TouchableOpacity
        disabled={(!isValid && isDirty) || isSubmitting}
        activeOpacity={0.8}
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        <AppText style={styles.buttonText}>Confirm Ownership</AppText>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.backLink}
        onPress={() => navigation.goBack()}
      >
        <AppText style={styles.backLinkText}>Use a different BVN</AppText>
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
  backLink: {
    marginTop: 16,
    alignItems: "center",
  },
  backLinkText: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: COLORS.primary,
  },
});

export default BVNOwnershipForm;
