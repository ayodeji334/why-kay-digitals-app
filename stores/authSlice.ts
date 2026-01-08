import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";
import { BASE_URL } from "../api/axios";
import { getItem, setItem, removeItem } from "../utlis/storage";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isBiometricEnabled: boolean;
  isGoogleAuthenticatorEnabled: boolean;
  isShowBalance: boolean;
  hasHydrated: boolean;
  fetchUserAccounts: () => Promise<void>;
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
  setHasHydrated: () => void;
}

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
      },

      setIsShowBalance: show => {
        set({ isShowBalance: show });
      },
      fetchUserAccounts: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const res = await axios.get(`${BASE_URL}/users/user/accounts`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 8000,
          });

          if (res.status === 200 && res.data?.success) {
            set(state => ({
              user: {
                ...(state.user ?? {}),
                ...res.data.data, // merge or replace depending on your needs
              },
            }));
          }
        } catch (err) {
          // fallback: clear accounts but keep user shape predictable
          set(state => ({
            user: { ...(state.user ?? {}), bank_accounts: [], wallets: [] },
          }));
        }
      },
      enableBiometric: () => set({ isBiometricEnabled: true }),
      disableBiometric: () => set({ isBiometricEnabled: false }),
      setBiometricEnabled: enabled => set({ isBiometricEnabled: enabled }),
      setIsGoogleAuthenticatorEnabled: enabled =>
        set({ isGoogleAuthenticatorEnabled: enabled }),

      logout: () => {
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
          } else {
            throw new Error("Invalid session");
          }
        } catch {
          get().logout();
        }
      },

      setHasHydrated: () => {
        set({ hasHydrated: true });
      },
    }),
    {
      name: "auth-storage",

      /**
       * MMKV adapter
       * IMPORTANT:
       * - Zustand already serializes
       * - MMKV stores raw strings
       * - NEVER JSON.stringify here
       */
      storage: createJSONStorage(() => ({
        getItem: key => {
          const value = getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: (key, value) => {
          setItem(key, value);
        },
        removeItem: key => {
          removeItem(key);
        },
      })),

      /**
       * Persist ONLY what is needed
       */
      partialize: state => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isBiometricEnabled: state.isBiometricEnabled,
        isGoogleAuthenticatorEnabled: state.isGoogleAuthenticatorEnabled,
      }),

      /**
       * Hydration callback (critical for real devices)
       */
      onRehydrateStorage: () => state => {
        state?.setHasHydrated();
        // call fetchUserAccounts once hydrated
        console.log("calling user account endpoint");
        state?.fetchUserAccounts?.();
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

export const useAuthActions = () =>
  useAuthStore(state => ({
    setToken: state.setToken,
    setUser: state.setUser,
    setIsAuthenticated: state.setIsAuthenticated,
    logout: state.logout,
    clearAuth: state.clearAuth,
  }));
