import DeviceInfo from "react-native-device-info";
import { OneSignal } from "react-native-onesignal";

// The backend's DeviceService keys "is this a known device?" off whatever
// value we send as device_id. Sending anything that isn't stable across
// sessions (e.g. the OneSignal player id, which can rotate on its own —
// re-registration, push token resets — independently of the physical
// device) makes it flag a real device as "new" on every single login.
//
// DeviceInfo.getUniqueId() is generated once per install and persisted by
// the OS/library itself (identifierForVendor on iOS, a generated + stored
// id on Android) — exactly the "stable, persisted device_id" the login
// flow needs, with no extra storage plumbing required. It's also already
// the value sent for biometric enrollment (see
// hooks/useBiometricEnrollment.ts), so login/device-verification and
// biometrics agree on what "this device" means.
export const getDeviceId = (): Promise<string> => DeviceInfo.getUniqueId();

export type DeviceMeta = {
  device_id: string;
  device_name: string | null;
  device_os: string;
  // OneSignal's per-device push subscription id — separate from device_id
  // above (which must stay the stable DeviceInfo id, see the note at the
  // top of this file). Sent alongside it so the backend can keep this
  // device's push registration in sync on every login. Null when OneSignal
  // hasn't finished creating the subscription yet (e.g. right after a
  // fresh install) or the lookup fails.
  push_subscription_id: string | null;
};

/** device_id/device_name/device_os/push_subscription_id for the /auth/login payload. */
export const getDeviceMeta = async (): Promise<DeviceMeta> => {
  const [deviceId, deviceName, pushSubscriptionId] = await Promise.all([
    DeviceInfo.getUniqueId(),
    DeviceInfo.getDeviceName().catch(() => null),
    await OneSignal.User.getOnesignalId(),
  ]);

  return {
    device_id: deviceId,
    device_name: deviceName ?? DeviceInfo.getModel() ?? null,
    device_os: `${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()}`,
    push_subscription_id: pushSubscriptionId,
  };
};
