import ReactNativeBiometrics from "react-native-biometrics";

const rnBiometrics = new ReactNativeBiometrics();

const isSensorAvailable = async () => {
  const { available, biometryType, error } =
    await rnBiometrics.isSensorAvailable();
  if (error) throw new Error(error);
  return { available, biometryType };
};

const createKeys = async () => {
  const { publicKey } = await rnBiometrics.createKeys();
  // if (error) throw new Error(error);
  return publicKey;
};

const createSignature = async (payload: string, promptMessage: string) => {
  const { success, signature, error } = await rnBiometrics.createSignature({
    payload,
    promptMessage,
  });
  if (error) throw new Error(error);
  if (!success) throw new Error("Authentication failed");
  return signature;
};

const simplePrompt = async (promptMessage: string) => {
  const { success, error } = await rnBiometrics.simplePrompt({
    promptMessage,
  });
  if (error) throw new Error(error);
  if (!success) throw new Error("Authentication failed");
  return true;
};

const BiometricService = {
  isSensorAvailable,
  createKeys,
  createSignature,
  simplePrompt,
};

export default BiometricService;
