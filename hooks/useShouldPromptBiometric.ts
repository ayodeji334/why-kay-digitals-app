import {
  COOLDOWN_MS,
  MAX_PROMPTS,
  useBiometricPromptStore,
} from "../stores/biometricPromptSlice";
import { useBiometricStore } from "../stores/biometricSlice";

// hooks/useShouldPromptBiometric.ts
export const useShouldPromptBiometric = () => {
  const { available, enrolledOnDevice, checked } = useBiometricStore(s => s);
  const { status, promptCount, lastPromptedAt, hydrated, holdGate } =
    useBiometricPromptStore(s => s);

  const result = (() => {
    if (!checked || !hydrated) return { ready: false, shouldPrompt: false };

    if (holdGate)
      return {
        ready: true,
        shouldPrompt: true,
        isSecondAsk: promptCount >= 1,
      };

    const shouldPrompt =
      available &&
      !enrolledOnDevice &&
      status !== "enrolled" &&
      status !== "declined_forever" &&
      promptCount < MAX_PROMPTS &&
      Date.now() - lastPromptedAt > COOLDOWN_MS;
    return { ready: true, shouldPrompt, isSecondAsk: promptCount >= 1 };
  })();

  console.log("[should]:", {
    available,
    enrolledOnDevice,
    checked,
    status,
    promptCount,
    hydrated,
    ...result,
  });

  return result;
};
