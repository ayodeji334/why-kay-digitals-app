import { useAuthStore } from "../stores/authSlice";
import { useBiometricLogin } from "./useBiometricLogin";

/**
 * Whether the current user already has at least one of the two factors
 * the backend accepts as step-up verification for high-value fiat
 * withdrawals set up — an authenticator (Google Authenticator TOTP) or a
 * registered biometric key on this device. Purely informational for the
 * UI (which modal to show, whether to redirect to Account Security); the
 * backend independently validates whichever factor is actually submitted.
 */
export const useStepUpAvailability = () => {
  const user = useAuthStore(state => state.user);
  const isGoogleAuthenticatorEnabled = useAuthStore(
    state => state.isGoogleAuthenticatorEnabled,
  );
  const { isReady: hasBiometric, biometryLabel } = useBiometricLogin();

  const hasAuthenticator = !!(
    user?.two_factor_enabled || isGoogleAuthenticatorEnabled
  );

  return {
    hasAuthenticator,
    hasBiometric,
    biometryLabel,
    hasAnyStepUpMethod: hasAuthenticator || hasBiometric,
  };
};
