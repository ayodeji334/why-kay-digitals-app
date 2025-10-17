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
import { useRoute } from "@react-navigation/native";
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

export default function ConfirmSecurityPinScreen() {
  const { setIsAuthenticated } = useAuthStore();
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
                fontWeight: "300",
                fontSize: normalize(11),
                marginTop: 6,
                marginLeft: 1,
              },
            ]}
          >
            Check your security pint to kept your account secure.
          </Text>
        </View>

        <OtpInputField control={control} name="pin" boxes={4} />

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
