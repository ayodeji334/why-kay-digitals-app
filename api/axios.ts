// import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
// import { getItem } from "../utlis/storage";
// import { useAuthStore } from "../stores/authSlice";
// import { BASE_URL } from "../config";

// // const badRequestStatusCodes = [400, 403, 404, 422, 500];

// let isRefreshing = false;
// let failedRequestsQueue: ((token: string) => void)[] = [];

// // export function createAxiosClient(): AxiosInstance {
// //   const client = axios.create({
// //     baseURL: BASE_URL,
// //     timeout: 80000,
// //     headers: {
// //       "Content-Type": "application/json",
// //       Accept: "application/json",
// //     },
// //   });

// //   client.interceptors.request.use(config => {
// //     const token = useAuthStore.getState().token;

// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }

// //     return config;
// //   });

// //   client.interceptors.response.use(
// //     res => res,
// //     async error => {
// //       const original = error.config as AxiosRequestConfig & {
// //         _retry?: boolean;
// //       };

// //       console.log(error);

// //       if (error.response?.status === 401 && !original._retry) {
// //         if (isRefreshing) {
// //           return new Promise(resolve => {
// //             failedRequestsQueue.push(token => {
// //               original.headers = original.headers ?? {};
// //               original.headers.Authorization = `Bearer ${token}`;
// //               resolve(client(original));
// //             });
// //           });
// //         }

// //         original._retry = true;
// //         isRefreshing = true;

// //         try {
// //           const refreshToken = getItem("refresh_token");
// //           if (!refreshToken) throw new Error("No refresh token");

// //           const res = await axios.post(`${BASE_URL}/auth/refresh`, {
// //             refresh_token: refreshToken,
// //           });

// //           const newAccessToken =
// //             res.data?.data?.access_token || res.data?.data?.auth?.accessToken;

// //           const newRefreshToken =
// //             res.data?.data?.refresh_token || res.data?.data?.auth?.refreshToken;

// //           if (!newAccessToken) throw new Error("Refresh failed");

// //           useAuthStore.getState().setToken(newAccessToken, newRefreshToken);

// //           failedRequestsQueue.forEach(cb => cb(newAccessToken));
// //           failedRequestsQueue = [];

// //           original.headers = original.headers ?? {};
// //           original.headers.Authorization = `Bearer ${refreshToken}`;
// //           return client(original);
// //         } catch (e) {
// //           useAuthStore.getState().logout();
// //           return Promise.reject(e);
// //         } finally {
// //           isRefreshing = false;
// //         }
// //       }

// //       if (badRequestStatusCodes.includes(error.response?.status)) {
// //         showError(error.response?.data?.message || "Something went wrong");
// //       } else {
// //         console.group(badRequestStatusCodes);
// //         showError("Network error. Please check your connection.");
// //       }

// //       return Promise.reject(error);
// //     },
// //   );

// //   return client;
// // }

// export function createAxiosClient(): AxiosInstance {
//   const client = axios.create({
//     baseURL: BASE_URL,
//     timeout: 180000,
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//   });

//   client.interceptors.request.use(config => {
//     const token = useAuthStore.getState().token;
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   });

//   client.interceptors.response.use(
//     res => res,
//     async error => {
//       const original = error.config as AxiosRequestConfig & {
//         _retry?: boolean;
//       };

//       if (error.response?.status === 401 && !original._retry) {
//         if (isRefreshing) {
//           return new Promise(resolve => {
//             failedRequestsQueue.push(token => {
//               original.headers = original.headers ?? {};
//               original.headers.Authorization = `Bearer ${token}`;
//               resolve(client(original));
//             });
//           });
//         }

//         original._retry = true;
//         isRefreshing = true;

//         try {
//           const refreshToken = getItem("refresh_token");
//           if (!refreshToken) throw new Error("No refresh token");

//           const res = await axios.post(`${BASE_URL}/auth/refresh`, {
//             refresh_token: refreshToken,
//           });

//           const newAccessToken =
//             res.data?.data?.access_token || res.data?.data?.auth?.accessToken;
//           const newRefreshToken =
//             res.data?.data?.refresh_token || res.data?.data?.auth?.refreshToken;

//           if (!newAccessToken) throw new Error("Refresh failed");

//           useAuthStore.getState().setToken(newAccessToken, newRefreshToken);

//           failedRequestsQueue.forEach(cb => cb(newAccessToken));
//           failedRequestsQueue = [];

//           original.headers = original.headers ?? {};
//           original.headers.Authorization = `Bearer ${refreshToken}`;
//           return client(original);
//         } catch (e) {
//           useAuthStore.getState().logout();
//           return Promise.reject(e);
//         } finally {
//           isRefreshing = false;
//         }
//       }

//       return Promise.reject(error);
//     },
//   );

//   return client;
// }
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/authSlice";
import { BASE_URL } from "../config";

let isRefreshing = false;
let failedRequestsQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

export function createAxiosClient(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 180000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  client.interceptors.request.use(config => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    res => res,
    async error => {
      const original = error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

      if (error.response?.status !== 401 || original._retry) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until the in-flight refresh resolves
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: (token: string) => {
              original.headers = original.headers ?? {};
              original.headers.Authorization = `Bearer ${token}`;
              resolve(client(original));
            },
            reject,
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // The refresh token lives in useAuthStore (persisted under the
        // "auth-storage" key by zustand/persist) — it was never actually
        // written to a separate "refresh_token" MMKV key, so reading from
        // that key here always came back empty and force-logged everyone
        // out the first time their access token expired.
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken =
          res.data?.data?.access_token ?? res.data?.data?.auth?.accessToken;
        const newRefreshToken =
          res.data?.data?.refresh_token ?? res.data?.data?.auth?.refreshToken;

        if (!newAccessToken) throw new Error("Refresh failed");

        // Fall back to the old refresh token when the backend doesn't
        // rotate it on every refresh — otherwise this would null it out
        // in the store and break the very next refresh.
        useAuthStore
          .getState()
          .setToken(newAccessToken, newRefreshToken ?? refreshToken);

        // Resolve every request that was queued during the refresh
        failedRequestsQueue.forEach(p => p.resolve(newAccessToken));
        failedRequestsQueue = [];

        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newAccessToken}`; // <-- was the old refreshToken, fixed
        return client(original);
      } catch (e) {
        failedRequestsQueue.forEach(p => p.reject(e)); // <-- queued requests no longer hang forever
        failedRequestsQueue = [];
        useAuthStore.getState().logout();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    },
  );

  return client;
}
