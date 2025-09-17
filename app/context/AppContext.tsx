// app/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getItem, removeItem } from "../utlis/storage";
import apiClient from "../api/axios";

type AuthContextType = {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const token = getItem("auth_token");

        if (token) {
          const res = await apiClient.get("/user/current-user");
          if (res?.status === 200) {
            setIsAuthenticated(true);
          } else {
            removeItem("auth_token");
            removeItem("refresh_token");
            removeItem("user");
          }
        }
      } catch (err) {
        removeItem("auth_token");
        removeItem("refresh_token");
        removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
