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
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import OtpInputField from "../components/OtpInputField";
import { useCallback, useState } from "react";
import CustomLoading from "../components/CustomLoading";
import useAxios from "../hooks/useAxios";
import { useIdempotencyKey } from "../hooks/useIdempotencyKey";
import { useQueryClient } from "@tanstack/react-query";
import { showError } from "../utlis/toast";
import { AxiosError } from "axios";
import { AppText } from "../components/AppText";
import { useColors, useResolvedTheme } from "../hooks/useTheme";
import StepUpVerificationModal, {
  StepUpResult,
} from "../components/StepUpVerificationModal";
import { useStepUpAvailability } from "../hooks/useStepUpAvailability";
import { HIGH_VALUE_WITHDRAWAL_THRESHOLD } from "../constants/transactionLimits";

type FormData = {
  pin: string;
};

const schema = yup.object().shape({
  pin: yup.string().length(4, "PIN is required").required("PIN is required"),
});

export default function ConfirmTransactionScreen() {
  const { post, apiGet } = useAxios();
  const { paymentRequestConfig, settleIdempotencyKey, handleUnknownOutcome } =
    useIdempotencyKey();
  const resolvedTheme = useResolvedTheme();

  const navigation: any = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const route: any = useRoute();
  const queryClient = useQueryClient();
  const { payload, highValueWithdrawalThreshold } = route.params;
  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { pin: "" },
  });
  const colors = useColors();
  const styles = makeStyles(colors);

  // WithdrawalScreen forwards the real threshold from the wallet summary
  // (`high_value_withdrawal_threshold`) — only fall back to the static
  // default if a caller didn't pass one (e.g. summary hadn't loaded yet).
  // Either way this is UI-only: the backend enforces the real limit
  // itself regardless of what this screen decides to show.
  const stepUpThreshold =
    highValueWithdrawalThreshold ?? HIGH_VALUE_WITHDRAWAL_THRESHOLD;

  // Only fiat withdrawal has a step-up requirement — the backend's
  // authenticator_code/biometric_* fields are specific to
  // POST /transactions/withdrawal, not the other transaction types this
  // same confirmation screen is reused for (crypto swap, gift cards, ...).
  const isWithdrawal = payload?.type === "WITHDRAWAL";
  const requiresStepUpByAmount =
    isWithdrawal && Number(payload?.amount) > stepUpThreshold;

  // The backend also requires step-up once a withdrawal trips
  // max_daily_withdrawals_before_step_up or withdrawal_velocity_window_minutes
  // (see wallet summary) — neither of those can be evaluated client-side
  // (no count of today's withdrawals or last-withdrawal timestamp is
  // exposed), so this starts as just the amount check and flips on
  // reactively if the submission itself comes back flagged as needing it.
  const [requiresStepUp, setRequiresStepUp] = useState(requiresStepUpByAmount);

  const { hasAnyStepUpMethod } = useStepUpAvailability();

  // Snapshot of the PIN the user entered when step-up was triggered —
  // held only long enough to resume submission once the modal (or an
  // Account Security detour) hands back a verified factor.
  const [pendingPin, setPendingPin] = useState<string | null>(null);
  const [showStepUpModal, setShowStepUpModal] = useState(false);
  // True while the user has been sent to Account Security to set up an
  // authenticator or biometrics — re-checked on refocus so the modal
  // reopens automatically once they actually have one, without requiring
  // an extra "Continue" tap.
  const [awaitingStepUpSetup, setAwaitingStepUpSetup] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (awaitingStepUpSetup && hasAnyStepUpMethod) {
        setAwaitingStepUpSetup(false);
        setShowStepUpModal(true);
      }
    }, [awaitingStepUpSetup, hasAnyStepUpMethod]),
  );

  const submitTransaction = async (pin: string, stepUp?: StepUpResult) => {
    try {
      setIsLoading(true);

      const { url, ...rest } = payload;

      const response = await post(
        url,
        {
          transaction_pin: pin,
          ...rest,
          ...(stepUp ?? {}),
        },
        paymentRequestConfig(),
      );
      settleIdempotencyKey();

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
      settleIdempotencyKey(err);
      if (handleUnknownOutcome(err)) return;
      if (err instanceof AxiosError) {
        console.log(err?.response?.data);
        const backendRequiresStepUp =
          err.response?.data?.data?.requires_step_up === true;

        // showError(err.response?.data?.message || "Something went wrong");

        if (backendRequiresStepUp) {
          setRequiresStepUp(true);
          setPendingPin(pin);
          setTimeout(() => setShowStepUpModal(true), 600);
          return;
        }

        showError(err.response?.data?.message || "Something went wrong");
      } else {
        return showError("Something went wrong. Please try again later");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = (values: FormData) => {
    if (requiresStepUp) {
      setPendingPin(values.pin);
      setShowStepUpModal(true);
      return;
    }

    submitTransaction(values.pin);
  };

  const handleStepUpVerified = (stepUp: StepUpResult) => {
    setShowStepUpModal(false);
    if (pendingPin) {
      submitTransaction(pendingPin, stepUp);
    }
    setPendingPin(null);
  };

  const handleStepUpClose = () => {
    setShowStepUpModal(false);
    setPendingPin(null);
  };

  const handleStepUpSetupRequired = () => {
    setShowStepUpModal(false);
    setAwaitingStepUpSetup(true);
    navigation.navigate("AccountSecurity" as never);
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
      >
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
            paddingTop: normalizeSpacing(20),
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
          style={{ marginTop: normalizeSpacing(40) }}
          onPress={() => navigation.navigate("ChangeTransactionPin")}
        >
          <AppText style={[styles.buttonText, { color: COLORS.primary }]}>
            Forget Pin?
          </AppText>
        </TouchableOpacity>
      </ScrollView>

      <CustomLoading loading={isLoading} />

      {requiresStepUp && (
        <StepUpVerificationModal
          visible={showStepUpModal}
          amount={Number(payload?.amount) || 0}
          accountNumber={payload?.account_number ?? ""}
          threshold={stepUpThreshold}
          onClose={handleStepUpClose}
          onVerified={handleStepUpVerified}
          onSetUpRequired={handleStepUpSetupRequired}
        />
      )}
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
      marginTop: normalizeSpacing(30),
      backgroundColor: COLORS.secondary,
      paddingVertical: normalizeSpacing(14),
      paddingHorizontal: normalizeSpacing(14),
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
      paddingHorizontal: normalizeSpacing(20),
    },
    header: {
      marginBottom: normalizeSpacing(23),
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
