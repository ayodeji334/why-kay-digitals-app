import DeviceInfo from "react-native-device-info";
import { OneSignal } from "react-native-onesignal";

export const getDeviceId = (): Promise<string> => DeviceInfo.getUniqueId();

// name needs an Apple-approved entitlement), plus library placeholders.
const GENERIC_DEVICE_NAMES = ["iphone", "ipad", "ipod touch", "unknown", ""];

/**
 * A human-readable device label for device lists on the backend, e.g.
 * "Ada's Galaxy S23" or, on iOS, "iPhone 15 Pro" (the model), falling back to
 * brand + model when the OS only gives a generic name.
 */
export const getReadableDeviceName = async (): Promise<string> => {
  const name = await DeviceInfo.getDeviceName().catch(() => "");
  if (!GENERIC_DEVICE_NAMES.includes(name.trim().toLowerCase())) {
    return name.trim();
  }
  const model = DeviceInfo.getModel();
  if (!GENERIC_DEVICE_NAMES.includes(model.trim().toLowerCase())) {
    // iOS model names already include the brand ("iPhone 15 Pro")
    return model.toLowerCase().startsWith("i")
      ? model
      : `${DeviceInfo.getBrand()} ${model}`;
  }
  return name.trim() || model || "Unknown device";
};

export const getDeviceOs = (): string =>
  `${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()}`;

/** device_name/device_os for any request that registers or trusts this device. */
export const getDeviceLabel = async (): Promise<{
  device_name: string;
  device_os: string;
}> => ({
  device_name: await getReadableDeviceName(),
  device_os: getDeviceOs(),
});

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
  // OneSignal's user-level id. Not a stable identifier (it changes on
  // account switches); sent only for backward compatibility.
  onesignal_id: string | null;
};

/** device_id/device_name/device_os/push_subscription_id for the /auth/login payload. */
export const getDeviceMeta = async (): Promise<DeviceMeta> => {
  const [deviceId, deviceName, pushSubscriptionId, onesignalId] =
    await Promise.all([
      DeviceInfo.getUniqueId(),
      getReadableDeviceName(),
      // The device-level subscription id OneSignal delivers push to.
      OneSignal.User.pushSubscription.getIdAsync().catch(() => null),
      OneSignal.User.getOnesignalId().catch(() => null),
    ]);

  return {
    device_id: deviceId,
    device_name: deviceName,
    device_os: getDeviceOs(),
    push_subscription_id: pushSubscriptionId,
    onesignal_id: onesignalId,
  };
};
