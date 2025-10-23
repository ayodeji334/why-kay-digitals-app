import { useCallback, useRef } from "react";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { getItem } from "../utlis/storage";
import { showError } from "../utlis/toast";
// import { Platform } from "react-native";
import { useAuthStore } from "../stores/authSlice";

// const URL = Platform.OS === "android" ? "10.172.115.101" : "localhost";
export const BASE_URL = `https://wk.micakin.com/v1`;
// export const BASE_URL = `http://${URL}:8000/v1`;

const NETWORK_ERROR_MESSAGE = "Network error. Please check your connection.";
const SERVER_ERROR_MESSAGE = "Something went wrong. Please try again.";
const badRequestStatusCodes = [403, 422, 400, 500, 404];

export default function useAxios() {
  const axiosInstanceRef = useRef<AxiosInstance | null>(null);
  const { logout, setToken } = useAuthStore();

  // Token refresh state - outside the hook to be shared across all instances
  let isRefreshing = false;
  let failedRequestsQueue: ((token: string) => void)[] = [];

  const createAxiosInstance = useCallback((): AxiosInstance => {
    const instance = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Request Interceptor
    instance.interceptors.request.use(
      config => {
        const token = getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error),
    );

    // Response Interceptor
    instance.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        // Handle 401 errors with token refresh
        if (error?.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise(resolve => {
              failedRequestsQueue.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(instance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          const refreshToken = getItem("refresh_token");

          if (refreshToken) {
            try {
              const response = await axios.post(`${BASE_URL}/auth/refresh`, {
                refresh_token: refreshToken,
              });

              const newAccessToken =
                response.data?.data?.access_token ||
                response.data?.data?.auth?.accessToken;
              const newRefreshToken =
                response.data?.data?.refresh_token ||
                response.data?.data?.auth?.refreshToken;

              if (newAccessToken) {
                // Update Zustand store AND MMKV
                setToken(newAccessToken, newRefreshToken);

                // Retry queued requests
                failedRequestsQueue.forEach(cb => cb(newAccessToken));
                failedRequestsQueue = [];

                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return instance(originalRequest);
              }
            } catch (refreshError) {
              logout();
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          } else {
            logout();
            isRefreshing = false;
          }
        }

        // Handle other errors
        if (badRequestStatusCodes.includes(error?.response?.status)) {
          if (
            Array.isArray(error?.response?.data?.error?.detailsArray) &&
            error?.response?.data?.error?.detailsArray.length > 0
          ) {
            error?.response?.data?.error?.detailsArray.forEach(
              (element: string) => {
                showError(element);
              },
            );
          } else if (
            Array.isArray(error?.response?.data?.errors) &&
            error?.response?.data?.errors.length > 0
          ) {
            error?.response?.data?.errors.forEach((element: string) => {
              showError(element);
            });
          } else {
            showError(error.response?.data?.message);
          }
        } else if (
          error?.code === "ERR_NETWORK" ||
          error?.code === "ECONNABORTED"
        ) {
          showError(NETWORK_ERROR_MESSAGE);
        } else {
          showError(SERVER_ERROR_MESSAGE);
        }

        return Promise.reject(error);
      },
    );

    return instance;
  }, []);

  const getInstance = useCallback((): AxiosInstance => {
    if (!axiosInstanceRef.current) {
      axiosInstanceRef.current = createAxiosInstance();
    }
    return axiosInstanceRef.current;
  }, [createAxiosInstance]);

  // API methods
  const apiGet = useCallback(
    async <T = any>(
      url: string,
      config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> => getInstance().get<T>(url, config),
    [getInstance],
  );

  const post = useCallback(
    async <T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> => getInstance().post<T>(url, data, config),
    [getInstance],
  );

  const put = useCallback(
    async <T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> => getInstance().put<T>(url, data, config),
    [getInstance],
  );

  const patch = useCallback(
    async <T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> => getInstance().patch<T>(url, data, config),
    [getInstance],
  );

  const del = useCallback(
    async <T = any>(
      url: string,
      config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> => getInstance().delete<T>(url, config),
    [getInstance],
  );

  return { apiGet, post, put, patch, delete: del, client: getInstance() };
}
