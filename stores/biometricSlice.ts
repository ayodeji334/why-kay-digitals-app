import { create } from "zustand";
import BiometricService from "../services/Biometrcs";
import { storage, STORAGE_KEYS } from "../utlis/storage";

type DeviceBiometricState = {
  available: boolean;
  biometryType?: string;
  enrolledOnDevice: boolean;
  checked: boolean;
};

export const useBiometricStore = create<
  DeviceBiometricState & {
    setDeviceState: (s: Partial<DeviceBiometricState>) => void;
  }
>(set => ({
  available: false,
  enrolledOnDevice: false,
  checked: false,
  setDeviceState: s => set(s),
}));

export const refreshBiometricState = async () => {
  const raw = await BiometricService.isSensorAvailable();
  console.log("[refresh] raw:", JSON.stringify(raw));

  const { available, biometryType } = raw;
  const keysExist = await BiometricService.biometricKeysExist();
  const keyId = storage.getString(STORAGE_KEYS.BIOMETRIC_KEY_ID);

  console.log("[refresh] ->", { available, biometryType, keysExist, keyId });

  useBiometricStore.getState().setDeviceState({
    available,
    biometryType,
    enrolledOnDevice: available && keysExist && !!keyId,
    checked: true,
  });
};
