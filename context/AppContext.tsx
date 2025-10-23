import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getItem, removeItem, setItem } from "../utlis/storage";
import useApiClient from "../api/axios";

interface User {
  id: string;
  uuid: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  biometric_enabled: boolean;
  biometric_enabled_at?: string;
  tier_level: string;
  status: string;
  // Add other user fields as needed
}

interface AuthContextType {
  // Authentication state
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  isLoading: boolean;

  // User data
  user: User | null;
  setUser: (user: User | null) => void;

  // Biometric state
  isBiometricEnabled: boolean;
  biometricDevices: any[];
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  refreshBiometricStatus: () => Promise<void>;

  // Push notifications
  isPushNotificationEnabled: boolean;
  setPushNotificationEnabled: (enabled: boolean) => void;

  // Auth actions
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { patch, apiGet } = useApiClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [biometricDevices, setBiometricDevices] = useState<any[]>([]);
  const [isPushNotificationEnabled, setIsPushNotificationEnabled] =
    useState(false);

  // Load initial auth state
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const token = getItem("auth_token");
        const savedUser = getItem("user");

        if (token && savedUser) {
          try {
            // Verify token is still valid
            const res = await apiGet("users/current-user");
            if (res?.status === 200 && res.data?.success) {
              const userData = res.data.data;
              setUser(userData);
              setIsAuthenticated(true);

              // Load biometric status
              await loadBiometricStatus(userData.uuid);

              // Load saved preferences
              loadUserPreferences();
            } else {
              throw new Error("Invalid token");
            }
          } catch (error) {
            clearAuthData();
          }
        }
      } catch (err) {
        console.error("Auth bootstrap error:", err);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const loadBiometricStatus = async (userUuid: string) => {
    try {
      const response = await apiGet(`biometrics/devices`);
      if (response.data?.success) {
        const { devices, biometric_enabled } = response.data.data;
        setIsBiometricEnabled(biometric_enabled);
        setBiometricDevices(devices || []);
      }
    } catch (error) {
      console.error("Failed to load biometric status:", error);
    }
  };

  const loadUserPreferences = () => {
    const pushEnabled = getItem("push_notifications_enabled");
    setIsPushNotificationEnabled(pushEnabled === "true");
  };

  const enableBiometric = async (): Promise<void> => {
    try {
      const response = await patch("biometrics/enable");
      if (response.data?.success) {
        setIsBiometricEnabled(true);

        // Update user data if needed
        if (user) {
          const updatedUser = {
            ...user,
            biometric_enabled: true,
            biometric_enabled_at: new Date().toISOString(),
          };
          setUser(updatedUser);
          setItem("user", JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Failed to enable biometric:", error);
      throw error;
    }
  };

  const disableBiometric = async (): Promise<void> => {
    try {
      const response = await patch("biometrics/disable");
      if (response.data?.success) {
        setIsBiometricEnabled(false);

        // Update user data if needed
        if (user) {
          const updatedUser = {
            ...user,
            biometric_enabled: false,
            biometric_enabled_at: undefined,
          };
          setUser(updatedUser);
          setItem("user", JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Failed to disable biometric:", error);
      throw error;
    }
  };

  const refreshBiometricStatus = async (): Promise<void> => {
    if (user?.uuid) {
      await loadBiometricStatus(user.uuid);
    }
  };

  const setPushNotificationEnabled = (enabled: boolean): void => {
    setIsPushNotificationEnabled(enabled);
    setItem("push_notifications_enabled", enabled.toString());
  };

  const updateUserProfile = (updates: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      setItem("user", JSON.stringify(updatedUser));
    }
  };

  const logout = (): void => {
    clearAuthData();
    setIsAuthenticated(false);
    setUser(null);
    setIsBiometricEnabled(false);
    setBiometricDevices([]);
  };

  const clearAuthData = (): void => {
    removeItem("auth_token");
    removeItem("refresh_token");
    removeItem("user");
    removeItem("push_notifications_enabled");
  };

  const value: AuthContextType = {
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    user,
    setUser,
    isBiometricEnabled,
    biometricDevices,
    enableBiometric,
    disableBiometric,
    refreshBiometricStatus,
    isPushNotificationEnabled,
    setPushNotificationEnabled,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
