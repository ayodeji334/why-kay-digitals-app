import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
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
 *
 * An account without a transaction PIN (e.g. one created on the website) is sent to
 * CreatePin with its tokens instead of straight into the app — the same hand-off new
 * sign-ups get after verifying their email; ConfirmPin finishes the login.
 */
export const useCompleteLogin = () => {
  const queryClient = useQueryClient();
  const navigation: any = useNavigation();
  const setToken = useAuthStore(state => state.setToken);
  const setUser = useAuthStore(state => state.setUser);
  const setIsAuthenticated = useAuthStore(state => state.setIsAuthenticated);
  const { clearBiometricsIfDifferentUser } = useBiometricLogin();

  return useCallback(
    async (auth: AuthTokens, user: any) => {
      if (user && user.has_set_transaction_pin === false) {
        navigation.navigate("CreatePin", {
          user,
          token: auth.accessToken,
          refreshToken: auth.refreshToken,
        });
        return;
      }

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
      navigation,
      setToken,
      setUser,
      setIsAuthenticated,
      clearBiometricsIfDifferentUser,
    ],
  );
};
