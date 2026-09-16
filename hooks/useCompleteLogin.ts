import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authSlice";
import { refreshBiometricState } from "../stores/biometricSlice";
import { useBiometricPromptStore } from "../stores/biometricPromptSlice";
import { useBiometricLogin } from "./useBiometricLogin";

type AuthTokens = { accessToken: string; refreshToken: string };

/**
 * Everything that has to happen once a login attempt actually succeeds —
 * whether that's a normal /auth/login response (known device) or a device
 * verification challenge (selfie/OTP) resolving to the exact same
 * user + auth shape. Centralized so the three call sites (LoginForm,
 * ReturningUserLoginForm, DeviceVerificationScreen) can't drift apart.
 */
export const useCompleteLogin = () => {
  const queryClient = useQueryClient();
  const setToken = useAuthStore(state => state.setToken);
  const setUser = useAuthStore(state => state.setUser);
  const setIsAuthenticated = useAuthStore(state => state.setIsAuthenticated);
  const { clearBiometricsIfDifferentUser } = useBiometricLogin();

  return useCallback(
    async (auth: AuthTokens, user: any) => {
      queryClient.prefetchQuery({ queryKey: ["assets"] });
      queryClient.prefetchQuery({ queryKey: ["banks"] });
      queryClient.prefetchQuery({ queryKey: ["supported-pairs"] });

      setToken(auth.accessToken, auth.refreshToken);
      setUser(user);

      await clearBiometricsIfDifferentUser(user?.uuid);
      await useBiometricPromptStore.getState().hydrate();
      await refreshBiometricState();

      setIsAuthenticated(true);
    },
    [
      queryClient,
      setToken,
      setUser,
      setIsAuthenticated,
      clearBiometricsIfDifferentUser,
    ],
  );
};
