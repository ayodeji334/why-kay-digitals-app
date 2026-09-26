import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";
import { secureStateStorage } from "../utlis/secureStorage";
import { BASE_URL } from "../config";
import { OneSignal } from "react-native-onesignal";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isBiometricEnabled: boolean;
  isGoogleAuthenticatorEnabled: boolean;
  isShowBalance: boolean;
  hasHydrated: boolean;
  setToken: (token: string | null, refreshToken?: string | null) => void;
  setUser: (user: any | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setIsShowBalance: (show: boolean) => void;
  enableBiometric: () => void;
  disableBiometric: () => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setIsGoogleAuthenticatorEnabled: (enabled: boolean) => void;
  logout: () => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setHasHydrated: () => void;
}

// Pushes are addressed to the account (OneSignal external id = user uuid), not to a
// device id we store. Linking the phone to the signed-in account makes OneSignal move this
// phone's subscription to that account, so after an account switch the previous account's
// notifications no longer arrive here. Called on every sign-in and on app start.
const linkPushToAccount = (uuid?: string | null) => {
  if (!uuid) return;
  try {
    OneSignal.login(String(uuid));
  } catch {}
};

// Fields that must never be written to device storage, even the Keychain. Everything
// else on the user object is display or status data.
const SENSITIVE_USER_FIELDS = [
  "bvn",
  "nin",
  "date_of_birth",
  "dob",
  "phone_number",
  "phone",
  "address",
  "street",
  "city",
  "state",
  "postal_code",
  "next_of_kin",
  "security_pin",
  "password",
  "two_factor_secret",
  "two_factor_recovery_codes",
  "selfie_url",
  "bvn_verification_data",
  "nin_verification_data",
];

const persistableUser = (user: any | null) => {
  if (!user || typeof user !== "object") return user;
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(user)) {
    if (!SENSITIVE_USER_FIELDS.includes(key)) safe[key] = value;
  }
  return safe;
};

// Secure storage is async, so the persisted session isn't in the store yet
// when it's created. Await this before reading the token at app start.
let resolveAuthHydration: () => void = () => {};
export const authHydration = new Promise<void>(resolve => {
  resolveAuthHydration = resolve;
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isBiometricEnabled: false,
      isGoogleAuthenticatorEnabled: false,
      isShowBalance: true,
      hasHydrated: false,

      setToken: (token, refreshToken = null) => {
        set({ token, refreshToken });
      },

      setUser: user => {
        set(state => ({
          user: user
            ? {
                ...(state.user ?? {}),
                ...user,
              }
            : null,
        }));
      },

      setIsAuthenticated: value => {
        set({ isAuthenticated: value });
        if (value) linkPushToAccount(get().user?.uuid);
      },

      setIsShowBalance: show => {
        set({ isShowBalance: show });
      },
      enableBiometric: () => set({ isBiometricEnabled: true }),
      disableBiometric: () => set({ isBiometricEnabled: false }),
      setBiometricEnabled: enabled => set({ isBiometricEnabled: enabled }),
      setIsGoogleAuthenticatorEnabled: enabled =>
        set({ isGoogleAuthenticatorEnabled: enabled }),

      logout: () => {
        // Deliberately does NOT call OneSignal.logout(): the phone stays linked
        // to the last signed-in account, so that account keeps getting its
        // notifications while signed out. When a different account signs in here,
        // OneSignal.login(<its uuid>) (see linkPushToAccount) moves the phone to
        // it, and the previous account's pushes stop arriving on this phone.
        set({
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      clearAuth: () => {
        get().logout();
        set({
          isBiometricEnabled: false,
          isGoogleAuthenticatorEnabled: false,
        });
      },

      initializeAuth: async () => {
        const { token } = get();

        if (!token) {
          get().logout();
          return;
        }

        try {
          const res = await axios.get(`${BASE_URL}/users/current-user`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 8000,
          });

          if (res.status === 200 && res.data?.success) {
            set({
              user: res.data.data,
              isAuthenticated: true,
            });
            // Re-link on every app start (covers installs signed in before this change).
            linkPushToAccount(res.data.data?.uuid);
          } else {
            throw new Error("Invalid session");
          }
        } catch {
          get().logout();
        }
      },

      // Best-effort refresh of the current user (e.g. to pick up an admin
      // un-suspending the account) — unlike initializeAuth, a failure here
      // must NOT log the user out, since they're still validly authenticated.
      refreshUser: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const res = await axios.get(`${BASE_URL}/users/current-user`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 8000,
          });

          if (res.status === 200 && res.data?.success) {
            set(state => ({
              user: { ...(state.user ?? {}), ...res.data.data },
            }));
          }
        } catch {
          // ignore — keep last known user state
        }
      },

      setHasHydrated: () => {
        set({ hasHydrated: true });
      },
    }),

    {
      name: "auth-storage",

      // Tokens + profile live in the Keychain/Keystore, not plaintext MMKV.
      storage: createJSONStorage(() => secureStateStorage),

      /**
       * Persist ONLY what is needed
       */
      partialize: state => ({
        token: state.token,
        refreshToken: state.refreshToken,
        // Identity and contact details are not kept on disk: they are re-fetched from
        // the backend at launch (initializeAuth), and only the display fields the UI
        // needs for its first paint are persisted.
        user: persistableUser(state.user),
        isBiometricEnabled: state.isBiometricEnabled,
        isGoogleAuthenticatorEnabled: state.isGoogleAuthenticatorEnabled,
        isShowBalance: state.isShowBalance, // now persists across restarts
      }),

      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.log("an error happened during hydration", error);
          } else {
            state?.setHasHydrated();
            console.log("hydration finished");
          }
          // Resolve on success and on error so app start never hangs.
          resolveAuthHydration();
        };
      },
    },
  ),
);

export const useToken = () => useAuthStore(state => state.token);
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () =>
  useAuthStore(state => state.isAuthenticated);
export const useIsBiometricEnabled = () =>
  useAuthStore(state => state.isBiometricEnabled);
export const useHasHydrated = () => useAuthStore(state => state.hasHydrated);
export const useIsShowBalance = () =>
  useAuthStore(state => state.isShowBalance);

export const useAuthActions = () =>
  useAuthStore(state => ({
    setToken: state.setToken,
    setUser: state.setUser,
    setIsAuthenticated: state.setIsAuthenticated,
    setIsShowBalance: state.setIsShowBalance,
    logout: state.logout,
    clearAuth: state.clearAuth,
    refreshUser: state.refreshUser,
  }));
