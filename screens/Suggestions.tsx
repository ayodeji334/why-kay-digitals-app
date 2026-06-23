import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants/colors";
import { getFontFamily, normalize } from "../constants/settings";
import useAxios from "../hooks/useAxios";
import { SafeAreaView } from "react-native-safe-area-context";
import { showError, showSuccess } from "../utlis/toast";
import { AppText } from "../components/AppText";

const schema = yup.object({
  description: yup
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters")
    .required("Please describe your suggestion"),
});

type FormValues = yup.InferType<typeof schema>;

const SuggestionScreen = () => {
  const { post } = useAxios();

  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { description: "" },
  });

  const submitSuggestion = async (payload: FormValues) => {
    const { data } = await post("/suggestions", payload);
    return data;
  };

  const descriptionValue = watch("description");
  const charCount = descriptionValue?.length ?? 0;

  const { mutate, isPending } = useMutation({
    mutationFn: submitSuggestion,
    onSuccess: () => {
      reset();

      showSuccess(
        "Your suggestion has been submitted successfully! Thank you for helping us improve.",
      );
    },
    onError: (error: any) => {
      showError("Failed to submit suggestion. Please try again.");
    },
  });

  const onSubmit = (values: FormValues) => mutate(values);

  const isLoading = isSubmitting || isPending;

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <AppText style={styles.title}>Send a Suggestion</AppText>
            <AppText style={styles.subtitle}>
              We'd love to hear your ideas. Share your thoughts and help us
              improve your experience.
            </AppText>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldWrapper}>
              <AppText style={styles.label}>Your Suggestion</AppText>

              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    maxFontSizeMultiplier={1}
                    allowFontScaling={false}
                    style={[
                      styles.textarea,
                      errors.description && styles.inputError,
                    ]}
                    placeholder="Describe your suggestion in detail..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                    maxLength={1000}
                  />
                )}
              />

              <View style={styles.fieldFooter}>
                {errors.description ? (
                  <AppText style={styles.errorText}>
                    {errors.description.message}
                  </AppText>
                ) : (
                  <View />
                )}
                <AppText
                  style={[
                    styles.charCount,
                    charCount > 900 && styles.charCountWarn,
                  ]}
                >
                  {charCount}/1000
                </AppText>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <AppText style={styles.upgradeButtonText}>
              {isLoading ? "Submitting..." : "Submit"}
            </AppText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  submitBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 120,
    alignItems: "center",
    marginBottom: 24,
  },
  upgradeButtonText: {
    color: "white",
    fontFamily: getFontFamily("800"),
    fontSize: normalize(18),
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexGrow: 1,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: normalize(20),
    color: "#111827",
    marginBottom: 3,
    fontFamily: getFontFamily("800"),
  },
  subtitle: {
    fontSize: normalize(17),
    color: "#6B7280",
    fontFamily: getFontFamily("700"),
  },
  form: {
    gap: 20,
    marginTop: 10,
  },
  fieldWrapper: {
    gap: 6,
  },
  label: {
    fontSize: normalize(18),
    color: "#000",
    marginBottom: 2,
    fontFamily: getFontFamily("800"),
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    fontFamily: getFontFamily("400"),
    fontSize: normalize(18),
    color: "#111827",
    minHeight: 180,
    backgroundColor: "#FAFAFA",
  },
  inputError: {
    borderColor: "#e10c0c",
    backgroundColor: "#FFF9F9",
  },
  fieldFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  errorText: {
    fontSize: normalize(17),
    color: "#f40707",
    flex: 1,
    fontFamily: getFontFamily("700"),
  },
  charCount: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: getFontFamily("900"),
  },
  charCountWarn: {
    color: "#545454",
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 8 : 20,
  },
  //   submitBtn: {
  //     backgroundColor: COLORS.primary,
  //     paddingVertical: 15,
  //     borderRadius: 12,
  //     alignItems: "center",
  //   },
  submitBtnDisabled: {
    opacity: 0.6,
  },
});

export default SuggestionScreen;
