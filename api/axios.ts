import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { getItem } from "../utlis/storage";
import { showError } from "../utlis/toast";
import { useAuthStore } from "../stores/authSlice";

// export const BASE_URL = "https://www.ayodejijava.com.ng/v1";
export const BASE_URL = "http://localhost:8000/v1";

const badRequestStatusCodes = [400, 403, 404, 422, 500];

let isRefreshing = false;
let failedRequestsQueue: ((token: string) => void)[] = [];

export function createAxiosClient(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // REQUEST
  client.interceptors.request.use(config => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  // RESPONSE
  client.interceptors.response.use(
    res => res,
    async error => {
      const original = error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

      if (error.response?.status === 401 && !original._retry) {
        if (isRefreshing) {
          return new Promise(resolve => {
            failedRequestsQueue.push(token => {
              original.headers = original.headers ?? {};
              original.headers.Authorization = `Bearer ${token}`;
              resolve(client(original));
            });
          });
        }

        original._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = getItem("refresh_token");
          if (!refreshToken) throw new Error("No refresh token");

          const res = await axios.post(`${BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const newAccessToken =
            res.data?.data?.access_token || res.data?.data?.auth?.accessToken;

          const newRefreshToken =
            res.data?.data?.refresh_token || res.data?.data?.auth?.refreshToken;

          if (!newAccessToken) throw new Error("Refresh failed");

          useAuthStore.getState().setToken(newAccessToken, newRefreshToken);

          failedRequestsQueue.forEach(cb => cb(newAccessToken));
          failedRequestsQueue = [];

          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${refreshToken}`;
          return client(original);
        } catch (e) {
          useAuthStore.getState().logout();
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      }

      if (badRequestStatusCodes.includes(error.response?.status)) {
        showError(error.response?.data?.message || "Something went wrong");
      } else {
        showError("Network error. Please check your connection.");
      }

      return Promise.reject(error);
    },
  );

  return client;
}
