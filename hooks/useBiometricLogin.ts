import { useCallback, useEffect, useState } from "react";
import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";
import useAxios from "./useAxios";
import { showError } from "../utlis/toast";
import { storage, STORAGE_KEYS } from "../utlis/storage";
import { OneSignal } from "react-native-onesignal";

const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: true, // true = also allow PIN/pattern fallback
});

export type BiometryLabel = "Face ID" | "Touch ID" | "Biometrics" | null;

export const useBiometricLogin = () => {
  const { post } = useAxios();
  const [biometryLabel, setBiometryLabel] = useState<BiometryLabel>(null);
  const [isReady, setIsReady] = useState(false); // sensor + registered key present
  const [isBusy, setIsBusy] = useState(false);

  /** Detect the sensor and whether a key pair + backend key id exist. */
  const refreshAvailability = useCallback(async () => {
    try {
      const { available, biometryType } =
        await rnBiometrics.isSensorAvailable();

      if (!available) {
        setBiometryLabel(null);
        setIsReady(false);
        return;
      }

      setBiometryLabel(
        biometryType === BiometryTypes.FaceID
          ? "Face ID"
          : biometryType === BiometryTypes.TouchID
          ? "Touch ID"
          : "Biometrics",
      );

      const { keysExist } = await rnBiometrics.biometricKeysExist();

      const storedKeyId = storage.getString(STORAGE_KEYS.BIOMETRIC_KEY_ID);

      setIsReady(keysExist && !!storedKeyId);

      console.log("Key: ", keysExist, storedKeyId);

      setIsReady(keysExist && !!storedKeyId);
    } catch {
      setBiometryLabel(null);
      setIsReady(false);
    }
  }, []);

  useEffect(() => {
    refreshAvailability();
  }, [refreshAvailability]);

  /**
   * Prompt Face ID / fingerprint, sign a payload, and verify it with the
   * backend. Resolves true when the backend confirms the signature.
   */
  const loginWithBiometrics = async (userUuid?: string): Promise<any> => {
    if (isBusy) return false;
    try {
      const keyId = storage.getString(STORAGE_KEYS.BIOMETRIC_KEY_ID);

      if (!keyId) return null;

      const userOneSignalID = await OneSignal.User.getOnesignalId();
      const payload = `${userUuid ?? "login"}|${Date.now()}`;

      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage: `Log in with ${biometryLabel ?? "biometrics"}`,
        payload,
        cancelButtonText: "Use password instead",
      });

      // User cancelled the native prompt — not an error, just fall through
      if (!success || !signature) return false;

      setIsBusy(true);

      const response = await post("/auth/biometrics/login", {
        key_id: Number(keyId),
        payload,
        signature,
        device_id: userOneSignalID,
      });

      // return verified;
      const data = response?.data ?? null;

      console.log("Biometric Logic. Data: ", data);

      // if (!data?.verified) {
      //   if (data?.is_locked) {
      //     showError(
      //       "Biometric login is temporarily locked. Use your password.",
      //     );
      //   } else {
      //     showError("Biometric verification failed. Use your password.");
      //   }
      //   return null;
      // }

      return data;
    } catch (err) {
      console.error("Biometric login failed:", err);
      showError("Biometric login failed. Use your password instead.");
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  /** Remove local keys + stored id (call alongside your revoke endpoint). */
  const clearLocalBiometrics = async () => {
    await rnBiometrics.deleteKeys();
    storage.delete(STORAGE_KEYS.BIOMETRIC_KEY_ID);
    await refreshAvailability();
  };

  return {
    biometryLabel, // "Face ID" | "Touch ID" | "Biometrics" | null
    isReady, // sensor available AND a registered key exists
    isBusy,
    loginWithBiometrics,
    clearLocalBiometrics,
  };
};
