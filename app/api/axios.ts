import axios from "axios";
import { getItem, removeItem, setItem } from "../utlis/storage";
import { showError } from "../utlis/toast";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  config => {
    const token = getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Token expired → try refreshing
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getItem("refresh_token");

      if (refreshToken) {
        try {
          const response = await axios.post(
            "https://your-api.com/api/auth/refresh",
            {
              refreshToken,
            },
          );

          const newAccessToken = response.data?.data?.auth?.accessToken;
          const newRefreshToken = response.data?.data?.auth?.refreshToken;

          if (newAccessToken) {
            setItem("auth_token", newAccessToken);
            if (newRefreshToken) {
              setItem("refresh_token", newRefreshToken);
            }

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          removeItem("auth_token");
          removeItem("refresh_token");
          // TODO: Redirect to Login screen
        }
      }
    }

    if (error.response?.status !== 400) {
      const message =
        (error.response?.data as any)?.message ||
        "Something went wrong. Please try again.";
      showError(message);
    }

    return Promise.reject(error);
  },
);
export default apiClient;
