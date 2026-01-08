import { useCallback, useRef } from "react";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getItem } from "../utlis/storage";
import { showError } from "../utlis/toast";
import { useAuthStore } from "../stores/authSlice";

// export const BASE_URL = "https://wk.micakin.com/v1";
export const BASE_URL = `http://10.210.55.110:8000/v1`;

const NETWORK_ERROR_MESSAGE = "Network error. Please check your connection.";
const SERVER_ERROR_MESSAGE = "Something went wrong. Please try again.";
const badRequestStatusCodes = [403, 422, 400, 500, 404];

type FailedRequestCallback = (token: string) => void;

// Type for the useAxios hook return value
interface UseAxiosReturn {
  apiGet: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<T>>;
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<T>>;
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<T>>;
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<T>>;
  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<T>>;
  client: AxiosInstance;
}

// Type for the enhanced Axios request config with _retry property
interface EnhancedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Type for refresh token response
interface RefreshTokenResponse {
  data?: {
    data?: {
      access_token?: string;
      refresh_token?: string;
      auth?: {
        accessToken: string;
        refreshToken: string;
      };
    };
  };
}

// Type for error response
interface ErrorResponse {
  response?: {
    status?: number;
    data?: {
      error?: {
        detailsArray?: string[];
      };
      errors?: string[];
      message?: string;
    };
  };
  code?: string;
  config?: EnhancedAxiosRequestConfig;
}

export default function useAxios(): UseAxiosReturn {
  const axiosInstanceRef = useRef<AxiosInstance | null>(null);
  const { logout, setToken, token } = useAuthStore(state => state);

  let isRefreshing = false;
  let failedRequestsQueue: FailedRequestCallback[] = [];

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
      (config: InternalAxiosRequestConfig) => {
        console.log("Attaching token to request:", token);
        console.log(
          "Request config before attaching token:",
          config.baseURL,
          config.url,
        );
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error: any) => Promise.reject(error),
    );

    // Response Interceptor
    instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: ErrorResponse) => {
        const originalRequest = error.config as EnhancedAxiosRequestConfig;
        console.log("Response error:", error.response);

        // Handle 401 errors with token refresh
        if (error?.response?.status === 401 && !originalRequest?._retry) {
          if (isRefreshing) {
            return new Promise<AxiosResponse>(resolve => {
              failedRequestsQueue.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(instance(originalRequest));
              });
            });
          }

          if (originalRequest) {
            originalRequest._retry = true;
          }

          isRefreshing = true;

          const refreshToken = getItem("refresh_token");

          if (refreshToken) {
            try {
              const response = (await axios.post(`${BASE_URL}/auth/refresh`, {
                refresh_token: refreshToken,
              })) as RefreshTokenResponse;

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
                if (originalRequest?.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return instance(originalRequest as AxiosRequestConfig);
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
        if (
          error?.response?.status &&
          badRequestStatusCodes.includes(error.response.status)
        ) {
          if (
            Array.isArray(error?.response?.data?.error?.detailsArray) &&
            error.response.data.error.detailsArray.length > 0
          ) {
            error.response.data.error.detailsArray.forEach(
              (element: string) => {
                showError(element);
              },
            );
          } else if (
            Array.isArray(error?.response?.data?.errors) &&
            error.response.data.errors.length > 0
          ) {
            error.response.data.errors.forEach((element: string) => {
              showError(element);
            });
          } else {
            // console.log(error.response?.data);
            showError(error.response?.data?.message || SERVER_ERROR_MESSAGE);
          }
        } else {
          showError(NETWORK_ERROR_MESSAGE);
        }

        return Promise.reject(error);
      },
    );

    return instance;
  }, [logout, setToken]);

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

  return {
    apiGet,
    post,
    put,
    patch,
    delete: del,
    client: getInstance(),
  };
}
