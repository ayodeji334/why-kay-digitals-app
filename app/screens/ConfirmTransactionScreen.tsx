import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { normalize } from "../constants/settings";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import OtpInputField from "../components/OtpInputField";
import { useState } from "react";
import apiClient from "../api/axios";
import { showError } from "../utlis/toast";
import { AxiosError } from "axios";
import CustomLoading from "../components/CustomLoading";
import { useAuth } from "../context/AppContext";
import { useAuthStore } from "../stores/authSlice";
import useAxios from "../api/axios";

type FormData = {
  pin: string;
};

const schema = yup.object().shape({
  pin: yup
    .string()
    .length(4, "PIN must be 4 digits")
    .required("PIN is required"),
});

export default function ConfirmTransactionScreen() {
  const { post } = useAxios();
  const navigation: any = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const route: any = useRoute();
  const { payload } = route.params;
  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { pin: "" },
  });

  const handleContinue = async (values: FormData) => {
    try {
      setIsLoading(true);

      const { url, ...rest } = payload;

      const response = await post(url, {
        transaction_pin: values.pin,
        ...rest,
      });

      console.log(response);

      navigation.navigate("TransactionDetail" as never, {
        transaction: response?.data?.data,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Confirm Transaction</Text>
          <Text
            style={[
              {
                fontWeight: "300",
                fontSize: normalize(11),
                marginTop: 6,
                marginLeft: 1,
              },
            ]}
          >
            Kindly enter your transaction pin to continue with the transaction.
          </Text>
        </View>

        <OtpInputField
          control={control}
          name="pin"
          boxes={4}
          isSecuredText={true}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(handleContinue)}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomLoading loading={isLoading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  button: {
    marginTop: 30,
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 80,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: normalize(12),
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 23,
  },
  title: {
    fontSize: normalize(15),
    fontWeight: "700",
  },
  highlight: {
    color: COLORS.primary,
  },
});
