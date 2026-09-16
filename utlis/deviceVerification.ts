import { AxiosError } from "axios";
import { useAuthStore } from "../stores/authSlice";

// Success shape returned by /auth/device/verify-selfie and
// /auth/device/verify-otp — identical to a normal /auth/login response,
// so it's handed to the same "complete login" logic as Case A.
export type DeviceVerificationSuccess = {
  user: any;
  auth: { accessToken: string; refreshToken: string };
};

/**
 * True once the verification challenge itself is gone — either the token
 * expired (10 minutes) or the combined selfie/OTP attempt counter hit 5
 * and the backend deleted the pending device row. Either way there is
 * nothing left to retry against; the only way forward is logging in again.
 *
 * The backend doesn't send a distinct error code for this, so it's
 * inferred the same way the spec describes: a 403 always means the
 * challenge is gone, and a per-attempt failure always mentions how many
 * attempts are left — once that phrase disappears from the message, the
 * attempts are exhausted too.
 */
export const isDeviceVerificationExpired = (err: unknown): boolean => {
  if (!(err instanceof AxiosError)) return false;

  if (err.response?.status === 403) return true;

  const message: string = err.response?.data?.message ?? "";
  if (!message) return false;

  return !/attempt/i.test(message);
};

export const getDeviceVerificationErrorMessage = (
  err: unknown,
  fallback: string,
): string => {
  if (err instanceof AxiosError) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
};

export type DeviceVerificationOption = "selfie" | "otp";

const normalizeIdentifier = (value?: string | null) =>
  (value ?? "").trim().toLowerCase();

/**
 * Which verification screen the login route should navigate to by
 * default. Selfie is only the default for a user who has actually
 * completed BVN + selfie verification before — checked against whatever
 * user record is cached locally on this device (from a previous session),
 * and only trusted if it matches the identifier just logged in with (a
 * different account's leftover cache on the same install must not steer
 * this). Everyone else — including "no local record at all" — defaults to
 * the email code, per spec.
 */
export const resolveDefaultDeviceVerificationOption = (
  login?: string,
): DeviceVerificationOption => {
  const cachedUser = useAuthStore.getState().user;

  const cachedUserMatches =
    !!cachedUser &&
    !!login &&
    [cachedUser.email, cachedUser.username].some(
      candidate => normalizeIdentifier(candidate) === normalizeIdentifier(login),
    );

  const hasSelfieOnFile =
    cachedUserMatches &&
    cachedUser?.bvn_verification_status === "VERIFIED" &&
    !!cachedUser?.selfie_url;

  return hasSelfieOnFile ? "selfie" : "otp";
};
