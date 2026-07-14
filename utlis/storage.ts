import { MMKV } from "react-native-mmkv";

export const storage = new MMKV();

export const STORAGE_KEYS = {
  BIOMETRIC_KEY_ID: "biometric_key_id",
  BIOMETRIC_PROMPT: "biometric_prompt",
} as const;

export const setItem = (key: string, value: string) => {
  storage.set(key, value);
};

export const getItem = (key: string): string | undefined => {
  return storage.getString(key);
};

export const removeItem = (key: string) => {
  storage.delete(key);
};
