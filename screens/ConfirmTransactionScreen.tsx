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
import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import OtpInputField from "../components/OtpInputField";
import { useState } from "react";
import CustomLoading from "../components/CustomLoading";
import useAxios from "../hooks/useAxios";
import { useQueryClient } from "@tanstack/react-query";
import { showError } from "../utlis/toast";
import { AxiosError } from "axios";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";

type FormData = {
  pin: string;
};

const schema = yup.object().shape({
  pin: yup.string().length(4, "PIN is required").required("PIN is required"),
});

export default function ConfirmTransactionScreen() {
  const { post, apiGet } = useAxios();
  const navigation: any = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const route: any = useRoute();
  const queryClient = useQueryClient();
  const { payload } = route.params;
  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { pin: "" },
  });
  const colors = useColors();
  const styles = makeStyles(colors);

  const handleContinue = async (values: FormData) => {
    try {
      setIsLoading(true);

      const { url, ...rest } = payload;

      console.log(rest);

      const response = await post(url, {
        transaction_pin: values.pin,
        ...rest,
      });

      queryClient.invalidateQueries({ queryKey: ["fiat-balance"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["saved-beneficiaries-banks"],
      });

      queryClient.invalidateQueries({ queryKey: ["saved-beneficiaries-data"] });
      queryClient.invalidateQueries({
        queryKey: ["saved-beneficiaries-airtime"],
      });
      queryClient.invalidateQueries({ queryKey: ["saved-beneficiaries-data"] });

      const transaction = response?.data?.data;

      apiGet("wallets/crypto/refresh");

      if (
        transaction.category === "CRYPTO_SWAP" &&
        transaction.status === "pending"
      ) {
        navigation.replace("PendingSwap", { transaction });
      } else if (
        transaction.category === "GIFT_CARD" &&
        transaction.status === "pending"
      ) {
        navigation.replace("PendingGiftCard", { transaction });
      } else {
        navigation.dispatch((state: any) => {
          // Remove ConfirmTransaction (current screen) from the stack
          const routesWithoutConfirm = state.routes.filter(
            (r: any) => r.name !== "ConfirmTransaction",
          );

          // Append TransactionDetail
          const newRoutes = [
            ...routesWithoutConfirm,
            { name: "TransactionDetail", params: { transaction } },
          ];

          return CommonActions.reset({
            ...state,
            routes: newRoutes,
            index: newRoutes.length - 1,
          });
        });
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        console.log(err?.response?.status);
        if (err.response?.status == 500) {
          return showError("Something went wrong");
        } else {
          showError(err.response?.data?.message || "Something went wrong");
        }
        showError(err.response?.data?.message || "Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <AppText style={styles.title}>Enter Transaction PIN</AppText>
          <AppText
            style={[
              {
                fontFamily: getFontFamily("400"),
                fontSize: normalize(18),
                color: colors.text,
              },
            ]}
          >
            Kindly enter your transaction pin to continue with the transaction.
          </AppText>
        </View>

        <View
          style={{
            paddingTop: 20,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <OtpInputField
            control={control}
            name="pin"
            boxes={4}
            isSecuredText={true}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={handleSubmit(handleContinue)}
        >
          <AppText style={styles.buttonText}>Continue</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginTop: 40 }}
          onPress={() => navigation.navigate("ChangeTransactionPin")}
        >
          <AppText style={[styles.buttonText, { color: COLORS.primary }]}>
            Forget Pin?
          </AppText>
        </TouchableOpacity>
      </ScrollView>

      <CustomLoading loading={isLoading} />
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
      fontFamily: getFontFamily("700"),
      textAlign: "center",
      fontSize: normalize(18),
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    header: {
      marginBottom: 23,
    },
    title: {
      fontSize: normalize(19),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    highlight: {
      color: COLORS.primary,
    },
  });
