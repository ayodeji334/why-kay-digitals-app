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
import { getFontFamily, normalize } from "../constants/settings";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import OtpInputField from "../components/OtpInputField";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";

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
  const navigation: any = useNavigation();
  const route = useRoute();
  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { pin: "" },
  });
  const colors = useColors();
  const styles = makeStyles(colors);

  const onSubmit = (data: FormData) => {
    if (data.pin.length !== 4) {
      Alert.alert("Error", "PIN must be 4 digits");
      return;
    }

    navigation.navigate(
      "ConfirmPin" as never,
      { pin: data.pin, ...route } as never,
    );
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
      >
        <View style={styles.header}>
          <AppText style={styles.title}>Create your Security Pin </AppText>
          <AppText
            style={[
              styles.title,
              {
                fontFamily: getFontFamily(400),
                fontSize: normalize(19),
                marginTop: 2,
                marginLeft: 1,
              },
            ]}
          >
            Set a pin to process your transaction
          </AppText>
        </View>

        <OtpInputField
          isSecuredText={true}
          control={control}
          name="pin"
          boxes={4}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          <AppText style={styles.buttonText}>Continue</AppText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    button: {
      marginTop: 30,
      backgroundColor: COLORS.secondary,
      padding: 14,
      borderRadius: 80,
    },
    buttonText: {
      color: "#fff",
      textAlign: "center",
      fontSize: normalize(18),
      fontFamily: getFontFamily("700"),
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
    },
    header: {
      marginBottom: 23,
    },
    title: {
      fontSize: normalize(22),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    highlight: {
      color: COLORS.primary,
    },
  });
