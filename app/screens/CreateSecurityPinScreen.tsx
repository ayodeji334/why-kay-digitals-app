import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import VerificationForm from "../components/forms/VerificationForm";
import { width } from "../constants/settings";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import OtpInputField from "../components/OtpInputField";

type FormData = {
  pin: string;
};

const schema = yup.object().shape({
  pin: yup
    .string()
    .length(4, "PIN must be 4 digits")
    .required("PIN is required"),
});

export default function CreateSecurityPinScreen() {
  const navigation = useNavigation();
  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { pin: "" },
  });

  const onSubmit = (data: FormData) => {
    if (data.pin.length !== 4) {
      Alert.alert("Error", "PIN must be 4 digits");
      return;
    }

    navigation.navigate("ConfirmPin" as never, { pin: data.pin } as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Create your Security Pin </Text>
          <Text
            style={[
              styles.title,
              {
                fontWeight: "300",
                fontSize: width * 0.0434,
                marginTop: 6,
                marginLeft: 1,
              },
            ]}
          >
            Set a pin to process your transaction
          </Text>
        </View>

        <OtpInputField control={control} name="pin" boxes={4} />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
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
  buttonText: { color: "#000", fontWeight: "bold", textAlign: "center" },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -40,
  },
  header: {
    marginBottom: 23,
  },
  title: {
    fontSize: width * 0.0644,
    fontWeight: "700",
  },
  highlight: {
    color: COLORS.primary,
  },
});
