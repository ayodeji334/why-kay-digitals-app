import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getItem, setItem, removeItem } from "../utlis/storage"; // Your MMKV utils
import axios from "axios";
import { BASE_URL } from "../api/axios";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isBiometricEnabled: boolean;
  isGoogleAuthenticatorEnabled: boolean;
  setToken: (token: string | null, refreshToken?: string | null) => void;
  setUser: (user: any) => void;
  logout: () => void;
  enableBiometric: () => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  disableBiometric: () => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setIsGoogleAuthenticatorEnabled: (enabled: boolean) => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isGoogleAuthenticatorEnabled: false,
      isBiometricEnabled: false,

      setToken: (token, refreshToken = null) => {
        set({
          token,
          refreshToken,
          isAuthenticated: !!token,
        });

        // Also update MMKV for axios interceptor access
        if (token) {
          setItem("auth_token", token);
        } else {
          removeItem("auth_token");
        }

        if (refreshToken) {
          setItem("refresh_token", refreshToken);
        } else {
          removeItem("refresh_token");
        }
      },

      setUser: user => {
        set(state => ({
          ...state,
          user: state.user ? { ...state.user, ...user } : null,
        }));

        // Update MMKV with merged user data
        if (get().user) {
          setItem("user", JSON.stringify(get().user));
        }
      },

      logout: () => {
        console.log("log out...");
        set(state => ({
          ...state,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }));

        removeItem("auth_token");
        removeItem("refresh_token");
      },

      setIsGoogleAuthenticatorEnabled: (value: boolean) => {
        set({ isGoogleAuthenticatorEnabled: value });
      },

      enableBiometric: () => {
        set({ isBiometricEnabled: true });
      },

      setIsAuthenticated: (value: boolean) => {
        set({ isAuthenticated: value });
      },

      disableBiometric: () => {
        set({ isBiometricEnabled: false });
      },

      setBiometricEnabled: (enabled: boolean) => {
        set({ isBiometricEnabled: enabled });
      },

      // completeOnboarding: () => {
      //   set({ isOnboardingCompleted: true });
      // },

      clearAuth: () => {
        get().logout();
        set({
          isBiometricEnabled: false,
          // isOnboardingCompleted: false,
        });
      },

      initializeAuth: async () => {
        try {
          const token = getItem("auth_token");
          const savedUser = getItem("user");

          if (token && savedUser) {
            try {
              const res = await axios.get(`${BASE_URL}/users/current-user`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 8000,
              });

              if (res?.status === 200 && res.data?.success) {
                const userData = res.data.data;

                set({
                  token,
                  user: userData,
                  isAuthenticated: true,
                });

                //   // Load additional user data
                //   await loadBiometricStatus(userData.uuid);
                //   loadUserPreferences();
              } else {
                throw new Error("Invalid token");
              }
            } catch (error) {
              console.log("Token validation failed:", error);
              get().logout(); // Use the existing logout action
            }
          } else {
            get().logout(); // Ensure clean state
          }
        } catch (err) {
          console.error("Auth initialization failed:", err);
          get().logout();
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => ({
        getItem: name => {
          const value = getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          setItem(name, JSON.stringify(value));
        },
        removeItem: name => {
          removeItem(name);
        },
      })),
      // Only persist these fields
      partialize: state => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isBiometricEnabled: state.isBiometricEnabled,
        isGoogleAuthenticatorEnabled: state.isGoogleAuthenticatorEnabled,
      }),
    },
  ),
);

// Selector hooks for optimized re-renders
export const useToken = () => useAuthStore(state => state.token);
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () =>
  useAuthStore(state => state.isAuthenticated);
export const useIsBiometricEnabled = () =>
  useAuthStore(state => state.isBiometricEnabled);
export const useAuthActions = () =>
  useAuthStore(state => ({
    setToken: state.setToken,
    setUser: state.setUser,
    logout: state.logout,
    enableBiometric: state.enableBiometric,
    disableBiometric: state.disableBiometric,
    setBiometricEnabled: state.setBiometricEnabled,
  }));
