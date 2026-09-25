import * as Keychain from "react-native-keychain";
import type { StateStorage } from "zustand/middleware";
import { storage } from "./storage";

// Keychain (iOS) / Keystore-encrypted storage (Android) for session data.
// THIS_DEVICE_ONLY keeps it out of backups and device migrations;
// AFTER_FIRST_UNLOCK (not WHEN_UNLOCKED) so a background launch from a push
// while the phone is locked can still read the session instead of logging out.
const keychainOptions = (service: string): Keychain.SetOptions => ({
  service,
  accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
});

const KEYCHAIN_USERNAME = "session";

// Marks that this install has already set up secure storage for `name`.
// MMKV is wiped on uninstall but the iOS Keychain is not, so a missing
// marker means a fresh install (or the first run after this update).
const installMarker = (name: string) => `${name}:keychain_ready`;

// Keychain calls are async and not guaranteed to finish in order; chain
// them so an older write can never land after a newer one.
let queue: Promise<unknown> = Promise.resolve();
const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
  const next = queue.then(task, task);
  queue = next.catch(() => {});
  return next;
};

const readKeychain = async (name: string): Promise<string | null> => {
  const credentials = await Keychain.getGenericPassword({ service: name });
  return credentials ? credentials.password : null;
};

const writeKeychain = async (name: string, value: string) => {
  await Keychain.setGenericPassword(
    KEYCHAIN_USERNAME,
    value,
    keychainOptions(name),
  );
};

export const secureStateStorage: StateStorage = {
  getItem: name =>
    enqueue(async () => {
      try {
        if (!storage.getBoolean(installMarker(name))) {
          // Drop a session left in the Keychain by a previous install, then
          // move over a session saved in plaintext MMKV by an older app
          // version so upgrading users stay logged in.
          await Keychain.resetGenericPassword({ service: name });
          const legacy = storage.getString(name) ?? null;
          if (legacy) {
            await writeKeychain(name, legacy);
            storage.delete(name);
          }
          storage.set(installMarker(name), true);
          return legacy;
        }
        return await readKeychain(name);
      } catch {
        // Unreadable (e.g. Keystore key invalidated): treat as signed out.
        return null;
      }
    }),

  setItem: (name, value) => enqueue(() => writeKeychain(name, value)),

  removeItem: name =>
    enqueue(async () => {
      await Keychain.resetGenericPassword({ service: name });
    }),
};
