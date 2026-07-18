import { useCallback, useState } from "react";
import BiometricService, { BiometryTypes } from "../services/Biometrcs";
import { removeItem, setItem, STORAGE_KEYS } from "../utlis/storage";
import {
  refreshBiometricState,
  useBiometricStore,
} from "../stores/biometricSlice";
import { showError, showSuccess } from "../utlis/toast";
import { Alert, Linking, Platform } from "react-native";
import { useAuthStore } from "../stores/authSlice";
import useAxios from "./useAxios";
import DeviceInfo from "react-native-device-info";

export const useBiometricEnrollment = () => {
  // const { post, patch } = useAxios();
  // const { setUser, enableBiometric, disableBiometric } = useAuthStore(s => s);
  // const { available, biometryType } = useBiometricStore(s => s);
  // const [isLoading, setIsLoading] = useState(false);
  const { post, patch } = useAxios();
  const { user, setUser, enableBiometric, disableBiometric } = useAuthStore(
    s => s,
  );
  const { available, biometryType } = useBiometricStore(s => s);
  const [isLoading, setIsLoading] = useState(false);

  const showEnrollmentAlert = useCallback(() => {
    Alert.alert(
      "No biometrics set up",
      `Add a ${
        Platform.OS === "ios"
          ? "Face ID / Touch ID"
          : "fingerprint or face unlock"
      } in your device settings first, then come back to enable it here.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () =>
            Platform.OS === "ios"
              ? Linking.openURL("App-Prefs:PASSCODE").catch(() =>
                  Linking.openSettings(),
                )
              : Linking.sendIntent("android.settings.SECURITY_SETTINGS").catch(
                  () => Linking.openSettings(),
                ),
        },
      ],
    );
  }, []);

  const handleError = useCallback(
    (err: any) => {
      const msg = String(err?.message ?? "");
      if (msg.includes("cancel") || msg.includes("User cancelled")) return;
      if (err?.code === "ERR_NETWORK")
        showError("Network error. Please check your connection.");
      else if (msg.includes("NONE_ENROLLED")) showEnrollmentAlert();
      else if (err?.response?.status === 400)
        showError(err.response.data?.message || "Invalid request");
      else showError("Something went wrong. Please try again.");
    },
    [showEnrollmentAlert],
  );

  const enroll = useCallback(
    async (opts?: { silent?: boolean }): Promise<boolean> => {
      try {
        if (!available) {
          await refreshBiometricState();
          if (!useBiometricStore.getState().available) {
            showEnrollmentAlert();
            return false;
          }
        }

        const prompt =
          biometryType === BiometryTypes.FaceID
            ? "Scan your face to enable biometrics"
            : biometryType === BiometryTypes.TouchID
            ? "Scan your fingerprint to enable biometrics"
            : "Confirm your biometrics to enable";

        if (!(await BiometricService.simplePrompt(prompt))) return false;

        setIsLoading(true);

        const [deviceName, deviceId] = await Promise.all([
          DeviceInfo.getDeviceName(),
          DeviceInfo.getUniqueId(),
        ]);

        const publicKey = await BiometricService.createKeys();

        let res;

        try {
          res = await post("biometrics/register", {
            public_key: publicKey,
            device_name: deviceName,
            device_id: deviceId,
            device_os: DeviceInfo.getSystemName(),
            biometric_type: biometryType,
          });
        } catch (apiErr) {
          await BiometricService.deleteKeys().catch(() => {});
          throw apiErr;
        }

        const { user: updatedUser, key_id } = res?.data?.data ?? {};

        if (!key_id) {
          await BiometricService.deleteKeys().catch(() => {});
          showError("Could not finish biometric setup. Please try again.");
          return false;
        }

        await setItem(STORAGE_KEYS.BIOMETRIC_KEY_ID, String(key_id));
        // Record WHICH user this key belongs to, so a later login as a
        // different user can detect the mismatch and clear stale biometrics.
        await setItem(
          STORAGE_KEYS.BIOMETRIC_USER_ID,
          String(updatedUser?.uuid ?? user?.uuid ?? ""),
        );

        if (updatedUser) setUser(updatedUser);
        enableBiometric();
        await refreshBiometricState();

        if (!opts?.silent) {
          showSuccess("Biometric authentication enabled successfully");
        }
        return true;
      } catch (err) {
        handleError(err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [
      available,
      biometryType,
      post,
      user,
      setUser,
      enableBiometric,
      handleError,
      showEnrollmentAlert,
    ],
  );

  // let res;

  // try {
  //   res = await post("biometrics/register", {
  //     public_key: publicKey,
  //     device_name: deviceName,
  //     device_id: deviceId,
  //     device_os: DeviceInfo.getSystemName(),
  //     biometric_type: biometryType,
  //   });
  // } catch (apiErr) {
  //   await BiometricService.deleteKeys().catch(() => {});
  //   throw apiErr;
  // }

  // const { user: updatedUser, key_id } = res?.data?.data ?? {};

  // if (!key_id) {
  //   await BiometricService.deleteKeys().catch(() => {});
  //   showError("Could not finish biometric setup. Please try again.");
  //   return false;
  // }

  // //   await setItem(STORAGE_KEYS.BIOMETRIC_KEY_ID, String(key_id));
  // //   if (updatedUser) setUser(updatedUser);
  // //   enableBiometric();
  // //   await refreshBiometricState();

  // //   showSuccess("Biometric authentication enabled successfully");
  // await setItem(STORAGE_KEYS.BIOMETRIC_KEY_ID, String(key_id));
  // if (updatedUser) setUser(updatedUser);
  // enableBiometric();
  // await refreshBiometricState();

  // if (!opts?.silent) {
  //   showSuccess("Biometric authentication enabled successfully");
  // }
  // return true;
  //     } catch (err) {
  //       handleError(err);
  //       return false;
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   },
  //   [
  //     available,
  //     biometryType,
  //     post,
  //     setUser,
  //     enableBiometric,
  //     handleError,
  //     showEnrollmentAlert,
  //   ],
  // );

  const revoke = useCallback(async (): Promise<boolean> => {
    try {
      if (
        !(await BiometricService.simplePrompt(
          "Confirm your identity to disable biometrics",
        ))
      ) {
        return false;
      }
      setIsLoading(true);

      const res = await patch("biometrics/disable");
      await BiometricService.deleteKeys().catch(() => {});
      await removeItem(STORAGE_KEYS.BIOMETRIC_KEY_ID);

      const user = res?.data?.data ?? null;
      if (user) setUser(user);
      disableBiometric();
      await refreshBiometricState();

      showSuccess("Biometric authentication disabled successfully");
      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [patch, setUser, disableBiometric, handleError]);

  return { enroll, revoke, isLoading, available, biometryType };
};
