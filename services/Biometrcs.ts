// import ReactNativeBiometrics from "react-native-biometrics";

// const rnBiometrics = new ReactNativeBiometrics();

// const isSensorAvailable = async () => {
//   const { available, biometryType, error } =
//     await rnBiometrics.isSensorAvailable();
//   if (error) throw new Error(error);
//   return { available, biometryType };
// };

// const createKeys = async () => {
//   const { publicKey } = await rnBiometrics.createKeys();
//   // if (error) throw new Error(error);
//   return publicKey;
// };

// const createSignature = async (payload: string, promptMessage: string) => {
//   const { success, signature, error } = await rnBiometrics.createSignature({
//     payload,
//     promptMessage,
//   });
//   if (error) throw new Error(error);
//   if (!success) throw new Error("Authentication failed");
//   return signature;
// };

// const simplePrompt = async (promptMessage: string) => {
//   const { success, error } = await rnBiometrics.simplePrompt({
//     promptMessage,
//   });
//   if (error) throw new Error(error);
//   if (!success) throw new Error("Authentication failed");
//   return true;
// };

// const BiometricService = {
//   isSensorAvailable,
//   createKeys,
//   createSignature,
//   simplePrompt,
// };

// export default BiometricService;
import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";

const rnBiometrics = new ReactNativeBiometrics({
  // set true if you want PIN/pattern as a fallback when biometrics fail
  allowDeviceCredentials: false,
});

/**
 * Do NOT throw here — "BIOMETRIC_ERROR_NONE_ENROLLED" etc. arrive through
 * this `error` field with available=false, and the screen's
 * ensureBiometricAccess() needs to READ it to show the right dialog.
 * Throwing turned "nothing enrolled" into "Something went wrong".
 */
const isSensorAvailable = async () => {
  const { available, biometryType, error } =
    await rnBiometrics.isSensorAvailable();
  return { available, biometryType, error };
};

/** Returns the public key string to send to biometrics/register */
const createKeys = async (): Promise<string> => {
  const { publicKey } = await rnBiometrics.createKeys();
  if (!publicKey) throw new Error("Failed to generate biometric keys");
  return publicKey;
};

/** True if a local biometric keypair exists on this device */
const biometricKeysExist = async (): Promise<boolean> => {
  const { keysExist } = await rnBiometrics.biometricKeysExist();
  return keysExist;
};

/** Remove the local keypair (call when disabling / after failed register) */
const deleteKeys = async (): Promise<boolean> => {
  const { keysDeleted } = await rnBiometrics.deleteKeys();
  return keysDeleted;
};

/**
 * Returns the signature string, or null when the user CANCELS the prompt.
 * Cancellation is a normal outcome, not an error — callers decide what
 * silence means. Real failures still throw.
 */
const createSignature = async (
  payload: string,
  promptMessage: string,
): Promise<string | null> => {
  const { success, signature, error } = await rnBiometrics.createSignature({
    payload,
    promptMessage,
    cancelButtonText: "Cancel",
  });

  if (!success || !signature) {
    if (error && !isCancellation(error)) throw new Error(error);
    return null; // user cancelled
  }
  return signature;
};

/**
 * Resolves true/false instead of throwing on cancel. Your screen code does
 * `const success = await simplePrompt(...)` and passes it to
 * handleSendDetailToServer, which treats false as a silent cancel — the old
 * throw-on-cancel version made every cancel surface as an error toast.
 */
const simplePrompt = async (promptMessage: string): Promise<boolean> => {
  const { success, error } = await rnBiometrics.simplePrompt({
    promptMessage,
    cancelButtonText: "Cancel",
  });

  if (!success && error && !isCancellation(error)) {
    throw new Error(error);
  }
  return success;
};

const isCancellation = (error: string) =>
  /cancel/i.test(error) || /user.*denied/i.test(error);

const BiometricService = {
  isSensorAvailable,
  createKeys,
  biometricKeysExist,
  deleteKeys,
  createSignature,
  simplePrompt,
};

export default BiometricService;
export { BiometryTypes };
