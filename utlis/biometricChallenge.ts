import { AxiosError, AxiosInstance } from "axios";

export type BiometricPurpose = "login" | "withdrawal";

/**
 * Asks the backend for a one-time challenge to sign, so a captured signature
 * can't be replayed. Expected contract:
 *
 *   GET /auth/biometrics/challenge?key_id=<id>&purpose=<login|withdrawal>
 *   -> { data: { challenge: "<random, single-use, ~60s TTL>" } }
 *
 * The backend must bind the challenge to key_id + purpose, accept it once,
 * and reject it after it expires.
 *
 * Returns null only when the endpoint isn't deployed yet (404/405), so callers
 * can fall back to the legacy timestamp payload during the rollout. Any other
 * failure throws. Remove the fallback once the backend ships the endpoint.
 */
export const fetchBiometricChallenge = async (
  client: AxiosInstance,
  keyId: string,
  purpose: BiometricPurpose,
): Promise<string | null> => {
  try {
    const res = await client.get("/auth/biometrics/challenge", {
      params: { key_id: Number(keyId), purpose },
    });
    const challenge = res?.data?.data?.challenge;
    if (!challenge) throw new Error("Missing biometric challenge");
    return String(challenge);
  } catch (err) {
    const status = err instanceof AxiosError ? err.response?.status : undefined;
    if (status === 404 || status === 405) return null;
    throw err;
  }
};
