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
import { getFontFamily, normalize } from "../constants/settings";
import { useRoute } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import OtpInputField from "../components/OtpInputField";
import { useState } from "react";
import { showError } from "../utlis/toast";
import { AxiosError } from "axios";
import CustomLoading from "../components/CustomLoading";
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

export default function ConfirmSecurityPinScreen() {
  const { setIsAuthenticated } = useAuthStore(state => state);
  const { post } = useAxios();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const route: any = useRoute();
  const { pin } = route.params;
  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { pin: "" },
  });

  const handleCreatePin = async (values: FormData) => {
    if (values.pin !== pin) {
      showError("PINs do not match");
      return;
    }
    try {
      setIsLoading(true);

      await post("/auth/security-pin/create", {
        security_pin: pin,
        security_pin_confirmation: pin,
      });

      setIsAuthenticated(true);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message || "Registration failed. Try again.";
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Confirm your Security Pin</Text>
          <Text
            style={[
              {
                fontFamily: getFontFamily(400),
                fontSize: normalize(18),
                marginTop: 2,
                marginLeft: 1,
              },
            ]}
          >
            Check your security pint to kept your account secure.
          </Text>
        </View>

        <OtpInputField
          isSecuredText={true}
          control={control}
          name="pin"
          boxes={4}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(handleCreatePin)}
        >
          <Text style={styles.buttonText}>Set Pin</Text>
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
    textAlign: "center",
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 23,
  },
  title: {
    fontSize: normalize(23),
    fontFamily: getFontFamily("800"),
  },
  highlight: {
    color: COLORS.primary,
  },
});
