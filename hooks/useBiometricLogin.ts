import { useCallback, useEffect, useState } from "react";
import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";
import useAxios from "./useAxios";
import { showError } from "../utlis/toast";
import { storage, STORAGE_KEYS } from "../utlis/storage";
import { OneSignal } from "react-native-onesignal";
import { useAuthStore } from "../stores/authSlice";
import DeviceInfo from "react-native-device-info";
import { fetchBiometricChallenge } from "../utlis/biometricChallenge";

// Biometrics only: allowing the device PIN/pattern here would make
// "biometric" login only as strong as the lock-screen PIN.
const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: false,
});

export type BiometryLabel = "Face ID" | "Touch ID" | "Biometrics" | null;

export const useBiometricLogin = () => {
  const { post, client } = useAxios();
  const [biometryLabel, setBiometryLabel] = useState<BiometryLabel>(null);
  const [isReady, setIsReady] = useState(false); // sensor + registered key present
  const [isBusy, setIsBusy] = useState(false);

  /** Detect the sensor and whether a key pair + backend key id exist. */

  const refreshAvailability = useCallback(async () => {
    try {
      const { available, biometryType } =
        await rnBiometrics.isSensorAvailable();
      const { keysExist } = await rnBiometrics.biometricKeysExist();
      const storedKeyId = storage.getString(STORAGE_KEYS.BIOMETRIC_KEY_ID);
      const storedUserId = storage.getString(STORAGE_KEYS.BIOMETRIC_USER_ID);
      const currentUserId = useAuthStore.getState().user?.uuid;

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

      // "Ready" now means: sensor available, key exists locally, AND that
      // key was registered by the currently logged-in user — not just
      // "some key exists" from a previous account.
      setIsReady(
        keysExist &&
          !!storedKeyId &&
          !!currentUserId &&
          storedUserId === currentUserId,
      );
    } catch (e) {
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

      // getOnesignalId() is the OneSignal *user* id, not the per-device
      // push subscription id the backend's device_id needs to match what
      // OneSignal shows for this device.
      const devicePushSubscriptionId = await OneSignal.User.getOnesignalId();
      // Sign a server-issued one-time challenge so the signature can't be
      // replayed. Legacy timestamp payload only while the endpoint rolls out.
      const challenge = await fetchBiometricChallenge(client, keyId, "login");
      const payload = challenge
        ? `login|${challenge}`
        : `${userUuid ?? "login"}|${Date.now()}`;

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
        device_id: devicePushSubscriptionId,
        // Stable hardware id: the backend binds the session's refresh token to it.
        hardware_device_id: await DeviceInfo.getUniqueId(),
        device_name: DeviceInfo.getModel() ?? null,
      });

      const data = response?.data ?? null;

      return data;
    } catch (err) {
      showError("Biometric login failed. Use your password instead.");
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  const clearBiometricsIfDifferentUser = useCallback(
    async (newUserUuid?: string): Promise<void> => {
      if (!newUserUuid) return;

      const storedUserId = storage.getString(STORAGE_KEYS.BIOMETRIC_USER_ID);
      const storedKeyId = storage.getString(STORAGE_KEYS.BIOMETRIC_KEY_ID);

      // Nothing enrolled on this device at all — nothing to clear.
      if (!storedKeyId) return;

      // Key belongs to this same user — leave it alone.
      if (storedUserId === newUserUuid) return;

      // Key belongs to someone else (or has no recorded owner, e.g. an
      // older enrollment from before this field existed) — clear it.
      await rnBiometrics.deleteKeys().catch(() => {});
      storage.delete(STORAGE_KEYS.BIOMETRIC_KEY_ID);
      storage.delete(STORAGE_KEYS.BIOMETRIC_USER_ID);
      await refreshAvailability();
    },
    [refreshAvailability],
  );

  /** Remove local keys + stored id (call alongside your revoke endpoint). */

  const clearLocalBiometrics = async () => {
    await rnBiometrics.deleteKeys();
    storage.delete(STORAGE_KEYS.BIOMETRIC_KEY_ID);
    storage.delete(STORAGE_KEYS.BIOMETRIC_USER_ID);
    await refreshAvailability();
  };

  return {
    biometryLabel,
    isReady,
    isBusy,
    loginWithBiometrics,
    clearLocalBiometrics,
    clearBiometricsIfDifferentUser,
    refreshAvailability,
  };
};
